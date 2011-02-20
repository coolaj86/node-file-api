(function () {
  "use strict";

  function doUpload() {
    var fileFields = $('[type=file]')[0],
      fileList = fileFields.files,
      file = fileList[0],
      formData = new FormData(),
      xhr = new XMLHttpRequest();

    formData.append('upgrade', fileList[0]);

    xhr.open("POST", "/upload", true);
    xhr.send(formData);
  }

  doUpload();
}());
