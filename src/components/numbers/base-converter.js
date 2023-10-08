const baseConverter = (nbaseFrom, baseFrom, baseTo) => {
  const symbols = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (baseFrom <= 0 || baseFrom > symbols.length || baseTo <= 0 || baseTo > symbols.length) {
    return 'Bad Base';
  }

  let i, nbaseten = 0;
  if (baseFrom !== 10) {
    const sizenbaseFrom = nbaseFrom.length;
    for (i = 0; i < sizenbaseFrom; i++) {
      let mul, mulOk = -1;
      for (mul = 0; mul < symbols.length; mul++) {
        if (nbaseFrom[i] === symbols[mul]) {
          mulOk = 1;
          break;
        }
      }
      if (mul >= baseFrom) return 'Symbol not allowed';
      if (mulOk === -1) return 'Symbol not found';
      const exp = sizenbaseFrom - i - 1;
      if (exp === 0) {
        nbaseten += mul;
      } else {
        nbaseten += mul * Math.pow(baseFrom, exp);
      }
    }
  } else {
    nbaseten = parseInt(nbaseFrom, 10);
  }
  if (baseTo !== 10) {
    const nbaseTo = [];
    let mod;
    while (nbaseten > 0) {
      mod = nbaseten % baseTo;
      if (mod < 0 || mod >= symbols.length) return 'Out of bounds error';
      nbaseTo.push(symbols[mod]);
      nbaseten = parseInt(nbaseten / baseTo, 10);
    }
    return nbaseTo.reverse().toString().replace(/,/g, '');
  }
  return nbaseten.toString();
};

customElements.define('base-converter', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = this.querySelector('template');

    shadow.appendChild(document.importNode(template.content, true));

    // bind this to functions
    this.converter = this.converter.bind(this);

    // bind form elements
    this.nFrom = this.shadowRoot.getElementById('numFrom');
    this.nTo = this.shadowRoot.getElementById('numTo');
    this.bFrom = this.shadowRoot.getElementById('baseFrom');
    this.bTo = this.shadowRoot.getElementById('baseTo');

    this.timeout = null;
  }

  connectedCallback() {
    this.nFrom.addEventListener('input', this.converter);
    this.nTo.addEventListener('input', this.converter);
    this.bFrom.addEventListener('change', this.converter);
    this.bTo.addEventListener('change', this.converter);
  }

  // convert base, delay for typing
  converter() {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.nTo.value = baseConverter(this.nFrom.value, this.bFrom.value, this.bTo.value);
    }, 300);
  }
});
