import randomColor from '/components/libs/random-color-lib.js';

// custom element
customElements.define('random-color', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = this.querySelector('template');

    shadow.appendChild(document.importNode(template.content, true));

    // bind this to functions
    this.generate = this.generate.bind(this);

    // bind form elements
    this.count = this.shadowRoot.getElementById('count');
    this.luminosity = this.shadowRoot.getElementById('luminosity');
    this.hue = this.shadowRoot.getElementById('hue');
    this.hueMod = this.shadowRoot.getElementById('hueMod');
    this.hueHex = this.shadowRoot.getElementById('hueHex');
    this.output = this.shadowRoot.getElementById('output');
  }

  connectedCallback() {
    this.count.addEventListener('input', this.generate);
    this.hueHex.addEventListener('input', this.generate);
    this.luminosity.addEventListener('change', this.generate);
    this.hue.addEventListener('change', this.generate);
    this.generate();
  }

  // generate random colors
  generate() {
    let out = '';
    let huey = this.hue.value;

    if (this.hue.value === 'custom') {
      this.hueMod.style.display = 'block';
      huey = `#${this.hueHex.value}`;
    } else {
      this.hueMod.style.display = 'none';
    }

    const colors = randomColor({
      count: this.count.value,
      luminosity: this.luminosity.value,
      hue: huey
    });

    const colorsLen = colors.length;
    for (let i = 0; i < colorsLen; i++) {
      out += `<div class="colorBlock"><div class="color" style="background:${colors[i]}"></div> 
        ${colors[i]}</div>`;
    }

    this.output.innerHTML = out;
  }
});
