import { addComponent, deleteComponent } from '/clh-loader.js';

class clhMenu extends HTMLElement {
  connectedCallback() {
    this.logoClick();
    this.windowClick();
    this.parentSelect();
    this.componentSelect();
  }

  // add or delete all open components
  logoClick() {
    document.getElementById('clhLogo').addEventListener('mouseup', () => {
      const menuComps = document.querySelectorAll('clh-menu .submenu input[type=checkbox]');
      const checked = [].filter.call(menuComps, (elem) => elem.checked);
      if (checked.length > 0) {
        checked.forEach((elem) => {
          elem.checked = false;
          this.updateComp(elem);
        });
      } else {
        menuComps.forEach((elem) => {
          elem.checked = true;
          this.updateComp(elem);
        });
      }
    });
  }

  // clear radio menu item when clicked
  windowClick() {
    document.addEventListener('mouseup', (ev) => {
      if (ev.target.tagName === 'INPUT') return;
      if (this.querySelector('.inMenu:checked')) {
        this.querySelector('.inMenu:checked').checked = false;
      }
    });
  }

  // parent menu item click
  parentSelect() {
    this.querySelectorAll('.inMenu').forEach((ins) => {
      ins.addEventListener('mousedown', (ev) => {
        if (ev.target.checked) return;
        if (this.querySelector('.inMenu:checked')) {
          this.querySelector('.inMenu:checked').checked = false;
        }
      });
      ins.addEventListener('mouseover', (ev) => {
        if (ev.target.checked) return;
        if (this.querySelector('.inMenu:checked')) {
          this.querySelector('.inMenu:checked').checked = false;
          ev.target.checked = true;
        }
      });
    });
  }

  // load custom element by clicks
  componentSelect() {
    this.querySelectorAll('clh-menu .submenu input').forEach((ins) => {
      // eslint-disable-next-line consistent-this
      const $this = this;
      ins.addEventListener('change', function () {
        $this.updateComp(this);
      });
    });
  }

  updateComp(elem) {
    const component = elem.parentNode.dataset.component;
    const category = elem.parentNode.parentNode.parentNode.id;
    if (elem.checked) {
      addComponent(category, component);
    } else {
      deleteComponent(category, `${component}-wrap`);
    }
  }
}
customElements.define('clh-menu', clhMenu);
