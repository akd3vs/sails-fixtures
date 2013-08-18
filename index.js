var async = require('async')
    , glob = require('glob')
    ;

module.exports = {
    init: function(config, cb) {

        var asyncQueue = [];

        glob(config.dir + "/" + config.pattern, function(err, files){
            for (var i in files) {
                var fixture = require(files[i]);
                for(var ii in fixture){
                    asyncQueue.push(fixture[ii]);
                }
            }
            async.series(asyncQueue, function(err, result){
                console.warn('Terminadas las fixtures', result);
                cb();
            });
        });
    }
};