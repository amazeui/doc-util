# doc-util
Amaze UI Markdown docs parsing util.

## Usage

```javascript
'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var markJSON = require('markit-json');
var docUtil = require('amazeui-doc-util');

gulp.task('markdoc', function(){
  return gulp.src('./test/test.md')
    .pipe(markJSON(docUtil.markedOptions))
    .pipe(docUtil.applyTemplate())
    .pipe($.rename(function(file) {
      file.extname = '.html';
    }))
    .pipe(gulp.dest('./dist'));
});
```

### `.markedOptions`

[marked](https://www.npmjs.com/package/marked) options for Amaze UI docs.

### `.applyTemplate(tpl, data)`

- `tpl`: Handlebars template, default is [default.hbs](https://github.com/amazeui/doc-util/blob/master/template/default.hbs).
- `data`: data pass to tpl.

In default tpl, you can set:

```js
{
  head: '', // code insert to HTML <head>
  footer: '', // code insert before HTML </body>
  pluginTitle: '',
  pluginDesc: '',
}
```

Custom data will extend with `markJSON()`'s result and pass to template.
