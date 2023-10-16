// randomColor by David Merfield under the CC0 license
// https://github.com/davidmerfield/randomColor/
// modified

// Seed to get repeatable colors
let seed = null;

// Shared color dictionary
const colorDictionary = {};

const stringToInteger = (string) => {
  let total = 0;
  for (let i = 0; i !== string.length; i++) {
    if (total >= Number.MAX_SAFE_INTEGER) break;
    total += string.charCodeAt(i);
  }
  return total;
};

const HSVtoHSL = (hsv) => {
  const h = hsv[0],
    s = hsv[1] / 100,
    v = hsv[2] / 100,
    k = (2 - s) * v;

  return [
    h,
    Math.round(s * v / (k < 1 ? k : 2 - k) * 10000) / 100,
    k / 2 * 100
  ];
};

const HexToHSB = (hex) => {
  hex = hex.replace(/^#/, '');
  hex = hex.length === 3 ? hex.replace(/(.)/g, '$1$1') : hex;

  const red = parseInt(hex.substring(0, 2), 16) / 255,
    green = parseInt(hex.substring(2, 4), 16) / 255,
    blue = parseInt(hex.substring(4, 6), 16) / 255;

  const cMax = Math.max(red, green, blue),
    delta = cMax - Math.min(red, green, blue),
    saturation = cMax ? delta / cMax : 0;

  switch (cMax) {
    case red: return [60 * ((green - blue) / delta) % 360 || 0, saturation, cMax];
    case green: return [60 * ((blue - red) / delta) + 120 || 0, saturation, cMax];
    case blue: return [60 * ((red - green) / delta) + 240 || 0, saturation, cMax];
    default: // nothing
  }
};

const HSVtoRGB = (hsv) => {
  // this doesn't work for the values of 0 and 360
  // here's the hacky fix
  let h = hsv[0];
  if (h === 0) h = 1;
  if (h === 360) h = 359;

  // Rebase the h,s,v values
  h /= 360;
  const s = hsv[1] / 100,
    v = hsv[2] / 100;

  const hI = Math.floor(h * 6),
    f = h * 6 - hI,
    p = v * (1 - s),
    q = v * (1 - f * s),
    t = v * (1 - (1 - f) * s);
  let r = 256,
    g = 256,
    b = 256;

  switch (hI) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default: // nothing
  }

  return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
};

const defineColor = (name, hueRange, lowerBounds) => {
  const bMax = lowerBounds[0][1],
    bMin = lowerBounds[lowerBounds.length - 1][1],
    sMax = lowerBounds[lowerBounds.length - 1][0],
    sMin = lowerBounds[0][0];

  colorDictionary[name] = {
    hueRange,
    lowerBounds,
    saturationRange: [sMin, sMax],
    brightnessRange: [bMin, bMax]
  };
};

const loadColorBounds = () => {
  defineColor(
    'monochrome',
    null,
    [[0, 0], [100, 0]]
  );

  defineColor(
    'red',
    [-26, 18],
    [[20, 100], [30, 92], [40, 89], [50, 85], [60, 78], [70, 70],
      [80, 60], [90, 55], [100, 50]]
  );

  defineColor(
    'orange',
    [19, 46],
    [[20, 100], [30, 93], [40, 88], [50, 86], [60, 85], [70, 70], [100, 70]]
  );

  defineColor(
    'yellow',
    [47, 62],
    [[25, 100], [40, 94], [50, 89], [60, 86], [70, 84], [80, 82], [90, 80], [100, 75]]
  );

  defineColor(
    'green',
    [63, 178],
    [[30, 100], [40, 90], [50, 85], [60, 81], [70, 74], [80, 64], [90, 50], [100, 40]]
  );

  defineColor(
    'blue',
    [179, 257],
    [[20, 100], [30, 86], [40, 80], [50, 74], [60, 60], [70, 52], [80, 44], [90, 39], [100, 35]]
  );

  defineColor(
    'purple',
    [258, 282],
    [[20, 100], [30, 87], [40, 79], [50, 70], [60, 65], [70, 59], [80, 52], [90, 45], [100, 42]]
  );

  defineColor(
    'pink',
    [283, 334],
    [[20, 100], [30, 90], [40, 86], [60, 84], [80, 80], [90, 75], [100, 73]]
  );
};

// Populate the color dictionary
loadColorBounds();

