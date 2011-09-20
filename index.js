var request = require('request')
  , follow  = require('follow')
  , es      = require('event-stream')
  , d       = require('d-utils')
  
  function safeCB(func, cb) {
    return function () {
      try {    
        func.apply(this, arguments)    
      } catch (err) {
        console.error(err)
        cb(err)
      }
    }
  }

//setup CouchStream with default parameters

function CouchStream(opts) {
  return d.map(exports, function (func, k) {
    return function CouchStream_wrapper(_opts) {
      return func(d.merge({}, opts, _opts )) //merge ignores null.
    }
  })
}

exports = module.exports = CouchStream

function getUrl (opts) {
  var host = opts.host || 'localhost'
    , port = opts.port || 5984
    , database = opts.database
    , url
    , url = opts.url || ('http://' + host + (port == 80 ? '' : ':' + port) + '/' + database)

  return url
}
  
function couchRequest (url, method, doc, callback) {
  var opts = {url: url, method: method}
  if(!callback) callback = doc, doc = null
  if(doc) opts.json = doc
  
  request(opts, safeCB(function (err, res, body) {

    console.error(err, res, body)

    var parseErr

    try { body = JSON.parse(body)} catch (err) { parseErr = err }

    if(err || res.statusCode >= 300 || parseErr) {
      err = err || (res.statusCode >= 300 ? body : null) || parseErr
      if(res && res.statusCode >= 300)
        err.statusCode = res.statusCode    
      throw err //caught be safeCB
    }

    callback(null, body)
  }, callback))
}

//add merge function:
//
// handle document conflicts by getting both documents and calling a merge function.
//
// default to force ? 
//
// that would mean you could pretty much use couchdb without thinking or learning stuff.
// just start spraying objects into the database...
//
  
exports.save = function (opts) {
  var url = getUrl(opts)

  //add a thing to create a database if it does not already exist

  return es.map(function (doc) {
    couchRequest(url, 'POST', doc, [].pop.call(arguments))
  })
}
//
// ReadableStream: changes this is very simple because follow does everything!
//
exports.changes = function (opts) {
  var stream = new es.Stream() //event-stream reexports stream from core.
  opts.db = getUrl(opts)
  opts.since = opts.since || 'now'
  follow(opts , function (err, change) {
    if(err)
      stream.emit('error', err)
    else
      stream.emit('data', change)
  })
  return stream
}

//
// ThroughStream: get documents from incoming ids
//

exports.get = function (opts) {

  //add a thing to poll until database is created

  return es.map(function (doc) {
    var id = 'string' == typeof doc ? doc : doc._id || doc.id

    couchRequest(getUrl(opts) + '/' + id, 'GET', [].pop.call(arguments))
  })

}

// 
// ThroughStream: wait until the database exists
//

exports.wait = function (opts) {

  var stream = es.gate()
  opts.poll = opts.poll || 500

  ;(function poll() {
    couchRequest(getUrl(opts), 'GET', function (err, json) {
      console.log(err, json)
      if(err) {
        if (err.statusCode == 404)
          d.delay(poll, opts.poll)()
        else
          stream.emit('error', err)
        return
      }
      //else the database exists!
      stream.open()
    })
  })()

  return stream
}

// 
// ThroughStream: create buffer events while the database is created
//

exports.create = function (opts) {

  var stream = es.gate()
  opts.poll = opts.poll || 500

  ;(function poll() {
    couchRequest(getUrl(opts), 'PUT', function (err, json) {
      if(err) {
        if (err.statusCode == 412)
          stream.open() //database already exists
        else
          stream.emit('error', err)
        return
      }
      //else the database was created
      stream.open()
    })
  })()

  return stream
}
