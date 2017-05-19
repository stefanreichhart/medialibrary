let http = require('request-promise');
let mongodb = require('mongodb').MongoClient;

let uuid = require('./uuid');
let assert = require('./assert');
let Scheduler = require('./scheduler');

let Library = exports = module.exports = function() { };

Library.prototype.tmdbSearch = function(request, response, fnComplete) {
    let self = this;
    let searchText = self.normalize(request.params.search);
    assert.defined(searchText);
    let url = `${self.options.apiUrl}/search/movie?api_key=${self.options.apiKeyTmdb}&query=${searchText}`;
    let message = `Searching for <${searchText}>`;
    let answer = self.createAnswer({ type: 'tmdb/search', url: url });
    self.mongodb()
        .then(db => { 
            db.collection('tmdb/search', (error, collection) => {
                assert.notDefined(error);
                collection.findOne({ searchText: searchText }, {}, (error, document) => {
                    assert.notDefined(error);
                    if (document === null) {
                        http({ uri: url, json: true})
                            .then(httpResponse => {
                                if (httpResponse && httpResponse.results && httpResponse.results.length > 0) {
                                    let newDocument = self.createDocument({ searchText: searchText, tmdb: httpResponse });
                                    collection.save(newDocument, (error, savedDocument) => {
                                        self._onHandleSaved(response, error, savedDocument, httpResponse, answer, fnComplete);
                                    });
                                } else {
                                    self._onHandleEmptyResult(response, httpResponse, message, answer, fnComplete);
                                }
                            });
                    } else {
                        self._onHandleResult(response, document.tmdb, answer, fnComplete);
                    }
                });
            });
        })
        .catch(error => { 
            self._onHandleError(response, error, message, answer); 
        });
};

