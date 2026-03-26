const en = require('./en.json');
const ar = require('./ar.json');

const dictionaries = { en, ar };

const getDictionary = (locale) => dictionaries[locale] || dictionaries.en;

module.exports = { getDictionary };