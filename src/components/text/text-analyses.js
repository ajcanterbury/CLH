import WordFreq from '/components/text/wordfreq.js'

customElements.define('text-analyses', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    const template = this.querySelector('template');

    // little bit of webcomponent pollyfill if using web-components.js
    //ShadyCSS.prepareTemplate(template, customElem);
    
    shadow.appendChild(document.importNode(template.content, true));

    // bind this to functions
    this.analyze = this.analyze.bind(this);
    this.buildFreq = this.buildFreq.bind(this);
    this.resizeArea = this.resizeArea.bind(this);

    // bind form elements
    this.tarea = this.shadowRoot.querySelector('textarea');
    this.button = this.shadowRoot.querySelector('button');
    this.chars = this.shadowRoot.getElementById('chars');
    this.words = this.shadowRoot.getElementById('words');
    this.space = this.shadowRoot.getElementById('space')
    this.short = this.shadowRoot.getElementById('short');
    this.long = this.shadowRoot.getElementById('long');
    this.spec = this.shadowRoot.getElementById('spec');
    this.sent = this.shadowRoot.getElementById('sent');
    this.para = this.shadowRoot.getElementById('para');
    this.hash = this.shadowRoot.getElementById('hash');
    this.freq = this.shadowRoot.getElementById('freq');
    this.resizeHandle = this.shadowRoot.getElementById('resizeHandle');

    this.timeout = null;

  }

  connectedCallback() {
    this.tarea.addEventListener('input', this.analyze);

    // disable standard resizing
    this.parentNode.querySelector('.resizeComp').style.display = 'none';
  }

  // analyze text, delay for typing
  analyze() {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      let text = this.tarea.value;
      // character cound does not account symbols
      this.chars.textContent = text.length;

      // word count
      let words = text.replace(/(^\s*)|(\s*$)/gi,'');
      words = words.replace(/[ ]{2,}/gi,' ');
      words = words.replace(/\n /,'\n');
      this.words.textContent = words.split(' ').length;

      // count spaces
      this.space.textContent = (text.match(/ /g) || []).length
      
      // shortest word length
      words = words.split(' ');
      this.short.textContent = Math.min(...words.map(({ length }) => length));

      // longest word length
      this.long.textContent = Math.max(...words.map(({ length }) => length));

      // special character count
      const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/gi;
      this.spec.textContent = (text.match(specialChars) || []).length;

      // count sentences
      const sPattern = /([.?!])\s*(?=[A-Z0-9])/g;
      this.sent.textContent = text.replace(/\|/g,'').replace(sPattern, '$1|').split('|').length;

      // count paragraphs
      this.para.textContent = text.replace(/\n$/gm, '').split(/\n/).length;

      this.resizeArea();

      // word frequency call webworker frequency
      const options = {
        workerUrl: '/components/text/wordfreq.worker.js',
        minimumCount: 1
      }
      const wordfreq = WordFreq(options).process(text, this.buildFreq);

    }, 400);

  }

  buildFreq(list) {
    const listLen = list.length;
    let spans = '';
    let wordSize;
    const minWordSize = 0.8;

    for(let i=0;i<listLen;i++) {
      wordSize = list[i][1] / 1.2;
      if(wordSize < minWordSize) {
        wordSize = minWordSize;
      }
      spans += '<span style="font-size:'+ wordSize + 'rem;" title="' + list[i][1]
         + '">' + list[i][0] + ' </span>';
    }

    // fix size
    this.freq.innerHTML = spans;
  }

  resizeArea() {
    this.freq.style.width = this.tarea.offsetWidth - 10 + 'px';
    this.freq.style.height =  this.offsetHeight - 10 - this.tarea.offsetHeight + 'px';
  }

});