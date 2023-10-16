import { copyToClipboard } from '/components/libs/clipboard.js';

const MS_SEC = 1000;
const getTimeString = (time, utc) => {
  const hours = String(utc ? time.getUTCHours() : time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
};

customElements.define('date-converter', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = this.querySelector('template');

    shadow.appendChild(document.importNode(template.content, true));

    // bind this to functions
    this.generate = this.generate.bind(this);
    this.setStandard = this.setStandard.bind(this);
    this.setGMT = this.setGMT.bind(this);
    this.copy = this.copy.bind(this);

    // bind form elements
    this.sTime = this.shadowRoot.getElementById('standardTime');
    this.sDate = this.shadowRoot.getElementById('standardDate');
    this.gTime = this.shadowRoot.getElementById('gmtTime');
    this.gDate = this.shadowRoot.getElementById('gmtDate');
    this.epoch = this.shadowRoot.getElementById('epochTime');
    this.milli = this.shadowRoot.getElementById('milliTime');
    this.unixCopy = this.shadowRoot.getElementById('unixCopy');
    this.milliCopy = this.shadowRoot.getElementById('milliCopy');

    // set current date and time
    const time = new Date();
    this.setStandard(time);
  }

  connectedCallback() {
    this.sTime.addEventListener('input', () => this.generate('sTime'));
    this.sDate.addEventListener('input', () => this.generate('sTime'));
    this.gTime.addEventListener('input', () => this.generate('gTime'));
    this.gDate.addEventListener('input', () => this.generate('gTime'));
    this.epoch.addEventListener('input', () => this.generate('epoch'));
    this.milli.addEventListener('input', () => this.generate('milli'));
    this.unixCopy.addEventListener('click', () => this.copy(true));
    this.milliCopy.addEventListener('click', () => this.copy(false));

    this.generate('sTime');
  }

  // generate times
  generate(change) {
    if (this[change].value === '') return;
    if (change.includes('Time') &&
      this[change.replace('Time', 'Date')].value === '') return;

    let time;
    switch (change) {
      case 'sTime':
        time = new Date(`${this.sDate.value}T${this.sTime.value}`);
        this.setGMT(time);
        this.milli.value = time.getTime();
        this.epoch.value = Math.floor(this.milli.value / MS_SEC);
        time = time.toGMT;
        break;
      case 'gTime':
        time = new Date(`${this.gDate.value}T${this.gTime.value}.000-00:00`);
        this.setStandard(time);
        this.milli.value = time.getTime();
        this.epoch.value = Math.floor(this.milli.value / MS_SEC);
        break;
      case 'epoch':
        time = new Date(parseInt(this.epoch.value, 10) * MS_SEC);
        this.setStandard(time);
        this.setGMT(time);
        this.milli.value = this.epoch.value * MS_SEC;
        break;
      case 'milli':
        time = new Date(parseInt(this.milli.value, 10));
        this.setStandard(time);
        this.setGMT(time);
        this.epoch.value = Math.floor(this.milli.value / MS_SEC);
        break;
      default:
        // nothing
    }
  }

  setStandard(time) {
    this.sDate.value = time.toJSON().slice(0, 10);
    this.sTime.value = getTimeString(time);
  }

  setGMT(time) {
    const month = String(time.getUTCMonth() + 1).padStart(2, '0');
    const day = String(time.getUTCDate()).padStart(2, '0');
    this.gDate.value = `${time.getUTCFullYear()}-${month}-${day}`;
    this.gTime.value = getTimeString(time, true);
  }

  // copy output text
  async copy(unix = true) {
    await copyToClipboard(unix ? this.epoch : this.milli);
  }
});
