customElements.define('time-diff', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = this.querySelector('template');

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
    this.minutes = this.shadowRoot.getElementById('minutes');
    this.seconds = this.shadowRoot.getElementById('seconds');

    // set current date and time
    const time = new Date();
    this.setTime(time, 's');
    this.setTime(time, 'm');
  }

  connectedCallback() {
    this.sTime.addEventListener('input', () => this.generate('time'));
    this.sDate.addEventListener('input', () => this.generate('time'));
    this.mTime.addEventListener('input', () => this.generate('time'));
    this.mDate.addEventListener('input', () => this.generate('time'));
    this.days.addEventListener('input', () => this.generate('diff'));
    this.hours.addEventListener('input', () => this.generate('diff'));
    this.minutes.addEventListener('input', () => this.generate('diff'));
    this.seconds.addEventListener('input', () => this.generate('diff'));
  }

  // generate time differnces
  generate(type) {
    const dateFrom = new Date(`${this.sDate.value}T${this.sTime.value}`);
    if (type === 'time') {
      const dateTo = new Date(`${this.mDate.value}T${this.mTime.value}`);
      const timeDiff = Math.abs(dateTo.getTime() - dateFrom.getTime());

      this.days.value = Math.floor(timeDiff / (36e5 * 24));
      this.hours.value = Math.floor(timeDiff % (36e5 * 24) / 36e5);
      this.minutes.value = Math.floor(timeDiff % 36e5 / 60000);
      this.seconds.value = Math.floor(timeDiff % 60000 / 1000);
    } else {
      dateFrom.setDate(dateFrom.getDate() + parseInt(this.days.value, 10) - 1);

      // Adjust seconds and handle overflow
      dateFrom.setSeconds(dateFrom.getSeconds() + parseInt(this.seconds.value, 10));
      while (dateFrom.getSeconds() >= 60) {
        dateFrom.setMinutes(dateFrom.getMinutes() + 1);
        dateFrom.setSeconds(dateFrom.getSeconds() - 60);
      }

      // Adjust minutes and handle overflow
      dateFrom.setMinutes(dateFrom.getMinutes() + parseInt(this.minutes.value, 10));
      while (dateFrom.getMinutes() >= 60) {
        dateFrom.setHours(dateFrom.getHours() + 1);
        dateFrom.setMinutes(dateFrom.getMinutes() - 60);
      }

      // Adjust hours and handle overflow
      dateFrom.setHours(dateFrom.getHours() + parseInt(this.hours.value, 10));
      while (dateFrom.getHours() >= 24) {
        dateFrom.setDate(dateFrom.getDate() + 1);
        dateFrom.setHours(dateFrom.getHours() - 24);
      }

      this.setTime(dateFrom, 'm');
    }
  }

  setTime(time, x) {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const seconds = String(time.getSeconds()).padStart(2, '0');

    this[`${x}Date`].value = time.toJSON().slice(0, 10);
    this[`${x}Time`].value = `${hours}:${minutes}:${seconds}`;
  }
});
