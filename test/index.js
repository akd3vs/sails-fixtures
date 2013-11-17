var assert = require("assert")
    , fixtures = require('../index.js')
    , tests = [
        {
            name: 'andre',
            lastName: 'contreras',
            fullName: ''
        }, {
            name: 'andre2',
            lastName: 'contreras2',
            fullName: '',
            $$union: [
                {
                    modelName: 'fakeModel',
                    q: [{
                        name: 'andre'
                    }],
                    fields: [
                        ['fullName','name'] // @TODO: concatenate more than 1 field
                    ]
                }
            ]
        }
    ],
    fakeModel = function() {
        this.currentData = null;
        this.destroy = function() { return this; };
        this.create = function(data) { this.currentData = data; this.currentData.save = this.save; return this; };
        this.then = function (cb, bad) { cb(this.currentData); return this; };
        this.done = function (cb, bad) { cb(null, this.currentData); return this; };
        this.find = function(query) { console.log('search', query); return this; };
        this.save = function(cb) { cb(null); }
        return this;
    }
;
/*global describe, it*/
describe('Main', function(){
    describe('Load Data', function(){
        var nextData = [];
        it('should return the queue', function(done) {
            var a = new fakeModel();
            fixtures.$$debug().queue({
                model: a,
                fakeModel: a,
                queue: tests
            }, function(data) {
                fakeModel = a;
                nextData = data;
                (typeof data[0]).should.equal('function');
                done();
            });
        });
        it('procesed the data and returned', function(done) {
            nextData[1](function(a,result) {
                result.name.should.equal(tests[0].name);
                done();
            });
        });
        it('execute correctly the queue remaining', function(done) {
            fixtures.exec([], done);
        })
    });
});