(function () {
  "use strict";

  var http = require('http'),
    FileApi = require('../lib'),
    File = require('../lib/file.js'),
    FormData = require('../lib/form-data.js'),
    formData = new FormData(),
    client = http.createClient(process.argv[3] || 3000, process.argv[2] || 'localhost'),
    headers = {
      "Host": "localhost:3000",
      "User-Agent": "Node.js (AbstractHttpRequest)",
      "Accept-Encoding": "gzip,deflate",
      //"Accept-Charset": "ISO-8859-1,utf-8;q=0.7,*;q=0.7",
      //"Keep-Alive": 115,
      //"Connection": "keep-alive",
    },
    //chunked = false,
    chunked = true,
    bodyStream,
    request;


  function encodeBody() {
    formData.setNodeChunkedEncoding(chunked);
    // field portion
    formData.append('name', 'AJ');
    formData.append('name', 'ONeal');
    formData.append('favs[]', 'Blue');
    formData.append('favs[]', 'Wednesday');
    formData.append('email', 'coolaj86@gmail.com');
    // file portion
    formData.append('avatar', new File(__dirname + '/../files/smiley-cool.png'));
    formData.append('files', new File(__dirname + '/../files/file1.txt'));
    formData.append('files', new File(__dirname + '/../files/file2.txt'));
    formData.append('attachments[]', new File(__dirname + '/../files/file1.txt'));
    formData.append('attachments[]', new File(__dirname + '/../files/file2.txt'));
  }

  function sendBody() {
    // Uses 'x-www-form-urlencoded' if possible, but falls back to 'multipart/form-data; boundary=`randomString()`'
    bodyStream = formData.serialize('x-www-form-urlencoded');

    headers["Content-Type"] =  formData.getContentType();
    if (chunked) {
      request = client.request('POST', '/', headers);
      bodyStream.on('data', function (data) {
        request.write(data);
      });
    }

    // `data` will usually fire first, then `size`, then more `data`, then `load`
    bodyStream.on('size', function (size) {
      if (chunked) {
        return;
      } else {
        headers["Content-Length"] = size;
        request = client.request('POST', '/', headers);
      }
    });

    bodyStream.on('load', function (data) {
      if (!chunked) {
        request.write(data);
      }
      request.end();
    });
  }


  encodeBody();
  sendBody();
  // Does work on keep-alive
  // Does work with content-length
  // Does work when chunked (when content-length is commented out)
}());
