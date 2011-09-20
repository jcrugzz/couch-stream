# CouchStream

A Stream interface for couchdb.  

## example

basically just point CouchStream at your couch server ande start spraying documents in!

create a CouchStream and start writing documents to it.  
has the same interface as [Stream](http://nodejs.org/api/streams.html)
``` js
var CouchStream = require('couch-stream')
var save = CouchStream.save({database: 'tests'})

save.write({doc: "YES"})
```
or even better: USE PIPE

``` js
documentSource.pipe(save)
```

all the following examples use [EventStream](http://nodejs.org/api/streams.html)  
a toolkit for working creating and using Streams.  

## common options

each CouchStream function takes options and returns a stream.  
the following options apply to all functions:

``` js
{ database: database      // database  (mandatory)
, port: port              // port (default: 5984)
, host: host              // host (default: 'localhost')
, url: 
  'http://HOST:PORT/DB'   //optional, in place of using database, host, & port
}

```

## changes (opts)

read changes from the database, as they occur.  

wraps [Follow](https://github.com/iriscouch/follow)  
so options that work for follow, will work the same here.

``` js
var opts = {
  since: seq              // sequence number to listen from (default: 'now')
, include_docs: boolean   // emit docs at each change (default: false)
, filter:   filter        // a path to a design doc or a filter function (default: null (do not filter))
} //plus options 

CouchStream.changes(opts).pipe(writable)
```

## save (opts)

Save a stream of documents to the database,  
wraps [request](https://github.com/mikeal/request)  
so options that work for request will also work here.  
  
requires only the common options.

``` js

readable.pipe(CouchStream.save({database: 'tests'})) 

```


## get (opts)

retrive the docs from a Stream of ids.   
must be stream of strings, or objects with `_id` or `id` properties.  
  
requires only the common options.

``` js
ids.pipe(CouchStream.get({database: 'tests'})) 

```

## wait (opts)

buffer the stream until the database exists, 
(makes sense ahead of save)  

no documents will be let through until the database has exists.  
does not create the database.  

``` js

var waitForExists = 
      CouchStream.wait({
        database: 'tests'
      , poll: 100    //poll for the database every 100 ms. (default: 500)
      })

var es = require('event-stream')

es.connect(
  readableStreamOfDocuments,
  waitForExists,
  CouchStream.save({database: 'tests'})
)
```

## create

create a database, buffering the stream until the database is ready.  
(makes sense ahead of save)

``` js

var createDB = 
  CouchStream.create({database: 'tests'})

var es = require('event-stream')

es.connect(
  readableStreamOfDocuments,
  createDB,
  CouchStream.save({database: 'tests'})
)
```


#TODO

##view

(pull sections at a time respecting pause, etc)

##delete

delete documents from a stream of ids (similar to get).