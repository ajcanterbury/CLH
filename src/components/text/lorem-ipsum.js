customElements.define('lorem-ipsum', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    const template = this.querySelector('template');

    // little bit of webcomponent pollyfill if using web-components.js
    //ShadyCSS.prepareTemplate(template, customElem);
    
    shadow.appendChild(document.importNode(template.content, true));

    // giberish words
    this.words = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
      'adipiscing', 'elit', 'curabitur', 'vel', 'hendrerit', 'libero',
      'eleifend', 'blandit', 'nunc', 'ornare', 'odio', 'ut',
      'orci', 'gravida', 'imperdiet', 'nullam', 'purus', 'lacinia',
      'a', 'pretium', 'quis', 'congue', 'praesent', 'sagittis', 
      'laoreet', 'auctor', 'mauris', 'non', 'velit', 'eros',
      'dictum', 'proin', 'accumsan', 'sapien', 'nec', 'massa',
      'volutpat', 'venenatis', 'sed', 'eu', 'molestie', 'lacus',
      'quisque', 'porttitor', 'ligula', 'dui', 'mollis', 'tempus',
      'at', 'magna', 'vestibulum', 'turpis', 'ac', 'diam',
      'tincidunt', 'id', 'condimentum', 'enim', 'sodales', 'in',
      'hac', 'habitasse', 'platea', 'dictumst', 'aenean', 'neque',
      'fusce', 'augue', 'leo', 'eget', 'semper', 'mattis', 
      'tortor', 'scelerisque', 'nulla', 'interdum', 'tellus', 'malesuada',
      'rhoncus', 'porta', 'sem', 'aliquet', 'et', 'nam',
      'suspendisse', 'potenti', 'vivamus', 'luctus', 'fringilla', 'erat',
      'donec', 'justo', 'vehicula', 'ultricies', 'varius', 'ante',
      'primis', 'faucibus', 'ultrices', 'posuere', 'cubilia', 'curae',
      'etiam', 'cursus', 'aliquam', 'quam', 'dapibus', 'nisl',
      'feugiat', 'egestas', 'class', 'aptent', 'taciti', 'sociosqu',
      'ad', 'litora', 'torquent', 'per', 'conubia', 'nostra',
      'inceptos', 'himenaeos', 'phasellus', 'nibh', 'pulvinar', 'vitae',
      'urna', 'iaculis', 'lobortis', 'nisi', 'viverra', 'arcu',
      'morbi', 'pellentesque', 'metus', 'commodo', 'ut', 'facilisis',
      'felis', 'tristique', 'ullamcorper', 'placerat', 'aenean', 'convallis',
      'sollicitudin', 'integer', 'rutrum', 'duis', 'est', 'etiam',
      'bibendum', 'donec', 'pharetra', 'vulputate', 'maecenas', 'mi',
      'fermentum', 'consequat', 'suscipit', 'aliquam', 'habitant', 'senectus',
      'netus', 'fames', 'quisque', 'euismod', 'curabitur', 'lectus',
      'elementum', 'tempor', 'risus', 'cras'
    ];

    // bind this to functions
    this.generate = this.generate.bind(this);
    this.copy = this.copy.bind(this);

    // bind form elements
    this.input = this.shadowRoot.querySelector('input');
    this.select = this.shadowRoot.querySelector('select');
    this.button = this.shadowRoot.querySelector('button');
    this.output = this.shadowRoot.querySelector('div');
  }

  connectedCallback() {
    this.input.addEventListener('input', this.generate);
    this.select.addEventListener('change', this.generate);
    this.button.addEventListener('click', this.copy);
    this.generate();
  }

  // generate lorem ipsum
  generate() {
    const count = this.input.value;
    const type = this.select.value;
    let lorem = '';

    switch (type) {
      case 'p':
        for(let i = 0; i < count; i++) {
          const pLen = this.random(15, 45);
          lorem += '<p>' + this.wordPunc(pLen) + '</p>';
        }
        break;
      case 'b':
        let i = count/5;
        while(lorem.length < count) {
          lorem = this.wordPunc(i);
          i++;
        }
        lorem = lorem.substring(0, count - 1);
        break;
      case 'l':
        lorem = '<ul>';
        let lLen = this.random(5, 10);
        let line = this.wordPunc(lLen);
        lorem += '<li>' + line + '</li>';
        for(let i = 1; i < count; i++) {
          lLen = this.random(5, 10);
          line = this.wordPunc(lLen).replace('Lorem ipsum ','');
          line = line.charAt(0).toUpperCase() + line.substr(1);
          lorem += '<li>' + line + '</li>'
        }
        lorem += '</ul>';
        break;
      default:
        lorem = this.wordPunc(count);
    }
    
    this.output.innerHTML = lorem;
  }

  // words with punctuation
  wordPunc(count) {
    const puncs = ['', ',', '', ':', ';', '.', '?', '!'];
    const puncsLen = puncs.length;
    const wordsLen = this.words.length;
    let sentences = 'Lorem ipsum ';
    let lastPunc = 0;

    // add word and possibly punctuation
    for(let i=2;i<count;i++){
      let sentence = this.words[this.random(0,wordsLen)];
      if(i % 4) {
        // check to capitalize after punctuation
        if(lastPunc > 4 && sentence !== undefined) {
          sentence = sentence.charAt(0).toUpperCase() + sentence.substr(1);
          lastPunc = 0;
        }
        sentences += sentence;
      } else {
        lastPunc = this.random(0,puncsLen);
        sentences += sentence + puncs[lastPunc];
      }
      if(i < count-1){
        sentences += ' ';
      }
    }
    sentences += '.';

    return sentences;
  }

  // randomizer
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // copy output text
  copy() {
    let range = document.createRange();
    let sel = window.getSelection();
    range.selectNodeContents(this.output);
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('copy');
  }

});