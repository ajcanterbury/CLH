const NOT_FOUND = 404;

// load html and js file for components without html-import
export const loadTemplate = async (customElem, callback) => {
  let response;
  try {
    response = await fetch(`${customElem}.html`, { method:'GET' });
  } catch (error) {
    // when offline try to find the js if html failed
    if (error.message.includes('fetch')) {
      if (document.querySelector(`script[src="${customElem}.js"`)) return;
      const elemScript = document.createElement('script');
      elemScript.setAttribute('src', `${customElem}.js`);
      elemScript.setAttribute('type', 'module');
      elemScript.setAttribute('defer', '');
      document.head.appendChild(elemScript);
    } else {
      console.error(error);
    }
  }

  // if 404 it may be just a JS web component (just ignore console error)
  if (response.status === NOT_FOUND) {
    const elemScript = document.createElement('script');
    elemScript.setAttribute('src', `${customElem}.js`);
    elemScript.setAttribute('type', 'module');
    elemScript.setAttribute('defer', '');
    document.head.appendChild(elemScript);
    return;
  }

  const html = await response.text();
  let customElemName = customElem;

  // parse custom element file name
  if (customElemName.includes('/')) {
    customElemName = customElemName.substring(customElemName
      .lastIndexOf('/', customElemName.lastIndexOf('/') + 1) + 1);
  }

  // add html to custom element placeholder within doc main
  let placeholder = document.querySelector(customElemName);
  if (placeholder) {
    placeholder.innerHTML = html;
  } else {
    placeholder = document.createElement(customElemName);
    placeholder.innerHTML = html;
    document.body.prepend(placeholder);
    document.getElementById(customElem).appendChild(placeholder);
  }

  // load script if there is no script in the html
  if (!placeholder.querySelector('script')) {
    const elemScript = document.createElement('script');
    elemScript.setAttribute('src', `${customElem}.js`);
    elemScript.setAttribute('type', 'module');
    elemScript.setAttribute('defer', '');
    document.head.appendChild(elemScript);
  }

  // run further callbacks if present
  if (callback) callback();
};

// indexedDB for persistant state of components
export let clhData = window.indexedDB.open('ClhData', 1);
clhData.onupgradeneeded = (ev) => {
  console.log('upgraded db');
  clhData = ev.target.result;
  clhData.createObjectStore('activeHelpers', { keyPath:'id' });
};

// wrapper component
class clhWrapper extends HTMLElement {
  connectedCallback() {
    this.deleteComp();
    this.resizeComp();
  }

  deleteComp() {
    this.querySelector('.removeComp').addEventListener('click', () => {
      if (document.querySelector(`li[data-component="${this.id.replace('-wrap', '')}"] input`).checked) {
        document.querySelector(`li[data-component="${this.id.replace('-wrap', '')}"] input`).click();
      }
    });
  }
  resizeComp() {
    const resizeButt = this.querySelector('.resizeComp');

    // resize show or hide handles
    resizeButt.addEventListener('click', () => {
      if (resizeButt.getAttribute('title') === 'resize') {
        resizeButt.setAttribute('title', 'resize off');
        this.style.resize = 'both';
        this.style.maxWidth = 'none';
        resizeButt.style.color = '#387286';
      } else {
        resizeButt.setAttribute('title', 'resize');
        this.style.resize = 'none';
        this.style.maxWidth = '';
        this.style.width = '';
        this.style.height = '';
        resizeButt.style.color = '';
      }
    });
  }
}

// copy component
customElements.define('copy-component', class extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = document.getElementById('copyComponent');
    if (template) {
      shadow.appendChild(document.importNode(template.content, true));
    }
  }
});

// create component wrapper
export const addComponent = (category, component) => {
  // if it is just hidden, it just gets revealed
  const compExists = document.getElementById(`${component}-wrap`);

  // update db
  clhData.transaction('activeHelpers', 'readwrite').objectStore('activeHelpers')
    .add({
      id: component,
      category
    });

  // check if hidden
  if (compExists) {
    document.getElementById('clhMain').appendChild(compExists);
    compExists.classList.add('show');
    return;
  }

  // clone from template
  const temp = document.getElementById('c-wrapper');
  const clone = temp.content.cloneNode(true);
  const wrapper = clone.querySelector('c-wrapper');
  const compElem = document.createElement(component);

  wrapper.querySelector('h3').textContent = component.replace(/-/g, ' ').toUpperCase();
  wrapper.id = `${component}-wrap`;
  wrapper.append(compElem);
  document.getElementById('clhMain').appendChild(clone);

  // check if component has been registered
  if (document.createElement('c-wrapper').constructor === HTMLElement) {
    customElements.define('c-wrapper', clhWrapper);
  }

  loadTemplate(`components/${category}/${component}`);
  document.getElementById(`${component}-wrap`).classList.add('show');
};

// delete component with wrapper, actually this just hides it
export const deleteComponent = (category, component) => {
  document.getElementById(component)?.classList.remove('show');
  component = component.replace('-wrap', '');
  if (document.head.querySelector(`script[src="components/${category}/${component}.js"]`)) {
    document.head.querySelector(`script[src="components/${category}/${component}.js"]`).remove();
  }

  // update db
  clhData.transaction('activeHelpers', 'readwrite').objectStore('activeHelpers')
    .delete(component);
};

// check state of helper from indexedDB
const checkHelpers = () => {
  const objectStore = clhData.transaction('activeHelpers').objectStore('activeHelpers');
  objectStore.openCursor().onsuccess = (ev) => {
    const cursor = ev.target.result;
    if (cursor) {
      if (cursor.key === 'color-palette') { // clear out old
        deleteComponent('graphics', 'color-palette');
        cursor.continue();
        return;
      }
      addComponent(cursor.value.category, cursor.key);
      document.querySelector(`li[data-component="${cursor.key}"] input`).checked = true;
      cursor.continue();
    }
  };
};

// load menu at start, then load stored components
clhData.onsuccess = (ev) => {
  // check initial based on menu existing
  if (!document.getElementById('clhLogo')) {
    clhData = ev.target.result;
    loadTemplate('/menu/clh-menu', checkHelpers);
  }
};
