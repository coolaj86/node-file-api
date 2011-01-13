//
// FormData
//
// http://hacks.mozilla.org/2010/05/formdata-interface-coming-to-firefox/
//
(function () {
  "use strict";

  require('remedial');
  require('bufferjs');

  var EventEmitter = require('events').EventEmitter,
    Futures = require('futures'),
    File = require('./file'),
    FileReader = require('./file-reader');

  function isFile(o) {
    return (o instanceof File) ||
      (o.name && (o.path || o.stream || o.buffer));
  }

  function FormData() {
    var self = this,
      fields = {};

    self.nodeChunkedEncoding = false;

    self.setNodeChunkedEncoding = function (val) {
      self.nodeChunkedEncoding = val;
    };

    self.getContentType = function () {
      return self.type;
    };

    self.append = function (key, val) {
      var field = fields[key] = fields[key] || [],
        err;
      
      if (field.length > 0 && '[]' !== key.substr(key.length - 2)) {
        err = new Error("Overwriting '" + key + "'. Use '" + key  + "[] if you intend this to be treated as an array' ");
        console.log(err.message);
        field.pop();
      }

      field.push(val);
      return err;
    };

    function toJSON() {
      /*
        files.forEach(function (file) {
          var fr = new FileReader();
          fr.addEventListener('load', join.deliverer());
          fr.readAsText('base64');
        });
      */
    }

    function toContentDisposition(key, val) {
      var emitter = new EventEmitter(),
        text = '',
        fr;

      text += '\r\n--' + self.boundary;
      text += "\r\nContent-Disposition: form-data; name=" + key.quote();

      if (!isFile(val)) {
        if ('string' !== typeof val) {
          val = JSON.stringify(val);
        }
        process.nextTick(function () {
          emitter.emit('data', new Buffer(text + "\r\n\r\n" + val));
          emitter.emit('end');
        });
      } else {
        fr = new FileReader();
        fr.on('loadstart', function () {
          text += "\r\nContent-Type: " + (val.type || 'application/binary') + "\r\n\r\n";
          emitter.emit('data', new Buffer(text));
        });
        fr.on('data', function (data) {
          emitter.emit('data', data);
        });
        fr.on('loadend', function () {
          emitter.emit('end');
        });
        fr.setNodeChunkedEncoding(self.nodeChunkedEncoding);
        fr.readAsArrayBuffer(val);
      }
      return emitter;
    }

    Array.prototype.forEachAsync = function (callback) {
      var self = this,
        sequence = Futures.sequence();

      function handleItem(item, i, arr) {
        sequence.then(function (next) {
          callback(next, item, i, arr);
        });
      }

      this.forEach(handleItem);

      return sequence;
    };

    function toFormData() {
      var emitter = new EventEmitter(),
        buffers = [];

      // TODO randomize
      self.boundary = 'abcdefghiponmlkjqrstzyxwvu';

      emitter.on('data', function (data) {
        buffers.push(data);
      });

      Object.keys(fields).forEachAsync(function (next, key) {
        fields[key].forEachAsync(function (next, item) {
          var stream = toContentDisposition(key, item);
          stream.on('data', function (data) {
            emitter.emit('data', data);
          });
          stream.on('end', next);
        })
        .then(next);
      })
      .then(function (next) {
        emitter.emit('ready');
        next(); // does cleanup
      });

      emitter.on('ready', function () {
        var data = Buffer.concat(buffers);
        // TODO
        // determine the size as quickly as possible
        // so that the data can still be streamed, even
        // if the content-length must be known
        //
        // This will only take a significant amount of time
        // if one of the `File`s is stream-backed. Waiting
        // for the stream's `end` will hold-up the content-length
        // calculation.
        emitter.emit('size', data.length);
        emitter.emit('load', data);
        emitter.emit('end');
      });

      return emitter;
    }

    function toFormUrlEncoded() {
    }

    self.serialize = function (intendedType) {
      self.type = intendedType = (intendedType || '').toLowerCase();

      if ('multipart/form-data' !== self.type) {
        Object.keys(fields).forEach(function (key) {
          // TODO traverse entire tree
          fields[key].forEach(function (item) {
            if (isFile(item)) {
              self.type = 'multipart/form-data';
            }
          });
        });

        if ('multipart/form-data' === self.type) {
          console.log("ContentType changed `multipart/form-data`: Some of the upload items are `HTML5::FileAPI::File`s.");
        }

        return toFormData();
      }

      if (!self.type || 'application/x-www-form-urlencoded' === self.type) {
        self.type = 'application/x-www-form-urlencoded';
        return toFormUrlEncoded();
      }

      if ('application/json' === encoding.toLowerCase()) {
        return toJSON();
      }
    };
  }

  module.exports = FormData;

  if ('undefined' === typeof provide) { provide = function() {}; }
  provide('file-api/form-data');
}());
