## < Coder's Little Helper >
![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

CLH is a PWA platform for running various web components (helpers) for working on coding, designing, and testing of applications.

![](screenShot.png)

## Getting Started

You can immediately use the app at [coderslittlehelper.com](https://www.coderslittlehelper.com) or you can grab the code and add your own web components.

### Prerequisites

You will need:
* Node.JS v8+
* A browser that supports Web Components (so no IE, Edge, or older browser). For now Firefox users will need to enable the pollyfill in src/index.html or set true about:config:
```
dom.webcomponents.customelements.enabled
dom.webcomponents.shadowdom.enabled
```

### Installing & Running

to test (with express):
```
npm i
```
```
npm run start
```

to build (uses builder.js):
```
npm run build
```

## Authors

* **Anthony Canterbury**

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
