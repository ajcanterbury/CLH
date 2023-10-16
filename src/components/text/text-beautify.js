/* eslint-disable camelcase */
import { copyToClipboard } from '/components/libs/clipboard.js';

// old iife files converted to load as modules
// eslint-disable-next-line no-unused-vars
import dummy from '/components/libs/beautify-html.js';

customElements.define('text-beautify', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = this.querySelector('template');

    shadow.appendChild(document.importNode(template.content, true));

    // bind this to functions
    this.generate = this.generate.bind(this);
    this.copy = this.copy.bind(this);

    // bind form elements
    this.textType = this.shadowRoot.getElementById('textType');
    this.indent = this.shadowRoot.getElementById('indentType');
    this.textIn = this.shadowRoot.getElementById('textIn');
    this.button = this.shadowRoot.querySelector('button');
    this.output = this.shadowRoot.getElementById('output');
  }

  connectedCallback() {
    this.textIn.addEventListener('input', this.generate);
    this.textType.addEventListener('change', this.generate);
    this.indent.addEventListener('change', this.generate);
    this.button.addEventListener('click', this.copy);
    this.generate();
  }

  // generate random strings
  generate() {
    const textType = this.textType.value;
    let inputString = this.textIn.value;
    if (!inputString) return;

    let spaces = this.indent.value, outputString = '', options;
    const tabs = spaces === 'tab';
    switch (textType) {
      case 'json':
        if (tabs) {
          spaces = 10; // temp size
        } else {
          spaces = Number(spaces);
        }

        try {
          outputString = JSON.parse(inputString);
          outputString = JSON.stringify(outputString, undefined, spaces);
          if (spaces === 10) outputString = outputString.replace(/ {10}/g, '\t');
        } catch {
          outputString = 'Invalid JSON';
        }
        break;
      case 'html':
        options = {
          indent_size: tabs ? 1 : Number(spaces),
          indent_char: tabs ? '\t' : ' '
        };
        // eslint-disable-next-line no-undef
        outputString = window.html_beautify(inputString, options);
        break;
      default: // text
        options = tabs ? '\t' : ' '.repeat(Number(spaces));
        if (!inputString.startsWith(options)) {
          inputString = `${options}${inputString.trimStart()}`;
        }
        outputString = inputString
          .replace(/(\r\n|\r|\n)/g, `$1${options}`);
    }

    this.output.value = outputString;
  }

  // copy output text
  async copy() {
    await copyToClipboard(this.output);
  }
});
