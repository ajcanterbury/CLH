customElements.define('date-converter', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    const template = this.querySelector('template');

    // little bit of webcomponent pollyfill if using web-components.js
    //ShadyCSS.prepareTemplate(template, customElem);
    
    shadow.appendChild(document.importNode(template.content, true));

    // bind this to functions
    this.generate = this.generate.bind(this);
    this.setStandard = this.setStandard.bind(this);
    this.setGMT = this.setGMT.bind(this);

    // bind form elements
    this.sTime = this.shadowRoot.getElementById('standardTime');
    this.sDate = this.shadowRoot.getElementById('standardDate');
    this.gTime = this.shadowRoot.getElementById('gmtTime');
    this.gDate = this.shadowRoot.getElementById('gmtDate');
    this.epoch = this.shadowRoot.getElementById('epochTime');
    this.milli = this.shadowRoot.getElementById('milliTime');

    // set current date and time
    const time = new Date();
    this.setStandard(time);
  }

  connectedCallback() {
    this.sTime.addEventListener('input', () => {this.generate('sTime')});
    this.sDate.addEventListener('input', () => {this.generate('sTime')});
    this.gTime.addEventListener('input', () => {this.generate('gTime')});
    this.gDate.addEventListener('input', () => {this.generate('gTime')});
    this.epoch.addEventListener('input', () => {this.generate('epoch')});
    this.milli.addEventListener('input', () => {this.generate('milli')});

    this.generate('sTime');
  }

  // generate times
  generate(change) {
    if(this[change].value === '') return;
    if(change.includes('Time') && this[change.replace('Time','Date')].value === '') return;
    
    let time;
    switch(change) {
      case 'sTime':
        time = new Date(this.sDate.value + 'T' + this.sTime.value);
        this.setGMT(time);
        this.epoch.value = time.getTime()/1000.0;
        this.milli.value = this.epoch.value * 1000;
        time = time.toGMT
        break;
      case 'gTime':
        time = new Date(this.gDate.value + 'T' + this.gTime.value + ' UTC');
        this.setStandard(time);
        this.milli.value = this.epoch.value * 1000;
        break;
      case 'epoch':
        time = new Date(parseInt(this.epoch.value) * 1000);
        this.setStandard(time);
        this.setGMT(time);
        this.milli.value = this.epoch.value * 1000;
        break;
      case 'milli':
        time = new Date(parseInt(this.milli.value));
        this.setStandard(time);
        this.setGMT(time);
        this.epoch.value = time.getTime()/1000.0;
        break;
    }
  }

  setStandard(time) {
    this.sDate.value = time.toJSON().slice(0,10)
    this.sTime.value =
      ('0' + time.getHours()).slice(-2)   + ':' + 
      ('0' + time.getMinutes()).slice(-2) + ':' + 
      ('0' + time.getSeconds()).slice(-2);
  }

  setGMT(time) {
    this.gDate.value = 
      time.getUTCFullYear() + '-' + 
      (('0' + (parseInt(time.getUTCMonth()) + 1))).slice(-2) + '-' + 
      ('0' + time.getUTCDate()).slice(-2);
    this.gTime.value =
      ('0' + time.getUTCHours()).slice(-2)   + ':' + 
      ('0' + time.getMinutes()).slice(-2) + ':' + 
      ('0' + time.getSeconds()).slice(-2);
  }

});