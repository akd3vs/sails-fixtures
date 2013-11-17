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
var fixtures = require('sails-fixtures')
    , contacts = [
        {
            name: 'Creatika'
        }
    ]
;

module.exports.getQueue = function(cb) {
    fixtures.queue({
        queue: contacts,
        model: Contact
    }, function(queue) {
        cb(queue);
    });
};
```
## Unions
---

``` javascript
var fixtures = require('sails-fixtures')
    , contacts = [
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
                     modelName: 'modelUser',
                     q: [{
                         name: 'andre'
                     }],
                     fields: [
                         ['fullName','name']
                     ]
                 }
             ]
         }
    ]
;

module.exports.getQueue = function(cb) {
    fixtures.queue({
        queue: contacts,
        model: Contact,
        modelUser: User
    }, function(queue) {
        cb(queue);
    });
};
```

This feature is in development, it will get more features like more fields to concatenate, better handle of the models, and data, etc.

The union it is specified in the key $$union. The modelName is the custom key in fixtures.queue();, if you look at it
itt will be a "modelUser" and in modelName there is a "modelUser".

The key "q" is to specify the query that will get the entry that we will get the fields.
This relation it is specify in the key fields. The field fullName of the entry that we get with the query "q"
we put in the name field of the current fixture.
