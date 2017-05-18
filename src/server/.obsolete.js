
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