'use strict';

import gulp from 'gulp';
import request from 'request';
import source from 'vinyl-source-stream';
import connect from 'gulp-connect';
import es from 'event-stream';
import through from 'through2';

function addBaseTag(domain) {

  return es.map((file, cb) => {

      var modifiedContent = ''

      if (file.isStream()) {

        file.contents
          .on('data', (d) => {
            modifiedContent += d.toString();
          })
          .on('error', (err) => {

          })
          .on('end', () => {

            var baseTag = '<head><base href="http://'+domain+'">';
            modifiedContent = modifiedContent.replace(/<head>/g, baseTag);

            file.contents = new Buffer(modifiedContent);

            cb(null, file);
          });

      } else {
        throw new Error('Not a stream');
      }


    });
};

gulp.task('fetch', () => {

  var domain = process.argv.slice(2).pop();

  if (!domain) {
    throw new Error('No domain provided');
  }

  return request('http://'+domain)
    .pipe(source('index.html'))
    .pipe(addBaseTag(domain))
    .pipe(gulp.dest('./temp/'+domain+'/'));

});

gulp.task('serve', () => {
  connect.server({
    root: 'temp'
  });
});

gulp.task('default', ['fetch', 'serve']);