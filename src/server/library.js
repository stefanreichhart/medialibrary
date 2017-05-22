let Promise = require('promise');
let http = require('request-promise');
var mongodb = require('mongodb-bluebird');

let uuid = require('./uuid');
let assert = require('./assert');
let exceptions = require('./exceptions');
let Scheduler = require('./scheduler');

let Library = exports = module.exports = function() { };

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

Library.prototype.tmdbExternalMovie = function(source, sourceId, language, resolve, reject) {
    let self = this;
    self._onCacheLookup(
        'tmdb/external', 
        `Searching for movie ${sourceId} at ${source}`,
        { source: source, sourceId: sourceId },
        (collection) => collection.findOne({ id: id, source: source }),
        `${apiUrl}/find/${id}?api_key=${apiKeyTmdb}&language=${language}&external_source=${source}`,
        (httpResponse) => httpResponse && httpResponse && Object.keys(httpResponse).length > 0,
        (httpResponse) => self._createDocument({ source: source, sourceId: sourceId, response: httpResponse }),
        resolve,
        reject
    );
};

Library.prototype.tmdbMovie = function(tmdbId, resolve, reject) {
    let self = this;
    self._onCacheLookup(
        'tmdb/movie', 
        `Requesting details for movie ${tmdbId}`,
        { tmdbId: tmdbId },
        (collection) => collection.findOne({ tmdbId: tmdbId }),
        `${apiUrl}/movie/${id}?api_key=${apiKeyTmdb}`,
        (httpResponse) => httpResponse && Object.keys(httpResponse).length > 0,
        (httpResponse) => self._createDocument({ tmdbId: tmdbId, response: httpResponse }),
        resolve,
        reject
    );
};

Library.prototype.tmdbGenres = function(language, resolve, reject) {
    let self = this;
    self._onCacheLookup(
        'tmdb/genres', 
        `Requesting genres for ${language}`,
        { language: language },
        (collection) => collection.findOne({ language: language }),
        `${apiUrl}/genre/movie/list?api_key=${apiKeyTmdb}&language=${language}`,
        (httpResponse) => httpResponse && httpResponse.genres && httpResponse.genres.length > 0,
        (httpResponse) => self._createDocument({ language: language, response: httpResponse }),
        resolve,
        reject
    );
};

Library.prototype.getMovie = function(uuid) {
    let self = this;
    self._onLookup(
        'movies',
        `Get movie ${uuid}`,
        (collection) => collection.findOne({ uuid: uuid }),
        (result) => (result !== null),
        null,
        resolve,
        reject
    );
};

Library.prototype.addMovie = function(tmdbId, resolve, reject) {
    let self = this;
    let message = ` Add movie ${tmdbid}`;
    let answer = { uuid: null, tmdbId: tmdbId };
    self.tmdbMovie(
        tmdbId,
        (result) => {
            if (result.response && Object.keys(result.response) > 0) {
                self._mongodb()
                    .then(db => {
                        let movies = db.collection('movies');
                        answer = Object.assign(answer, { uuid: uuid.generate() }, result.response);
                        movies.save(answer.document)
                            .then(savedDocument => self._onResolve(resolve, answer))
                            .catch(error => self._onReject(reject, answer, error, message))
                    })
                    .catch(error => self._onReject(reject, answer, error, message));
            } else {
                self._onReject(reject, answer, error, message)
            }
        },
        reject
    );
};

Library.prototype.getMovies = function() {
    let self = this;
    self._onLookup(
        'movies',
        `Get movies`,
        (collection) => collection.find({}),
        (result) => (result !== null && results.length > 0),
        [],
        resolve,
        reject
    );
};

Library.prototype.tmdbImport = function(request, response, fnComplete) {
    let self = this;
    let ids = [];
    let source = request.params.source;
    assert.defined(source);
    let language = util.normalizeParameter(request.params.language) || 'en';
    let answer = self._createAnswer({ type: 'library/import', results: ids });
    let message = `Importing movies from imdb ids <${ids}>`;
    try {
        ids = request.body || [];
        answer.results = ids;
        if (ids && ids.length > 0) {
            for (let i=0; i<ids.length; i++) {
                let id = ids[i];
                let fakeExternalMovieRequest = { params: { source: source, sourceId: id, language: language } };
                self.scheduler.add((task, onComplete, onError) => {
                    try {
                        self.tmdbExternalMovie(fakeExternalMovieRequest, null, (externalMovieAnswer) => {
                            let fakeMovieRequest = { params: { tmdbId: externalMovieAnswer.id } };
                            self.tmdbMovie(request, null, (movieAnswer) => {
                                onComplete();
                            });
                        });
                    } catch (error) {
                        onError(error);
                    }
                });
            }
        }
        response.json(answer);
    } catch (error) {
        self._onHandleError(response, error, message, answer);
    }
};

Library.prototype.getStats = function() {
    return Object.assign({}, this.stats, { scheduler: this.scheduler.getStats() });
};

Library.prototype.restart = function() {
    this.scheduler.restart();
    return this.getStats();
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
        emptyResults: 0,
        savedDocuments: 0,
        resolved: 0,
        errors: 0
    };
    this._setup_mongodb();
    this._setupScheduler();
    return this;
};

Library.prototype._setup_mongodb = function() {
    var self = this;
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
                .catch(error => exceptions.exit(error, 'Creating mongo db collections'));
        })
        .catch(error => exceptions.exit(error, 'Connecting to mongo db'));
};

Library.prototype._setupScheduler = function() {
    this.scheduler = new Scheduler();
    this.scheduler.initialize();
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

Library.prototype._onLookup = function(name, message, fnGetDocument, defaultResult, fnCacheCondition, resolve, reject) {
    let self = this;
    let answer = { result: defaultResult };
    self._mongodb()
        .then(db => { 
            let collection = db.collection(name);
            fnGetDocument(collection)
                .then(result => { 
                    if (fnCacheCondition(result)) {
                        answer = Object.assign({}, answer, { result: result });   
                    }
                    self._onResolve(resolve, answer);
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
                                        .then(savedDocument => self._onResolve(resolve, answer, newDocument, db))
                                        .catch(documentError => self._onReject(reject, answer, documentError, db, message));
                                } else {
                                    self._onResolve(resolve, answer, null, db);
                                }
                            })
                            .catch(httpError => self._onReject(reject, answer, httpError, db, message));
                    } else {
                        self._onResolve(resolve, answer, document, db);
                    }
                })
                .catch(queryError =>  self._onReject(reject, answer, queryError, db, message));
        })
        .catch(dbError => self._onReject(reject, answer, dbError, null, message));
};

Library.prototype._onResolve = function(resolve, answer, document, db) {
    try {
        this.stats.resolved++;
        let finalAnswer = Object.assign({}, answer || {}, { document: document });
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
