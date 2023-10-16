import { copyToClipboard } from '/components/libs/clipboard.js';

customElements.define('digit-generate', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = this.querySelector('template');

    shadow.appendChild(document.importNode(template.content, true));

    // bind this to functions
    this.generate = this.generate.bind(this);
    this.workerResult = this.workerResult.bind(this);
    this.copy = this.copy.bind(this);

    // bind form elements
    this.input = this.shadowRoot.querySelector('input');
    this.select = this.shadowRoot.querySelector('select');
    this.button = this.shadowRoot.querySelector('button');
    this.output = this.shadowRoot.getElementById('output');

    // create a webworker thread
    this.digitWorker = new Worker('/components/numbers/digit-worker.js');
  }

  connectedCallback() {
    this.input.addEventListener('input', this.generate);
    this.select.addEventListener('change', this.generate);
    this.button.addEventListener('click', this.copy);
    this.generate();
  }

  // generate various digits
  generate() {
    const count = this.input.value;
    const type = this.select.value;

    this.digitWorker.addEventListener('message', this.workerResult, false);

    // loading overlay
    document.activeElement.blur();
    this.shadowRoot.getElementById('loader').style.display = 'block';

    switch (type) {
      case 'p':
        this.digitWorker.postMessage({ cmd: 'prime', limit: count });
        break;
      case 'f':
        this.digitWorker.postMessage({ cmd: 'fib', limit: count });
        break;
      case 'pi':
        this.digitWorker.postMessage({ cmd: 'pi', limit: count });
        break;
      case 'e':
        this.digitWorker.postMessage({ cmd : 'euler', limit: count });
        break;
      case 'ph':
        this.digitWorker.postMessage({ cmd: 'phi', limit: count });
        break;
      case '2':
        this.digitWorker.postMessage({ cmd: 'sq2', limit: count });
        break;
      default:
        // nothing
    }
  }

  workerResult(event) {
    this.shadowRoot.getElementById('loader').style.display = '';
    this.output.innerHTML = event.data;
  }

  // copy output text
  async copy() {
    await copyToClipboard(this.output);
  }
});
