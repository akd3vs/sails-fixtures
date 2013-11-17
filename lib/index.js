var async = require('async')
    , glob = require('glob')
    , exps = module.exports
    , isInit = false
    , debug = false
    , $q = require('q')
    , extend = require('node.extend')
    ;
// @TODO: test in a real environment lol
exps.$$debug = function() {
    isInit = true;
    debug = true;
    return exps;
};

exps.init = function(config, cb) {

    var asyncQueue = [];
    isInit = true;

    glob(config.dir + "/" + config.pattern, function(err, files){
        for (var i in files) {
            require(files[i]).getQueue(function(fixture) {
                for(var ii in fixture){
                    asyncQueue.push(fixture[ii]);
                }
            });
        }
        exps.exec(asyncQueue,cb);
    });
};

exps.exec = function(asyncQueue,cb) {
    if(debug) {
        var lastQueue = exps.union.processQueue();
        async.series(lastQueue, function(err_, result_) {
            console.warn('Terminadas las fixtures', result_);
            cb();
        });
    } else {
        async.series(asyncQueue, function(err, result) {
            var lastQueue = exps.union.processQueue();
            async.series(lastQueue, function(err_, result_) {
                console.warn('Terminadas las fixtures', result, result_);
                cb();
            });
        });
    }
};

exps.union = {
    queue: [],
    addQueue: function(entity, data, model, modelComp) {
        this.queue.push({entity:entity, data: data, modelComp: modelComp, model: model });
    },
    processQueue: function() {
        var queue = []
            ,$this = this
        ;
        this.queue.forEach(function(obj) {
            delete obj.entity.$$union;
            obj.model.create(obj.entity).then(function(origEntity){
                $this.__getQueueData(obj.data).forEach(function(data) {
                    queue.push(function(asynccb){
                        obj.modelComp.findOne(data.query).done(function( err, entity ) {
                            var field = entity[data.field];
                            origEntity[data.fieldName] = field;
                            console.log('assigning', data, origEntity, entity);
                            origEntity.save(function() {
                                asynccb(null, null);
                            });
                        });
                    });
                });
            });
        });
        return queue;
    },
    /**
     *
     * @param queue
     * @returns [{ field:..., fieldName:..., query:... }] || Error()
     * @private
     */
    __getQueueData: function(queue) {
        var queries = queue.q
            , fields = queue.fields

        ;
        if(queries.length != fields.length) {
            return new Error('The number of queries and fields does not match.');
        }
        var returns = []
        ;
        fields.forEach(function(current, index) {
            returns[index] = {
                fieldName: current[0],
                field: current[1],
                query: queries[index]
            };
        });
        return returns;
    }
};

/**
 * The intention of this method is add the objetcs to the queue.
 */
exps.queue = function(configs, callback) {
    var defer = $q.defer()
        ,queue = []
        , __globals = {

        }
    ;

    var globals = extend(true, __globals, configs)
        , Model = globals.model
    ;

    if(!isInit) {
        throw new Error('This actions is not available. init still not called.');
    }

    queue.push(function(cb){
        Model.destroy({}).done(function(errDestroy){
            if(errDestroy) cb(errDestroy);
            cb(null, null); // just for fun
        });
    });
    globals.queue.forEach(function(contact){
        if(null == contact.$$union){
            queue.push(function(asynccb){
                Model.create(contact).then(function(contactObj){
                    asynccb(null, contactObj);
                }, function(err) {
                    if(err){
                        throw err;
                    }
                });
            });
        } else {
            contact.$$union.forEach(function(obj) {
                exps.union.addQueue(contact, obj, globals.model, globals[obj.modelName]);
            });
        }
    });

    callback(queue);

    return exps;
};