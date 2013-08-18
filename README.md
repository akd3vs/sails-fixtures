# sails-fixtures
---
Fixtures for Sails.js
## Usage
---
In config/bootstrap.js
``` javascript
var sails_fixtures = require('sails-fixtures');

module.exports.bootstrap = function (cb) {

  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

    sails_fixtures.init({
        dir: __dirname + '/fixtures',
        /*pattern: '*.fixture.js'*/
        pattern: '*.js' //default
    }, function(){
        cb();
    });

};
```
And you have to create a directory in config called "fixtures" and the pattern key, specified the pattern to search files. I'm using the package glob.

Obviusly you can specify the directory where to search. You can, even make an api/controllers/fixtures, etc.
### Fixture structure
---
``` javascript
var queue = []
    , contacts = [
        {
            name: 'Creatika'
        }
    ]
;

queue.push(function(asynccbParent){
    Contact.destroy({}).done(function(errDestroy){
        if(errDestroy) console.log(errDestroy);
        asynccbParent(null, null); // just for fun
    });
});
contacts.forEach(function(contact){
    queue.push(function(asynccb){
        Contact.create(contact).done(function(err, contactObj){
            if(err) throw err;
            asynccb(null, contactObj);
        });
    });
});

module.exports = queue;
```
It is just an example, you can customize everything. Sorry for using async, but I did not find anything better to make async calls without looking to dirty.

The logic is:

I'm getting the contacts from the variable, you can obtain these from a DB for example (ironic), or from a file, then empty the collection Contact. In the second queue in this fixture, I'm creating the contacts pushing into the queue.
