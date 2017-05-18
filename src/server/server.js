let path = require('path');
var http = require('request-promise');
let assert = require('assert');
let mongodb = require('mongodb').MongoClient;
let express = require('express');
let bodyParser = require('body-parser');
let scheduler = require('./scheduler').Scheduler;

// setup cnstants
// // // // // // // // // // // // // // // // // // // // // // // // // // //

let dbPort = 4000;
let dbName = 'medialibrary';
let apiPort = 4100;
let apiUrl= 'https://api.themoviedb.org/3';
let apiKeyTmdb = '9cc3876eae5c294c28fc147e4fd1c957';

// setup express
// // // // // // // // // // // // // // // // // // // // // // // // // // //

let app = express();

// setup statics
// // // // // // // // // // // // // // // // // // // // // // // // // // //

let www = '../' + __dirname + '/www';
app.use(express.static(www));

// setup body parsing
// // // // // // // // // // // // // // // // // // // // // // // // // // //

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// setup router
// // // // // // // // // // // // // // // // // // // // // // // // // // //

let router = express.Router();
app.use('/api', router);

// setup utilities
// // // // // // // // // // // // // // // // // // // // // // // // // // //

let assertNotDefined = function(value, message) {
    assert(value === null || value === undefined, message);
};

let assertDefined = function(value, message) {
    assert(value !== null && value !== undefined, message);
};

let assertNotEmpty = function(value, message) {
    assertDefined(value);
    assert(value != '' && value.trim() != '', message);
};

let defaultUuidLength = 16;
let defaultChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
let generateUUID = function(length) {
    return Array(length || defaultUuidLength).join().split(',').map(() => { 
      return defaultChars.charAt(Math.floor(Math.random() * defaultChars.length)); 
    }).join('');
};

// setup mongo
// // // // // // // // // // // // // // // // // // // // // // // // // // //

let mongoUrl = `mongodb://localhost:${dbPort}/${dbName}`;
let mongoCollections = [ 'tmdb/search', 'tmdb/movie', 'tmdb/genres', 'movies', 'library/jobs' ];

let onError = (response, error, message) => {
    console.log(`[ERROR] ${message}`);
    console.log(error);
    answer.error = error.message;
    response.status(500).json(answer);  
};

let onEmptyResult = (response, httpResponse, message, answer) => {
    console.log(`[WARNING] ${message}`)
    console.log(httpResponse);
    response.json(answer);
};

// setup api routes
// // // // // // // // // // // // // // // // // // // // // // // // // // //

router.get('/tmdb/movies/:search', (request, response) => {
    let searchText = (request.params.search || '').replace(/ /g, '+').toLowerCase().trim();
    let url = `${apiUrl}/search/movie?api_key=${apiKeyTmdb}&query=${searchText}`;
    let message = `Searching for <${searchText}>`;
    let answer = {
        type: 'tmdb/search',
        cache: null,
        results: []
    }
    mongodb.connect(mongoUrl)
        .then(db => { 
            db.collection('tmdb/search', (error, collection) => {
                assertNotDefined(error);
                collection.findOne({ searchText: searchText }, {}, (error, document) => {
                    assertNotDefined(error);
                    if (document === null) {
                        console.log(message);
                        http({ uri: url, json: true})
                            .then(httpResponse => {
                                results = httpResponse.results;
                                if (results && results.length > 0) {
                                    let now = Date.now();
                                    let newDocument = { searchText: searchText, results: results, created: now, modified: now };
                                    collection.save(newDocument, (error, saveDocument) => {
                                        assertNotDefined(error);
                                        answer.cache = false;
                                        answer.results = results;
                                        response.json(answer);
                                    });
                                } else {
                                    answer.cache = false;
                                    onEmptyResult(response, httpResponse, message, answer)
                                }
                            });
                    } else {
                        answer.cache = true;
                        answer.results = document.results;
                        response.json(answer);
                    }
                });
            });
        })
        .catch(error => { onError(response, error, message, answer) });
});

router.get('/tmdb/movie/:tmdbid', (request, response) => {
    let id = Number.parseInt(request.params.tmdbid);
    let url = `${apiUrl}/movie/${id}?api_key=${apiKeyTmdb}`;
    let message = `Retrieving movie <${id}>`;
    let answer = {
        type: 'tmdb/genres',
        cache: null,
        results: []
    };
    mongodb.connect(mongoUrl)
        .then(db => { 
            let collection = db.collection('tmdb/movie');
            collection.findOne({ 'tmdb.id': id }, {}, (error, document) => {
                assertNotDefined(error);
                if (document === null) {
                    console.log(message);
                    http({ uri: url, json: true }).then(httpResponse => {
                        let result = httpResponse;
                        if (result && Object.keys(result).length > 0) {
                            let now = Date.now();
                            let newDocument = { tmdb: result, created: now, modified: now };
                            collection.save(newDocument, (error, savedDocument) => {
                                assertNotDefined(error);
                                answer.cache = false;
                                answer.results = [ result ];
                                response.json(answer);
                            });
                        } else {
                            answer.cache = false;
                            onEmptyResult(response, httpResponse, message, answer)
                        }
                    })
                } else {
                    answer.cache = true;
                    answer.results = [ document ];
                    response.json(answer);
                }
            } )
        })
        .catch(error => { onError(response, error, message, answer) });
});

