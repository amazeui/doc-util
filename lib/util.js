'use strict';

var path = require('path');
var format = require('util').format;
var fs = require('fs');
var hl = require('highlight.js');
var marked = require('marked');
var through = require('through2');
var Handlebars = require('handlebars');
var assign = require('object.assign');
var safeString = require('./safeString');

var escape = function(html, encode) {
  return html.replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;').
    replace(/</g, '&lt;').
    replace(/>/g, '&gt;').
    replace(/"/g, '&quot;').
    replace(/'/g, '&#39;');
};

var unescape = function(html) {
  return html.replace(/&([#\w]+);/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x' ?
        String.fromCharCode(parseInt(n.substring(2), 16)) :
        String.fromCharCode(+n.substring(1));
    }
    return '';
  });
};

var codeHl = function(code, language) {
  if (!language) {
    return '<pre>' + escape(code) + '</pre>';
  }
  if (language === 'html') {
    language = 'xml';
  }
  code = hl.highlight(language, code).value;

  return format('<div class="doc-code demo-highlight">' +
    '<pre><code class="%s">%s</code></pre></div>', language, code);
};

var getLang = function(language) {
  if (!language) {
    return null;
  }

  if (language === 'html') {
    return 'html';
  }

  var shortcuts = {
    'js': 'javascript',
    'json': 'javascript',
    'py': 'python',
    'rb': 'ruby',
    'md': 'markdown',
    'mkd': 'markdown',
    'c++': 'cpp'
  };

  if (language && shortcuts[language]) {
    language = shortcuts[language];
  }

  if (!language || !hl.getLanguage(language)) {
    return null;
  }

  return language;
};

var renderer = new marked.Renderer();
renderer.code = function(code, language) {
  if (!language || language === '+' || language === '-') {
    return codeHl(code);
  }
  var lastChar = language.slice(-1);
  var hide = (lastChar === '-');
  var inject = (lastChar === '-' || lastChar === '+');

  if (inject) {
    language = language.slice(0, -1);
  }

  language = getLang(language);

  if (['javascript', 'css', 'html'].indexOf(language) !== -1) {
    inject = inject && true;
  }

  var html = '';

  if (inject) {
    html = {
      javascript: format('<script>%s</script>', code),
      css: format('<style type="text/css">%s</style>', code),
      html: format('<div class="doc-example">%s</div>', code)
    }[language];
  }

  if (hide && inject) {
    return html;
  }

  return html + codeHl(code, language);
};

renderer.heading = function(text, level) {
  var escapedText = safeString(text);

  return '<h' + level + '><a name="' +
    escapedText +
    '" class="anchor" href="#' +
    escapedText +
    '"><span class="header-link"></span></a>' +
    text + '</h' + level + '>';
};

renderer.table = function(header, body) {
  return format('<table class="am-table am-table-bordered am-table-striped"><thead>%s</thead><tbody>%s</tbody></table>', header, body);
};

var applyTemplate = function(tpl, data) {
  tpl = tpl || fs.readFileSync(path.join(__dirname, '../template/default.hbs'),
    {encoding: 'utf8'});
  var compiler = Handlebars.compile(tpl);

  return through.obj(function (file, enc, callback) {
    var mdData = assign({}, JSON.parse(file.contents.toString()), data || {});
    file.contents = new Buffer(compiler(mdData), 'utf8');
    this.push(file);
    callback();
  });
};

exports.markedOptions = {
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: true,
    sanitize: false,
    smartLists: true,
    renderer: renderer
};

exports.getLang = getLang;
exports.escape = escape;
exports.unescape = unescape;
exports.codeHl = codeHl;
exports.applyTemplate = applyTemplate;
exports.codeRenderer = renderer;
exports.autoprefixerBrowsers = [
  'ie >= 8',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 2.3',
  'bb >= 10'
];

exports.safeString = safeString;
