
// setup mongo queue
// // // // // // // // // // // // // // // // // // // // // // // // // // //
let monq = require('monq');

let mongoQueue = monq(mongoUrl).queue('library/jobs');
let mongoWorker = monq(mongoUrl).worker([ 'library/jobs' ], { interval: 60000 });

mongoWorker.register({
    'library/jobs/import/imdb': (params, callback) => {
        try {
            // process params.id
            console.log("processing " + params.id);
            setTimeout(() => {
                callback(null, "ok");
            }, 2000);
        } catch (error) {
            callback(error);
        }
    }
});
mongoWorker.on('complete', (data) => {
    mongodb.connect(mongoUrl)
        .then(db => { 
            db.collection('jobs').remove({ '_id': data._id }, { justOne: true }, (error, document) => {
                if (error !== null) {
                    console.log('[ERROR] worker complete');
                    console.log(error);
                }
            });
        })
        .catch(error => { 
            console.log('[ERROR] worker complete');
            console.log(error);
         });
});
mongoWorker.on('failed', (data) => {
    console.log('[WARNING] worker failed');
    console.log(data);
});
mongoWorker.on('error', (error) => {
    console.log('[ERROR] worker');
    console.log(error);
});

mongoWorker.start();










// TODO replace !
                mongoQueue.enqueue('library/jobs/import/imdb', { id: id }, (error, job) => {
                    if (error !== null) {
                        console.log(`[ERROR] ${message} @ <${id}>`);
                        console.log(error);
                    } 
                });
                mongoWorker.start();
                // TODO replace







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


Library.prototype.GET = function(request, response, type, callback) {
    let self = this;
    try {
        return callback(request, response)
            .then(answer => response.json(answer))
            .catch(error => self._onReject(response.status(500).json, {}, error, `GET ${type}`));
    } catch (error) {
        return self._onReject(response.status(500).json, {}, error, `GET ${type}`)
    }
}

Library.prototype.GET_tmdbSearch = function(request, response) {
    let self = this;
    let searchText = self.normalize(request.params.search);
    return this.tmdbSearch(searchText)
        .then(answer => response.json(answer))
        .catch(error => self._onReject(response.status(500).json, {}, error, 'GET tmdb/search'));
};





Library.prototype.tmdbSearchOLD = function(searchText, resolve, reject) {
    let self = this;
    let answer = { type: 'tmdb/search', searchText: searchText };
    let message = `Searching for movies matching ${searchText}`;
    self.mongodb()
        .then(db => {
            let collection = db.collection('tmdb/search')
            collection.findOne({ searchText: searchText })
                .then(document => {
                    if (document === null) {
                        let url = `${self.options.apiUrl}/search/movie?api_key=${self.options.apiKeyTmdb}&query=${searchText}`;
                        answer = Object.assign(answer, { url: url });
                        http({ uri: url, json: true})
                            .then(httpResponse => {
                                if (httpResponse && httpResponse.results && httpResponse.results.length > 0) {
                                    let newDocument = self.createDocument({ searchText: searchText, response: httpResponse.results });
                                    collection.save(newDocument)
                                        .then(savedDocument => self._onResolve(resolve, answer, savedDocument))
                                        .catch(documentError => self._onReject(reject, answer, documentError, message));
                                } else {
                                    self._onResolve(resolve, answer, null);
                                }
                            })
                            .catch(httpError => self._onReject(reject, answer, httpError, message));
                    } else {
                        self._onResolve(resolve, answer, document);
                    }
                })
                .catch(queryError =>  self._onReject(reject, answer, queryError, message));
        })
        .catch(dbError => self._onReject(reject, answer, dbError, message));
}








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
        })
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


Library.prototype.getStats = function() {
    return Object.assign({}, this.stats, {
        scheduler: this.scheduler.getStats()
    });
};



Library.prototype.getMovies = function(request, response, fnComplete) {
    let self = this;
    let message = `Getting movies`;
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

Library.prototype.getMovie = function(request, response, fnComplete) {
    let self = this;
    let uuid = request.params.uuid;
    assert.defined(uuid);
    let message = `Getting movie <${uuid}>`;
    let answer = self.createAnswer({ type: 'movies', uuid: uuid, results: [] });
    self.mongodb()
        .then(db => { 
            db.collection('movies', (error, collection) => {
                assert.notDefined(error);
                collection.findOne({ uuid: uuid }, (error, document) => {
                    assert.notDefined(error);
                    if (document !== null) {
                        self._onHandleResult(response, document, answer, fnComplete);
                    } else {
                        self._onHandleEmptyResult(response, {}, message, answer, fnComplete);
                    }
                });
            });
        })
        .catch(error => { 
            self._onHandleError(response, error, message, answer);
        });
};


Library.prototype.normalize = function(text) {
    return ('' + (text || '')).replace(/ /g, '+').toLowerCase().trim();;
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

Library.prototype._onHandleEmptyResult = function(response, httpResponse, message, answer, fnComplete) {
    this.stats.cacheMiss++;
    this.stats.emptyResults++;
    answer.cache = false;
    console.log(`[WARNING] ${message}`)
    console.log(httpResponse);
    this._onHandleAnswer(response, answer);
    this._apply(fnComplete, answer);
};


Library.prototype._onHandleError = function(response, error, message) {
    this._onReject(error, message);
    answer.error = error.message;
    this._onHandleErrorAnswer(response, answer); 
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
        this._onReject(error);
    }
};

// Library.prototype._onReject = function(error, message) {
//     this.stats.errors++;
//     console.log(`[ERROR] ${message}`);
//     console.log(error);
// };