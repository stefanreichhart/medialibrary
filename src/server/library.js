let Promise = require('promise');
let http = require('request-promise');
var mongodb = require('mongodb-bluebird');

let uuid = require('./uuid');
let Merger = require('./merger');
let assert = require('./assert');
let exceptions = require('./exceptions');
let Scheduler = require('./scheduler');

let Library = exports = module.exports = function() { };

// ok
Library.prototype.tmdbSearch = function(searchText, resolve, reject) {
    let self = this;
    self._onCacheLookup(
        'tmdb/search', 
        `Searching for movies matching ${searchText}`,
        { searchText: searchText },
        (collection) => collection.findOne({ searchText: searchText }),
        `${self.options.apiUrl}/search/movie?api_key=${self.options.apiKeyTmdb}&query=${searchText}`,
        (httpResponse) => httpResponse && httpResponse.results && httpResponse.results.length > 0,
        (httpResponse) => self._createDocument({ searchText: searchText, response: httpResponse.results }),
        resolve,
        reject
    );
};

// ok
Library.prototype.tmdbExternalMovie = function(source, sourceId, language, resolve, reject) {
    let self = this;
    self._onCacheLookup(
        'tmdb/external', 
        `Searching for movie ${sourceId} at ${source}`,
        { source: source, sourceId: sourceId },
        (collection) => collection.findOne({ source: source,sourceId: sourceId }),
        `${self.options.apiUrl}/find/${sourceId}?api_key=${self.options.apiKeyTmdb}&language=${language}&external_source=${source}`,
        (httpResponse) => httpResponse && httpResponse && Object.keys(httpResponse).length > 0,
        (httpResponse) => self._createDocument({ source: source, sourceId: sourceId, response: httpResponse }),
        resolve,
        reject
    );
};

//ok
Library.prototype.tmdbMovie = function(tmdbId, resolve, reject) {
    let self = this;
    self._onCacheLookup(
        'tmdb/movie', 
        `Requesting details for movie ${tmdbId}`,
        { tmdbId: tmdbId },
        (collection) => collection.findOne({ tmdbId: tmdbId }),
        `${self.options.apiUrl}/movie/${tmdbId}?api_key=${self.options.apiKeyTmdb}`,
        (httpResponse) => httpResponse && Object.keys(httpResponse).length > 0,
        (httpResponse) => self._createDocument({ tmdbId: tmdbId, response: httpResponse }),
        resolve,
        reject
    );
};

// ok
Library.prototype.tmdbGenres = function(language, resolve, reject) {
    let self = this;
    self._onCacheLookup(
        'tmdb/genres', 
        `Requesting genres for ${language}`,
        { language: language },
        (collection) => collection.findOne({ language: language }),
        `${self.options.apiUrl}/genre/movie/list?api_key=${self.options.apiKeyTmdb}&language=${language}`,
        (httpResponse) => httpResponse && httpResponse.genres && httpResponse.genres.length > 0,
        (httpResponse) => self._createDocument({ language: language, response: httpResponse }),
        resolve,
        reject
    );
};

// ok
Library.prototype.getMovie = function(uuid, resolve, reject) {
    let self = this;
    self._onLookup(
        'movies',
        `Get movie ${uuid}`,
        (collection) => collection.findOne({ uuid: uuid }),
        (answer) => (answer !== null),
        null,
        resolve,
        reject
    );
};

// ok
Library.prototype.addMovie = function(tmdbId, resolve, reject) {
    let self = this;
    let message = ` Add movie ${tmdbId}`;
    let answer = { action: 'add/movie', uuid: null, tmdbId: tmdbId };
    self.tmdbMovie(
        tmdbId,
        (response) => {
            if (response && response.result && Object.keys(response.result).length > 0) {
                self._mongodb()
                    .then(db => {
                        let movies = db.collection('movies');
                        let document = Object.assign({ uuid: uuid.generate(), tmdb: response.result });
                        movies.save(document)
                            .then(savedDocument => self._onResolve(resolve, document))
                            .catch(error => self._onReject(reject, answer, error, message))
                    })
                    .catch(error => self._onReject(reject, answer, error, message));
            } else {
                self._onReject(reject, answer, null, message)
            }
        },
        reject
    );
};

// TODO
Library.prototype.updateMovie = function(uuid, data, resolve, reject) {
    let self = this;
    let answer = { action: 'update/movie', uuid: uuid };
    self.withMovieDo(
        uuid,
        (movie, document) => { 
            let newData = new Merger(movie, data).get();
            document.response = newData;
            self._mongodb()
                .then(db => {
                    let movies = db.collection('movies');
                    movies.save(document)
                        .then(result => { 
                            answer = Object.assign(answer, { status: 'ok' });
                            self._onResolve(resolve, answer); 
                        })
                        .catch(error => error => self._onReject(reject, answer, error, message));
                })
                .catch(error => self._onReject(reject, answer, error, message));
        },
        () => self._onReject(reject, answer, error, message),
        reject);
};

