#!/usr/bin/env node
const {ExtractLocales} = require('../index.js')

const extractor = new ExtractLocales({
  locales: ['en-US', 'fr-FR'],
  htmlQuery: 'data-localize',
  jsFunction: 'localize'
})

extractor.parseHtml('<span data-localize>Hey {USER}, nice to meet you!</span>')
extractor.parseJs('localize("There { COUNT, plural, =0 {are no results} one {is one result} other {are # results} }.")')
extractor.output('./lang/')

