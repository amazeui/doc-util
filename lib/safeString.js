'use strict';

var unidecode = require('unidecode');

var safeString = function(string) {
  string = string.trim();

  // Remove non ascii characters
  string = unidecode(string);

  string = string.trim();

  // Remove URL reserved chars: `:/?#[]@!$&'()*+,;=` as well as `\%<>|^~£"`
  string = string.replace(/[:\/\?#\[\]@!$&'()*+,;=\\%<>\|\^~£"]/g, '')
    // Replace dots and spaces with a dash
    .replace(/(\s|\.)/g, '-')
    // Convert 2 or more dashes into a single dash
    .replace(/-+/g, '-')
    // Make the whole thing lowercase
    .toLowerCase();

  return string;
};

module.exports = safeString;
