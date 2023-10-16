import { copyToClipboard } from '/components/libs/clipboard.js';

customElements.define('random-strings', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = this.querySelector('template');

    shadow.appendChild(document.importNode(template.content, true));

    // character lists
    this.alphaNum = 'abcefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    this.specialChar = ' !"#$%&\'()*+,-./:;=>?@[\\]^_`{|}~';

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

  // generate random strings
  generate() {
    const count = this.length.value;
    const type = this.select.value;
    const charCount = this.chars.value;
    const spec = this.special.checked;
    const crypt = this.crypto.checked;
    let charList = this.alphaNum;
    let out = '';

    if (spec) {
      charList += this.specialChar;
    }

    switch (type) {
      case 'a':
        this.chars.style.opacity = '1';
        out = '[';
        for (let i = 0; i < count; i++) {
          out += `"${this.randomString(charCount, charList, crypt)}", `;
        }
        out = out.substring(0, out.length - 2);
        out += ']';
        break;
      case 'o':
        this.chars.style.opacity = '1';
        out = '{';
        // keys are incremeneted values
        for (let i = 0; i < count; i++) {
          out += `"${i}": "${this.randomString(charCount, charList, crypt)}", `;
        }
        out = out.substring(0, out.length - 2);
        out += '}';
        break;
      case 'p':
        this.chars.style.opacity = '';
        charList = this.alphaNum.substring(51);
        for (let i = 0; i < count; i++) {
          out += `(${this.randomString(3, charList, crypt)}) `;
          out += this.randomString(3, charList, crypt);
          out += `-${this.randomString(4, charList, crypt)}, `;
        }
        out = out.substring(0, out.length - 2);
        break;
      default:
        this.chars.style.opacity = '';
        out = this.randomString(count, charList, crypt);
    }

    this.output.innerHTML = out;
  }

  // random string
  randomString(len, charList, crypt) {
    const charLen = charList.length;
    let string = '';
    let rand = 0;

    // pick strong or weak random
    if (crypt) {
      let randomBuffer = new Uint32Array(1);
      let randomNumber = 0;
      for (let i = 0; i < len; i++) {
        randomBuffer = new Uint32Array(1);
        window.crypto.getRandomValues(randomBuffer);
        randomNumber = randomBuffer[0] / (0xffffffff + 1);
        rand = Math.floor(randomNumber * Math.floor(charLen));
        string += charList.charAt(rand);
      }
    } else {
      for (let i = 0; i < len; i++) {
        rand = Math.floor(Math.random() * Math.floor(charLen));
        string += charList.charAt(rand);
      }
    }

    return string;
  }

  // copy output text
  async copy() {
    await copyToClipboard(this.output);
  }
});