// ok
Library.prototype.removeMovie = function(uuid, resolve, reject) {
    let self = this;
    let answer = { action: 'remove/movie', uuid: uuid };
    self.withMovieDo(
        uuid,
        (document) => { 
            self._mongodb()
                .then(db => {
                    let movies = db.collection('movies');
                    console.log(document);
                    movies.remove({ _id: document._id })
                        .then(result => { 
                            answer = Object.assign(answer, { status: 'ok' });
                            // TODO: remove reference from all lists
                            self._onResolve(resolve, answer); 
                        })
                        .catch(error => error => self._onReject(reject, answer, error, message));
                })
                .catch(error => self._onReject(reject, answer, error, message));
        },
        () => { 
            answer = Object.assign(answer, { status: 'ok' });
            self._onResolve(resolve, answer); 
        },
        reject);
};

// ok
Library.prototype.getMovies = function(resolve, reject) {
    let self = this;
    self._onLookup(
        'movies',
        `Get movies`,
        (collection) => collection.find({}),
        (answer) => (answer !== null && answer.length > 0),
        [],
        resolve,
        reject
    );
};

Library.prototype.importMovies = function(source, sourceIds, language, resolve, reject) {
    let self = this;
    let answer = { action: 'import/movies', source: source, sourceIds: sourceIds, language: language };
    let message = `Scheduling import of movie <${sourceIds}> from ${source}`;
    try {
        for (let i=0; i<sourceIds.length; i++) {
            let sourceId = sourceIds[i];
            console.log(message);
            self.scheduler.add((task, onComplete, onError) => {
                let message = `Importing movie <${sourceId}> from ${source}`;
                console.log(message);
                self.tmdbExternalMovie(
                    source, 
                    sourceId, 
                    language, 
                    (answer) => {
                        try {
                            let tmdbId = answer.result.movie_results[0].id;
                            self.addMovie(tmdbId, onComplete, onError);
                        } catch (error) {
                            self._onReject(onError, answer, error, message);
                        }
                    }, 
                    onError);
            }, `import/${sourceId}/${source}`);
        }
        self._onResolve(resolve, answer); 
    } catch(error) {
        self._onReject(reject, answer, error, message);
    }
};

Library.prototype.getStats = function() {
    return Object.assign({}, this.stats, { scheduler: this.scheduler.getStats() });
};

Library.prototype.restart = function() {
    this.scheduler.restart();
    return this.getStats();
};

// ok 
Library.prototype.withMovieDo = function(uuid, resolve, resolveNone, reject) {
    let self = this;
    self._onLookup(
        'movies',
        `With movie ${uuid} do ...`,
        (collection) => collection.findOne({ uuid: uuid }),
        (answer) => (answer !== null && Object.keys(answer).length > 0),
        null,
        (answer) => { 
            if (answer && answer.result) {
                resolve(answer.result);
            } else {
                resolveNone();
            }
        },
        reject
    );
};

// init
// // // // // // // // // // // // // // // // // // // // // // // // // // //

Library.prototype.initialize = function(options) {
    assert.defined(options.apiUrl);
    assert.defined(options.apiKeyTmdb);
    assert.defined(options.mongoUrl);
    this.options = options;
    this.stats = {
        mongoConnectionsOpened: 0,
        cacheHit: 0,
        cacheMiss: 0,
        cacheCleaned: 0,
        emptyResults: 0,
        savedDocuments: 0,
        resolved: 0,
        errors: 0
    };
    this._cleaner = null;
    this._setup_mongodb();
    this._setupScheduler();
    this._setupCleaning();
    return this;
};

Library.prototype._setup_mongodb = function() {
    var self = this;
    let resolveAll = (promises) => {
        console.log('Creating mongo db collections done');
        return Promise.resolve(promises);
    };
    self._mongodb()
        .then(db => {
            Promise
                .all(self.options.mongoCollections.map(name => { 
                    return db.createCollection(name, {}, (error, collection) => {
                        if (error) {
                            exceptions.exit(error, `Creating mongo db collection ${name}`)
                        }
                    });
                }))
                .then(promises => resolveAll(promises))
                .catch(error => exceptions.exit(error, 'Creating mongo db collections'));
        })
        .catch(error => exceptions.exit(error, 'Connecting to mongo db'));
};

Library.prototype._setupScheduler = function() {
    this.scheduler = new Scheduler();
    this.scheduler.initialize();
};

