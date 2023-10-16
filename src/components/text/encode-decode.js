/* eslint-disable camelcase */
import { copyToClipboard } from '/components/libs/clipboard.js';

const toBinary = (str) => {
  let binary = '';
  for (let i = 0; i < str.length; i++) {
    binary += str.charCodeAt(i).toString(2).padStart(8, '0');
  }
  return binary;
};

const binaryToString = (binary) => {
  const bytes = binary.match(/.{1,8}/g);
  if (!bytes) return '';

  return bytes.map((byte) => String.fromCharCode(parseInt(byte, 2))).join('');
};

const toHex = (str) => {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
};

const hexToString = (hex) => {
  const hexBytes = hex.replace(/[^0-9a-fA-F]/g, '').match(/.{1,2}/g);
  if (!hexBytes) return '';

  return hexBytes.map((byte) => String.fromCharCode(parseInt(byte, 16))).join('');
};

const htmlEntityEncode = (str) => {
  const p = document.createElement('p');
  p.appendChild(document.createTextNode(str));
  return p.innerHTML;
};

const htmlEntityDecode = (encodedString) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(`<!doctype html><body>${encodedString}text/html`);
  return dom.body.textContent;
};

customElements.define('encode-decode', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = this.querySelector('template');

    shadow.appendChild(document.importNode(template.content, true));

    this.morseCodeMap = {
      // Letters
      A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.',
      F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
      K: '-.-', L: '.-..', M: '--', N: '-.', O: '---',
      P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
      U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--',
      Z: '--..',

      // Numbers
      0: '-----', 1: '.----', 2: '..---', 3: '...--',
      4: '....-', 5: '.....', 6: '-....', 7: '--...',
      8: '---..', 9: '----.',

      // Punctuation
      '.': '.-.-.-', ',': '--..--', '?': '..--..', '\'': '.----.',
      '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
      '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
      '+': '.-.-.', '-': '-....-', _: '..--.-', '"': '.-..-.',
      $: '...-..-', '@': '.--.-.'
    };

    this.reverseMorseCodeMap = {};
    for (const char in this.morseCodeMap) {
      if (char) this.reverseMorseCodeMap[this.morseCodeMap[char]] = char;
    }

    // bind this to functions
    this.generate = this.generate.bind(this);
    this.copy = this.copy.bind(this);

    // bind form elements
    this.encodeDecode = this.shadowRoot.getElementById('encodeDecode');
    this.encodeType = this.shadowRoot.getElementById('encodeType');
    this.textIn = this.shadowRoot.getElementById('textIn');
    this.button = this.shadowRoot.querySelector('button');
    this.output = this.shadowRoot.getElementById('output');
  }

  connectedCallback() {
    this.textIn.addEventListener('input', this.generate);
    this.encodeDecode.addEventListener('change', this.generate);
    this.encodeType.addEventListener('change', this.generate);
    this.button.addEventListener('click', this.copy);
    this.generate();
  }

  // generate random strings
  generate() {
    const encode = this.encodeDecode.value === 'encode';
    const encodeType = this.encodeType.value;
    const inputString = this.textIn.value;
    let outputString = '';

    switch (encodeType) {
      case 'base64':
        try {
          outputString = encode ? btoa(inputString) : atob(inputString);
        } catch {
          outputString = 'Invalid Base64!';
        }
        break;
      case 'binary':
        try {
          outputString = encode ? toBinary(inputString) : binaryToString(inputString);
        } catch {
          outputString = 'Invalid Binary!';
        }
        break;
      case 'hex':
        outputString = encode ? toHex(inputString) : hexToString(inputString);
        break;
      case 'html':
        outputString = encode ? htmlEntityEncode(inputString) : htmlEntityDecode(inputString);
        break;
      case 'morse':
        outputString = encode ? inputString.trim().split('')
          .map((char) => this.morseCodeMap[char.toUpperCase()] || ' ')
          .join(' ')
          .replace(/ +/g, ' ')
          .trim()
          : inputString.trim().split('   ')
            .map((word) => word.split(' ')
              .map((letter) => this.reverseMorseCodeMap[letter]).join('')
            )
            .join(' ');
        break;
      case 'url':
        outputString = encodeURIComponent(inputString);
        break;
      default: // nothing
    }

    this.output.value = outputString;
  }

  // copy output text
  async copy() {
    await copyToClipboard(this.output);
  }
});
