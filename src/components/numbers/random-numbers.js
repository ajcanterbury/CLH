import { copyToClipboard } from '/components/libs/clipboard.js';

customElements.define('random-numbers', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = this.querySelector('template');

    shadow.appendChild(document.importNode(template.content, true));

    // bind this to functions
    this.generate = this.generate.bind(this);
    this.copy = this.copy.bind(this);

    // bind form elements
    this.length = this.shadowRoot.getElementById('length');
    this.chars = this.shadowRoot.getElementById('chars');
    this.special = this.shadowRoot.getElementById('special');
    this.crypto = this.shadowRoot.getElementById('crypto');
    this.select = this.shadowRoot.querySelector('select');
    this.button = this.shadowRoot.querySelector('button');
    this.output = this.shadowRoot.getElementById('output');
  }

  connectedCallback() {
    this.length.addEventListener('input', this.generate);
    this.chars.addEventListener('input', this.generate);
    this.special.addEventListener('change', this.generate);
    this.crypto.addEventListener('change', this.generate);
    this.select.addEventListener('change', this.generate);
    this.button.addEventListener('click', this.copy);
    this.generate();
  }

  // generate random numbers
  generate() {
    const count = parseFloat(this.length.value);
    const type = this.select.value;
    const max = parseFloat(this.chars.value);
    const spec = this.special.checked;
    const crypt = this.crypto.checked;
    let out = '';

    switch (type) {
      case 'a':
        out = '[';
        for (let i = 0; i < count; i++) {
          out += `${this.randomNumber(0, max, crypt, spec)}, `;
        }
        out = out.substring(0, out.length - 2);
        out += ']';
        break;
      case 'd':
        out = '{';
        // keys are incremeneted values
        for (let i = 0; i < count; i++) {
          out += `${i}: `;
          out += `${this.randomNumber(0, max, crypt, spec)}, `;
        }
        out = out.substring(0, out.length - 2);
        out += '}';
        break;
      case 'm':
        out = '[';
        for (let i = 0; i < count; i++) {
          out += '[';
          for (let j = 0; j < max; j++) {
            out += `${this.randomNumber(0, 100, crypt, spec)}, `;
          }
          out = out.substring(0, out.length - 2);
          out += '], ';
        }
        out = out.substring(0, out.length - 2);
        out += ']';
        break;
      default:
        out = this.randomNumber(count, max, crypt, spec);
    }

    this.output.innerHTML = out;
  }

  // random string
  randomNumber(min, max, crypt) {
    // pick strong or weak random
    if (crypt) {
      const randomBuffer = new Uint32Array(1);
      window.crypto.getRandomValues(randomBuffer);
      const randomNumber = randomBuffer[0] / (0xffffffff + 1);
      min = Math.ceil(min);
      const fmax = Math.floor(max);
      return Math.floor(randomNumber * (fmax - min + 1)) + min;
    }

    return Math.floor(Math.random() * max) + min;
  }

  // copy output text
  async copy() {
    await copyToClipboard(this.output);
  }
});
