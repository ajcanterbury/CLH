customElements.define('stop-watch', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    const template = this.querySelector('template');

    // little bit of webcomponent pollyfill if using web-components.js
    //ShadyCSS.prepareTemplate(template, customElem);
    
    shadow.appendChild(document.importNode(template.content, true));

    // bind this to functions
    this.startTimer = this.startTimer.bind(this);
    this.pauseTimer = this.pauseTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.recordLap = this.recordLap.bind(this);
    this.updateLaps = this.updateLaps.bind(this);
    this.getDisplay = this.getDisplay.bind(this);

    // bind form elements
    this.bStart = this.shadowRoot.querySelector('.start');
    this.bPause = this.shadowRoot.querySelector('.pause');
    this.bReset = this.shadowRoot.querySelector('.reset');
    this.bLap = this.shadowRoot.querySelector('.lap')
    this.lLaps = this.shadowRoot.querySelector('.laps');
    this.bClear = this.shadowRoot.querySelector('.clear');
    this.tDisplay = this.shadowRoot.querySelector('.time');

    this.ms = 0;
    this.s = 0;
    this.m = 0;
    this.h = 0;
    this.SETTINGS = {
      start: 0,
      progress: 0,
      currentTime: "",
      playing: false,
      timerId: null,
      laps: [],
      get milliseconds() {
        return Math.trunc(this.progress);
      }
    }
  }

  connectedCallback() {
    this.bStart.addEventListener("click", e => {
      e.preventDefault();
      if (this.SETTINGS.playing === false) {
        this.SETTINGS.playing = true;
        this.SETTINGS.timerId = window.requestAnimationFrame(this.startTimer);
      }
  
      //Resuming play
      if (this.SETTINGS.progress !== 0) {
        this.SETTINGS.start = performance.now() - this.SETTINGS.progress;
      }
    });

    this.bPause.addEventListener("click", this.pauseTimer);
    this.bReset.addEventListener("click", this.resetTimer);
    this.bLap.addEventListener("click", this.recordLap);
    this.bClear.addEventListener("click", e => {
      e.preventDefault();
      this.removeChildren(this.lLaps);
      this.SETTINGS.laps = [];
      this.updateLaps();
    });
  }

  startTimer(timestamp) {
    if (!this.SETTINGS.start) this.SETTINGS.start = timestamp;
    this.SETTINGS.progress = timestamp - this.SETTINGS.start;
    this.SETTINGS.timerId = window.requestAnimationFrame(this.startTimer);
    this.tDisplay.textContent = this.getDisplay();
  }

  pauseTimer() {
    this.SETTINGS.playing = false;
    window.cancelAnimationFrame(this.SETTINGS.timerId);
  }

  resetTimer() {
    // Increment this.SETTINGS.start with new delay time
    this.SETTINGS.start += this.SETTINGS.progress;
    this.SETTINGS.progress = 0.01;
    this.tDisplay.textContent = "00:00:00:00";
  }

  recordLap() {
    if (this.SETTINGS.playing === true) {
      this.SETTINGS.laps.push(this.SETTINGS.currentTime);
      this.updateLaps();
    }
  }

  updateLaps() {
    this.removeChildren(this.lLaps);
    let fragment = document.createDocumentFragment();
    this.SETTINGS.laps.forEach(e => {
      this.createEl({ tag: "li", content: e, parent: fragment, addToParent: 1 });
    });
    this.lLaps.appendChild(fragment);
    this.bClear.style.display = this.SETTINGS.laps.length > 0 ? "block" : "none";
  }

  getDisplay() {
    this.ms = Math.trunc((this.SETTINGS.milliseconds / 10) % 100);
    this.s = Math.trunc(this.SETTINGS.milliseconds / 1000)
      .toString()
      .padStart(2, "0");
    this.h = parseInt(this.s / 3600);
    this.s = this.s % 3600; // Purge extracted
    this.m = Math.trunc(this.s / 60)
      .toString()
      .padStart(2, "0");
    this.s = this.s % 60; // Purge extracted

    this.SETTINGS.currentTime = `${this.formatTime(this.h)}:${this.formatTime(this.m)}:${this.formatTime(
      this.s)}:${this.formatTime(this.ms)}`;
    return this.SETTINGS.currentTime;
  }

  formatTime(time) {
    return time.toString().padStart(2, "0");
  }

  createEl({ parent, tag, content, classes, addToParent } = {}) {
    let el = document.createElement(tag);
    if (content) {
      let txt = document.createTextNode(content);
      el.appendChild(txt);
    }
    if (classes) {
      el.setAttribute("class", classes);
    }
    if (addToParent) {
      parent.appendChild(el);
    }
    return el;
  }

  removeChildren(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

});