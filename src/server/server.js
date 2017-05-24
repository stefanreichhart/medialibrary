let path = require('path');
let express = require('express');
let bodyParser = require('body-parser');

let assert = require('./assert');
let request = require('./request');
let Library = require('./library');
let util = require('./util');

// setup library
// // // // // // // // // // // // // // // // // // // // // // // // // // //

let library = new Library();
library.initialize({
    apiUrl: 'https://api.themoviedb.org/3', // todo -> db
    apiKey: 'QrNogGHg0WNNgH4cS5HVpcD6NgLb8wBB', // todo -> bootstrap per session
    apiKeyTmdb: '9cc3876eae5c294c28fc147e4fd1c957',
    mongoUrl: `mongodb://localhost:4000/medialibrary`,
    mongoCollections: [ 'tmdb/search', 'tmdb/movie', 'tmdb/external', 'tmdb/genres', 'movies', 'library/jobs' ]
});

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

request.get(router, '/tmdb/movies/:search', (request, response, resolve, reject) => {
    let searchText = util.normalizeParameter(request.params.search);
    assert.defined(searchText, 'Search text must not be empty');
    library.tmdbSearch(searchText, resolve, reject);
});

request.get(router, '/tmdb/movies/:source/:sourceId/:language?', (request, response, resolve, reject) => {
    let source = util.normalizeParameter(request.params.source);
    let sourceId = util.normalizeText(request.params.sourceId);
    let language = util.normalizeParameter(request.params.language) || 'en';
    assert.defined(source, 'Source must not be empty');
    assert.defined(sourceId, 'Source ID must not be empty');
    assert.defined(language, 'Language must not be empty');
    library.tmdbExternalMovie(source, sourceId, language, resolve, reject);
});

request.get(router, '/tmdb/movie/:tmdbId', (request, response, resolve, reject) => {
    let tmdbId = util.normalizeText(request.params.tmdbId);
    assert.defined(tmdbId, 'Tmdb ID must not be empty');
    library.tmdbMovie(tmdbId, resolve, reject);
});

request.get(router, '/tmdb/genres/:language', (request, response, resolve, reject) => {
    let language = util.normalizeText(request.params.language) || 'en';
    assert.defined(language, 'Language must not be empty');
    library.tmdbGenres(language, resolve, reject);
});

// router.get('/library/lists', (request, response) => { });

// router.get('/library/list/:uuid', (request, response) => {});
// router.put('/library/list/:uuid', (request, response) => {});
// router.post('/library/list/:uuid', (request, response) => {});
// router.delete('/library/list/:uuid', (request, response) => {});

request.get(router, '/library/movies', (request, response, resolve, reject) => {
    library.getMovies(resolve, reject);
});

request.get(router, '/library/movie/:uuid', (request, response, resolve, reject) => {
    let uuid = util.normalizeText(request.params.uuid);
    assert.defined(uuid);
    library.getMovies(uuid, resolve, reject);
});

request.put(router, '/library/movie/:tmdbId', (request, response, resolve, reject) => {
    let tmdbId = util.normalizeText(request.params.tmdbId);
    assert.defined(tmdbId);
    library.addMovie(tmdbId, resolve, reject);
});

request.delete(router, '/library/movie/:uuid', (request, response, resolve, reject) => {
    let uuid = util.normalizeText(request.params.uuid);
    assert.defined(uuid);
    library.removeMovie(uuid, resolve, reject);
});

request.post(router, '/library/movie/:uuid', (request, response, resolve, reject) => {
    let uuid = util.normalizeText(request.params.uuid);
    let data = request.body || {};
    assert.defined(uuid);
    assert.defined(data);
    library.updateMovie(uuid, data, resolve, reject);
});

request.put(router, '/library/import/:source/:language?', (request, response, resolve, reject) => {
    let source = util.normalizeParameter(request.params.source);
    let sourceIds = request.body || [];
    let language = util.normalizeText(request.params.language) || 'en';
    assert.defined(source, 'Source must not be empty');
    assert.notEmpty(sourceIds, 'Source Ids must not be empty');
    assert.defined(language, 'Language must not be empty');
    library.importMovies(source, sourceIds, language, resolve, reject);
});

request.get(router, '/library/stats', (request, response) => {
    response.json(library.getStats());
});

request.get(router, '/library/restart', (request, response) => {
    response.json(library.restart());
});

// start server
// // // // // // // // // // // // // // // // // // // // // // // // // // //

app.listen(4100);