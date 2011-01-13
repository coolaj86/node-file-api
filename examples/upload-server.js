/**
 * Module dependencies.
 */

var express = require('express'),
    form = require('connect-form'),
    sys = require('sys');

var app = express.createServer(
    // connect-form (http://github.com/visionmedia/connect-form)
    // middleware uses the formidable middleware to parse urlencoded
    // and multipart form data
    form({ keepExtensions: true })
);


app.get('/', function(req, res){
    res.send('<html><body>\n'
        + '\t<form method="post" enctype="multipart/form-data">\n'
        + '\t\t<p>First: <input type="text" name="name" /></p>\n'
        + '\t\t<p>Last: <input type="text" name="name" /></p>\n'
        + '\t\t<p>Favorite Color: <input type="text" name="favs[]" /></p>\n'
        + '\t\t<p>Favorite Weekday: <input type="text" name="favs[]" /></p>\n'
        + '\t\t<p>Email: <input type="text" name="email" /></p>\n'
        + '\t\t<p>Avatar: <input type="file" name="avatar" /></p>\n'
        + '\t\t<p>Files: <input type="file" name="files" multiple=multiple /></p>\n'
        + '\t\t<p>Attachments[]: <input type="file" name="attachments[]" multiple=multiple /></p>\n'
        + '\t\t<p><input type="submit" value="Upload" /></p>\n'
        + '\t</form>\n'
        + '</body></html>\n');
});

app.post('/', function(req, res, next){

    // connect-form adds the req.form object
    // we can (optionally) define onComplete, passing
    // the exception (if any) fields parsed, and files parsed
    req.form.complete(function(err, fields, files){
        if (err) {
            next(err);
        } else {
            console.log(JSON.stringify({
              fields: fields,
              files: files
            }, null, '  '));
            //console.log('\nuploaded %s to %s', 
                //files.image.filename,
                //files.image.path);
            res.redirect('back');
        }
    });

    // We can add listeners for several form
    // events such as "progress"
    req.form.addListener('progress', function(bytesReceived, bytesExpected){
        var percent = (bytesReceived / bytesExpected * 100) | 0;
        sys.print('Uploading: %' + percent + '\r');
    });
});

app.listen(3000);
console.log('Express app started on port 3000');
