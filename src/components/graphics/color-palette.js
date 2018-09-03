/* 
  We're going to build an iframe, since the current library is not easily used
  in a shadow dom. This library is based off the Mozilla MDN color picker.
*/
(function(){
  const cPicker = document.getElementById('colorPalette');
  document.getElementById('color-palette-wrap').style.maxWidth = '100%';
  // fetch the files outside of the iframe due to a Chrome Service Worker issue
  fetch('/components/graphics/color-palette.css',{method:'GET'})
  .then(response => {
    return response.text();
  })
  .then((CSS) => {
    fetch('/components/graphics/palette.js',{method:'GET'})
    .then(response => {
      return response.text();
    })
    .then((JS) => {
      cPicker.setAttribute('srcdoc', `
      <style>${CSS}</style>
      <div id="container">
        <div id="palette" class="block">
          <div id="color-palette"></div>
          <div id="color-info">
            <div class="title"> CSS Color </div>
          </div>
        </div>
        <div id="picker" class="block">
          <div class="ui-color-picker" data-topic="picker" data-mode="HSL"></div>
          <div id="picker-samples" sample-id="master"></div>
          <div id="controls">
            <div id="delete">
              <div id="trash-can"></div>
            </div>
            <div id="void-sample" class="icon"></div>
          </div>
        </div>
      </div>
      <script>${JS}</script>
    `)
    });
  });
})();