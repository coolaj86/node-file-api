(function () {
  "use strict";

  var http = require('http'),
    File = require('../lib/file.js'),
    FormData = require('../lib/form-data.js'),
    formData = new FormData(),
    chunked = (new Date().valueOf() % 2) ? true : false,
    client = http.createClient(3000, 'localhost'),
    bodyStream,
    headers,
    body,
    request,
    requestChunked;

  formData.setNodeChunkedEncoding(chunked);

  formData.append('items[]', 'value0');
  formData.append('items[]', 'value1');
  formData.append('item', 'value2');
  formData.append('item', 'value3');
  formData.append('file1', new File(__dirname + '/../files/file2.txt'));
  formData.append('emoticon', new File(__dirname + '/../files/smiley-cool.png'));
  formData.append('avatar', new File(__dirname + '/../files/coolaj86-2010.jpg'));

  // Uses 'x-www-form-urlencoded' if possible
  bodyStream = formData.serialize('x-www-form-urlencoded');

  requestChunked = client.request('POST', '/', {
    "Host": "localhost:3000",
    "Content-Type": formData.getContentType(),
    "Transfer-Encoding": "chunked"
  });

  bodyStream.on('data', function (data) {
    // Node takes care of the chunk sizes and count
    /*
      "\r\n" + data.length.toString(16) + data
    */
    requestChunked.write(data);
  });
  bodyStream.on('load', function () {
    // Node takes care of the body footer
    /*
      "\r\n" + 0 + "\r\n\r\n"
    */
    requestChunked.end();
  });

  // `size` will always occur before `load`
  // but will likely not occur before the
  // first `data`
  bodyStream.on('size', function (size) {
    request = client.request('POST', '/', {
      "Host": "localhost",
      "Content-Type": formData.getContentType(),
      "Content-Length": size
    });
  });

  bodyStream.on('load', function (data) {
    request.write(data);
    request.end();
    request.on('response', function (response) {
      //response.on();
    });
  });

}());
