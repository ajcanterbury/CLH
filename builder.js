/* eslint-disable no-undef */
/* eslint-disable no-sync */
/* edit files and minify for production */
const fs = require('fs');
const UglifyJS = require('uglify-js');
const HTMLminify = require('html-minifier').minify;
const UglifyCSS = require('uglifycss');
const ncp = require('ncp').ncp;

const DIST = 'dist';
const compTypes = fs.readdirSync('src/components');
const compArray = [];

console.log('Building ...');

// check (sync) existance of directory
const checkDirectory = (dir) => {
  try {
    return fs.statSync(dir).isDirectory();
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    }
    throw e;
  }
};

// create dist directory and structure
if (!checkDirectory(DIST)) {
  fs.mkdirSync(DIST);
}
if (!checkDirectory(`${DIST}/components`)) {
  fs.mkdirSync(`${DIST}/components`);
}
if (!checkDirectory(`${DIST}/img`)) {
  fs.mkdirSync(`${DIST}/img`);
}
if (!checkDirectory(`${DIST}/menu`)) {
  fs.mkdirSync(`${DIST}/menu`);
}

// compress files
const miniFi = (file, newFile) => {
  fs.readFile(`src/${file}`, 'utf8', (err, contents) => {
    if (err) throw err;
    let ugly, oldFile;
    if (file.includes('.js')) {
      // eslint-disable-next-line camelcase
      ugly = UglifyJS.minify(contents, { keep_fnames:true }).code;
    } else if (file.includes('.html')) {
      ugly = HTMLminify(contents, {
        caseSensitive: true,
        collapseWhitespace: true,
        // conservativeCollapse: true,
        removeAttributeQuotes: true,
        minifyCSS: true,
        removeComments: true
      });
    } else if (file.includes('.css')) {
      ugly = UglifyCSS.processString(contents);
    }
    if (newFile) {
      oldFile = file;
      file = newFile;
    }

    fs.writeFile(`${DIST}/${file}`, ugly, (err) => {
      if (err) throw err;
      console.log(`${file} has been minied!`);
      if (newFile) {
        fs.unlink(`src/${oldFile}`, (err) => {
          if (err) throw err;
        });
      }
    });
  });
};

// edit sw.js (service worker) with new component array
const updateSW = () => {
  fs.readFile('src/sw.js', 'utf8', (err, contents) => {
    if (err) throw err;
    const compRE = /const COMPONENTS = \[([\S\s]*?)\];/;
    const versionRE = /const CACHE_ID = 'v([\S\s]*?)';/;
    const version = parseInt(contents.match(versionRE)[1], 10) + 1;
    contents = contents
      .replace(compRE, `const COMPONENTS = [\n${compArray.join(',\n')}\n];`);
    // allways update file since a build implies a new cache of files
    contents = contents
      .replace(versionRE, `const CACHE_ID = 'v${version}';`);
    fs.writeFile('src/sw.js', contents, (err) => {
      if (err) throw err;
      // compress and copy file
      miniFi('sw.js');
      console.log('sw.js file has been updated!');
    });
  });
};

// read component files, build array and minify
const buildComp = (compType, item) => {
  console.log(compType);
  if (!checkDirectory(`${DIST}/components/${compType}`)) {
    fs.mkdirSync(`${DIST}/components/${compType}`);
  }
  fs.readdir(`src/components/${compType}/`, (_err, files) => {
    files.forEach((file) => {
      compArray.push(`  '/components/${compType}/${file}'`);
      miniFi(`components/${compType}/${file}`);
    });
    item++;
    if (item < compTypes.length) {
      buildComp(compTypes[item], item);
    } else {
      updateSW();
    }
  });
};

buildComp(compTypes[0], 0);

// remove test scripts from index.html
fs.readFile('src/index.html', 'utf8', (err, contents) => {
  if (err) throw err;
  const removeRE = /<!-- remove on build -->([\S\s]*?)<!-- remove done -->/g;
  contents = contents.replace(removeRE, '');
  fs.writeFile('src/indexDIST.html', contents, (err) => {
    if (err) throw err;
    // compress and copy file
    miniFi('indexDIST.html', 'index.html');
  });
});

// Minify all the (rest of the) things!
miniFi('clh-loader.js');
miniFi('clh.css');
miniFi('copy.css');
miniFi('menu/clh-menu.html');
miniFi('menu/clh-menu.js');

// if not copied during compression copy files to /dist
ncp('src/manifest.json', `${DIST}/manifest.json`, (err) => {
  if (err) return console.error(err);
});
ncp('manifest', DIST, (err) => {
  if (err) return console.error(err);
});
ncp('src/img', `${DIST}/img`, (err) => {
  if (err) return console.error(err);
});
