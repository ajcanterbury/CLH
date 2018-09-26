customElements.define('time-diff', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    const template = this.querySelector('template');

    // little bit of webcomponent pollyfill if using web-components.js
    //ShadyCSS.prepareTemplate(template, customElem);
    
    shadow.appendChild(document.importNode(template.content, true));

    // bind this to functions
    this.generate = this.generate.bind(this);
    this.setTime = this.setTime.bind(this);

    // bind form elements
    this.sTime = this.shadowRoot.getElementById('startTime');
    this.sDate = this.shadowRoot.getElementById('startDate');
    this.mTime = this.shadowRoot.getElementById('modTime');
    this.mDate = this.shadowRoot.getElementById('modDate');
    this.days = this.shadowRoot.getElementById('days');
    this.hours = this.shadowRoot.getElementById('hours');

    // set current date and time
    const time = new Date();
    this.setTime(time, 's');
    this.setTime(time, 'm');
  }

  connectedCallback() {
    this.sTime.addEventListener('input', () => {this.generate('time')});
    this.sDate.addEventListener('input', () => {this.generate('time')});
    this.mTime.addEventListener('input', () => {this.generate('time')});
    this.mDate.addEventListener('input', () => {this.generate('time')});
    this.days.addEventListener('input', () => {this.generate('diff')});
    this.hours.addEventListener('input', () => {this.generate('diff')});
  }

  // generate time differnces
  generate(type) {
    const dateFrom = new Date(this.sDate.value + 'T' + this.sTime.value);
    if(type === 'time') {
      const dateTo = new Date(this.mDate.value + 'T' + this.mTime.value);
      const timeDiff = Math.abs(dateTo.getTime() - dateFrom.getTime());
      this.days.value = Math.floor(timeDiff / (1000 * 3600 * 24)); 
      this.hours.value = Math.floor((Math.abs(dateTo - dateFrom) / 36e5) - 
        (this.days.value * 24));
    } else {
      if(parseInt(this.hours.value) === 24) {
        this.days.value++;
        this.hours.value = 0;
      }
      if(parseInt(this.hours.value) === -1) {
        this.days.value--;
        this.hours.value = 23;
      }
      dateFrom.setDate(dateFrom.getDate() + (this.days.value - 1));
      dateFrom.setTime(dateFrom.getTime() + (this.hours.value*60*60*1000));
      this.setTime(dateFrom, 'm');
    }
    
  }

  setTime(time, x) {
    this[x+'Date'].value = time.toJSON().slice(0,10)
    this[x+'Time'].value =
      ('0' + time.getHours()).slice(-2)   + ':' + 
      ('0' + time.getMinutes()).slice(-2) + ':' + 
      ('0' + time.getSeconds()).slice(-2);
  }
});