const HSVtoHex = (hsv) => {
  const rgb = HSVtoRGB(hsv);
  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${componentToHex(rgb[0])}${componentToHex(rgb[1])}${componentToHex(rgb[2])}`;
};

const randomWithin = (range) => {
  if (seed === null) {
    return Math.floor(range[0] + Math.random() * (range[1] + 1 - range[0]));
  }

  // Seeded random algorithm from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
  const max = range[1] || 1,
    min = range[0] || 0;
  seed = (seed * 9301 + 49297) % 233280;
  const rnd = seed / 233280.0;
  return Math.floor(min + rnd * (max - min));
};

const getColorInfo = (hue) => {
  // Maps red colors to make picking hue easier
  if (hue >= 334 && hue <= 360) {
    hue -= 360;
  }

  for (const colorName in colorDictionary) {
    if (colorName) {
      const color = colorDictionary[colorName];
      if (color.hueRange &&
          hue >= color.hueRange[0] &&
          hue <= color.hueRange[1]) {
        return colorDictionary[colorName];
      }
    }
  }
  return 'Color not found';
};

const getSaturationRange = (hue) => getColorInfo(hue).saturationRange;

const getHueRange = (colorInput) => {
  if (typeof parseInt(colorInput, 10) === 'number') {
    const number = parseInt(colorInput, 10);

    if (number < 360 && number > 0) {
      return [number, number];
    }
  }

  if (typeof colorInput === 'string') {
    if (colorDictionary[colorInput]) {
      const color = colorDictionary[colorInput];
      if (color.hueRange) return color.hueRange;
    } else if (colorInput.match(/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i)) {
      const hue = HexToHSB(colorInput)[0];
      return [hue, hue];
    }
  }

  return [0, 360];
};

const getMinimumBrightness = (H, S) => {
  const lowerBounds = getColorInfo(H).lowerBounds;

  for (let i = 0; i < lowerBounds.length - 1; i++) {
    const s1 = lowerBounds[i][0],
      v1 = lowerBounds[i][1];

    const s2 = lowerBounds[i + 1][0],
      v2 = lowerBounds[i + 1][1];

    if (S >= s1 && S <= s2) {
      const m = (v2 - v1) / (s2 - s1);
      const b = v1 - m * s1;

      return m * S + b;
    }
  }

  return 0;
};

const setFormat = (hsv, options) => {
  let alpha, hsl, hslColor, rgb, rgbColor;
  switch (options.format) {
    case 'hsvArray':
      return hsv;
    case 'hslArray':
      return HSVtoHSL(hsv);
    case 'hsl':
      hsl = HSVtoHSL(hsv);
      return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
    case 'hsla':
      hslColor = HSVtoHSL(hsv);
      alpha = options.alpha || Math.random();
      return `hsla(${hslColor[0]}, ${hslColor[1]}%, ${hslColor[2]}%, ${alpha})`;
    case 'rgbArray':
      return HSVtoRGB(hsv);
    case 'rgb':
      rgb = HSVtoRGB(hsv);
      return `rgb(${rgb.join(', ')})`;
    case 'rgba':
      rgbColor = HSVtoRGB(hsv);
      alpha = options.alpha || Math.random();
      return `rgba(${rgbColor.join(', ')}, ${alpha})`;
    default:
      return HSVtoHex(hsv);
  }
};

const pickHue = (options) => {
  const hueRange = getHueRange(options.hue);
  let hue = randomWithin(hueRange);
  // Instead of storing red as two seperate ranges,
  // we group them, using negative numbers
  if (hue < 0) {
    hue = 360 + hue;
  }

  return hue;
};

const pickSaturation = (hue, options) => {
  if (options.hue === 'monochrome') return 0;
  if (options.luminosity === 'random') return randomWithin([0, 100]);

  const saturationRange = getSaturationRange(hue);

  let sMax = saturationRange[1],
    sMin = saturationRange[0];

  switch (options.luminosity) {
    case 'bright':
      sMin = 55;
      break;
    case 'dark':
      sMin = sMax - 10;
      break;
    case 'light':
      sMax = 55;
      break;
    default: // nothing
  }

  return randomWithin([sMin, sMax]);
};

const pickBrightness = (H, S, options) => {
  let bMax = 100,
    bMin = getMinimumBrightness(H, S);

  switch (options.luminosity) {
    case 'dark':
      bMax = bMin + 20;
      break;
    case 'light':
      bMin = (bMax + bMin) / 2;
      break;
    case 'random':
      bMin = 0;
      bMax = 100;
      break;
    default: // nothing
  }

  return randomWithin([bMin, bMax]);
};

const randomColor = (options) => {
  options = options || {};

  // Check if there is a seed and ensure it's an
  // integer. Otherwise, reset the seed value.
  if (options?.seed === parseInt(options.seed, 10)) {
    seed = options.seed;

  // A string was passed as a seed
  } else if (typeof options.seed === 'string') {
    seed = stringToInteger(options.seed);

  // Something was passed as a seed but it wasn't an integer or string
  } else if (options.seed) {
    throw new TypeError('The seed value must be an integer or string');

  // No seed, reset the value outside.
  } else {
    seed = null;
  }

  // Check if we need to generate multiple colors
  if (options.count !== null && options.count !== undefined) {
    const totalColors = options.count;
    const colors = [];

    options.count = null;

    while (totalColors > colors.length) {
      // Since we're generating multiple colors,
      // incremement the seed. Otherwise we'd just
      // generate the same color each time...
      if (seed && options.seed) options.seed += 1;

      colors.push(randomColor(options));
    }

    options.count = totalColors;

    return colors;
  }

  // First we pick a hue (H)
  const H = pickHue(options);

  // Then use H to determine saturation (S)
  const S = pickSaturation(H, options);

  // Then use S and H to determine brightness (B).
  const B = pickBrightness(H, S, options);

  // Then we return the HSB color in the desired format
  return setFormat([H, S, B], options);
};

export default randomColor;
