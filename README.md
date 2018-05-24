# extract-locales

[![linting](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Extract HTML and JS localized messages for your web application.

## Installation

```sh
npm i --save-dev extract-locales
```

## Usage

### Quick examples

> TLDR; run the example script:

```sh
npm run examples
```

Then have a look at the modified `./lang` folder.

### CLI call

```sh
$ export PATH=./node_modules/.bin:$PATH
$ extract-locales \
  --locales en-US,fr-FR \
  --html src/**/*.html \
  --js js/**/*.js \
  --output tpl/ \
  --output-type yml \
  --purge
$ ls tpl/
en-US.yml fr-FR.yml
```

that's it!

### Package integration: CLI call

You can of course use this command line within your `package.json` scripts:

```json
"scripts": {
  "i18n:extract": "extract-locales --locales en-US,fr-FR --html src/**/*.html --js js/**/*.js --output tpl/ --purge"
}
```

### Package integration: programmatic call

If you want to write your own script / wrapper:

```js
const fs = require('fs')
const {ExtractLocales} = require('extract-locales')
const extractor = new ExtractLocales({
  htmlQuery: '[data-localize]',
  jsFunction: 'localize'
})

extractor.parseHtml('<span data-localize>Hey {USER}, nice to meet you!</span>')
extractor.parseJs('localize("There { COUNT, plural, \
  =0 {are no results} \
  one {is one result} \
  other {are # results} \
}.")')

extractor.output('./lang/')
```

## CLI documentation

```sh
$ ./cli.js --help

  Usage: extract-locales [options]

  Options:

    -V, --version                output the version number
    -l, --locales <en-US,fr-FR>  locales supported by your app
    -h, --html <path>            input HTML file or path to be parsed
    -j, --js <path>              input JS file or path to be parsed
    -o, --output <path>          output directory of the locale files (default: ./lang)
    -t, --output-type <type>     either json or yml (default: json)
    -p, --purge                  remove unused translations from your locale files
    --html-query <query>         query to retrieve keys in html files (default: [data-localize])
    --js-function <function>     identifier to retrieve keys in js files (default: localize)
    -h, --help                   output usage information
```

## Q&A

Q: I want the messages to respect my application complex folder structure, indeed, I'm looking for multiple translation files in the extractor output.
A: Do use multiple `extract-locales` calls in your build process, one per desired indentation.

## Other tools

* [build-locales](http://github.com/jokesterfr/build-locales)
* [gulp-locales](http://github.com/jokesterfr/gulp-locales)
