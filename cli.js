#!/usr/bin/env node
/**
 * @author Clément Désiles <main@jokester.fr>
 * @licence MIT
 * @description CLI handler targeting ExtractLocales toolkit
 */
const fs = require('fs')
const pkg = require('./package.json')
const prog = require('commander')
const globby = require('globby')
const {ExtractLocales} = require('./index.js')

prog.name(pkg.name)
  .version(pkg.version)
  .option('-l, --locales <en-US,fr-FR>', 'locales supported by your app', String)
  .option('-h, --html <path1,path2>', 'input HTML file or path to be parsed', String)
  .option('-j, --js <path1,path2>', 'input JS file or path to be parsed', String)
  .option('-o, --output <path>', 'output directory of the locale files', String, './lang')
  .option('-t, --output-type <type>', 'either json or yml', String, 'json')
  .option('-p, --purge', 'remove unused translations from your locale files', Boolean, false)
  .option('--html-query <query>', 'query to retrieve keys in html files', String, '[data-localize]')
  .option('--js-function <function>', 'identifier to retrieve keys in js files', String, 'localize')
  .parse(process.argv)

const extractor = new ExtractLocales({
  locales: prog.locales && prog.locales.split(','),
  outputDirectory: prog.output,
  outputType: prog.outputType,
  htmlQuery: prog.htmlQuery,
  jsFunction: prog.jsFunction,
  purge: prog.purge
})

;(async () => {
  if (prog.html) {
    const htmlPaths = await globby(prog.html.split(','));
    htmlPaths.forEach(filepath => {
      console.log(`parsing ${filepath}`)
      extractor.parseHtml(fs.readFileSync(filepath).toString())
    })
  }

  if (prog.js) {
    const jsPaths = await globby(prog.js.split(','));
    jsPaths.forEach(filepath => {
      console.log(`parsing ${filepath}`)
      extractor.parseJs(fs.readFileSync(filepath).toString())
    })
  }

  extractor.output()
})()
