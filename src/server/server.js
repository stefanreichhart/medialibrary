let path = require('path');
let express = require('express');
let bodyParser = require('body-parser');

let Library = require('./library');

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

router.get('/tmdb/movies/:search', (request, response) => { library.tmdbSearch(request, response); });
router.get('/tmdb/movies/:source/:sourceId/:language?', (request, response) => { library.tmdbExternalMovie(request, response); });
router.get('/tmdb/movie/:tmdbId', (request, response) => { library.tmdbMovie(request, response); });
router.get('/tmdb/genres/:language?', (request, response) => { library.tmdbGenres(request, response); });

// router.get('/library/lists', (request, response) => { });

// router.get('/library/list/:uuid', (request, response) => {});
// router.put('/library/list/:uuid', (request, response) => {});
// router.post('/library/list/:uuid', (request, response) => {});
// router.delete('/library/list/:uuid', (request, response) => {});

router.get('/library/movies', (request, response) => { library.getMovies(request, response); });

router.get('/library/movie/:uuid', (request, response) => { library.getMovie(request, response); });
// router.put('/library/movie/:uuid', (request, response) => {});
// router.post('/library/movie/:uuid', (request, response) => {});
// router.delete('/library/movie/:uuid', (request, response) => {});

router.put('/library/import/:source/:language?', (request, response) => { library.tmdbImport(request, response); });

router.get('/library/stats', (request, response) => { library.getStats(request, response); });

// setup library
// // // // // // // // // // // // // // // // // // // // // // // // // // //

let library = new Library();
library.initialize({
    apiUrl: 'https://api.themoviedb.org/3',
    apiKeyTmdb: '9cc3876eae5c294c28fc147e4fd1c957',
    mongoUrl: `mongodb://localhost:4000/medialibrary`,
    mongoCollections: [ 'tmdb/search', 'tmdb/movie', 'tmdb/external', 'tmdb/genres', 'movies', 'library/jobs' ]
});

// start server
// // // // // // // // // // // // // // // // // // // // // // // // // // //

app.listen(4100);