# CouchStream

A Stream interface for couchdb.

## example

basically just point CouchStream at your couch server ande start spraying documents in!

``` js
//TODO

```

## changes (opts)

listen for changes to the database. 
``` js
opts = {
  since: seq || 'now'         //  sequence number to listen from
, include_docs: false || true //  emit docs at each change
, filter:   pathToDesignDoc || function (doc, req) {}
}
```

## save (opts)

Save a stream of documents to the database, 

## get (opts)

retrive the docs for a stream of ids.  

must be stream of strings, or objects with `_id` or `id` properties.

## wait (opts)

buffer the stream until the database is created, makes sense ahead of get

## create

create a database, but buffer the stream until the database ready. (makes sense ahead of save)

#TODO

##view

(pull sections at a time respecting pause, etc)

##delete

delete documents from a stream of ids (similar to get).