router.get('/tmdb/genres/:language?', (request, response) => {
    let language = (request.params.language || 'en').replace(/ /g, '+').toLowerCase().trim();
    let url = `${apiUrl}/genre/movie/list?api_key=${apiKeyTmdb}&language=${language}`;
    let message = `Searching for genres <${language}>`;
    mongodb.connect(mongoUrl)
        .then(db => { 
            db.collection('tmdb/genres', (error, collection) => {
                assertNotDefined(error);
                collection.findOne({ language: language }, {}, (error, document) => {
                    assertNotDefined(error);
                    if (document === null) {
                        console.log(message);
                        http({ uri: url, json: true})
                            .then(httpResponse => {
                                let results = httpResponse.genres;
                                if (results && results.length > 0) {
                                    let now = Date.now();
                                    collection.save({ language: language, results: results, created: now, modified: now }, (error, saveDocument) => {
                                        assertNotDefined(error);
                                        response.json({ 
                                            type: 'tmdb/genres',
                                            cache: false,
                                            results: results,
                                        }); 
                                    });
                                } else {
                                    onEmptyResult(response, httpResponse, message)
                                }
                            });
                    } else {
                        response.json({ 
                            type: 'tmdb/genres',
                            cache: true, 
                            results: document.results
                        }); 
                    }
                });
            });
        })
        .catch(error => { onError(response, error, message) });
});

router.get('/library/lists', (request, response) => {
    mongo(request, response, db => {
        response.json({ 
            results: [  ]
        }); 
    });
});

router.get('/library/list/:uuid', (request, response) => {
    mongo(request, response, db => {
        response.json({ 
            results: [  ]
        }); 
    });
});

router.put('/library/list/:uuid', (request, response) => {
    mongo(request, response, db => {
        response.json({ 
            results: [  ]
        }); 
    });
});

router.post('/library/list/:uuid', (request, response) => {
    mongo(request, response, db => {
        response.json({ 
            results: [  ]
        }); 
    });
});

router.delete('/library/list/:uuid', (request, response) => {
    mongo(request, response, db => {
        response.json({ 
            results: [  ]
        }); 
    });
});

router.get('/library/movies', (request, response) => {
    mongo(request, response, db => {
        response.json({ 
            results: [  ]
        }); 
    });
});

router.get('/library/movie/:uuid', (request, response) => {
    mongo(request, response, db => {
        response.json({ 
            results: [  ]
        }); 
    });
});

router.put('/library/movie/:uuid', (request, response) => {
    mongo(request, response, db => {
        response.json({ 
            results: [  ]
        }); 
    });
});

router.post('/library/movie/:uuid', (request, response) => {
    mongo(request, response, db => {
        response.json({ 
            results: [  ]
        }); 
    });
});

router.delete('/library/movie/:uuid', (request, response) => {
    mongo(request, response, db => {
        response.json({ 
            results: [  ]
        }); 
    });
});

router.put('/library/import', (request, response) => {
    let ids = [];
    let message = `Importing movied from imdb ids <${ids}>`;
    let answer = {
        type: 'library/jobs',
        results: []
    };
    try {
        ids = request.body || [];
        if (ids && ids.length > 0) {
            for (let i=0; i<ids.length; i++) {
                let id = ids[i];
                scheduler.add((callback) => {
                    try {
                        console.log(`do something with ${id}`);
                    } catch (error) {
                        console.log('ups');
                    } finally {
                        callback();
                    }
                });
            }
            answer.results = ids;
        } 
        response.json(answer);
    } catch (error) {
        onError(response, error, message, answer);
    }
});

// start database
// // // // // // // // // // // // // // // // // // // // // // // // // // //

mongodb.connect(mongoUrl)
    .then(db => {
        Promise
            .all(mongoCollections.map(name => db.createCollection(name)))
            .catch(error => {
                console.log('Error while creating mongo db tables: ' + error);
                process.exit(2);
            });
    })
    .catch(error => {
        console.log('Error while connecting to mongo db: ' + error);
        process.exit(1);
    });

// start server
// // // // // // // // // // // // // // // // // // // // // // // // // // //

app.listen(apiPort);