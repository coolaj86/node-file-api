(function () {
  "use strict";

  var File = require('../lib/file.js'),
    FormData = require('../lib/form-data.js'),
    formData = new FormData(),
    chunked = (new Date().valueOf() % 2) ? true : false,
    size = 0,
    count = 0,
    bodyStream;

  formData.setNodeChunkedEncoding(chunked);

  // TODO auto-unfold arrays onto `key[]`
  // TODO auto-unfold objects onto `key[subkey]`
  formData.append('items[]', 'value0');
  formData.append('items[]', 'value1');
  formData.append('item', 'value2');
  formData.append('item', 'value3');
  formData.append('file1', new File(__dirname + '/../files/file2.txt'));
  formData.append('emoticon', new File(__dirname + '/../files/smiley-cool.png'));
  formData.append('avatar', new File(__dirname + '/../files/coolaj86-2010.jpg'));


  // Uses 'x-www-form-urlencoded' if possible
  bodyStream = formData.serialize('x-www-form-urlencoded');

  // Check to see if contentType has switched to 'multipart/form-data'
  console.log(formData.getContentType());

  bodyStream.on('data', function (data) {
    count += 1;
    size += data.length;
    //console.log(data.toString('binary'));
  });
  bodyStream.on('load', function (data) {
    console.log(chunked ? 'chunked' : 'not-chunked', count, data.length, size);
    //console.log(data.toString('binary'));
  });
  bodyStream.on('end', function () {
    console.log(size);
  });
}());
