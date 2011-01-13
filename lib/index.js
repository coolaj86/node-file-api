//
// HTML5 File API
// http://www.w3.org/TR/FileAPI
(function () {
  "use strict";

  module.exports = {
    File: require('./file'),
    FileList: require('./file-list'),
    //FileError: require('./file-error'),
    FileReader: require('./file-reader'),
    FormData: require('./form-data')
  }

  if ('undefined' === typeof provide) { provide = function() {}; }
  provide('file-api');
}());