Library.prototype._setupCleaning = function() {
    var self = this;
    self._cleaner = setTimeout(() => {
        let now = Date.now();
        let past = now - (30 * 24 * 60 * 60 * 1000);
        let resolve = (name, collection) => {
            let removed = collection.result.n || 0;
            self.stats.cacheCleaned = self.stats.cacheCleaned + removed;
            console.log(`Cleaning mongo collection ${name} (${removed})`);
            return Promise.resolve(collection);
        };
        let resolveAll = (collections) => {
            console.log(`Cleaning mongo db done`);
            return Promise.resolve(collections);
        };
        let reject = (error) => {
            exceptions.error(error, 'Cleaning mongo db');
            clearTimeout(self._cleaner);
            self._cleaner = null;
            return Promise.resolve(error);
        };
        self._mongodb()
            .then(db => {
                Promise
                    .all(self.options.mongoCollections.map(name => { 
                        return db.collection(name).remove({ modified: { $lte : past } })
                            .then(response => resolve(name, response))
                            .catch(error => reject(error))
                    }))
                    .then(promises => resolveAll(promises))
                    .catch(error => reject(error));
            })
            .catch(error => reject(error));
        
    }, 1 * 1000);
};

Library.prototype._mongodb = function() {
    this.stats.mongoConnectionsOpened++;
    return mongodb.connect(this.options.mongoUrl);
};

Library.prototype._createAnswer = function(params) {
    return Object.assign({
        type: null,
        url: null,
        cache: null,
        results: []
    }, params || {});
};

Library.prototype._createDocument = function(document) {
    let now = Date.now();
    return Object.assign({ response: null, created: now, modified: now }, document || {});
};

Library.prototype._onLookup = function(name, message, fnGetDocument, fnCacheCondition, defaultResult, resolve, reject) {
    let self = this;
    let answer = { result: defaultResult };
    self._mongodb()
        .then(db => { 
            let collection = db.collection(name);
            fnGetDocument(collection)
                .then(result => { 
                    if (fnCacheCondition(result)) {
                        self._onResolve(resolve, answer, result);
                    } else {
                        self._onResolve(resolve, answer, null);
                    }
                })
                .catch(error => self._onReject(reject, answer, error, message));
        })
        .catch(error => self._onReject(reject, answer, error, message));
};

Library.prototype._onCacheLookup = function(name, message, parameters, fnGetDocument, url, fnCacheCondition, fnNewDocument, resolve, reject) {
    let self = this;
    let answer = Object.assign({}, parameters || {});
    self._mongodb()
        .then(db => {
            let collection = db.collection(name);
            fnGetDocument(collection)
                .then(document => {
                    if (document === null) {
                        answer = Object.assign(answer, { url: url });
                        http({ uri: url, json: true})
                            .then(httpResponse => {
                                if (fnCacheCondition(httpResponse)) {
                                    let newDocument = fnNewDocument(httpResponse);
                                    collection.save(newDocument)
                                        .then(savedDocument => self._onResolve(resolve, answer, newDocument.response, db))
                                        .catch(documentError => self._onReject(reject, answer, documentError, db, message));
                                } else {
                                    self._onResolve(resolve, answer, null, db);
                                }
                            })
                            .catch(httpError => self._onReject(reject, answer, httpError, db, message));
                    } else {
                        self._onResolve(resolve, answer, document.response, db);
                    }
                })
                .catch(queryError =>  self._onReject(reject, answer, queryError, db, message));
        })
        .catch(dbError => self._onReject(reject, answer, dbError, null, message));
};

Library.prototype._onResolve = function(resolve, answer, document, db) {
    try {
        this.stats.resolved++;
        let finalAnswer = Object.assign({}, answer || {}, { result: document });
        if (resolve && typeof resolve == 'function') {
            resolve(finalAnswer);
        }
    } catch (fatal) {
        this._onFatal(fatal, answer, 'Resolving answer');
    } finally {
        if (db && db.close) {
            db.close();
        }
    }
};

Library.prototype._onReject = function(reject, answer, error, db, message) {
    try {
        this.stats.errors++;
        let finalAnswer = Object.assign({}, answer || {}, { message: message || '', error: (error ? error.message : null) || 'UNKNOWN' });
        console.log(`[ERROR] ${message}`);
        console.log(finalAnswer);
        console.log(error);
        if (reject && typeof reject == 'function') {
            reject(finalAnswer, error);
        }
    } catch (fatal) {
        this._onFatal(fatal, answer, 'Rejecting error', error);
    } finally {
        if (db && db.close) {
            db.close();
        }
    }
};

Library.prototype._onFatal = function(fatal, answer, message, error) {
    console.log(`[FATAL] ${message}`);
    console.log(answer);
    console.log(fatal);
    console.log(error);
};
