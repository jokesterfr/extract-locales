/**
 * @author Clément Désiles <main@jokester.fr>
 * @licence MIT
 * @description A locale extractor for web applications
 */
const fs = require('fs')
const path = require('path')
const { validate } = require('bcp47-validate')
const { JSDOM } = require('jsdom')
const esprima = require('esprima')
const yaml = require('js-yaml')

class ExtractLocales {
  /**
   * @param {Object} options
   * @return {ExtractLocales} instance
   */
  constructor (options) {
    this.keys = new Set()
    this.options = Object.assign({
      htmlQuery: '[data-localize]',
      jsFunction: 'localize',
      outputDirectory: './lang',
      outputType: 'json',
      purge: false
    }, options || {})

    if (!options.locales || !Array.isArray(options.locales)) {
      throw new Error('missing supported locales')
    } else {
      options.locales.forEach(l => {
        if (!validate(l)) throw new Error(l + ' is not a bcp47 compliant locale')
      })
    }
  }

  /**
   * Parse the HTML content to retrieve the locale keys
   * @param {String} HTML content to be parsed
   * @return {Array} values to be localized
   */
  parseHtml (content) {
    if (!content) return []
    const data = new Set()
    let dom

    try {
      dom = JSDOM.fragment(content)
    } catch (err) {
      console.error('> you have an error in your HTML syntax, parsing failed:')
      throw err
    }

    dom.querySelectorAll(this.options.htmlQuery).forEach(item => {
      data.add(item.innerHTML)
    })

    this.keys.add(...data)
    return Array.from(data).sort()
  }

  /**
   * Parse the HTML content to retrieve the locale keys
   * @param {String} HTML content to be parsed
   * @return {Array} values to be localized
   */
  parseJs (content) {
    if (!content) return []
    const data = new Set()
    let tokens

    try {
      tokens = esprima.tokenize(content)
    } catch (err) {
      console.error('> you have an error in your Javascript syntax, parsing failed:')
      throw err
    }

    tokens.forEach((token, i) => {
      if (token.type !== 'Identifier' || token.value !== this.options.jsFunction) return
      if (!tokens[i + 1] || tokens[i + 1].type !== 'Punctuator') return
      if (!tokens[i + 2] || tokens[i + 2].type !== 'String') return
      data.add(tokens[i + 2].value)
    })

    this.keys.add(...data)
    return Array.from(data).sort()
  }

  /**
   * Output the detected keys in the locale directory
   * @param {String} outputDirectory - directory to store locale files
   * @param {String} outputType - 'json' or 'yml'
   * @return none
   */
  output (outputDirectory, outputType) {
    this.options.outputDirectory = outputDirectory || this.options.outputDirectory
    this.options.outputType = outputType || this.options.outputType

    if (!fs.existsSync(this.options.outputDirectory)) fs.mkdirSync(this.options.outputDirectory)

    // default locale has "locale key" => "locale key" association
    const detectedKeys = (Array.from(this.keys)).sort().reduce((map, cur) => {
      map[cur] = cur
      return map
    }, {})

    const taks = []
    this.options.locales.forEach(locale => {
      taks.push(
        new Promise((resolve, reject) => {
          const filename = locale + '.' + this.options.outputType
          const filepath = path.join(this.options.outputDirectory, filename)
          let doc = {}

          // parse the input locale file
          if (fs.existsSync(filepath)) {
            const parser = (['yml', 'yaml'].indexOf(this.options.outputType) !== -1) ? yaml.safeLoad : JSON.parse
            try {
              doc = parser(fs.readFileSync(filepath, 'utf8'))
            } catch (e) {
              console.error(e)
              return reject(new Error('cannot parse ' + filepath + ' ' + this.options.outputType + ' file'))
            }
          }

          // purge document if required
          if (this.options.purge) {
            Object.keys(doc).forEach(key => {
              if (!detectedKeys.hasOwnProperty(key)) {
                console.log('old key purged:', key)
                delete doc[key]
              }
            })
          }

          // output to the locale the merged values
          const serializer = (['yml', 'yaml'].indexOf(this.options.outputType) !== -1) ? yaml.safeDump : JSON.stringify
          doc = serializer(Object.assign(detectedKeys, doc), null, 2)
          fs.writeFileSync(filepath, doc, 'utf8')
          return resolve(filename)
        })
      )
    })
    Promise.all(taks)
      .then(() => {
        console.log(`locales updated in ${this.options.outputDirectory}: ${this.options.locales.join(', ')}`)
      })
      .catch(e => {
        console.error(e)
      })
  }
}

module.exports.ExtractLocales = ExtractLocales