Library.prototype.tmdbExternalMovie = function(request, response, fnComplete) {
    let self = this;
    let id = request.params.sourceId;
    assert.defined(sourceId);
    let source = request.params.source;
    assert.defined(source);
    let language = self.normalize(request.params.language) || 'en';
    let url = `${apiUrl}/find/${id}?api_key=${apiKeyTmdb}&language=${language}&external_source=${source}`;
    let message = `Retrieving movie <${id}> from external source ${source}`;
    let answer = self.createAnswer({ type: 'tmdb/external', url: url, id: id, source: source, language: language });
    self.mongodb()
        .then(db => { 
            let collection = db.collection('tmdb/external');
            collection.findOne({ id: id, source: source }, {}, (error, document) => {
                assert.notDefined(error);
                if (document === null) {
                    console.log(message);
                    http({ uri: url, json: true }).then(httpResponse => {
                        if (httpResponse && httpResponse && Object.keys(httpResponse).length > 0) {
                            let newDocument = self.createDocument({ id: id, source: source, tmdb: httpResponse });
                            collection.save(newDocument, (error, savedDocument) => {
                                self._onHandleSaved(response, error, savedDocument, httpResponse, answer, fnComplete);
                            });
                        } else {
                            self._onHandleEmptyResult(response, httpResponse, message, answer, fnComplete);
                        }
                    })
                } else {
                    self._onHandleResult(response, document.tmdb, answer, fnComplete);
                }
            });
        }
        .catch(error => { 
            self._onHandleError(response, error, message, answer);
        });
};

Library.prototype.tmdbMovie = function(request, response, fnComplete) {
    let self = this;
    let id = Number.parseInt(request.params.tmdbId);
    assert.defined(id);
    let url = `${apiUrl}/movie/${id}?api_key=${apiKeyTmdb}`;
    let message = `Retrieving movie <${id}>`;
    let answer = self.createAnswer({ type: 'tmdb/movie', url: url, id: id });
    self.mongodb()
        .then(db => { 
            let collection = db.collection('tmdb/movie');
            collection.findOne({ id: id }, {}, (error, document) => {
                assert.notDefined(error);
                if (document === null) {
                    console.log(message);
                    http({ uri: url, json: true }).then(httpResponse => {
                        if (httpResponse && Object.keys(httpResponse).length > 0) {
                            let newDocument = self.createDocument({ id: id, tmdb: httpResponse });
                            collection.save(newDocument, (error, savedDocument) => {
                                self._onHandleSaved(response, error, savedDocument, httpResponse, answer, fnComplete);
                            });
                        } else {
                            self._onHandleEmptyResult(response, httpResponse, message, answer, fnComplete);
                        }
                    })
                } else {
                    self._onHandleResult(response, document.tmdb, answer, fnComplete);
                }
            } )
        })
        .catch(error => { 
            self._onHandleError(response, error, message, answer);
        });
};

Library.prototype.tmdbGenres = function(request, response, fnComplete) {
    let self = this;
    let language = self.normalize(request.params.language) || 'en';
    let url = `${apiUrl}/genre/movie/list?api_key=${apiKeyTmdb}&language=${language}`;
    let message = `Searching for genres <${language}>`;
    let answer = self.createAnswer({ type: 'tmdb/genres', url: url, language: language });
    self.mongodb()
        .then(db => { 
            db.collection('tmdb/genres', (error, collection) => {
                assert.notDefined(error);
                collection.findOne({ language: language }, {}, (error, document) => {
                    assert.notDefined(error);
                    if (document === null) {
                        console.log(message);
                        http({ uri: url, json: true})
                            .then(httpResponse => {
                                if (httpResponse && httpResponse.genres && httpResponse.genres.length > 0) {
                                    let newDocument = self.createDocument({ language: language, tmdb: httpResponse });
                                    collection.save(newDocument, (error, savedDocument) => {
                                        self._onHandleSaved(response, error, savedDocument, httpResponse, answer, fnComplete);
                                    });
                                } else {
                                    self._onHandleEmptyResult(response, httpResponse, message, answer, fnComplete);
                                }
                            });
                    } else {
                        self._onHandleResult(response, document.tmdb, answer, fnComplete);
                    }
                });
            });
        })
        .catch(error => { 
            self._onHandleError(response, error, message, answer);
        });
};

Library.prototype.tmdbImport = function(request, response, fnComplete) {
    let self = this;
    let ids = [];
    let source = request.params.source;
    assert.defined(source);
    let language = self.normalize(request.params.language) || 'en';
    let message = `Importing movies from imdb ids <${ids}>`;
    let answer = self.createAnswer({ type: 'library/import', results: ids });
    try {
        ids = request.body || [];
        answer.results = ids;
        if (ids && ids.length > 0) {
            for (let i=0; i<ids.length; i++) {
                let id = ids[i];}
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

Library.prototype.getStats = function(request, response) {
    response.json(Object.assign({}, this.stats, {
        scheduler: this.scheduler.getStats()
    }));
};

Library.prototype.getMovies = function(request, response) {
    let answer = self.createAnswer({ type: 'movies', results: [] });
    self.mongodb()
        .then(db => { 
            db.collection('movies', (error, collection) => {
                assert.notDefined(error);
                collection.find({}, (error, documents) => {
                    assert.notDefined(error);
                    if (documents !== null && documents.length > 0) {
                        self._onHandleResult(response, documents, answer, fnComplete);
                    } else {
                        self._onHandleEmptyResult(response, [], message, answer, fnComplete);
                    }
                });
            });
        })
        .catch(error => { 
            self._onHandleError(response, error, message, answer);
        });
};

Library.prototype.getMovie = function(request, response) {
    let uuid = request.params.uuid;
    assert.defined(uuid);
    let answer = self.createAnswer({ type: 'movies', uuid: uuid, results: [] });
    self.mongodb()
        .then(db => { 
            db.collection('movies', (error, collection) => {
                assert.notDefined(error);
                collection.find({ uuid: uuid }, (error, documents) => {
                    assert.notDefined(error);
                    if (documents !== null && documents.length > 0) {
                        self._onHandleResult(response, documents, answer, fnComplete);
                    } else {
                        self._onHandleEmptyResult(response, [], message, answer, fnComplete);
                    }
                });
            });
        })
        .catch(error => { 
            self._onHandleError(response, error, message, answer);
        });
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
        errors: 0
    };
    this._setupMongoDb();
    this._setupScheduler();
    return this;
};

Library.prototype._setupMongoDb = function() {
    let self = this;
    self.mongodb()
        .then(db => {
            Promise
                .all(self.options.mongoCollections.map(name => db.createCollection(name)))
                .catch(error => {
                    console.log('Error while creating mongo db tables: ' + error);
                    process.exit(2);
                });
        })
        .catch(error => {
            console.log('Error while connecting to mongo db: ' + error);
            process.exit(1);
        });
};

Library.prototype._setupScheduler = function() {
    this.scheduler = new Scheduler();
    this.scheduler.initialize();
};

// utils
// // // // // // // // // // // // // // // // // // // // // // // // // // //

Library.prototype.mongodb = function() {
    this.stats.mongoConnectionsOpened++;
    return mongodb.connect(this.options.mongoUrl);
};

Library.prototype.normalize = function(text) {
    return ('' + (text || '')).replace(/ /g, '+').toLowerCase().trim();;
};

Library.prototype.createAnswer = function(params) {
    return Object.assign({
        type: null,
        url: null,
        cache: null,
        results: []
    }, params || {});
};

Library.prototype.createDocument = function(params) {
    let now = Date.now();
    return Object.assign({ results: [], created: now, modified: now }, params || {});
};

Library.prototype._onHandleError = function(response, error, message) {
    this._onError(error, message);
    answer.error = error.message;
    this._onHandleErrorAnswer(response, answer); 
};

Library.prototype._onHandleSaved = function(response, error, saveDocument, results, answer, fnComplete) {
    this.stats.cacheMiss++;
    this.stats.savedDocuments++;
    assert.notDefined(error);
    answer.cache = false;
    answer.results = results;
    this._onHandleAnswer(response, answer);
    this._apply(fnComplete, answer);
};

Library.prototype._onHandleResult = function(response, results, answer, fnComplete) {
    this.stats.cacheHits++;
    answer.cache = true;    
    answer.results = results;
    this._onHandleAnswer(response, answer);
    this._apply(fnComplete, answer);
};

Library.prototype._onHandleEmptyResult = function(response, httpResponse, message, answer) {
    this.stats.cacheMiss++;
    this.stats.emptyResults++;
    answer.cache = false;
    console.log(`[WARNING] ${message}`)
    console.log(httpResponse);
    this._onHandleAnswer(response, answer);
    this._apply(fnComplete, answer);
};

Library.prototype._onHandleAnswer = function(response, answer) {
    if (response && response.json && typeof response.json == "function") {
        response.json(answer);
    }
};

Library.prototype._onHandleErrorAnswer = function(response, answer) {
    if (response && response.status && response.json && typeof response.json == "function") {
        response.status(500).json(answer); 
    }
};

Library.prototype._apply = function(fn, argument) {
    try {
        if (fn && typeof fn == 'function') {
            fn(argument);
        }
    } catch (error) {
        this._onError(error);
    }
};

Library.prototype._onError = function(error, message) {
    this.stats.errors++;
    console.log(`[ERROR] ${message}`);
    console.log(error);
};
