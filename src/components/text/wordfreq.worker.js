/* eslint-disable no-throw-literal */
/* wordfreq - Text corpus calculation in Javascript.

  Author: timdream <http://timc.idv.tw/>
  modified

  This file contains the following library (unmodified but minified):
  http://tartarus.org/~martin/PorterStemmer/js.txt
  // Porter stemmer in Javascript
  // Release 1 be 'andargor', Jul 2004
  // Release 2 (substantially revised) by Christopher McKenzie, Aug 2009

*/

(function (global) {
  // http://tartarus.org/~martin/PorterStemmer/js.txt
  // Porter stemmer in Javascript
  // Release 1 be 'andargor', Jul 2004
  // Release 2 (substantially revised) by Christopher McKenzie, Aug 2009
  const stemmer = (function () {
    const g = {
        ational:'ate',
        tional:'tion',
        enci:'ence',
        anci:'ance',
        izer:'ize',
        bli:'ble',
        alli:'al',
        entli:'ent',
        eli:'e',
        ousli:'ous',
        ization:'ize',
        ation:'ate',
        ator:'ate',
        alism:'al',
        iveness:'ive',
        fulness:'ful',
        ousness:'ous',
        aliti:'al',
        iviti:'ive',
        biliti:'ble',
        logi:'log'
      },
      h = {
        icate:'ic',
        ative:'',
        alize:'al',
        iciti:'ic',
        ical:'ic',
        ful:'',
        ness:''
      };

    // eslint-disable-next-line complexity
    return function (a) {
      let d, b, c, f;
      if (a.length < 3) return a;
      const e = a.substring(0, 1);
      if (e === 'y') a = e.toUpperCase() + a.substring(1);
      c = /^(.+?)(ss|i)es$/;
      b = /^(.+?)([^s])s$/;
      if (c.test(a))a = a.replace(c, '$1$2');
      else if (b.test(a))a = a.replace(b, '$1$2');
      c = /^(.+?)eed$/;
      b = /^(.+?)(ed|ing)$/;
      if (c.test(a)) {
        b = c.exec(a);
        c = /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/;
        if (c.test(b[1])) {
          c = /.$/;
          a = a.replace(c, '');
        }
      } else if (b.test(a)) {
        b = b.exec(a);
        d = b[1];
        b = /^([^aeiou][^aeiouy]*)?[aeiouy]/;
        if (b.test(d)) {
          a = d;
          b = /(at|bl|iz)$/;
          f = /([^aeiouylsz])\1$/;
          d = /^[^aeiou][^aeiouy]*[aeiouy][^aeiouwxy]$/;
          if (b.test(a))a += 'e';
          else if (f.test(a)) {
            c = /.$/;
            a = a.replace(c, '');
          } else if (d.test(a))a += 'e';
        }
      }
      c = /^(.+?)y$/;
      if (c.test(a)) {
        b = c.exec(a);
        d = b[1];
        c = /^([^aeiou][^aeiouy]*)?[aeiouy]/;
        if (c.test(d))a = `${d}i`;
      }
      c = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
      if (c.test(a)) {
        b = c.exec(a);
        d = b[1];
        b = b[2];
        c = /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/;
        if (c.test(d))a = d + g[b];
      }
      c = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
      if (c.test(a)) {
        b = c.exec(a);
        d = b[1];
        b = b[2];
        c = /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/;
        if (c.test(d))a = d + h[b];
      }
      c = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
      b = /^(.+?)(s|t)(ion)$/;
      if (c.test(a)) {
        b = c.exec(a);
        d = b[1];
        c = /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/;
        if (c.test(d))a = d;
      } else if (b.test(a)) {
        b = b.exec(a);
        d = b[1] + b[2];
        b = /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/;
        if (b.test(d))a = d;
      }
      c = /^(.+?)e$/;
      if (c.test(a)) {
        b = c.exec(a);
        d = b[1];
        c = /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/;
        b = /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*([aeiouy][aeiou]*)?$/;
        f = /^[^aeiou][^aeiouy]*[aeiouy][^aeiouwxy]$/;
        if (c.test(d) || b.test(d) && !f.test(d))a = d;
      }
      c = /ll$/;
      b = /^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/;
      if (c.test(a) && b.test(a)) {
        c = /.$/;
        a = a.replace(c, '');
      }
      if (e === 'y') a = e.toLowerCase() + a.substring(1);
      return a;
    };
  }());

  const WordFreqSync = (options) => {
    let list = [];
    let terms = Object.create(null);

    options = options || {};

    // fill some defaults
    options.languages = options.languages || ['chinese', 'english'];
    options.stopWordSets = options.stopWordSets || ['cjk', 'english1', 'english2'];

    if (!Array.isArray(options.stopWords)) {
      options.stopWords = [];
    }

    options.stopWordSets.forEach((stopWordSet) => {
      switch (stopWordSet) {
        case 'cjk':
          options.stopWords = options.stopWords.concat([
            '\u3092', /* Japanese wo */
            '\u3067\u3059', /* Japanese desu */
            '\u3059\u308b', /* Japanese suru */
            '\u306e', /* Japanese no */
            '\u308c\u3089']);
          break;
        case 'english1':
          options.stopWords = options.stopWords.concat([
            'i', 'a', 'about', 'an', 'and', 'are', 'as', 'at',
            'be', 'been', 'by', 'com', 'for', 'from', 'how', 'in',
            'is', 'it', 'not', 'of', 'on', 'or', 'that',
            'the', 'this', 'to', 'was', 'what', 'when', 'where', 'which',
            'who', 'will', 'with', 'www', 'the']);
          break;
        case 'english2':
          options.stopWords = options.stopWords.concat([
            'we', 'us', 'our', 'ours',
            'they', 'them', 'their', 'he', 'him', 'his',
            'she', 'her', 'hers', 'it', 'its', 'you', 'yours', 'your',
            'has', 'have', 'would', 'could', 'should', 'shall',
            'can', 'may', 'if', 'then', 'else', 'but',
            'there', 'these', 'those']);
          break;
        default: // nothing
      }
    });

    if (typeof options.filterSubstring !== 'boolean') options.filterSubstring = true;

    options.maxiumPhraseLength = options.maxiumPhraseLength || 8;
    options.minimumCount = options.minimumCount || 2;


    // Return all possible substrings of a give string in an array
    // If there is no maxLength is unrestricted, array will contain
    // (2 * str.length) substrings.
    const getAllSubStrings = (str, maxLength) => {
      if (!str.length) return [];

      let result = [];
      let i = Math.min(str.length, maxLength);
      do {
        result.push(str.substring(0, i));
      } while (--i);

      if (str.length > 1) result = result.concat(getAllSubStrings(str.substring(1), maxLength));

      return result;
    };

    return {
      process: function process(text) {
        terms = Object.create(null); // reset
        if (typeof text !== 'string') throw 'You need to supply text for processing.';

        // English
        if (options.languages.indexOf('english') !== -1) {
        // For English, we count "stems" instead of words,
        // and decide how to represent that stem at the end
        // according to the counts.
          let stems = Object.create(null);

          // say bye bye to characters that is not belongs to a word
          const words = text.split(/[^A-Za-zéÉ'’_\-0-9@.]+/);

          const stopWords = options.stopWords;

          words.forEach((word) => {
            word = word
              .replace(/\.+/g, '.') // replace multiple full stops
              .replace(/(.{3,})\.$/g, '$1') // replace single trailing stop
              .replace(/n['’]t\b/ig, '') // get rid of ~n't
              .replace(/['’](s|ll|d|ve)?\b/ig, ''); // get rid of ’ and '

            // skip if the word is shorter than two characters
            // (i.e. exactly one letter)
            if (!word || word.length < 2) return;

            // that's not a word unless it contains at least an alphabet
            if (/^[0-9.@-]+$/.test(word)) return;

            // skip if this is a stop word
            if (stopWords.indexOf(word.toLowerCase()) !== -1) return;

            const stem = stemmer(word).toLowerCase();

            // count++ for the stem
            if (!(stem in stems)) stems[stem] = { count: 0, word };
            stems[stem].count++;

            // if the current word representing the stem is longer than
            // this one, use this word instead (booking -> book)
            if (word.length < stems[stem].word.length) stems[stem].word = word;

            // if the current word representing the stem is of the same
            // length but with different form,
            // use the lower-case representation (Book -> book)
            if (word.length === stems[stem].word.length &&
              word !== stems[stem].word) stems[stem].word = word.toLowerCase();
          });

          // Push each "stem" into terms as word
          for (const stem in stems) {
            if (stem) {
              const term = stems[stem].word;
              if (!(term in terms)) {
                terms[term] = stems[stem].count;
              } else {
                terms[term] += stems[stem].count;
              }
            }
          }

          stems = undefined;
        }

        // Chinese
        if (options.languages.indexOf('chinese') !== -1) {
        // Chinese is a language without word boundary.
        // We must use N-gram here to extract meaningful terms.

          // say good bye to non-Chinese (Kanji) characters
          // TBD: Cannot match CJK characters beyond BMP,
          // e.g. \u20000-\u2A6DF at plane B.

          // Han: \u4E00-\u9FFF\u3400-\u4DBF
          // Kana: \u3041-\u309f\u30a0-\u30ff
          const regexp = /[^\u4E00-\u9FFF\u3400-\u4DBF]+/g;
          text = text.replace(regexp, '\n');

          // Use the stop words as separators -- replace them.
          options.stopWords.forEach((stopWord) => {
          // Not handling that stop word if it's not a Chinese word.
            if (!(/^[\u4E00-\u9FFF\u3400-\u4DBF]+$/).test(stopWord)) return;

            text = text.replace(new RegExp(stopWord, 'g'), '$1\n');
          });

          const chunks = text.split(/\n+/);

          let pendingTerms = Object.create(null);

          // counts all the chunks (and it's substrings) in pendingTerms
          chunks.forEach((chunk) => {
            if (chunk.length <= 1) return;

            const substrings = getAllSubStrings(chunk, options.maxiumPhraseLength);
            substrings.forEach((substr) => {
              if (substr.length <= 1) return;

              if (!(substr in pendingTerms)) pendingTerms[substr] = 0;

              pendingTerms[substr]++;
            });
          });

          // if filterSubstring is true, remove the substrings with the exact
          // same count as the longer term (implying they are only present in
          // the longer terms)
          if (options.filterSubstring) {
            for (const term in pendingTerms) {
              if (term) {
                const substrings = getAllSubStrings(term, options.maxiumPhraseLength);
                // eslint-disable-next-line no-loop-func
                substrings.forEach((substr) => {
                  if (term === substr) return;

                  if (substr in pendingTerms &&
                    pendingTerms[substr] === pendingTerms[term]) {
                    delete pendingTerms[substr];
                  }
                });
              }
            }
          }

          // add the pendingTerms into terms
          for (const term in pendingTerms) {
            if (term) {
              if (!(term in terms)) terms[term] = 0;

              terms[term] += pendingTerms[term];
            }
          }

          pendingTerms = undefined;
        }

        // Update the list
        list = [];
        for (const term in terms) {
          if (terms[term] < options.minimumCount) continue;

          list.push([term, terms[term]]);
        }
        list = list.sort((a, b) => {
          if (a[1] > b[1]) return -1;
          if (a[1] < b[1]) return 1;
          if (a[0] === b[0]) return 0;
          const t = [a[0], b[0]].sort();
          if (t[0] !== a[0]) return 1;
          return -1;
        });

        return list;
      },

      empty: function empty() {
        list = [];
        terms = Object.create(null);
        return true;
      },

      getList: function getList() {
        return list;
      },

      getLength: function getLength() {
        return list.length;
      },

      getVolume: function getVolume() {
        let volume = 0;
        list.forEach((item) => {
          volume += item[0].length * Math.pow(item[1], 2);
        });

        return volume;
      },

      stop: function stop() { /* Nothing to do. */ }
    };
  };

  WordFreqSync.isSupported = Boolean(Array.prototype.push &&
  Array.prototype.indexOf &&
  Array.prototype.forEach &&
  Array.isArray &&
  Object.create);

  // expose WordFreqSync as a global interface.
  // eslint-disable-next-line no-sync
  global.WordFreqSync = WordFreqSync;

  /* If those conditions are met, assume we are in Web Workers.
  * Web Workers script that importScripts() us must have their onmessage
  * handler set-up first.
  * 1. the global object must have a self property.
  * 2. the global object must NOT have an window property that is assigned to
  *    itself.
  * 3. there are two Web Workers method exists under 'self'.
  *
  * XXX: I would love to check (self === global) but it would fail on IE10.
  */
  if ('self' in global &&
    !('window' in global && window === global) &&
    !self.onmessage && self.postMessage && self.importScripts) {
    let wordfreqsync;
    self.onmessage = (evt) => {
      const msg = evt.data;
      const method = msg.method;
      const params = msg.params;

      if (method === 'init') {
        wordfreqsync = WordFreqSync.apply(global, params);
        self.postMessage(true);
        return;
      }

      if (!wordfreqsync) throw 'You must init to create an instance first';

      if (!method || !wordfreqsync[method]) throw 'No such method';

      const result = wordfreqsync[method](...params);
      self.postMessage(result);
    };
  }
}(this));
