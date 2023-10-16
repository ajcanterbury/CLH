import { addComponent, deleteComponent } from '/clh-loader.js';
import { copyToClipboard } from '/components/libs/clipboard.js';
import randomColor from '/components/libs/random-color-lib.js';

customElements.define('gradient-maker', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = this.querySelector('template');

    shadow.appendChild(document.importNode(template.content, true));

    // bind this to functions
    this.generate = this.generate.bind(this);
    this.addGrad = this.addGrad.bind(this);
    this.deleteGrad = this.deleteGrad.bind(this);
    this.drag = this.drag.bind(this);
    this.setColor = this.setColor.bind(this);
    this.copy = this.copy.bind(this);

    // load color-picker component
    addComponent('graphics', 'color-picker');
    // remove the element if it is not actively showing
    if (!document.querySelector('clh-menu li[data-component="color-picker"] input').checked) {
      deleteComponent('graphics', 'color-picker-wrap');
    }

    // bind form elements
    this.add = this.shadowRoot.getElementById('gradAdd');
    this.delete = this.shadowRoot.getElementById('gradDelete');
    this.type = this.shadowRoot.getElementById('gradType');
    this.direction = this.shadowRoot.getElementById('gradDirection');
    this.circle = this.shadowRoot.getElementById('circleType');
    this.ellipse = this.shadowRoot.getElementById('ellipseType');
    this.display = this.shadowRoot.getElementById('gradDisplay');
    this.sliderWrap = this.shadowRoot.getElementById('gradSlider');
    this.output = this.shadowRoot.getElementById('output');
    this.colors = this.shadowRoot.querySelectorAll('.colorSlider');
    this.over = this.shadowRoot.getElementById('dragOver');
    this.pickerWrap = this.shadowRoot.getElementById('colorPicker');
    this.picker = this.shadowRoot.querySelector('color-picker');
    this.opacity = this.shadowRoot.getElementById('opacity');
    this.deg = this.shadowRoot.querySelector('span');
    this.current = false;
    this.width = false;
    this.copyButton = this.shadowRoot.getElementById('copy');
  }

  connectedCallback() {
    this.width = this.display.offsetWidth - 2;
    this.add.addEventListener('click', this.addGrad);
    this.delete.addEventListener('click', this.deleteGrad);
    this.type.addEventListener('change', this.generate);
    this.direction.addEventListener('input', this.generate);
    this.circle.addEventListener('change', this.generate);
    this.ellipse.addEventListener('change', this.generate);
    this.colors.forEach((elem) => this.drag(elem));
    this.opacity.addEventListener('input', this.setColor);
    this.picker.addEventListener('color-change', () => {
      this.setColor();
    });
    this.copyButton.addEventListener('click', this.copy);
  }

  generate() {
    let type = 'linear-gradient';
    let direction = `${this.direction.value}deg,`;
    let colors = '';

    if (this.type.value === 'circle') {
      type = 'radial-gradient';
      this.direction.style.display = 'none';
      this.deg.style.display = 'none';
      this.circle.style.display = 'inline-block';
      this.ellipse.style.display = '';
      direction = this.circle.value;
    } else if (this.type.value === 'ellipse') {
      type = 'radial-gradient';
      this.direction.style.display = 'none';
      this.deg.style.display = 'none';
      this.circle.style.display = '';
      this.ellipse.style.display = 'inline-block';
      direction = this.ellipse.value;
    } else {
      this.direction.style.display = '';
      this.deg.style.display = '';
      this.circle.style.display = '';
      this.ellipse.style.display = '';
    }

    let i = 0;
    const len = this.colors.length;
    for (; i < len; i++) {
      const backgroundC = this.colors[i].querySelector('div').style.background
        .replace(' none repeat scroll 0% 0%', '');
      const colorW = parseInt(100 * (this.colors[i].offsetLeft / this.width), 10);
      colors += `${backgroundC} ${colorW}%,`;
    }
    colors = colors.slice(0, -1);

    const val = `${type}(${direction}${colors})`;
    this.display.style.background = val;
    this.output.innerHTML = val;
  }

  addGrad() {
    // move new point to end and reposition last to middle
    const len = this.colors.length - 1;

    // create new slider
    const lastId = this.colors[len - 1].getAttribute('id');
    const lastIdNum = parseInt(lastId.substring(lastId.indexOf('-') + 1), 10) + 1;
    const slider = document.createElement('div');
    const colorOff = (this.colors[len - 1].offsetLeft + this.colors[len].offsetLeft) / 2;
    slider.classList.add('colorSlider');
    slider.setAttribute('id', `color-${lastIdNum}`);
    this.width = this.display.offsetWidth - 5;
    slider.style.left = `${this.width}px`;
    this.colors[len].style.left = `${colorOff}px`;
    slider.innerHTML = `<hr/>
      <div style="background:${randomColor({ count: 1 })}"></div>`;

    this.sliderWrap.appendChild(slider);
    this.colors = this.shadowRoot.querySelectorAll('.colorSlider');
    this.colors.forEach((elem) => this.drag(elem));
    this.generate();
  }

  deleteGrad() {
    if (this.colors.length < 3) {
      // TODO: switch to inline
      // eslint-disable-next-line no-alert
      alert('not a gradient without two colors');
      return;
    }
    this.sliderWrap.removeChild(this.current.parentNode);
    this.over.style.display = 'none';
    this.pickerWrap.style.display = 'none';
    this.colors = this.shadowRoot.querySelectorAll('.colorSlider');
    this.colors.forEach((elem) => this.drag(elem));
    this.generate();
  }

  drag(elem) {
    let position;
    let mouse;
    let maxPosition;
    // eslint-disable-next-line consistent-this
    const $this = this;
    let color;

    const dragging = (e) => {
      e.preventDefault();
      position = e.clientX - mouse;
      if (position > -1 && position < maxPosition) {
        elem.style.left = `${position}px`;
        $this.generate();
      }
    };

    const tDragging = (e) => {
      const touch = e.targetTouches[0];
      position = touch.pageX - mouse;
      if (position > -1 && position < maxPosition) {
        elem.style.left = `${position}px`;
        $this.generate();
      }
    };

    const dragEnd = (el) => {
      el.style.display = 'none';
      el.removeEventListener('mousemove', dragging);
      el.removeEventListener('touchmove', tDragging);
      $this.pickerWrap.style.display = 'none';
    };

    const dragStart = (e) => {
      mouse = e.clientX - elem.offsetLeft;
      if (isNaN(mouse)) {
        const touch = e.targetTouches[0];
        mouse = touch.pageX - elem.offsetLeft;
      }
      maxPosition = $this.display.offsetWidth;
      $this.current = elem.querySelector('div');
      // launch drag area
      $this.over.style.display = 'block';
      $this.over.addEventListener('mousemove', dragging);
      $this.over.addEventListener('touchmove', tDragging, { passive: true });
      // open color picker
      $this.pickerWrap.style.display = 'block';
      color = $this.current.style.background;
      color = $this.rgb2hex(color).toUpperCase();
      $this.picker.setAttribute('hex', color);
      $this.width = $this.display.offsetWidth - 2;
    };

    elem.addEventListener('mousedown', (e) => {
      dragStart(e);
    });
    elem.addEventListener('touchstart', (e) => {
      dragStart(e);
    }, { passive: true });

    this.over.addEventListener('mouseup', function () {
      dragEnd(this);
    });
    this.over.addEventListener('touchend', function () {
      dragEnd(this);
    });
  }

  setColor() {
    if (!this.current) return;
    const op = parseInt(this.opacity.value, 10) / 100;
    const { state } = this.picker;
    const colors = state;
    this.current.style.background = `rgba(${colors.rgb.r},
      ${colors.rgb.g},${colors.rgb.b},${op})`;
    this.generate();
  }

  rgb2hex(rgb) {
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

    const r = `${String(parseInt(rgb[1], 10).toString(16)).padStart(2, '0')}`;
    const g = `${String(parseInt(rgb[2], 10).toString(16)).padStart(2, '0')}`;
    const b = `${String(parseInt(rgb[3], 10).toString(16)).padStart(2, '0')}`;
    return rgb && rgb.length === 4 ? `${r}${g}${b}` : '';
  }

  hex2rgb(hex, opacity) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r},${g},${b},${opacity / 100})`;
  }

  // copy output text
  async copy() {
    await copyToClipboard(this.output);
  }
});
