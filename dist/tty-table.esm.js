var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

// @TODO split defaults into table and cell settings
const defaults = {
  borderCharacters: {
    invisible: [
      { v: " ", l: " ", j: " ", h: " ", r: " " },
      { v: " ", l: " ", j: " ", h: " ", r: " " },
      { v: " ", l: " ", j: " ", h: " ", r: " " }
    ],
    solid: [
      { v: "│", l: "┌", j: "┬", h: "─", r: "┐" },
      { v: "│", l: "├", j: "┼", h: "─", r: "┤" },
      { v: "│", l: "└", j: "┴", h: "─", r: "┘" }
    ],
    dashed: [
      { v: "|", l: "+", j: "+", h: "-", r: "+" },
      { v: "|", l: "+", j: "+", h: "-", r: "+" },
      { v: "|", l: "+", j: "+", h: "-", r: "+" }
    ],
    none: [
      { v: "", l: "", j: "", h: "", r: "" },
      { v: "", l: "", j: "", h: "", r: "" },
      { v: "", l: "", j: "", h: "", r: "" }
    ]
  },
  align: "center",
  borderColor: null,
  borderStyle: "solid",
  color: false,
  COLUMNS: 80, // if !{}.stdout.columns assume redirecting to write stream 80 columns is VT200 standard
  compact: false,
  defaultErrorValue: "�",
  // defaultValue: "\u001b[31m?\u001b[39m",
  defaultValue: "[32m[37m[41m ?[49m[32m[39m",
  errorOnNull: false,
  FIXED_WIDTH: false,
  footerAlign: "center",
  footerColor: false,
  formatter: null,
  headerAlign: "center",
  headerColor: "yellow",
  isNull: false, // undocumented cell setting
  marginLeft: 2,
  marginTop: 1,
  paddingBottom: 0,
  paddingLeft: 1,
  paddingRight: 1,
  paddingTop: 0,
  showHeader: null, // undocumented
  truncate: false,
  width: "100%",
  GUTTER: 1, // undocumented
  columnSettings: [],
  // save so cell options can be merged into column options
  table: {
    body: "",
    columnInnerWidths: [],
    columnWidths: [],
    columns: [],
    footer: "",
    header: "", // post-rendered strings.
    height: 0,
    typeLocked: false // once a table type is selected can't switch
  }
};

// support deprecated border style values
defaults.borderCharacters["0"] = defaults.borderCharacters.none;
defaults.borderCharacters["1"] = defaults.borderCharacters.solid;
defaults.borderCharacters["2"] = defaults.borderCharacters.dashed;

var defaults_1 = defaults;

var colorName = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};

/* MIT license */
/* eslint-disable no-mixed-operators */


// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

const reverseKeywords = {};
for (const key of Object.keys(colorName)) {
	reverseKeywords[colorName[key]] = key;
}

const convert = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

var conversions = convert;

// Hide .channels and .labels properties
for (const model of Object.keys(convert)) {
	if (!('channels' in convert[model])) {
		throw new Error('missing channels property: ' + model);
	}

	if (!('labels' in convert[model])) {
		throw new Error('missing channel labels property: ' + model);
	}

	if (convert[model].labels.length !== convert[model].channels) {
		throw new Error('channel and label counts mismatch: ' + model);
	}

	const {channels, labels} = convert[model];
	delete convert[model].channels;
	delete convert[model].labels;
	Object.defineProperty(convert[model], 'channels', {value: channels});
	Object.defineProperty(convert[model], 'labels', {value: labels});
}

convert.rgb.hsl = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const min = Math.min(r, g, b);
	const max = Math.max(r, g, b);
	const delta = max - min;
	let h;
	let s;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	const l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	let rdif;
	let gdif;
	let bdif;
	let h;
	let s;

	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const v = Math.max(r, g, b);
	const diff = v - Math.min(r, g, b);
	const diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = 0;
		s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}

		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert.rgb.hwb = function (rgb) {
	const r = rgb[0];
	const g = rgb[1];
	let b = rgb[2];
	const h = convert.rgb.hsl(rgb)[0];
	const w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;

	const k = Math.min(1 - r, 1 - g, 1 - b);
	const c = (1 - r - k) / (1 - k) || 0;
	const m = (1 - g - k) / (1 - k) || 0;
	const y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

function comparativeDistance(x, y) {
	/*
		See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
	*/
	return (
		((x[0] - y[0]) ** 2) +
		((x[1] - y[1]) ** 2) +
		((x[2] - y[2]) ** 2)
	);
}

convert.rgb.keyword = function (rgb) {
	const reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	let currentClosestDistance = Infinity;
	let currentClosestKeyword;

	for (const keyword of Object.keys(colorName)) {
		const value = colorName[keyword];

		// Compute comparative distance
		const distance = comparativeDistance(rgb, value);

		// Check if its less, if so set as closest
		if (distance < currentClosestDistance) {
			currentClosestDistance = distance;
			currentClosestKeyword = keyword;
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return colorName[keyword];
};

convert.rgb.xyz = function (rgb) {
	let r = rgb[0] / 255;
	let g = rgb[1] / 255;
	let b = rgb[2] / 255;

	// Assume sRGB
	r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
	g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
	b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

	const x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	const y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	const z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	const xyz = convert.rgb.xyz(rgb);
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	const h = hsl[0] / 360;
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;
	let t2;
	let t3;
	let val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	const t1 = 2 * l - t2;

	const rgb = [0, 0, 0];
	for (let i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}

		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	const h = hsl[0];
	let s = hsl[1] / 100;
	let l = hsl[2] / 100;
	let smin = s;
	const lmin = Math.max(l, 0.01);

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	const v = (l + s) / 2;
	const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	const h = hsv[0] / 60;
	const s = hsv[1] / 100;
	let v = hsv[2] / 100;
	const hi = Math.floor(h) % 6;

	const f = h - Math.floor(h);
	const p = 255 * v * (1 - s);
	const q = 255 * v * (1 - (s * f));
	const t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	const h = hsv[0];
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;
	const vmin = Math.max(v, 0.01);
	let sl;
	let l;

	l = (2 - s) * v;
	const lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	const h = hwb[0] / 360;
	let wh = hwb[1] / 100;
	let bl = hwb[2] / 100;
	const ratio = wh + bl;
	let f;

	// Wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	const i = Math.floor(6 * h);
	const v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	const n = wh + f * (v - wh); // Linear interpolation

	let r;
	let g;
	let b;
	/* eslint-disable max-statements-per-line,no-multi-spaces */
	switch (i) {
		default:
		case 6:
		case 0: r = v;  g = n;  b = wh; break;
		case 1: r = n;  g = v;  b = wh; break;
		case 2: r = wh; g = v;  b = n; break;
		case 3: r = wh; g = n;  b = v; break;
		case 4: r = n;  g = wh; b = v; break;
		case 5: r = v;  g = wh; b = n; break;
	}
	/* eslint-enable max-statements-per-line,no-multi-spaces */

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	const c = cmyk[0] / 100;
	const m = cmyk[1] / 100;
	const y = cmyk[2] / 100;
	const k = cmyk[3] / 100;

	const r = 1 - Math.min(1, c * (1 - k) + k);
	const g = 1 - Math.min(1, m * (1 - k) + k);
	const b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	const x = xyz[0] / 100;
	const y = xyz[1] / 100;
	const z = xyz[2] / 100;
	let r;
	let g;
	let b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// Assume sRGB
	r = r > 0.0031308
		? ((1.055 * (r ** (1.0 / 2.4))) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * (g ** (1.0 / 2.4))) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * (b ** (1.0 / 2.4))) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	let x = xyz[0];
	let y = xyz[1];
	let z = xyz[2];

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

	const l = (116 * y) - 16;
	const a = 500 * (x - y);
	const b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let x;
	let y;
	let z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	const y2 = y ** 3;
	const x2 = x ** 3;
	const z2 = z ** 3;
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	const l = lab[0];
	const a = lab[1];
	const b = lab[2];
	let h;

	const hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	const c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	const l = lch[0];
	const c = lch[1];
	const h = lch[2];

	const hr = h / 360 * 2 * Math.PI;
	const a = c * Math.cos(hr);
	const b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args, saturation = null) {
	const [r, g, b] = args;
	let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation; // Hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	let ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// Optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	const r = args[0];
	const g = args[1];
	const b = args[2];

	// We use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	const ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	let color = args % 10;

	// Handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	const mult = (~~(args > 50) + 1) * 0.5;
	const r = ((color & 1) * mult) * 255;
	const g = (((color >> 1) & 1) * mult) * 255;
	const b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// Handle greyscale
	if (args >= 232) {
		const c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	let rem;
	const r = Math.floor(args / 36) / 5 * 255;
	const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	const b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	const integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	let colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(char => {
			return char + char;
		}).join('');
	}

	const integer = parseInt(colorString, 16);
	const r = (integer >> 16) & 0xFF;
	const g = (integer >> 8) & 0xFF;
	const b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const max = Math.max(Math.max(r, g), b);
	const min = Math.min(Math.min(r, g), b);
	const chroma = (max - min);
	let grayscale;
	let hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	const s = hsl[1] / 100;
	const l = hsl[2] / 100;

	const c = l < 0.5 ? (2.0 * s * l) : (2.0 * s * (1.0 - l));

	let f = 0;
	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;

	const c = s * v;
	let f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	const h = hcg[0] / 360;
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	const pure = [0, 0, 0];
	const hi = (h % 1) * 6;
	const v = hi % 1;
	const w = 1 - v;
	let mg = 0;

	/* eslint-disable max-statements-per-line */
	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}
	/* eslint-enable max-statements-per-line */

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const v = c + g * (1.0 - c);
	let f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;

	const l = g * (1.0 - c) + 0.5 * c;
	let s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	const c = hcg[1] / 100;
	const g = hcg[2] / 100;
	const v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	const w = hwb[1] / 100;
	const b = hwb[2] / 100;
	const v = 1 - b;
	const c = v - w;
	let g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hsv = convert.gray.hsl;

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	const val = Math.round(gray[0] / 100 * 255) & 0xFF;
	const integer = (val << 16) + (val << 8) + val;

	const string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};

/*
	This function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	const graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	const models = Object.keys(conversions);

	for (let len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	const graph = buildGraph();
	const queue = [fromModel]; // Unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		const current = queue.pop();
		const adjacents = Object.keys(conversions[current]);

		for (let len = adjacents.length, i = 0; i < len; i++) {
			const adjacent = adjacents[i];
			const node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	const path = [graph[toModel].parent, toModel];
	let fn = conversions[graph[toModel].parent][toModel];

	let cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

var route = function (fromModel) {
	const graph = deriveBFS(fromModel);
	const conversion = {};

	const models = Object.keys(graph);
	for (let len = models.length, i = 0; i < len; i++) {
		const toModel = models[i];
		const node = graph[toModel];

		if (node.parent === null) {
			// No possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};

const convert$1 = {};

const models = Object.keys(conversions);

function wrapRaw(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];
		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		return fn(args);
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	const wrappedFn = function (...args) {
		const arg0 = args[0];

		if (arg0 === undefined || arg0 === null) {
			return arg0;
		}

		if (arg0.length > 1) {
			args = arg0;
		}

		const result = fn(args);

		// We're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (let len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// Preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(fromModel => {
	convert$1[fromModel] = {};

	Object.defineProperty(convert$1[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert$1[fromModel], 'labels', {value: conversions[fromModel].labels});

	const routes = route(fromModel);
	const routeModels = Object.keys(routes);

	routeModels.forEach(toModel => {
		const fn = routes[toModel];

		convert$1[fromModel][toModel] = wrapRounded(fn);
		convert$1[fromModel][toModel].raw = wrapRaw(fn);
	});
});

var colorConvert = convert$1;

var ansiStyles = createCommonjsModule(function (module) {

const wrapAnsi16 = (fn, offset) => (...args) => {
	const code = fn(...args);
	return `\u001B[${code + offset}m`;
};

const wrapAnsi256 = (fn, offset) => (...args) => {
	const code = fn(...args);
	return `\u001B[${38 + offset};5;${code}m`;
};

const wrapAnsi16m = (fn, offset) => (...args) => {
	const rgb = fn(...args);
	return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
};

const ansi2ansi = n => n;
const rgb2rgb = (r, g, b) => [r, g, b];

const setLazyProperty = (object, property, get) => {
	Object.defineProperty(object, property, {
		get: () => {
			const value = get();

			Object.defineProperty(object, property, {
				value,
				enumerable: true,
				configurable: true
			});

			return value;
		},
		enumerable: true,
		configurable: true
	});
};

/** @type {typeof import('color-convert')} */
let colorConvert$1;
const makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
	if (colorConvert$1 === undefined) {
		colorConvert$1 = colorConvert;
	}

	const offset = isBackground ? 10 : 0;
	const styles = {};

	for (const [sourceSpace, suite] of Object.entries(colorConvert$1)) {
		const name = sourceSpace === 'ansi16' ? 'ansi' : sourceSpace;
		if (sourceSpace === targetSpace) {
			styles[name] = wrap(identity, offset);
		} else if (typeof suite === 'object') {
			styles[name] = wrap(suite[targetSpace], offset);
		}
	}

	return styles;
};

function assembleStyles() {
	const codes = new Map();
	const styles = {
		modifier: {
			reset: [0, 0],
			// 21 isn't widely supported and 22 does the same thing
			bold: [1, 22],
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		color: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],

			// Bright color
			blackBright: [90, 39],
			redBright: [91, 39],
			greenBright: [92, 39],
			yellowBright: [93, 39],
			blueBright: [94, 39],
			magentaBright: [95, 39],
			cyanBright: [96, 39],
			whiteBright: [97, 39]
		},
		bgColor: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49],

			// Bright color
			bgBlackBright: [100, 49],
			bgRedBright: [101, 49],
			bgGreenBright: [102, 49],
			bgYellowBright: [103, 49],
			bgBlueBright: [104, 49],
			bgMagentaBright: [105, 49],
			bgCyanBright: [106, 49],
			bgWhiteBright: [107, 49]
		}
	};

	// Alias bright black as gray (and grey)
	styles.color.gray = styles.color.blackBright;
	styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
	styles.color.grey = styles.color.blackBright;
	styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	}

	Object.defineProperty(styles, 'codes', {
		value: codes,
		enumerable: false
	});

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	setLazyProperty(styles.color, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, false));
	setLazyProperty(styles.color, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, false));
	setLazyProperty(styles.color, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, false));
	setLazyProperty(styles.bgColor, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, true));
	setLazyProperty(styles.bgColor, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, true));
	setLazyProperty(styles.bgColor, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, true));

	return styles;
}

// Make the export immutable
Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});
});

var browser = {
	stdout: false,
	stderr: false
};

const stringReplaceAll = (string, substring, replacer) => {
	let index = string.indexOf(substring);
	if (index === -1) {
		return string;
	}

	const substringLength = substring.length;
	let endIndex = 0;
	let returnValue = '';
	do {
		returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
		endIndex = index + substringLength;
		index = string.indexOf(substring, endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

const stringEncaseCRLFWithFirstIndex = (string, prefix, postfix, index) => {
	let endIndex = 0;
	let returnValue = '';
	do {
		const gotCR = string[index - 1] === '\r';
		returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
		endIndex = index + 1;
		index = string.indexOf('\n', endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

var util = {
	stringReplaceAll,
	stringEncaseCRLFWithFirstIndex
};

const TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
const ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;

const ESCAPES = new Map([
	['n', '\n'],
	['r', '\r'],
	['t', '\t'],
	['b', '\b'],
	['f', '\f'],
	['v', '\v'],
	['0', '\0'],
	['\\', '\\'],
	['e', '\u001B'],
	['a', '\u0007']
]);

function unescape(c) {
	const u = c[0] === 'u';
	const bracket = c[1] === '{';

	if ((u && !bracket && c.length === 5) || (c[0] === 'x' && c.length === 3)) {
		return String.fromCharCode(parseInt(c.slice(1), 16));
	}

	if (u && bracket) {
		return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
	}

	return ESCAPES.get(c) || c;
}

function parseArguments(name, arguments_) {
	const results = [];
	const chunks = arguments_.trim().split(/\s*,\s*/g);
	let matches;

	for (const chunk of chunks) {
		const number = Number(chunk);
		if (!Number.isNaN(number)) {
			results.push(number);
		} else if ((matches = chunk.match(STRING_REGEX))) {
			results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, character) => escape ? unescape(escape) : character));
		} else {
			throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
		}
	}

	return results;
}

function parseStyle(style) {
	STYLE_REGEX.lastIndex = 0;

	const results = [];
	let matches;

	while ((matches = STYLE_REGEX.exec(style)) !== null) {
		const name = matches[1];

		if (matches[2]) {
			const args = parseArguments(name, matches[2]);
			results.push([name].concat(args));
		} else {
			results.push([name]);
		}
	}

	return results;
}

function buildStyle(chalk, styles) {
	const enabled = {};

	for (const layer of styles) {
		for (const style of layer.styles) {
			enabled[style[0]] = layer.inverse ? null : style.slice(1);
		}
	}

	let current = chalk;
	for (const [styleName, styles] of Object.entries(enabled)) {
		if (!Array.isArray(styles)) {
			continue;
		}

		if (!(styleName in current)) {
			throw new Error(`Unknown Chalk style: ${styleName}`);
		}

		current = styles.length > 0 ? current[styleName](...styles) : current[styleName];
	}

	return current;
}

var templates = (chalk, temporary) => {
	const styles = [];
	const chunks = [];
	let chunk = [];

	// eslint-disable-next-line max-params
	temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
		if (escapeCharacter) {
			chunk.push(unescape(escapeCharacter));
		} else if (style) {
			const string = chunk.join('');
			chunk = [];
			chunks.push(styles.length === 0 ? string : buildStyle(chalk, styles)(string));
			styles.push({inverse, styles: parseStyle(style)});
		} else if (close) {
			if (styles.length === 0) {
				throw new Error('Found extraneous } in Chalk template literal');
			}

			chunks.push(buildStyle(chalk, styles)(chunk.join('')));
			chunk = [];
			styles.pop();
		} else {
			chunk.push(character);
		}
	});

	chunks.push(chunk.join(''));

	if (styles.length > 0) {
		const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? '' : 's'} (\`}\`)`;
		throw new Error(errMessage);
	}

	return chunks.join('');
};

const {stdout: stdoutColor, stderr: stderrColor} = browser;
const {
	stringReplaceAll: stringReplaceAll$1,
	stringEncaseCRLFWithFirstIndex: stringEncaseCRLFWithFirstIndex$1
} = util;

const {isArray} = Array;

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = [
	'ansi',
	'ansi',
	'ansi256',
	'ansi16m'
];

const styles = Object.create(null);

const applyOptions = (object, options = {}) => {
	if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
		throw new Error('The `level` option should be an integer from 0 to 3');
	}

	// Detect level if not set manually
	const colorLevel = stdoutColor ? stdoutColor.level : 0;
	object.level = options.level === undefined ? colorLevel : options.level;
};

class ChalkClass {
	constructor(options) {
		// eslint-disable-next-line no-constructor-return
		return chalkFactory(options);
	}
}

const chalkFactory = options => {
	const chalk = {};
	applyOptions(chalk, options);

	chalk.template = (...arguments_) => chalkTag(chalk.template, ...arguments_);

	Object.setPrototypeOf(chalk, Chalk.prototype);
	Object.setPrototypeOf(chalk.template, chalk);

	chalk.template.constructor = () => {
		throw new Error('`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.');
	};

	chalk.template.Instance = ChalkClass;

	return chalk.template;
};

function Chalk(options) {
	return chalkFactory(options);
}

for (const [styleName, style] of Object.entries(ansiStyles)) {
	styles[styleName] = {
		get() {
			const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
			Object.defineProperty(this, styleName, {value: builder});
			return builder;
		}
	};
}

styles.visible = {
	get() {
		const builder = createBuilder(this, this._styler, true);
		Object.defineProperty(this, 'visible', {value: builder});
		return builder;
	}
};

const usedModels = ['rgb', 'hex', 'keyword', 'hsl', 'hsv', 'hwb', 'ansi', 'ansi256'];

for (const model of usedModels) {
	styles[model] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		}
	};
}

for (const model of usedModels) {
	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		}
	};
}

const proto = Object.defineProperties(() => {}, {
	...styles,
	level: {
		enumerable: true,
		get() {
			return this._generator.level;
		},
		set(level) {
			this._generator.level = level;
		}
	}
});

const createStyler = (open, close, parent) => {
	let openAll;
	let closeAll;
	if (parent === undefined) {
		openAll = open;
		closeAll = close;
	} else {
		openAll = parent.openAll + open;
		closeAll = close + parent.closeAll;
	}

	return {
		open,
		close,
		openAll,
		closeAll,
		parent
	};
};

const createBuilder = (self, _styler, _isEmpty) => {
	const builder = (...arguments_) => {
		if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) {
			// Called as a template literal, for example: chalk.red`2 + 3 = {bold ${2+3}}`
			return applyStyle(builder, chalkTag(builder, ...arguments_));
		}

		// Single argument is hot path, implicit coercion is faster than anything
		// eslint-disable-next-line no-implicit-coercion
		return applyStyle(builder, (arguments_.length === 1) ? ('' + arguments_[0]) : arguments_.join(' '));
	};

	// We alter the prototype because we must return a function, but there is
	// no way to create a function with a different prototype
	Object.setPrototypeOf(builder, proto);

	builder._generator = self;
	builder._styler = _styler;
	builder._isEmpty = _isEmpty;

	return builder;
};

const applyStyle = (self, string) => {
	if (self.level <= 0 || !string) {
		return self._isEmpty ? '' : string;
	}

	let styler = self._styler;

	if (styler === undefined) {
		return string;
	}

	const {openAll, closeAll} = styler;
	if (string.indexOf('\u001B') !== -1) {
		while (styler !== undefined) {
			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			string = stringReplaceAll$1(string, styler.close, styler.open);

			styler = styler.parent;
		}
	}

	// We can move both next actions out of loop, because remaining actions in loop won't have
	// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
	// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
	const lfIndex = string.indexOf('\n');
	if (lfIndex !== -1) {
		string = stringEncaseCRLFWithFirstIndex$1(string, closeAll, openAll, lfIndex);
	}

	return openAll + string + closeAll;
};

let template;
const chalkTag = (chalk, ...strings) => {
	const [firstString] = strings;

	if (!isArray(firstString) || !isArray(firstString.raw)) {
		// If chalk() was called by itself or with a string,
		// return the string itself as a string.
		return strings.join(' ');
	}

	const arguments_ = strings.slice(1);
	const parts = [firstString.raw[0]];

	for (let i = 1; i < firstString.length; i++) {
		parts.push(
			String(arguments_[i - 1]).replace(/[{}\\]/g, '\\$&'),
			String(firstString.raw[i])
		);
	}

	if (template === undefined) {
		template = templates;
	}

	return template(chalk, parts.join(''));
};

Object.defineProperties(Chalk.prototype, styles);

const chalk = Chalk(); // eslint-disable-line new-cap
chalk.supportsColor = stdoutColor;
chalk.stderr = Chalk({level: stderrColor ? stderrColor.level : 0}); // eslint-disable-line new-cap
chalk.stderr.supportsColor = stderrColor;

var source = chalk;

let FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM, isTTY=true;
if (typeof {} !== 'undefined') {
	({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = {} || {});
	isTTY = {}.stdout ;
}

const $ = {
	enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== 'dumb' && (
		FORCE_COLOR != null && FORCE_COLOR !== '0' || isTTY
	),

	// modifiers
	reset: init(0, 0),
	bold: init(1, 22),
	dim: init(2, 22),
	italic: init(3, 23),
	underline: init(4, 24),
	inverse: init(7, 27),
	hidden: init(8, 28),
	strikethrough: init(9, 29),

	// colors
	black: init(30, 39),
	red: init(31, 39),
	green: init(32, 39),
	yellow: init(33, 39),
	blue: init(34, 39),
	magenta: init(35, 39),
	cyan: init(36, 39),
	white: init(37, 39),
	gray: init(90, 39),
	grey: init(90, 39),

	// background colors
	bgBlack: init(40, 49),
	bgRed: init(41, 49),
	bgGreen: init(42, 49),
	bgYellow: init(43, 49),
	bgBlue: init(44, 49),
	bgMagenta: init(45, 49),
	bgCyan: init(46, 49),
	bgWhite: init(47, 49)
};

function run(arr, str) {
	let i=0, tmp, beg='', end='';
	for (; i < arr.length; i++) {
		tmp = arr[i];
		beg += tmp.open;
		end += tmp.close;
		if (!!~str.indexOf(tmp.close)) {
			str = str.replace(tmp.rgx, tmp.close + tmp.open);
		}
	}
	return beg + str + end;
}

function chain(has, keys) {
	let ctx = { has, keys };

	ctx.reset = $.reset.bind(ctx);
	ctx.bold = $.bold.bind(ctx);
	ctx.dim = $.dim.bind(ctx);
	ctx.italic = $.italic.bind(ctx);
	ctx.underline = $.underline.bind(ctx);
	ctx.inverse = $.inverse.bind(ctx);
	ctx.hidden = $.hidden.bind(ctx);
	ctx.strikethrough = $.strikethrough.bind(ctx);

	ctx.black = $.black.bind(ctx);
	ctx.red = $.red.bind(ctx);
	ctx.green = $.green.bind(ctx);
	ctx.yellow = $.yellow.bind(ctx);
	ctx.blue = $.blue.bind(ctx);
	ctx.magenta = $.magenta.bind(ctx);
	ctx.cyan = $.cyan.bind(ctx);
	ctx.white = $.white.bind(ctx);
	ctx.gray = $.gray.bind(ctx);
	ctx.grey = $.grey.bind(ctx);

	ctx.bgBlack = $.bgBlack.bind(ctx);
	ctx.bgRed = $.bgRed.bind(ctx);
	ctx.bgGreen = $.bgGreen.bind(ctx);
	ctx.bgYellow = $.bgYellow.bind(ctx);
	ctx.bgBlue = $.bgBlue.bind(ctx);
	ctx.bgMagenta = $.bgMagenta.bind(ctx);
	ctx.bgCyan = $.bgCyan.bind(ctx);
	ctx.bgWhite = $.bgWhite.bind(ctx);

	return ctx;
}

function init(open, close) {
	let blk = {
		open: `\x1b[${open}m`,
		close: `\x1b[${close}m`,
		rgx: new RegExp(`\\x1b\\[${close}m`, 'g')
	};
	return function (txt) {
		if (this !== void 0 && this.has !== void 0) {
			!!~this.has.indexOf(open) || (this.has.push(open),this.keys.push(blk));
			return txt === void 0 ? this : $.enabled ? run(this.keys, txt+'') : txt+'';
		}
		return txt === void 0 ? chain([open], [blk]) : $.enabled ? run([blk], txt+'') : txt+'';
	};
}

var kleur = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': $
});

var ansiRegex = ({onlyFirst = false} = {}) => {
	const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
	].join('|');

	return new RegExp(pattern, onlyFirst ? undefined : 'g');
};

var stripAnsi = string => typeof string === 'string' ? string.replace(ansiRegex(), '') : string;

var kleur$1 = getCjsExportFromNamespace(kleur);

var style = createCommonjsModule(function (module, exports) {
// user kleur if we are in the browser
const colorLib = ({} && {}.stdout) ? source : kleur$1;



module.exports.style = (str, ...colors) => {
  const out = colors.reduce(function (input, color) {
    return colorLib[color](input)
  }, str);
  return out
};

module.exports.styleEachChar = (str, ...colors) => {
  // strip existing ansi chars so we dont loop them
  // @ TODO create a really clever workaround so that you can accrete styles
  const chars = [...stripAnsi(str)];

  // style each character
  const out = chars.reduce((prev, current) => {
    const coded = colors.reduce((input, color) => {
      return colorLib[color](input)
    }, current);
    return prev + coded
  }, "");

  return out
};

module.exports.resetStyle = function (str) {
  this.configure({ reset: true });
  return stripAnsi(str)
};

module.exports.colorizeCell = (str, cellOptions, rowType) => {
  let color = false; // false will keep terminal default

  switch (true) {
    case (rowType === "body"):
      color = cellOptions.color || color;
      break

    case (rowType === "header"):
      color = cellOptions.headerColor || color;
      break

    default:
      color = cellOptions.footerColor || color;
  }

  if (color) {
    str = exports.style(str, color);
  }

  return str
};
});
var style_1 = style.style;
var style_2 = style.styleEachChar;
var style_3 = style.resetStyle;
var style_4 = style.colorizeCell;

var clone_1 = createCommonjsModule(function (module) {
var clone = (function() {

/**
 * Clones (copies) an Object using deep copying.
 *
 * This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling clone(obj, false).
 *
 * Caution: if `circular` is false and `parent` contains circular references,
 * your program may enter an infinite loop and crash.
 *
 * @param `parent` - the object to be cloned
 * @param `circular` - set to true if the object to be cloned may contain
 *    circular references. (optional - true by default)
 * @param `depth` - set to a number if the object is only to be cloned to
 *    a particular depth. (optional - defaults to Infinity)
 * @param `prototype` - sets the prototype to be used when cloning an object.
 *    (optional - defaults to parent prototype).
*/
function clone(parent, circular, depth, prototype) {
  var filter;
  if (typeof circular === 'object') {
    depth = circular.depth;
    prototype = circular.prototype;
    filter = circular.filter;
    circular = circular.circular;
  }
  // maintain two arrays for circular references, where corresponding parents
  // and children have the same index
  var allParents = [];
  var allChildren = [];

  var useBuffer = typeof Buffer != 'undefined';

  if (typeof circular == 'undefined')
    circular = true;

  if (typeof depth == 'undefined')
    depth = Infinity;

  // recurse this function so we don't reset allParents and allChildren
  function _clone(parent, depth) {
    // cloning null always returns null
    if (parent === null)
      return null;

    if (depth == 0)
      return parent;

    var child;
    var proto;
    if (typeof parent != 'object') {
      return parent;
    }

    if (clone.__isArray(parent)) {
      child = [];
    } else if (clone.__isRegExp(parent)) {
      child = new RegExp(parent.source, __getRegExpFlags(parent));
      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
    } else if (clone.__isDate(parent)) {
      child = new Date(parent.getTime());
    } else if (useBuffer && Buffer.isBuffer(parent)) {
      if (Buffer.allocUnsafe) {
        // Node.js >= 4.5.0
        child = Buffer.allocUnsafe(parent.length);
      } else {
        // Older Node.js versions
        child = new Buffer(parent.length);
      }
      parent.copy(child);
      return child;
    } else {
      if (typeof prototype == 'undefined') {
        proto = Object.getPrototypeOf(parent);
        child = Object.create(proto);
      }
      else {
        child = Object.create(prototype);
        proto = prototype;
      }
    }

    if (circular) {
      var index = allParents.indexOf(parent);

      if (index != -1) {
        return allChildren[index];
      }
      allParents.push(parent);
      allChildren.push(child);
    }

    for (var i in parent) {
      var attrs;
      if (proto) {
        attrs = Object.getOwnPropertyDescriptor(proto, i);
      }

      if (attrs && attrs.set == null) {
        continue;
      }
      child[i] = _clone(parent[i], depth - 1);
    }

    return child;
  }

  return _clone(parent, depth);
}

/**
 * Simple flat clone using prototype, accepts only objects, usefull for property
 * override on FLAT configuration object (no nested props).
 *
 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
 * works.
 */
clone.clonePrototype = function clonePrototype(parent) {
  if (parent === null)
    return null;

  var c = function () {};
  c.prototype = parent;
  return new c();
};

// private utility functions

function __objToStr(o) {
  return Object.prototype.toString.call(o);
}clone.__objToStr = __objToStr;

function __isDate(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Date]';
}clone.__isDate = __isDate;

function __isArray(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Array]';
}clone.__isArray = __isArray;

function __isRegExp(o) {
  return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
}clone.__isRegExp = __isRegExp;

function __getRegExpFlags(re) {
  var flags = '';
  if (re.global) flags += 'g';
  if (re.ignoreCase) flags += 'i';
  if (re.multiline) flags += 'm';
  return flags;
}clone.__getRegExpFlags = __getRegExpFlags;

return clone;
})();

if ( module.exports) {
  module.exports = clone;
}
});

var defaults$1 = function(options, defaults) {
  options = options || {};

  Object.keys(defaults).forEach(function(key) {
    if (typeof options[key] === 'undefined') {
      options[key] = clone_1(defaults[key]);
    }
  });

  return options;
};

var combining = [
    [ 0x0300, 0x036F ], [ 0x0483, 0x0486 ], [ 0x0488, 0x0489 ],
    [ 0x0591, 0x05BD ], [ 0x05BF, 0x05BF ], [ 0x05C1, 0x05C2 ],
    [ 0x05C4, 0x05C5 ], [ 0x05C7, 0x05C7 ], [ 0x0600, 0x0603 ],
    [ 0x0610, 0x0615 ], [ 0x064B, 0x065E ], [ 0x0670, 0x0670 ],
    [ 0x06D6, 0x06E4 ], [ 0x06E7, 0x06E8 ], [ 0x06EA, 0x06ED ],
    [ 0x070F, 0x070F ], [ 0x0711, 0x0711 ], [ 0x0730, 0x074A ],
    [ 0x07A6, 0x07B0 ], [ 0x07EB, 0x07F3 ], [ 0x0901, 0x0902 ],
    [ 0x093C, 0x093C ], [ 0x0941, 0x0948 ], [ 0x094D, 0x094D ],
    [ 0x0951, 0x0954 ], [ 0x0962, 0x0963 ], [ 0x0981, 0x0981 ],
    [ 0x09BC, 0x09BC ], [ 0x09C1, 0x09C4 ], [ 0x09CD, 0x09CD ],
    [ 0x09E2, 0x09E3 ], [ 0x0A01, 0x0A02 ], [ 0x0A3C, 0x0A3C ],
    [ 0x0A41, 0x0A42 ], [ 0x0A47, 0x0A48 ], [ 0x0A4B, 0x0A4D ],
    [ 0x0A70, 0x0A71 ], [ 0x0A81, 0x0A82 ], [ 0x0ABC, 0x0ABC ],
    [ 0x0AC1, 0x0AC5 ], [ 0x0AC7, 0x0AC8 ], [ 0x0ACD, 0x0ACD ],
    [ 0x0AE2, 0x0AE3 ], [ 0x0B01, 0x0B01 ], [ 0x0B3C, 0x0B3C ],
    [ 0x0B3F, 0x0B3F ], [ 0x0B41, 0x0B43 ], [ 0x0B4D, 0x0B4D ],
    [ 0x0B56, 0x0B56 ], [ 0x0B82, 0x0B82 ], [ 0x0BC0, 0x0BC0 ],
    [ 0x0BCD, 0x0BCD ], [ 0x0C3E, 0x0C40 ], [ 0x0C46, 0x0C48 ],
    [ 0x0C4A, 0x0C4D ], [ 0x0C55, 0x0C56 ], [ 0x0CBC, 0x0CBC ],
    [ 0x0CBF, 0x0CBF ], [ 0x0CC6, 0x0CC6 ], [ 0x0CCC, 0x0CCD ],
    [ 0x0CE2, 0x0CE3 ], [ 0x0D41, 0x0D43 ], [ 0x0D4D, 0x0D4D ],
    [ 0x0DCA, 0x0DCA ], [ 0x0DD2, 0x0DD4 ], [ 0x0DD6, 0x0DD6 ],
    [ 0x0E31, 0x0E31 ], [ 0x0E34, 0x0E3A ], [ 0x0E47, 0x0E4E ],
    [ 0x0EB1, 0x0EB1 ], [ 0x0EB4, 0x0EB9 ], [ 0x0EBB, 0x0EBC ],
    [ 0x0EC8, 0x0ECD ], [ 0x0F18, 0x0F19 ], [ 0x0F35, 0x0F35 ],
    [ 0x0F37, 0x0F37 ], [ 0x0F39, 0x0F39 ], [ 0x0F71, 0x0F7E ],
    [ 0x0F80, 0x0F84 ], [ 0x0F86, 0x0F87 ], [ 0x0F90, 0x0F97 ],
    [ 0x0F99, 0x0FBC ], [ 0x0FC6, 0x0FC6 ], [ 0x102D, 0x1030 ],
    [ 0x1032, 0x1032 ], [ 0x1036, 0x1037 ], [ 0x1039, 0x1039 ],
    [ 0x1058, 0x1059 ], [ 0x1160, 0x11FF ], [ 0x135F, 0x135F ],
    [ 0x1712, 0x1714 ], [ 0x1732, 0x1734 ], [ 0x1752, 0x1753 ],
    [ 0x1772, 0x1773 ], [ 0x17B4, 0x17B5 ], [ 0x17B7, 0x17BD ],
    [ 0x17C6, 0x17C6 ], [ 0x17C9, 0x17D3 ], [ 0x17DD, 0x17DD ],
    [ 0x180B, 0x180D ], [ 0x18A9, 0x18A9 ], [ 0x1920, 0x1922 ],
    [ 0x1927, 0x1928 ], [ 0x1932, 0x1932 ], [ 0x1939, 0x193B ],
    [ 0x1A17, 0x1A18 ], [ 0x1B00, 0x1B03 ], [ 0x1B34, 0x1B34 ],
    [ 0x1B36, 0x1B3A ], [ 0x1B3C, 0x1B3C ], [ 0x1B42, 0x1B42 ],
    [ 0x1B6B, 0x1B73 ], [ 0x1DC0, 0x1DCA ], [ 0x1DFE, 0x1DFF ],
    [ 0x200B, 0x200F ], [ 0x202A, 0x202E ], [ 0x2060, 0x2063 ],
    [ 0x206A, 0x206F ], [ 0x20D0, 0x20EF ], [ 0x302A, 0x302F ],
    [ 0x3099, 0x309A ], [ 0xA806, 0xA806 ], [ 0xA80B, 0xA80B ],
    [ 0xA825, 0xA826 ], [ 0xFB1E, 0xFB1E ], [ 0xFE00, 0xFE0F ],
    [ 0xFE20, 0xFE23 ], [ 0xFEFF, 0xFEFF ], [ 0xFFF9, 0xFFFB ],
    [ 0x10A01, 0x10A03 ], [ 0x10A05, 0x10A06 ], [ 0x10A0C, 0x10A0F ],
    [ 0x10A38, 0x10A3A ], [ 0x10A3F, 0x10A3F ], [ 0x1D167, 0x1D169 ],
    [ 0x1D173, 0x1D182 ], [ 0x1D185, 0x1D18B ], [ 0x1D1AA, 0x1D1AD ],
    [ 0x1D242, 0x1D244 ], [ 0xE0001, 0xE0001 ], [ 0xE0020, 0xE007F ],
    [ 0xE0100, 0xE01EF ]
];

var DEFAULTS = {
  nul: 0,
  control: 0
};

var wcwidth_1 = function wcwidth(str) {
  return wcswidth(str, DEFAULTS)
};

var config = function(opts) {
  opts = defaults$1(opts || {}, DEFAULTS);
  return function wcwidth(str) {
    return wcswidth(str, opts)
  }
};

/*
 *  The following functions define the column width of an ISO 10646
 *  character as follows:
 *  - The null character (U+0000) has a column width of 0.
 *  - Other C0/C1 control characters and DEL will lead to a return value
 *    of -1.
 *  - Non-spacing and enclosing combining characters (general category
 *    code Mn or Me in the
 *    Unicode database) have a column width of 0.
 *  - SOFT HYPHEN (U+00AD) has a column width of 1.
 *  - Other format characters (general category code Cf in the Unicode
 *    database) and ZERO WIDTH
 *    SPACE (U+200B) have a column width of 0.
 *  - Hangul Jamo medial vowels and final consonants (U+1160-U+11FF)
 *    have a column width of 0.
 *  - Spacing characters in the East Asian Wide (W) or East Asian
 *    Full-width (F) category as
 *    defined in Unicode Technical Report #11 have a column width of 2.
 *  - All remaining characters (including all printable ISO 8859-1 and
 *    WGL4 characters, Unicode control characters, etc.) have a column
 *    width of 1.
 *  This implementation assumes that characters are encoded in ISO 10646.
*/

function wcswidth(str, opts) {
  if (typeof str !== 'string') return wcwidth(str, opts)

  var s = 0;
  for (var i = 0; i < str.length; i++) {
    var n = wcwidth(str.charCodeAt(i), opts);
    if (n < 0) return -1
    s += n;
  }

  return s
}

function wcwidth(ucs, opts) {
  // test for 8-bit control characters
  if (ucs === 0) return opts.nul
  if (ucs < 32 || (ucs >= 0x7f && ucs < 0xa0)) return opts.control

  // binary search in table of non-spacing characters
  if (bisearch(ucs)) return 0

  // if we arrive here, ucs is not a combining or C0/C1 control character
  return 1 +
      (ucs >= 0x1100 &&
       (ucs <= 0x115f ||                       // Hangul Jamo init. consonants
        ucs == 0x2329 || ucs == 0x232a ||
        (ucs >= 0x2e80 && ucs <= 0xa4cf &&
         ucs != 0x303f) ||                     // CJK ... Yi
        (ucs >= 0xac00 && ucs <= 0xd7a3) ||    // Hangul Syllables
        (ucs >= 0xf900 && ucs <= 0xfaff) ||    // CJK Compatibility Ideographs
        (ucs >= 0xfe10 && ucs <= 0xfe19) ||    // Vertical forms
        (ucs >= 0xfe30 && ucs <= 0xfe6f) ||    // CJK Compatibility Forms
        (ucs >= 0xff00 && ucs <= 0xff60) ||    // Fullwidth Forms
        (ucs >= 0xffe0 && ucs <= 0xffe6) ||
        (ucs >= 0x20000 && ucs <= 0x2fffd) ||
        (ucs >= 0x30000 && ucs <= 0x3fffd)));
}

function bisearch(ucs) {
  var min = 0;
  var max = combining.length - 1;
  var mid;

  if (ucs < combining[0][0] || ucs > combining[max][1]) return false

  while (max >= min) {
    mid = Math.floor((min + max) / 2);
    if (ucs > combining[mid][1]) min = mid + 1;
    else if (ucs < combining[mid][0]) max = mid - 1;
    else return true
  }

  return false
}
wcwidth_1.config = config;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }



var main = function (input, breakAtLength) {

  var str = input.toString();
  var charArr = [].concat(_toConsumableArray(str));
  var index = 0;
  var indexOfLastFitChar = 0;
  var fittableLength = 0;

  while (charArr.length > 0) {

    var char = charArr.shift();
    var currentLength = fittableLength + wcwidth_1(char);

    if (currentLength <= breakAtLength) {
      indexOfLastFitChar = index;
      fittableLength = currentLength;
      index++;
    } else {
      break;
    }
  }

  //break after this character
  return indexOfLastFitChar;
};

var toStr = Object.prototype.toString;

var isArguments = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

var keysShim;
if (!Object.keys) {
	// modified from https://github.com/es-shims/es5-shim
	var has = Object.prototype.hasOwnProperty;
	var toStr$1 = Object.prototype.toString;
	var isArgs = isArguments; // eslint-disable-line global-require
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
	var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
	var dontEnums = [
		'toString',
		'toLocaleString',
		'valueOf',
		'hasOwnProperty',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'constructor'
	];
	var equalsConstructorPrototype = function (o) {
		var ctor = o.constructor;
		return ctor && ctor.prototype === o;
	};
	var excludedKeys = {
		$applicationCache: true,
		$console: true,
		$external: true,
		$frame: true,
		$frameElement: true,
		$frames: true,
		$innerHeight: true,
		$innerWidth: true,
		$onmozfullscreenchange: true,
		$onmozfullscreenerror: true,
		$outerHeight: true,
		$outerWidth: true,
		$pageXOffset: true,
		$pageYOffset: true,
		$parent: true,
		$scrollLeft: true,
		$scrollTop: true,
		$scrollX: true,
		$scrollY: true,
		$self: true,
		$webkitIndexedDB: true,
		$webkitStorageInfo: true,
		$window: true
	};
	var hasAutomationEqualityBug = (function () {
		/* global window */
		if (typeof window === 'undefined') { return false; }
		for (var k in window) {
			try {
				if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
					try {
						equalsConstructorPrototype(window[k]);
					} catch (e) {
						return true;
					}
				}
			} catch (e) {
				return true;
			}
		}
		return false;
	}());
	var equalsConstructorPrototypeIfNotBuggy = function (o) {
		/* global window */
		if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
			return equalsConstructorPrototype(o);
		}
		try {
			return equalsConstructorPrototype(o);
		} catch (e) {
			return false;
		}
	};

	keysShim = function keys(object) {
		var isObject = object !== null && typeof object === 'object';
		var isFunction = toStr$1.call(object) === '[object Function]';
		var isArguments = isArgs(object);
		var isString = isObject && toStr$1.call(object) === '[object String]';
		var theKeys = [];

		if (!isObject && !isFunction && !isArguments) {
			throw new TypeError('Object.keys called on a non-object');
		}

		var skipProto = hasProtoEnumBug && isFunction;
		if (isString && object.length > 0 && !has.call(object, 0)) {
			for (var i = 0; i < object.length; ++i) {
				theKeys.push(String(i));
			}
		}

		if (isArguments && object.length > 0) {
			for (var j = 0; j < object.length; ++j) {
				theKeys.push(String(j));
			}
		} else {
			for (var name in object) {
				if (!(skipProto && name === 'prototype') && has.call(object, name)) {
					theKeys.push(String(name));
				}
			}
		}

		if (hasDontEnumBug) {
			var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

			for (var k = 0; k < dontEnums.length; ++k) {
				if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
					theKeys.push(dontEnums[k]);
				}
			}
		}
		return theKeys;
	};
}
var implementation = keysShim;

var slice = Array.prototype.slice;


var origKeys = Object.keys;
var keysShim$1 = origKeys ? function keys(o) { return origKeys(o); } : implementation;

var originalKeys = Object.keys;

keysShim$1.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			var args = Object.keys(arguments);
			return args && args.length === arguments.length;
		}(1, 2));
		if (!keysWorksWithArguments) {
			Object.keys = function keys(object) { // eslint-disable-line func-name-matching
				if (isArguments(object)) {
					return originalKeys(slice.call(object));
				}
				return originalKeys(object);
			};
		}
	} else {
		Object.keys = keysShim$1;
	}
	return Object.keys || keysShim$1;
};

var objectKeys = keysShim$1;

/* eslint complexity: [2, 18], max-statements: [2, 33] */
var shams = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

var origSymbol = typeof Symbol !== 'undefined' && Symbol;


var hasSymbols = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return shams();
};

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice$1 = Array.prototype.slice;
var toStr$2 = Object.prototype.toString;
var funcType = '[object Function]';

var implementation$1 = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr$2.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice$1.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice$1.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice$1.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

var functionBind = Function.prototype.bind || implementation$1;

var src = functionBind.call(Function.call, Object.prototype.hasOwnProperty);

var undefined$1;

var $SyntaxError = SyntaxError;
var $Function = Function;
var $TypeError = TypeError;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
	try {
		$gOPD({}, '');
	} catch (e) {
		$gOPD = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function () {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols$1 = hasSymbols();

var getProto = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' ? undefined$1 : getProto(Uint8Array);

var INTRINSICS = {
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined$1 : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols$1 ? getProto([][Symbol.iterator]()) : undefined$1,
	'%AsyncFromSyncIteratorPrototype%': undefined$1,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined$1 : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined$1 : BigInt,
	'%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined$1 : BigInt64Array,
	'%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined$1 : BigUint64Array,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined$1 : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined$1 : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined$1 : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols$1 ? getProto(getProto([][Symbol.iterator]())) : undefined$1,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined$1,
	'%Map%': typeof Map === 'undefined' ? undefined$1 : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols$1 ? undefined$1 : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined$1 : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined$1 : Proxy,
	'%RangeError%': RangeError,
	'%ReferenceError%': ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined$1 : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined$1 : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols$1 ? undefined$1 : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols$1 ? getProto(''[Symbol.iterator]()) : undefined$1,
	'%Symbol%': hasSymbols$1 ? Symbol : undefined$1,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array,
	'%URIError%': URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined$1 : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet
};

try {
	null.error; // eslint-disable-line no-unused-expressions
} catch (e) {
	// https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
	var errorProto = getProto(getProto(e));
	INTRINSICS['%Error.prototype%'] = errorProto;
}

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};



var $concat = functionBind.call(Function.call, Array.prototype.concat);
var $spliceApply = functionBind.call(Function.apply, Array.prototype.splice);
var $replace = functionBind.call(Function.call, String.prototype.replace);
var $strSlice = functionBind.call(Function.call, String.prototype.slice);
var $exec = functionBind.call(Function.call, RegExp.prototype.exec);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (src(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (src(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

var getIntrinsic = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	if ($exec(/^%?[^%]*%?$/, name) === null) {
		throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
	}
	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (src(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined$1;
			}
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = src(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};

var $defineProperty = getIntrinsic('%Object.defineProperty%', true);

var hasPropertyDescriptors = function hasPropertyDescriptors() {
	if ($defineProperty) {
		try {
			$defineProperty({}, 'a', { value: 1 });
			return true;
		} catch (e) {
			// IE 8 has a broken defineProperty
			return false;
		}
	}
	return false;
};

hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
	// node v0.6 has a bug where array lengths can be Set but not Defined
	if (!hasPropertyDescriptors()) {
		return null;
	}
	try {
		return $defineProperty([], 'length', { value: 1 }).length !== 1;
	} catch (e) {
		// In Firefox 4-22, defining length on an array throws an exception.
		return true;
	}
};

var hasPropertyDescriptors_1 = hasPropertyDescriptors;

var hasSymbols$2 = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

var toStr$3 = Object.prototype.toString;
var concat = Array.prototype.concat;
var origDefineProperty = Object.defineProperty;

var isFunction = function (fn) {
	return typeof fn === 'function' && toStr$3.call(fn) === '[object Function]';
};

var hasPropertyDescriptors$1 = hasPropertyDescriptors_1();

var supportsDescriptors = origDefineProperty && hasPropertyDescriptors$1;

var defineProperty = function (object, name, value, predicate) {
	if (name in object) {
		if (predicate === true) {
			if (object[name] === value) {
				return;
			}
		} else if (!isFunction(predicate) || !predicate()) {
			return;
		}
	}
	if (supportsDescriptors) {
		origDefineProperty(object, name, {
			configurable: true,
			enumerable: false,
			value: value,
			writable: true
		});
	} else {
		object[name] = value; // eslint-disable-line no-param-reassign
	}
};

var defineProperties = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = objectKeys(map);
	if (hasSymbols$2) {
		props = concat.call(props, Object.getOwnPropertySymbols(map));
	}
	for (var i = 0; i < props.length; i += 1) {
		defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
	}
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

var defineProperties_1 = defineProperties;

var callBind = createCommonjsModule(function (module) {




var $apply = getIntrinsic('%Function.prototype.apply%');
var $call = getIntrinsic('%Function.prototype.call%');
var $reflectApply = getIntrinsic('%Reflect.apply%', true) || functionBind.call($call, $apply);

var $gOPD = getIntrinsic('%Object.getOwnPropertyDescriptor%', true);
var $defineProperty = getIntrinsic('%Object.defineProperty%', true);
var $max = getIntrinsic('%Math.max%');

if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = null;
	}
}

module.exports = function callBind(originalFunction) {
	var func = $reflectApply(functionBind, $call, arguments);
	if ($gOPD && $defineProperty) {
		var desc = $gOPD(func, 'length');
		if (desc.configurable) {
			// original length, plus the receiver, minus any additional arguments (after the receiver)
			$defineProperty(
				func,
				'length',
				{ value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) }
			);
		}
	}
	return func;
};

var applyBind = function applyBind() {
	return $reflectApply(functionBind, $apply, arguments);
};

if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}
});
var callBind_1 = callBind.apply;

var $abs = getIntrinsic('%Math.abs%');

// http://262.ecma-international.org/5.1/#sec-5.2

var abs = function abs(x) {
	return $abs(x);
};

// https://262.ecma-international.org/5.1/#sec-8

var Type = function Type(x) {
	if (x === null) {
		return 'Null';
	}
	if (typeof x === 'undefined') {
		return 'Undefined';
	}
	if (typeof x === 'function' || typeof x === 'object') {
		return 'Object';
	}
	if (typeof x === 'number') {
		return 'Number';
	}
	if (typeof x === 'boolean') {
		return 'Boolean';
	}
	if (typeof x === 'string') {
		return 'String';
	}
};

// https://262.ecma-international.org/11.0/#sec-ecmascript-data-types-and-values

var Type$1 = function Type$1(x) {
	if (typeof x === 'symbol') {
		return 'Symbol';
	}
	if (typeof x === 'bigint') {
		return 'BigInt';
	}
	return Type(x);
};

// var modulo = require('./modulo');
var $floor = Math.floor;

// http://262.ecma-international.org/11.0/#eqn-floor

var floor = function floor(x) {
	// return x - modulo(x, 1);
	if (Type$1(x) === 'BigInt') {
		return x;
	}
	return $floor(x);
};

var _isNaN = Number.isNaN || function isNaN(a) {
	return a !== a;
};

var _isFinite = function (x) { return (typeof x === 'number' || typeof x === 'bigint') && !_isNaN(x) && x !== Infinity && x !== -Infinity; };

// https://tc39.es/ecma262/#sec-isintegralnumber

var IsIntegralNumber = function IsIntegralNumber(argument) {
	if (Type$1(argument) !== 'Number' || _isNaN(argument) || !_isFinite(argument)) {
		return false;
	}
	var absValue = abs(argument);
	return floor(absValue) === absValue;
};

var test = {
	foo: {}
};

var $Object = Object;

var hasProto = function hasProto() {
	return { __proto__: test }.foo === test.foo && !({ __proto__: null } instanceof $Object);
};

var $ArrayPrototype = getIntrinsic('%Array.prototype%');
var $RangeError = getIntrinsic('%RangeError%');
var $SyntaxError$1 = getIntrinsic('%SyntaxError%');
var $TypeError$1 = getIntrinsic('%TypeError%');



var MAX_ARRAY_LENGTH = Math.pow(2, 32) - 1;

var hasProto$1 = hasProto();

var $setProto = getIntrinsic('%Object.setPrototypeOf%', true) || (
	hasProto$1
		? function (O, proto) {
			O.__proto__ = proto; // eslint-disable-line no-proto, no-param-reassign
			return O;
		}
		: null
);

// https://262.ecma-international.org/12.0/#sec-arraycreate

var ArrayCreate = function ArrayCreate(length) {
	if (!IsIntegralNumber(length) || length < 0) {
		throw new $TypeError$1('Assertion failed: `length` must be an integer Number >= 0');
	}
	if (length > MAX_ARRAY_LENGTH) {
		throw new $RangeError('length is greater than (2**32 - 1)');
	}
	var proto = arguments.length > 1 ? arguments[1] : $ArrayPrototype;
	var A = []; // steps 3, 5
	if (proto !== $ArrayPrototype) { // step 4
		if (!$setProto) {
			throw new $SyntaxError$1('ArrayCreate: a `proto` argument that is not `Array.prototype` is not supported in an environment that does not support setting the [[Prototype]]');
		}
		$setProto(A, proto);
	}
	if (length !== 0) { // bypasses the need for step 6
		A.length = length;
	}
	/* step 6, the above as a shortcut for the below
	OrdinaryDefineOwnProperty(A, 'length', {
		'[[Configurable]]': false,
		'[[Enumerable]]': false,
		'[[Value]]': length,
		'[[Writable]]': true
	});
	*/
	return A;
};

var _nodeResolve_empty = {};

var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': _nodeResolve_empty
});

var utilInspect = getCjsExportFromNamespace(_nodeResolve_empty$1);

var hasMap = typeof Map === 'function' && Map.prototype;
var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size') : null;
var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function' ? mapSizeDescriptor.get : null;
var mapForEach = hasMap && Map.prototype.forEach;
var hasSet = typeof Set === 'function' && Set.prototype;
var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size') : null;
var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function' ? setSizeDescriptor.get : null;
var setForEach = hasSet && Set.prototype.forEach;
var hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype;
var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
var hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype;
var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
var hasWeakRef = typeof WeakRef === 'function' && WeakRef.prototype;
var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
var booleanValueOf = Boolean.prototype.valueOf;
var objectToString = Object.prototype.toString;
var functionToString = Function.prototype.toString;
var $match = String.prototype.match;
var $slice = String.prototype.slice;
var $replace$1 = String.prototype.replace;
var $toUpperCase = String.prototype.toUpperCase;
var $toLowerCase = String.prototype.toLowerCase;
var $test = RegExp.prototype.test;
var $concat$1 = Array.prototype.concat;
var $join = Array.prototype.join;
var $arrSlice = Array.prototype.slice;
var $floor$1 = Math.floor;
var bigIntValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : null;
var gOPS = Object.getOwnPropertySymbols;
var symToString = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? Symbol.prototype.toString : null;
var hasShammedSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'object';
// ie, `has-tostringtag/shams
var toStringTag = typeof Symbol === 'function' && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? 'object' : 'symbol')
    ? Symbol.toStringTag
    : null;
var isEnumerable$1 = Object.prototype.propertyIsEnumerable;

var gPO = (typeof Reflect === 'function' ? Reflect.getPrototypeOf : Object.getPrototypeOf) || (
    [].__proto__ === Array.prototype // eslint-disable-line no-proto
        ? function (O) {
            return O.__proto__; // eslint-disable-line no-proto
        }
        : null
);

function addNumericSeparator(num, str) {
    if (
        num === Infinity
        || num === -Infinity
        || num !== num
        || (num && num > -1000 && num < 1000)
        || $test.call(/e/, str)
    ) {
        return str;
    }
    var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
    if (typeof num === 'number') {
        var int = num < 0 ? -$floor$1(-num) : $floor$1(num); // trunc(num)
        if (int !== num) {
            var intStr = String(int);
            var dec = $slice.call(str, intStr.length + 1);
            return $replace$1.call(intStr, sepRegex, '$&_') + '.' + $replace$1.call($replace$1.call(dec, /([0-9]{3})/g, '$&_'), /_$/, '');
        }
    }
    return $replace$1.call(str, sepRegex, '$&_');
}


var inspectCustom = utilInspect.custom;
var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;

var objectInspect = function inspect_(obj, options, depth, seen) {
    var opts = options || {};

    if (has$1(opts, 'quoteStyle') && (opts.quoteStyle !== 'single' && opts.quoteStyle !== 'double')) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
    }
    if (
        has$1(opts, 'maxStringLength') && (typeof opts.maxStringLength === 'number'
            ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity
            : opts.maxStringLength !== null
        )
    ) {
        throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
    }
    var customInspect = has$1(opts, 'customInspect') ? opts.customInspect : true;
    if (typeof customInspect !== 'boolean' && customInspect !== 'symbol') {
        throw new TypeError('option "customInspect", if provided, must be `true`, `false`, or `\'symbol\'`');
    }

    if (
        has$1(opts, 'indent')
        && opts.indent !== null
        && opts.indent !== '\t'
        && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)
    ) {
        throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
    }
    if (has$1(opts, 'numericSeparator') && typeof opts.numericSeparator !== 'boolean') {
        throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
    }
    var numericSeparator = opts.numericSeparator;

    if (typeof obj === 'undefined') {
        return 'undefined';
    }
    if (obj === null) {
        return 'null';
    }
    if (typeof obj === 'boolean') {
        return obj ? 'true' : 'false';
    }

    if (typeof obj === 'string') {
        return inspectString(obj, opts);
    }
    if (typeof obj === 'number') {
        if (obj === 0) {
            return Infinity / obj > 0 ? '0' : '-0';
        }
        var str = String(obj);
        return numericSeparator ? addNumericSeparator(obj, str) : str;
    }
    if (typeof obj === 'bigint') {
        var bigIntStr = String(obj) + 'n';
        return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
    }

    var maxDepth = typeof opts.depth === 'undefined' ? 5 : opts.depth;
    if (typeof depth === 'undefined') { depth = 0; }
    if (depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') {
        return isArray$1(obj) ? '[Array]' : '[Object]';
    }

    var indent = getIndent(opts, depth);

    if (typeof seen === 'undefined') {
        seen = [];
    } else if (indexOf(seen, obj) >= 0) {
        return '[Circular]';
    }

    function inspect(value, from, noIndent) {
        if (from) {
            seen = $arrSlice.call(seen);
            seen.push(from);
        }
        if (noIndent) {
            var newOpts = {
                depth: opts.depth
            };
            if (has$1(opts, 'quoteStyle')) {
                newOpts.quoteStyle = opts.quoteStyle;
            }
            return inspect_(value, newOpts, depth + 1, seen);
        }
        return inspect_(value, opts, depth + 1, seen);
    }

    if (typeof obj === 'function' && !isRegExp(obj)) { // in older engines, regexes are callable
        var name = nameOf(obj);
        var keys = arrObjKeys(obj, inspect);
        return '[Function' + (name ? ': ' + name : ' (anonymous)') + ']' + (keys.length > 0 ? ' { ' + $join.call(keys, ', ') + ' }' : '');
    }
    if (isSymbol(obj)) {
        var symString = hasShammedSymbols ? $replace$1.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, '$1') : symToString.call(obj);
        return typeof obj === 'object' && !hasShammedSymbols ? markBoxed(symString) : symString;
    }
    if (isElement(obj)) {
        var s = '<' + $toLowerCase.call(String(obj.nodeName));
        var attrs = obj.attributes || [];
        for (var i = 0; i < attrs.length; i++) {
            s += ' ' + attrs[i].name + '=' + wrapQuotes(quote(attrs[i].value), 'double', opts);
        }
        s += '>';
        if (obj.childNodes && obj.childNodes.length) { s += '...'; }
        s += '</' + $toLowerCase.call(String(obj.nodeName)) + '>';
        return s;
    }
    if (isArray$1(obj)) {
        if (obj.length === 0) { return '[]'; }
        var xs = arrObjKeys(obj, inspect);
        if (indent && !singleLineValues(xs)) {
            return '[' + indentedJoin(xs, indent) + ']';
        }
        return '[ ' + $join.call(xs, ', ') + ' ]';
    }
    if (isError(obj)) {
        var parts = arrObjKeys(obj, inspect);
        if (!('cause' in Error.prototype) && 'cause' in obj && !isEnumerable$1.call(obj, 'cause')) {
            return '{ [' + String(obj) + '] ' + $join.call($concat$1.call('[cause]: ' + inspect(obj.cause), parts), ', ') + ' }';
        }
        if (parts.length === 0) { return '[' + String(obj) + ']'; }
        return '{ [' + String(obj) + '] ' + $join.call(parts, ', ') + ' }';
    }
    if (typeof obj === 'object' && customInspect) {
        if (inspectSymbol && typeof obj[inspectSymbol] === 'function' && utilInspect) {
            return utilInspect(obj, { depth: maxDepth - depth });
        } else if (customInspect !== 'symbol' && typeof obj.inspect === 'function') {
            return obj.inspect();
        }
    }
    if (isMap(obj)) {
        var mapParts = [];
        if (mapForEach) {
            mapForEach.call(obj, function (value, key) {
                mapParts.push(inspect(key, obj, true) + ' => ' + inspect(value, obj));
            });
        }
        return collectionOf('Map', mapSize.call(obj), mapParts, indent);
    }
    if (isSet(obj)) {
        var setParts = [];
        if (setForEach) {
            setForEach.call(obj, function (value) {
                setParts.push(inspect(value, obj));
            });
        }
        return collectionOf('Set', setSize.call(obj), setParts, indent);
    }
    if (isWeakMap(obj)) {
        return weakCollectionOf('WeakMap');
    }
    if (isWeakSet(obj)) {
        return weakCollectionOf('WeakSet');
    }
    if (isWeakRef(obj)) {
        return weakCollectionOf('WeakRef');
    }
    if (isNumber(obj)) {
        return markBoxed(inspect(Number(obj)));
    }
    if (isBigInt(obj)) {
        return markBoxed(inspect(bigIntValueOf.call(obj)));
    }
    if (isBoolean(obj)) {
        return markBoxed(booleanValueOf.call(obj));
    }
    if (isString(obj)) {
        return markBoxed(inspect(String(obj)));
    }
    if (!isDate(obj) && !isRegExp(obj)) {
        var ys = arrObjKeys(obj, inspect);
        var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
        var protoTag = obj instanceof Object ? '' : 'null prototype';
        var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr$4(obj), 8, -1) : protoTag ? 'Object' : '';
        var constructorTag = isPlainObject || typeof obj.constructor !== 'function' ? '' : obj.constructor.name ? obj.constructor.name + ' ' : '';
        var tag = constructorTag + (stringTag || protoTag ? '[' + $join.call($concat$1.call([], stringTag || [], protoTag || []), ': ') + '] ' : '');
        if (ys.length === 0) { return tag + '{}'; }
        if (indent) {
            return tag + '{' + indentedJoin(ys, indent) + '}';
        }
        return tag + '{ ' + $join.call(ys, ', ') + ' }';
    }
    return String(obj);
};

function wrapQuotes(s, defaultStyle, opts) {
    var quoteChar = (opts.quoteStyle || defaultStyle) === 'double' ? '"' : "'";
    return quoteChar + s + quoteChar;
}

function quote(s) {
    return $replace$1.call(String(s), /"/g, '&quot;');
}

function isArray$1(obj) { return toStr$4(obj) === '[object Array]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isDate(obj) { return toStr$4(obj) === '[object Date]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isRegExp(obj) { return toStr$4(obj) === '[object RegExp]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isError(obj) { return toStr$4(obj) === '[object Error]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isString(obj) { return toStr$4(obj) === '[object String]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isNumber(obj) { return toStr$4(obj) === '[object Number]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isBoolean(obj) { return toStr$4(obj) === '[object Boolean]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }

// Symbol and BigInt do have Symbol.toStringTag by spec, so that can't be used to eliminate false positives
function isSymbol(obj) {
    if (hasShammedSymbols) {
        return obj && typeof obj === 'object' && obj instanceof Symbol;
    }
    if (typeof obj === 'symbol') {
        return true;
    }
    if (!obj || typeof obj !== 'object' || !symToString) {
        return false;
    }
    try {
        symToString.call(obj);
        return true;
    } catch (e) {}
    return false;
}

function isBigInt(obj) {
    if (!obj || typeof obj !== 'object' || !bigIntValueOf) {
        return false;
    }
    try {
        bigIntValueOf.call(obj);
        return true;
    } catch (e) {}
    return false;
}

var hasOwn = Object.prototype.hasOwnProperty || function (key) { return key in this; };
function has$1(obj, key) {
    return hasOwn.call(obj, key);
}

function toStr$4(obj) {
    return objectToString.call(obj);
}

function nameOf(f) {
    if (f.name) { return f.name; }
    var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
    if (m) { return m[1]; }
    return null;
}

function indexOf(xs, x) {
    if (xs.indexOf) { return xs.indexOf(x); }
    for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) { return i; }
    }
    return -1;
}

function isMap(x) {
    if (!mapSize || !x || typeof x !== 'object') {
        return false;
    }
    try {
        mapSize.call(x);
        try {
            setSize.call(x);
        } catch (s) {
            return true;
        }
        return x instanceof Map; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakMap(x) {
    if (!weakMapHas || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakMapHas.call(x, weakMapHas);
        try {
            weakSetHas.call(x, weakSetHas);
        } catch (s) {
            return true;
        }
        return x instanceof WeakMap; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakRef(x) {
    if (!weakRefDeref || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakRefDeref.call(x);
        return true;
    } catch (e) {}
    return false;
}

function isSet(x) {
    if (!setSize || !x || typeof x !== 'object') {
        return false;
    }
    try {
        setSize.call(x);
        try {
            mapSize.call(x);
        } catch (m) {
            return true;
        }
        return x instanceof Set; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakSet(x) {
    if (!weakSetHas || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakSetHas.call(x, weakSetHas);
        try {
            weakMapHas.call(x, weakMapHas);
        } catch (s) {
            return true;
        }
        return x instanceof WeakSet; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isElement(x) {
    if (!x || typeof x !== 'object') { return false; }
    if (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) {
        return true;
    }
    return typeof x.nodeName === 'string' && typeof x.getAttribute === 'function';
}

function inspectString(str, opts) {
    if (str.length > opts.maxStringLength) {
        var remaining = str.length - opts.maxStringLength;
        var trailer = '... ' + remaining + ' more character' + (remaining > 1 ? 's' : '');
        return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
    }
    // eslint-disable-next-line no-control-regex
    var s = $replace$1.call($replace$1.call(str, /(['\\])/g, '\\$1'), /[\x00-\x1f]/g, lowbyte);
    return wrapQuotes(s, 'single', opts);
}

function lowbyte(c) {
    var n = c.charCodeAt(0);
    var x = {
        8: 'b',
        9: 't',
        10: 'n',
        12: 'f',
        13: 'r'
    }[n];
    if (x) { return '\\' + x; }
    return '\\x' + (n < 0x10 ? '0' : '') + $toUpperCase.call(n.toString(16));
}

function markBoxed(str) {
    return 'Object(' + str + ')';
}

function weakCollectionOf(type) {
    return type + ' { ? }';
}

function collectionOf(type, size, entries, indent) {
    var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ', ');
    return type + ' (' + size + ') {' + joinedEntries + '}';
}

function singleLineValues(xs) {
    for (var i = 0; i < xs.length; i++) {
        if (indexOf(xs[i], '\n') >= 0) {
            return false;
        }
    }
    return true;
}

function getIndent(opts, depth) {
    var baseIndent;
    if (opts.indent === '\t') {
        baseIndent = '\t';
    } else if (typeof opts.indent === 'number' && opts.indent > 0) {
        baseIndent = $join.call(Array(opts.indent + 1), ' ');
    } else {
        return null;
    }
    return {
        base: baseIndent,
        prev: $join.call(Array(depth + 1), baseIndent)
    };
}

function indentedJoin(xs, indent) {
    if (xs.length === 0) { return ''; }
    var lineJoiner = '\n' + indent.prev + indent.base;
    return lineJoiner + $join.call(xs, ',' + lineJoiner) + '\n' + indent.prev;
}

function arrObjKeys(obj, inspect) {
    var isArr = isArray$1(obj);
    var xs = [];
    if (isArr) {
        xs.length = obj.length;
        for (var i = 0; i < obj.length; i++) {
            xs[i] = has$1(obj, i) ? inspect(obj[i], obj) : '';
        }
    }
    var syms = typeof gOPS === 'function' ? gOPS(obj) : [];
    var symMap;
    if (hasShammedSymbols) {
        symMap = {};
        for (var k = 0; k < syms.length; k++) {
            symMap['$' + syms[k]] = syms[k];
        }
    }

    for (var key in obj) { // eslint-disable-line no-restricted-syntax
        if (!has$1(obj, key)) { continue; } // eslint-disable-line no-restricted-syntax, no-continue
        if (isArr && String(Number(key)) === key && key < obj.length) { continue; } // eslint-disable-line no-restricted-syntax, no-continue
        if (hasShammedSymbols && symMap['$' + key] instanceof Symbol) {
            // this is to prevent shammed Symbols, which are stored as strings, from being included in the string key section
            continue; // eslint-disable-line no-restricted-syntax, no-continue
        } else if ($test.call(/[^\w$]/, key)) {
            xs.push(inspect(key, obj) + ': ' + inspect(obj[key], obj));
        } else {
            xs.push(key + ': ' + inspect(obj[key], obj));
        }
    }
    if (typeof gOPS === 'function') {
        for (var j = 0; j < syms.length; j++) {
            if (isEnumerable$1.call(obj, syms[j])) {
                xs.push('[' + inspect(syms[j]) + ']: ' + inspect(obj[syms[j]], obj));
            }
        }
    }
    return xs;
}

// https://262.ecma-international.org/6.0/#sec-ispropertykey

var IsPropertyKey = function IsPropertyKey(argument) {
	return typeof argument === 'string' || typeof argument === 'symbol';
};

var $TypeError$2 = getIntrinsic('%TypeError%');






// https://262.ecma-international.org/6.0/#sec-get-o-p

var Get = function Get(O, P) {
	// 7.3.1.1
	if (Type$1(O) !== 'Object') {
		throw new $TypeError$2('Assertion failed: Type(O) is not Object');
	}
	// 7.3.1.2
	if (!IsPropertyKey(P)) {
		throw new $TypeError$2('Assertion failed: IsPropertyKey(P) is not true, got ' + objectInspect(P));
	}
	// 7.3.1.3
	return O[P];
};

var $indexOf = callBind(getIntrinsic('String.prototype.indexOf'));

var callBound = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = getIntrinsic(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
		return callBind(intrinsic);
	}
	return intrinsic;
};

var $Array = getIntrinsic('%Array%');

// eslint-disable-next-line global-require
var toStr$5 = !$Array.isArray && callBound('Object.prototype.toString');

var IsArray = $Array.isArray || function IsArray(argument) {
	return toStr$5(argument) === '[object Array]';
};

// https://262.ecma-international.org/6.0/#sec-isarray
var IsArray$1 = IsArray;

// TODO: remove, semver-major

var GetIntrinsic = getIntrinsic;

var $TypeError$3 = getIntrinsic('%TypeError%');

var isPropertyDescriptor = function IsPropertyDescriptor(ES, Desc) {
	if (ES.Type(Desc) !== 'Object') {
		return false;
	}
	var allowed = {
		'[[Configurable]]': true,
		'[[Enumerable]]': true,
		'[[Get]]': true,
		'[[Set]]': true,
		'[[Value]]': true,
		'[[Writable]]': true
	};

	for (var key in Desc) { // eslint-disable-line no-restricted-syntax
		if (src(Desc, key) && !allowed[key]) {
			return false;
		}
	}

	if (ES.IsDataDescriptor(Desc) && ES.IsAccessorDescriptor(Desc)) {
		throw new $TypeError$3('Property Descriptors may not be both accessor and data descriptors');
	}
	return true;
};

var $defineProperty$1 = hasPropertyDescriptors_1() && getIntrinsic('%Object.defineProperty%', true);

var hasArrayLengthDefineBug = hasPropertyDescriptors_1.hasArrayLengthDefineBug();

// eslint-disable-next-line global-require
var isArray$2 = hasArrayLengthDefineBug && IsArray;



var $isEnumerable = callBound('Object.prototype.propertyIsEnumerable');

// eslint-disable-next-line max-params
var DefineOwnProperty = function DefineOwnProperty(IsDataDescriptor, SameValue, FromPropertyDescriptor, O, P, desc) {
	if (!$defineProperty$1) {
		if (!IsDataDescriptor(desc)) {
			// ES3 does not support getters/setters
			return false;
		}
		if (!desc['[[Configurable]]'] || !desc['[[Writable]]']) {
			return false;
		}

		// fallback for ES3
		if (P in O && $isEnumerable(O, P) !== !!desc['[[Enumerable]]']) {
			// a non-enumerable existing property
			return false;
		}

		// property does not exist at all, or exists but is enumerable
		var V = desc['[[Value]]'];
		// eslint-disable-next-line no-param-reassign
		O[P] = V; // will use [[Define]]
		return SameValue(O[P], V);
	}
	if (
		hasArrayLengthDefineBug
		&& P === 'length'
		&& '[[Value]]' in desc
		&& isArray$2(O)
		&& O.length !== desc['[[Value]]']
	) {
		// eslint-disable-next-line no-param-reassign
		O.length = desc['[[Value]]'];
		return O.length === desc['[[Value]]'];
	}

	$defineProperty$1(O, P, FromPropertyDescriptor(desc));
	return true;
};

// https://262.ecma-international.org/13.0/#sec-match-records

var isMatchRecord = function isMatchRecord(record) {
	return (
		src(record, '[[StartIndex]]')
        && src(record, '[[EndIndex]]')
        && record['[[StartIndex]]'] >= 0
        && record['[[EndIndex]]'] >= record['[[StartIndex]]']
        && String(parseInt(record['[[StartIndex]]'], 10)) === String(record['[[StartIndex]]'])
        && String(parseInt(record['[[EndIndex]]'], 10)) === String(record['[[EndIndex]]'])
	);
};

var $TypeError$4 = getIntrinsic('%TypeError%');
var $SyntaxError$2 = getIntrinsic('%SyntaxError%');





var predicates = {
	// https://262.ecma-international.org/6.0/#sec-property-descriptor-specification-type
	'Property Descriptor': function isPropertyDescriptor(Desc) {
		var allowed = {
			'[[Configurable]]': true,
			'[[Enumerable]]': true,
			'[[Get]]': true,
			'[[Set]]': true,
			'[[Value]]': true,
			'[[Writable]]': true
		};

		if (!Desc) {
			return false;
		}
		for (var key in Desc) { // eslint-disable-line
			if (src(Desc, key) && !allowed[key]) {
				return false;
			}
		}

		var isData = src(Desc, '[[Value]]');
		var IsAccessor = src(Desc, '[[Get]]') || src(Desc, '[[Set]]');
		if (isData && IsAccessor) {
			throw new $TypeError$4('Property Descriptors may not be both accessor and data descriptors');
		}
		return true;
	},
	// https://262.ecma-international.org/13.0/#sec-match-records
	'Match Record': isMatchRecord,
	'Iterator Record': function isIteratorRecord(value) {
		return src(value, '[[Iterator]]') && src(value, '[[NextMethod]]') && src(value, '[[Done]]');
	},
	'PromiseCapability Record': function isPromiseCapabilityRecord(value) {
		return !!value
			&& src(value, '[[Resolve]]')
			&& typeof value['[[Resolve]]'] === 'function'
			&& src(value, '[[Reject]]')
			&& typeof value['[[Reject]]'] === 'function'
			&& src(value, '[[Promise]]')
			&& value['[[Promise]]']
			&& typeof value['[[Promise]]'].then === 'function';
	},
	'AsyncGeneratorRequest Record': function isAsyncGeneratorRequestRecord(value) {
		return !!value
			&& src(value, '[[Completion]]') // TODO: confirm is a completion record
			&& src(value, '[[Capability]]')
			&& predicates['PromiseCapability Record'](value['[[Capability]]']);
	}
};

var assertRecord = function assertRecord(Type, recordType, argumentName, value) {
	var predicate = predicates[recordType];
	if (typeof predicate !== 'function') {
		throw new $SyntaxError$2('unknown record type: ' + recordType);
	}
	if (Type(value) !== 'Object' || !predicate(value)) {
		throw new $TypeError$4(argumentName + ' must be a ' + recordType);
	}
};

var fromPropertyDescriptor = function fromPropertyDescriptor(Desc) {
	if (typeof Desc === 'undefined') {
		return Desc;
	}
	var obj = {};
	if ('[[Value]]' in Desc) {
		obj.value = Desc['[[Value]]'];
	}
	if ('[[Writable]]' in Desc) {
		obj.writable = !!Desc['[[Writable]]'];
	}
	if ('[[Get]]' in Desc) {
		obj.get = Desc['[[Get]]'];
	}
	if ('[[Set]]' in Desc) {
		obj.set = Desc['[[Set]]'];
	}
	if ('[[Enumerable]]' in Desc) {
		obj.enumerable = !!Desc['[[Enumerable]]'];
	}
	if ('[[Configurable]]' in Desc) {
		obj.configurable = !!Desc['[[Configurable]]'];
	}
	return obj;
};

// https://262.ecma-international.org/6.0/#sec-frompropertydescriptor

var FromPropertyDescriptor = function FromPropertyDescriptor(Desc) {
	if (typeof Desc !== 'undefined') {
		assertRecord(Type$1, 'Property Descriptor', 'Desc', Desc);
	}

	return fromPropertyDescriptor(Desc);
};

// https://262.ecma-international.org/5.1/#sec-8.10.1

var IsAccessorDescriptor = function IsAccessorDescriptor(Desc) {
	if (typeof Desc === 'undefined') {
		return false;
	}

	assertRecord(Type$1, 'Property Descriptor', 'Desc', Desc);

	if (!src(Desc, '[[Get]]') && !src(Desc, '[[Set]]')) {
		return false;
	}

	return true;
};

// https://262.ecma-international.org/5.1/#sec-8.10.2

var IsDataDescriptor = function IsDataDescriptor(Desc) {
	if (typeof Desc === 'undefined') {
		return false;
	}

	assertRecord(Type$1, 'Property Descriptor', 'Desc', Desc);

	if (!src(Desc, '[[Value]]') && !src(Desc, '[[Writable]]')) {
		return false;
	}

	return true;
};

// http://262.ecma-international.org/5.1/#sec-9.12

var SameValue = function SameValue(x, y) {
	if (x === y) { // 0 === -0, but they are not identical.
		if (x === 0) { return 1 / x === 1 / y; }
		return true;
	}
	return _isNaN(x) && _isNaN(y);
};

// http://262.ecma-international.org/5.1/#sec-9.2

var ToBoolean = function ToBoolean(value) { return !!value; };

var fnToStr = Function.prototype.toString;
var reflectApply = typeof Reflect === 'object' && Reflect !== null && Reflect.apply;
var badArrayLike;
var isCallableMarker;
if (typeof reflectApply === 'function' && typeof Object.defineProperty === 'function') {
	try {
		badArrayLike = Object.defineProperty({}, 'length', {
			get: function () {
				throw isCallableMarker;
			}
		});
		isCallableMarker = {};
		// eslint-disable-next-line no-throw-literal
		reflectApply(function () { throw 42; }, null, badArrayLike);
	} catch (_) {
		if (_ !== isCallableMarker) {
			reflectApply = null;
		}
	}
} else {
	reflectApply = null;
}

var constructorRegex = /^\s*class\b/;
var isES6ClassFn = function isES6ClassFunction(value) {
	try {
		var fnStr = fnToStr.call(value);
		return constructorRegex.test(fnStr);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionToStr(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr$6 = Object.prototype.toString;
var objectClass = '[object Object]';
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var ddaClass = '[object HTMLAllCollection]'; // IE 11
var ddaClass2 = '[object HTML document.all class]';
var ddaClass3 = '[object HTMLCollection]'; // IE 9-10
var hasToStringTag = typeof Symbol === 'function' && !!Symbol.toStringTag; // better: use `has-tostringtag`

var isIE68 = !(0 in [,]); // eslint-disable-line no-sparse-arrays, comma-spacing

var isDDA = function isDocumentDotAll() { return false; };
if (typeof document === 'object') {
	// Firefox 3 canonicalizes DDA to undefined when it's not accessed directly
	var all = document.all;
	if (toStr$6.call(all) === toStr$6.call(document.all)) {
		isDDA = function isDocumentDotAll(value) {
			/* globals document: false */
			// in IE 6-8, typeof document.all is "object" and it's truthy
			if ((isIE68 || !value) && (typeof value === 'undefined' || typeof value === 'object')) {
				try {
					var str = toStr$6.call(value);
					return (
						str === ddaClass
						|| str === ddaClass2
						|| str === ddaClass3 // opera 12.16
						|| str === objectClass // IE 6-8
					) && value('') == null; // eslint-disable-line eqeqeq
				} catch (e) { /**/ }
			}
			return false;
		};
	}
}

var isCallable = reflectApply
	? function isCallable(value) {
		if (isDDA(value)) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		try {
			reflectApply(value, null, badArrayLike);
		} catch (e) {
			if (e !== isCallableMarker) { return false; }
		}
		return !isES6ClassFn(value) && tryFunctionObject(value);
	}
	: function isCallable(value) {
		if (isDDA(value)) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		if (hasToStringTag) { return tryFunctionObject(value); }
		if (isES6ClassFn(value)) { return false; }
		var strClass = toStr$6.call(value);
		if (strClass !== fnClass && strClass !== genClass && !(/^\[object HTML/).test(strClass)) { return false; }
		return tryFunctionObject(value);
	};

// http://262.ecma-international.org/5.1/#sec-9.11

var IsCallable = isCallable;

var $TypeError$5 = getIntrinsic('%TypeError%');





// https://262.ecma-international.org/5.1/#sec-8.10.5

var ToPropertyDescriptor = function ToPropertyDescriptor(Obj) {
	if (Type$1(Obj) !== 'Object') {
		throw new $TypeError$5('ToPropertyDescriptor requires an object');
	}

	var desc = {};
	if (src(Obj, 'enumerable')) {
		desc['[[Enumerable]]'] = ToBoolean(Obj.enumerable);
	}
	if (src(Obj, 'configurable')) {
		desc['[[Configurable]]'] = ToBoolean(Obj.configurable);
	}
	if (src(Obj, 'value')) {
		desc['[[Value]]'] = Obj.value;
	}
	if (src(Obj, 'writable')) {
		desc['[[Writable]]'] = ToBoolean(Obj.writable);
	}
	if (src(Obj, 'get')) {
		var getter = Obj.get;
		if (typeof getter !== 'undefined' && !IsCallable(getter)) {
			throw new $TypeError$5('getter must be a function');
		}
		desc['[[Get]]'] = getter;
	}
	if (src(Obj, 'set')) {
		var setter = Obj.set;
		if (typeof setter !== 'undefined' && !IsCallable(setter)) {
			throw new $TypeError$5('setter must be a function');
		}
		desc['[[Set]]'] = setter;
	}

	if ((src(desc, '[[Get]]') || src(desc, '[[Set]]')) && (src(desc, '[[Value]]') || src(desc, '[[Writable]]'))) {
		throw new $TypeError$5('Invalid property descriptor. Cannot both specify accessors and a value or writable attribute');
	}
	return desc;
};

var $TypeError$6 = getIntrinsic('%TypeError%');












// https://262.ecma-international.org/6.0/#sec-definepropertyorthrow

var DefinePropertyOrThrow = function DefinePropertyOrThrow(O, P, desc) {
	if (Type$1(O) !== 'Object') {
		throw new $TypeError$6('Assertion failed: Type(O) is not Object');
	}

	if (!IsPropertyKey(P)) {
		throw new $TypeError$6('Assertion failed: IsPropertyKey(P) is not true');
	}

	var Desc = isPropertyDescriptor({
		Type: Type$1,
		IsDataDescriptor: IsDataDescriptor,
		IsAccessorDescriptor: IsAccessorDescriptor
	}, desc) ? desc : ToPropertyDescriptor(desc);
	if (!isPropertyDescriptor({
		Type: Type$1,
		IsDataDescriptor: IsDataDescriptor,
		IsAccessorDescriptor: IsAccessorDescriptor
	}, Desc)) {
		throw new $TypeError$6('Assertion failed: Desc is not a valid Property Descriptor');
	}

	return DefineOwnProperty(
		IsDataDescriptor,
		SameValue,
		FromPropertyDescriptor,
		O,
		P,
		Desc
	);
};

var IsConstructor = createCommonjsModule(function (module) {



var $construct = GetIntrinsic('%Reflect.construct%', true);

var DefinePropertyOrThrow$1 = DefinePropertyOrThrow;
try {
	DefinePropertyOrThrow$1({}, '', { '[[Get]]': function () {} });
} catch (e) {
	// Accessor properties aren't supported
	DefinePropertyOrThrow$1 = null;
}

// https://262.ecma-international.org/6.0/#sec-isconstructor

if (DefinePropertyOrThrow$1 && $construct) {
	var isConstructorMarker = {};
	var badArrayLike = {};
	DefinePropertyOrThrow$1(badArrayLike, 'length', {
		'[[Get]]': function () {
			throw isConstructorMarker;
		},
		'[[Enumerable]]': true
	});

	module.exports = function IsConstructor(argument) {
		try {
			// `Reflect.construct` invokes `IsConstructor(target)` before `Get(args, 'length')`:
			$construct(argument, badArrayLike);
		} catch (err) {
			return err === isConstructorMarker;
		}
	};
} else {
	module.exports = function IsConstructor(argument) {
		// unfortunately there's no way to truly check this without try/catch `new argument` in old environments
		return typeof argument === 'function' && !!argument.prototype;
	};
}
});

var $species = getIntrinsic('%Symbol.species%', true);
var $TypeError$7 = getIntrinsic('%TypeError%');








// https://262.ecma-international.org/12.0/#sec-arrayspeciescreate

var ArraySpeciesCreate = function ArraySpeciesCreate(originalArray, length) {
	if (!IsIntegralNumber(length) || length < 0) {
		throw new $TypeError$7('Assertion failed: length must be an integer >= 0');
	}

	var isArray = IsArray$1(originalArray);
	if (!isArray) {
		return ArrayCreate(length);
	}

	var C = Get(originalArray, 'constructor');
	// TODO: figure out how to make a cross-realm normal Array, a same-realm Array
	// if (IsConstructor(C)) {
	// 	if C is another realm's Array, C = undefined
	// 	Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(Array))) === null ?
	// }
	if ($species && Type$1(C) === 'Object') {
		C = Get(C, $species);
		if (C === null) {
			C = void 0;
		}
	}

	if (typeof C === 'undefined') {
		return ArrayCreate(length);
	}
	if (!IsConstructor(C)) {
		throw new $TypeError$7('C must be a constructor');
	}
	return new C(length); // Construct(C, length);
};

var $Math = getIntrinsic('%Math%');
var $Number = getIntrinsic('%Number%');

var maxSafeInteger = $Number.MAX_SAFE_INTEGER || $Math.pow(2, 53) - 1;

var $TypeError$8 = getIntrinsic('%TypeError%');



var $apply = getIntrinsic('%Reflect.apply%', true) || callBound('Function.prototype.apply');

// https://262.ecma-international.org/6.0/#sec-call

var Call = function Call(F, V) {
	var argumentsList = arguments.length > 2 ? arguments[2] : [];
	if (!IsArray$1(argumentsList)) {
		throw new $TypeError$8('Assertion failed: optional `argumentsList`, if provided, must be a List');
	}
	return $apply(F, V, argumentsList);
};

var $gOPD$1 = getIntrinsic('%Object.getOwnPropertyDescriptor%', true);

if ($gOPD$1) {
	try {
		$gOPD$1([], 'length');
	} catch (e) {
		// IE 8 has a broken gOPD
		$gOPD$1 = null;
	}
}

var gopd = $gOPD$1;

var isPrimitive = function isPrimitive(value) {
	return value === null || (typeof value !== 'function' && typeof value !== 'object');
};

var $preventExtensions = getIntrinsic('%Object.preventExtensions%', true);
var $isExtensible = getIntrinsic('%Object.isExtensible%', true);



// https://262.ecma-international.org/6.0/#sec-isextensible-o

var IsExtensible = $preventExtensions
	? function IsExtensible(obj) {
		return !isPrimitive(obj) && $isExtensible(obj);
	}
	: function IsExtensible(obj) {
		return !isPrimitive(obj);
	};

var isFullyPopulatedPropertyDescriptor = function isFullyPopulatedPropertyDescriptor(ES, Desc) {
	return !!Desc
		&& typeof Desc === 'object'
		&& '[[Enumerable]]' in Desc
		&& '[[Configurable]]' in Desc
		&& (ES.IsAccessorDescriptor(Desc) || ES.IsDataDescriptor(Desc));
};

// https://262.ecma-international.org/6.0/#sec-isgenericdescriptor

var IsGenericDescriptor = function IsGenericDescriptor(Desc) {
	if (typeof Desc === 'undefined') {
		return false;
	}

	assertRecord(Type$1, 'Property Descriptor', 'Desc', Desc);

	if (!IsAccessorDescriptor(Desc) && !IsDataDescriptor(Desc)) {
		return true;
	}

	return false;
};

var $TypeError$9 = getIntrinsic('%TypeError%');













// https://262.ecma-international.org/13.0/#sec-validateandapplypropertydescriptor

// see https://github.com/tc39/ecma262/pull/2468 for ES2022 changes

// eslint-disable-next-line max-lines-per-function, max-statements, max-params
var ValidateAndApplyPropertyDescriptor = function ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current) {
	var oType = Type$1(O);
	if (oType !== 'Undefined' && oType !== 'Object') {
		throw new $TypeError$9('Assertion failed: O must be undefined or an Object');
	}
	if (!IsPropertyKey(P)) {
		throw new $TypeError$9('Assertion failed: P must be a Property Key');
	}
	if (Type$1(extensible) !== 'Boolean') {
		throw new $TypeError$9('Assertion failed: extensible must be a Boolean');
	}
	if (!isPropertyDescriptor({
		Type: Type$1,
		IsDataDescriptor: IsDataDescriptor,
		IsAccessorDescriptor: IsAccessorDescriptor
	}, Desc)) {
		throw new $TypeError$9('Assertion failed: Desc must be a Property Descriptor');
	}
	if (Type$1(current) !== 'Undefined' && !isPropertyDescriptor({
		Type: Type$1,
		IsDataDescriptor: IsDataDescriptor,
		IsAccessorDescriptor: IsAccessorDescriptor
	}, current)) {
		throw new $TypeError$9('Assertion failed: current must be a Property Descriptor, or undefined');
	}

	if (Type$1(current) === 'Undefined') { // step 2
		if (!extensible) {
			return false; // step 2.a
		}
		if (oType === 'Undefined') {
			return true; // step 2.b
		}
		if (IsAccessorDescriptor(Desc)) { // step 2.c
			return DefineOwnProperty(
				IsDataDescriptor,
				SameValue,
				FromPropertyDescriptor,
				O,
				P,
				Desc
			);
		}
		// step 2.d
		return DefineOwnProperty(
			IsDataDescriptor,
			SameValue,
			FromPropertyDescriptor,
			O,
			P,
			{
				'[[Configurable]]': !!Desc['[[Configurable]]'],
				'[[Enumerable]]': !!Desc['[[Enumerable]]'],
				'[[Value]]': Desc['[[Value]]'],
				'[[Writable]]': !!Desc['[[Writable]]']
			}
		);
	}

	// 3. Assert: current is a fully populated Property Descriptor.
	if (!isFullyPopulatedPropertyDescriptor({
		IsAccessorDescriptor: IsAccessorDescriptor,
		IsDataDescriptor: IsDataDescriptor
	}, current)) {
		throw new $TypeError$9('`current`, when present, must be a fully populated and valid Property Descriptor');
	}

	// 4. If every field in Desc is absent, return true.
	// this can't really match the assertion that it's a Property Descriptor in our JS implementation

	// 5. If current.[[Configurable]] is false, then
	if (!current['[[Configurable]]']) {
		if ('[[Configurable]]' in Desc && Desc['[[Configurable]]']) {
			// step 5.a
			return false;
		}
		if ('[[Enumerable]]' in Desc && !SameValue(Desc['[[Enumerable]]'], current['[[Enumerable]]'])) {
			// step 5.b
			return false;
		}
		if (!IsGenericDescriptor(Desc) && !SameValue(IsAccessorDescriptor(Desc), IsAccessorDescriptor(current))) {
			// step 5.c
			return false;
		}
		if (IsAccessorDescriptor(current)) { // step 5.d
			if ('[[Get]]' in Desc && !SameValue(Desc['[[Get]]'], current['[[Get]]'])) {
				return false;
			}
			if ('[[Set]]' in Desc && !SameValue(Desc['[[Set]]'], current['[[Set]]'])) {
				return false;
			}
		} else if (!current['[[Writable]]']) { // step 5.e
			if ('[[Writable]]' in Desc && Desc['[[Writable]]']) {
				return false;
			}
			if ('[[Value]]' in Desc && !SameValue(Desc['[[Value]]'], current['[[Value]]'])) {
				return false;
			}
		}
	}

	// 6. If O is not undefined, then
	if (oType !== 'Undefined') {
		var configurable;
		var enumerable;
		if (IsDataDescriptor(current) && IsAccessorDescriptor(Desc)) { // step 6.a
			configurable = ('[[Configurable]]' in Desc ? Desc : current)['[[Configurable]]'];
			enumerable = ('[[Enumerable]]' in Desc ? Desc : current)['[[Enumerable]]'];
			// Replace the property named P of object O with an accessor property having [[Configurable]] and [[Enumerable]] attributes as described by current and each other attribute set to its default value.
			return DefineOwnProperty(
				IsDataDescriptor,
				SameValue,
				FromPropertyDescriptor,
				O,
				P,
				{
					'[[Configurable]]': !!configurable,
					'[[Enumerable]]': !!enumerable,
					'[[Get]]': ('[[Get]]' in Desc ? Desc : current)['[[Get]]'],
					'[[Set]]': ('[[Set]]' in Desc ? Desc : current)['[[Set]]']
				}
			);
		} else if (IsAccessorDescriptor(current) && IsDataDescriptor(Desc)) {
			configurable = ('[[Configurable]]' in Desc ? Desc : current)['[[Configurable]]'];
			enumerable = ('[[Enumerable]]' in Desc ? Desc : current)['[[Enumerable]]'];
			// i. Replace the property named P of object O with a data property having [[Configurable]] and [[Enumerable]] attributes as described by current and each other attribute set to its default value.
			return DefineOwnProperty(
				IsDataDescriptor,
				SameValue,
				FromPropertyDescriptor,
				O,
				P,
				{
					'[[Configurable]]': !!configurable,
					'[[Enumerable]]': !!enumerable,
					'[[Value]]': ('[[Value]]' in Desc ? Desc : current)['[[Value]]'],
					'[[Writable]]': !!('[[Writable]]' in Desc ? Desc : current)['[[Writable]]']
				}
			);
		}

		// For each field of Desc that is present, set the corresponding attribute of the property named P of object O to the value of the field.
		return DefineOwnProperty(
			IsDataDescriptor,
			SameValue,
			FromPropertyDescriptor,
			O,
			P,
			Desc
		);
	}

	return true; // step 7
};

var $SyntaxError$3 = getIntrinsic('%SyntaxError%');
var $TypeError$a = getIntrinsic('%TypeError%');












// https://262.ecma-international.org/6.0/#sec-ordinarydefineownproperty

var OrdinaryDefineOwnProperty = function OrdinaryDefineOwnProperty(O, P, Desc) {
	if (Type$1(O) !== 'Object') {
		throw new $TypeError$a('Assertion failed: O must be an Object');
	}
	if (!IsPropertyKey(P)) {
		throw new $TypeError$a('Assertion failed: P must be a Property Key');
	}
	if (!isPropertyDescriptor({
		Type: Type$1,
		IsDataDescriptor: IsDataDescriptor,
		IsAccessorDescriptor: IsAccessorDescriptor
	}, Desc)) {
		throw new $TypeError$a('Assertion failed: Desc must be a Property Descriptor');
	}
	if (!gopd) {
		// ES3/IE 8 fallback
		if (IsAccessorDescriptor(Desc)) {
			throw new $SyntaxError$3('This environment does not support accessor property descriptors.');
		}
		var creatingNormalDataProperty = !(P in O)
			&& Desc['[[Writable]]']
			&& Desc['[[Enumerable]]']
			&& Desc['[[Configurable]]']
			&& '[[Value]]' in Desc;
		var settingExistingDataProperty = (P in O)
			&& (!('[[Configurable]]' in Desc) || Desc['[[Configurable]]'])
			&& (!('[[Enumerable]]' in Desc) || Desc['[[Enumerable]]'])
			&& (!('[[Writable]]' in Desc) || Desc['[[Writable]]'])
			&& '[[Value]]' in Desc;
		if (creatingNormalDataProperty || settingExistingDataProperty) {
			O[P] = Desc['[[Value]]']; // eslint-disable-line no-param-reassign
			return SameValue(O[P], Desc['[[Value]]']);
		}
		throw new $SyntaxError$3('This environment does not support defining non-writable, non-enumerable, or non-configurable properties');
	}
	var desc = gopd(O, P);
	var current = desc && ToPropertyDescriptor(desc);
	var extensible = IsExtensible(O);
	return ValidateAndApplyPropertyDescriptor(O, P, extensible, Desc, current);
};

var $TypeError$b = getIntrinsic('%TypeError%');





// https://262.ecma-international.org/6.0/#sec-createdataproperty

var CreateDataProperty = function CreateDataProperty(O, P, V) {
	if (Type$1(O) !== 'Object') {
		throw new $TypeError$b('Assertion failed: Type(O) is not Object');
	}
	if (!IsPropertyKey(P)) {
		throw new $TypeError$b('Assertion failed: IsPropertyKey(P) is not true');
	}
	var newDesc = {
		'[[Configurable]]': true,
		'[[Enumerable]]': true,
		'[[Value]]': V,
		'[[Writable]]': true
	};
	return OrdinaryDefineOwnProperty(O, P, newDesc);
};

var $TypeError$c = getIntrinsic('%TypeError%');





// // https://262.ecma-international.org/6.0/#sec-createdatapropertyorthrow

var CreateDataPropertyOrThrow = function CreateDataPropertyOrThrow(O, P, V) {
	if (Type$1(O) !== 'Object') {
		throw new $TypeError$c('Assertion failed: Type(O) is not Object');
	}
	if (!IsPropertyKey(P)) {
		throw new $TypeError$c('Assertion failed: IsPropertyKey(P) is not true');
	}
	var success = CreateDataProperty(O, P, V);
	if (!success) {
		throw new $TypeError$c('unable to create data property');
	}
	return success;
};

var $TypeError$d = getIntrinsic('%TypeError%');




// https://262.ecma-international.org/6.0/#sec-hasproperty

var HasProperty = function HasProperty(O, P) {
	if (Type$1(O) !== 'Object') {
		throw new $TypeError$d('Assertion failed: `O` must be an Object');
	}
	if (!IsPropertyKey(P)) {
		throw new $TypeError$d('Assertion failed: `P` must be a Property Key');
	}
	return P in O;
};

var isPrimitive$1 = function isPrimitive(value) {
	return value === null || (typeof value !== 'function' && typeof value !== 'object');
};

var shams$1 = function hasToStringTagShams() {
	return shams() && !!Symbol.toStringTag;
};

var getDay = Date.prototype.getDay;
var tryDateObject = function tryDateGetDayCall(value) {
	try {
		getDay.call(value);
		return true;
	} catch (e) {
		return false;
	}
};

var toStr$7 = Object.prototype.toString;
var dateClass = '[object Date]';
var hasToStringTag$1 = shams$1();

var isDateObject = function isDateObject(value) {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	return hasToStringTag$1 ? tryDateObject(value) : toStr$7.call(value) === dateClass;
};

var isSymbol$1 = createCommonjsModule(function (module) {

var toStr = Object.prototype.toString;
var hasSymbols$1 = hasSymbols();

if (hasSymbols$1) {
	var symToStr = Symbol.prototype.toString;
	var symStringRegex = /^Symbol\(.*\)$/;
	var isSymbolObject = function isRealSymbolObject(value) {
		if (typeof value.valueOf() !== 'symbol') {
			return false;
		}
		return symStringRegex.test(symToStr.call(value));
	};

	module.exports = function isSymbol(value) {
		if (typeof value === 'symbol') {
			return true;
		}
		if (toStr.call(value) !== '[object Symbol]') {
			return false;
		}
		try {
			return isSymbolObject(value);
		} catch (e) {
			return false;
		}
	};
} else {

	module.exports = function isSymbol(value) {
		// this environment does not support Symbols.
		return false ;
	};
}
});

var hasSymbols$3 = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';






var ordinaryToPrimitive = function OrdinaryToPrimitive(O, hint) {
	if (typeof O === 'undefined' || O === null) {
		throw new TypeError('Cannot call method on ' + O);
	}
	if (typeof hint !== 'string' || (hint !== 'number' && hint !== 'string')) {
		throw new TypeError('hint must be "string" or "number"');
	}
	var methodNames = hint === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
	var method, result, i;
	for (i = 0; i < methodNames.length; ++i) {
		method = O[methodNames[i]];
		if (isCallable(method)) {
			result = method.call(O);
			if (isPrimitive$1(result)) {
				return result;
			}
		}
	}
	throw new TypeError('No default value');
};

var GetMethod = function GetMethod(O, P) {
	var func = O[P];
	if (func !== null && typeof func !== 'undefined') {
		if (!isCallable(func)) {
			throw new TypeError(func + ' returned for property ' + P + ' of object ' + O + ' is not a function');
		}
		return func;
	}
	return void 0;
};

// http://www.ecma-international.org/ecma-262/6.0/#sec-toprimitive
var es2015 = function ToPrimitive(input) {
	if (isPrimitive$1(input)) {
		return input;
	}
	var hint = 'default';
	if (arguments.length > 1) {
		if (arguments[1] === String) {
			hint = 'string';
		} else if (arguments[1] === Number) {
			hint = 'number';
		}
	}

	var exoticToPrim;
	if (hasSymbols$3) {
		if (Symbol.toPrimitive) {
			exoticToPrim = GetMethod(input, Symbol.toPrimitive);
		} else if (isSymbol$1(input)) {
			exoticToPrim = Symbol.prototype.valueOf;
		}
	}
	if (typeof exoticToPrim !== 'undefined') {
		var result = exoticToPrim.call(input, hint);
		if (isPrimitive$1(result)) {
			return result;
		}
		throw new TypeError('unable to convert exotic object to primitive');
	}
	if (hint === 'default' && (isDateObject(input) || isSymbol$1(input))) {
		hint = 'string';
	}
	return ordinaryToPrimitive(input, hint === 'default' ? 'number' : hint);
};

// https://262.ecma-international.org/6.0/#sec-toprimitive

var ToPrimitive = function ToPrimitive(input) {
	if (arguments.length > 1) {
		return es2015(input, arguments[1]);
	}
	return es2015(input);
};

var hasToStringTag$2 = shams$1();
var has$2;
var $exec$1;
var isRegexMarker;
var badStringifier;

if (hasToStringTag$2) {
	has$2 = callBound('Object.prototype.hasOwnProperty');
	$exec$1 = callBound('RegExp.prototype.exec');
	isRegexMarker = {};

	var throwRegexMarker = function () {
		throw isRegexMarker;
	};
	badStringifier = {
		toString: throwRegexMarker,
		valueOf: throwRegexMarker
	};

	if (typeof Symbol.toPrimitive === 'symbol') {
		badStringifier[Symbol.toPrimitive] = throwRegexMarker;
	}
}

var $toString = callBound('Object.prototype.toString');
var gOPD = Object.getOwnPropertyDescriptor;
var regexClass = '[object RegExp]';

var isRegex = hasToStringTag$2
	// eslint-disable-next-line consistent-return
	? function isRegex(value) {
		if (!value || typeof value !== 'object') {
			return false;
		}

		var descriptor = gOPD(value, 'lastIndex');
		var hasLastIndexDataProperty = descriptor && has$2(descriptor, 'value');
		if (!hasLastIndexDataProperty) {
			return false;
		}

		try {
			$exec$1(value, badStringifier);
		} catch (e) {
			return e === isRegexMarker;
		}
	}
	: function isRegex(value) {
		// In older browsers, typeof regex incorrectly returns 'function'
		if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
			return false;
		}

		return $toString(value) === regexClass;
	};

var $exec$2 = callBound('RegExp.prototype.exec');
var $TypeError$e = getIntrinsic('%TypeError%');

var safeRegexTest = function regexTester(regex) {
	if (!isRegex(regex)) {
		throw new $TypeError$e('`regex` must be a RegExp');
	}
	return function test(s) {
		return $exec$2(regex, s) !== null;
	};
};

var $TypeError$f = getIntrinsic('%TypeError%');

// http://262.ecma-international.org/5.1/#sec-9.10

var CheckObjectCoercible = function CheckObjectCoercible(value, optMessage) {
	if (value == null) {
		throw new $TypeError$f(optMessage || ('Cannot call method on ' + value));
	}
	return value;
};

var RequireObjectCoercible = CheckObjectCoercible;

var $String = getIntrinsic('%String%');
var $TypeError$g = getIntrinsic('%TypeError%');

// https://262.ecma-international.org/6.0/#sec-tostring

var ToString = function ToString(argument) {
	if (typeof argument === 'symbol') {
		throw new $TypeError$g('Cannot convert a Symbol value to a string');
	}
	return $String(argument);
};

var $replace$2 = callBound('String.prototype.replace');

var mvsIsWS = (/^\s$/).test('\u180E');
/* eslint-disable no-control-regex */
var leftWhitespace = mvsIsWS
	? /^[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+/
	: /^[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+/;
var rightWhitespace = mvsIsWS
	? /[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+$/
	: /[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+$/;
/* eslint-enable no-control-regex */

var implementation$2 = function trim() {
	var S = ToString(RequireObjectCoercible(this));
	return $replace$2($replace$2(S, leftWhitespace, ''), rightWhitespace, '');
};

var zeroWidthSpace = '\u200b';
var mongolianVowelSeparator = '\u180E';

var polyfill = function getPolyfill() {
	if (
		String.prototype.trim
		&& zeroWidthSpace.trim() === zeroWidthSpace
		&& mongolianVowelSeparator.trim() === mongolianVowelSeparator
		&& ('_' + mongolianVowelSeparator).trim() === ('_' + mongolianVowelSeparator)
		&& (mongolianVowelSeparator + '_').trim() === (mongolianVowelSeparator + '_')
	) {
		return String.prototype.trim;
	}
	return implementation$2;
};

var shim = function shimStringTrim() {
	var polyfill$1 = polyfill();
	defineProperties_1(String.prototype, { trim: polyfill$1 }, {
		trim: function testTrim() {
			return String.prototype.trim !== polyfill$1;
		}
	});
	return polyfill$1;
};

var bound = callBind(polyfill());
var boundMethod = function trim(receiver) {
	RequireObjectCoercible(receiver);
	return bound(receiver);
};

defineProperties_1(boundMethod, {
	getPolyfill: polyfill,
	implementation: implementation$2,
	shim: shim
});

var string_prototype_trim = boundMethod;

var $Number$1 = getIntrinsic('%Number%');
var $RegExp = getIntrinsic('%RegExp%');
var $TypeError$h = getIntrinsic('%TypeError%');
var $parseInteger = getIntrinsic('%parseInt%');




var $strSlice$1 = callBound('String.prototype.slice');
var isBinary = safeRegexTest(/^0b[01]+$/i);
var isOctal = safeRegexTest(/^0o[0-7]+$/i);
var isInvalidHexLiteral = safeRegexTest(/^[-+]0x[0-9a-f]+$/i);
var nonWS = ['\u0085', '\u200b', '\ufffe'].join('');
var nonWSregex = new $RegExp('[' + nonWS + ']', 'g');
var hasNonWS = safeRegexTest(nonWSregex);





// https://262.ecma-international.org/13.0/#sec-stringtonumber

var StringToNumber = function StringToNumber(argument) {
	if (Type$1(argument) !== 'String') {
		throw new $TypeError$h('Assertion failed: `argument` is not a String');
	}
	if (isBinary(argument)) {
		return $Number$1($parseInteger($strSlice$1(argument, 2), 2));
	}
	if (isOctal(argument)) {
		return $Number$1($parseInteger($strSlice$1(argument, 2), 8));
	}
	if (hasNonWS(argument) || isInvalidHexLiteral(argument)) {
		return NaN;
	}
	var trimmed = string_prototype_trim(argument);
	if (trimmed !== argument) {
		return StringToNumber(trimmed);
	}
	return $Number$1(argument);
};

var $TypeError$i = getIntrinsic('%TypeError%');
var $Number$2 = getIntrinsic('%Number%');





// https://262.ecma-international.org/13.0/#sec-tonumber

var ToNumber = function ToNumber(argument) {
	var value = isPrimitive(argument) ? argument : ToPrimitive(argument, $Number$2);
	if (typeof value === 'symbol') {
		throw new $TypeError$i('Cannot convert a Symbol value to a number');
	}
	if (typeof value === 'bigint') {
		throw new $TypeError$i('Conversion from \'BigInt\' to \'number\' is not allowed.');
	}
	if (typeof value === 'string') {
		return StringToNumber(value);
	}
	return $Number$2(value);
};

var sign = function sign(number) {
	return number >= 0 ? 1 : -1;
};

// https://262.ecma-international.org/12.0/#sec-tointegerorinfinity

var ToIntegerOrInfinity = function ToIntegerOrInfinity(value) {
	var number = ToNumber(value);
	if (_isNaN(number) || number === 0) { return 0; }
	if (!_isFinite(number)) { return number; }
	var integer = floor(abs(number));
	if (integer === 0) { return 0; }
	return sign(number) * integer;
};

var ToLength = function ToLength(argument) {
	var len = ToIntegerOrInfinity(argument);
	if (len <= 0) { return 0; } // includes converting -0 to +0
	if (len > maxSafeInteger) { return maxSafeInteger; }
	return len;
};

var $TypeError$j = getIntrinsic('%TypeError%');





// https://262.ecma-international.org/11.0/#sec-lengthofarraylike

var LengthOfArrayLike = function LengthOfArrayLike(obj) {
	if (Type$1(obj) !== 'Object') {
		throw new $TypeError$j('Assertion failed: `obj` must be an Object');
	}
	return ToLength(Get(obj, 'length'));
};

var $TypeError$k = getIntrinsic('%TypeError%');











// https://262.ecma-international.org/11.0/#sec-flattenintoarray

// eslint-disable-next-line max-params
var FlattenIntoArray = function FlattenIntoArray(target, source, sourceLen, start, depth) {
	var mapperFunction;
	if (arguments.length > 5) {
		mapperFunction = arguments[5];
	}

	var targetIndex = start;
	var sourceIndex = 0;
	while (sourceIndex < sourceLen) {
		var P = ToString(sourceIndex);
		var exists = HasProperty(source, P);
		if (exists === true) {
			var element = Get(source, P);
			if (typeof mapperFunction !== 'undefined') {
				if (arguments.length <= 6) {
					throw new $TypeError$k('Assertion failed: thisArg is required when mapperFunction is provided');
				}
				element = Call(mapperFunction, arguments[6], [element, sourceIndex, source]);
			}
			var shouldFlatten = false;
			if (depth > 0) {
				shouldFlatten = IsArray$1(element);
			}
			if (shouldFlatten) {
				var elementLen = LengthOfArrayLike(element);
				targetIndex = FlattenIntoArray(target, element, elementLen, targetIndex, depth - 1);
			} else {
				if (targetIndex >= maxSafeInteger) {
					throw new $TypeError$k('index too large');
				}
				CreateDataPropertyOrThrow(target, ToString(targetIndex), element);
				targetIndex += 1;
			}
		}
		sourceIndex += 1;
	}

	return targetIndex;
};

var $Object$1 = getIntrinsic('%Object%');



// https://262.ecma-international.org/6.0/#sec-toobject

var ToObject = function ToObject(value) {
	RequireObjectCoercible(value);
	return $Object$1(value);
};

var implementation$3 = function flat() {
	var O = ToObject(this);
	var sourceLen = ToLength(Get(O, 'length'));

	var depthNum = 1;
	if (arguments.length > 0 && typeof arguments[0] !== 'undefined') {
		depthNum = ToIntegerOrInfinity(arguments[0]);
	}

	var A = ArraySpeciesCreate(O, 0);
	FlattenIntoArray(A, O, sourceLen, 0, depthNum);
	return A;
};

var polyfill$1 = function getPolyfill() {
	return Array.prototype.flat || implementation$3;
};

var hasUnscopables = typeof Symbol === 'function' && typeof Symbol.unscopables === 'symbol';

var map = hasUnscopables && Array.prototype[Symbol.unscopables];

var $TypeError$l = TypeError;

var esShimUnscopables = function shimUnscopables(method) {
	if (typeof method !== 'string' || !method) {
		throw new $TypeError$l('method must be a non-empty string');
	}
	if (!src(Array.prototype, method)) {
		throw new $TypeError$l('method must be on Array.prototype');
	}
	if (hasUnscopables) {
		map[method] = true;
	}
};

var shim$1 = function shimFlat() {
	var polyfill = polyfill$1();

	defineProperties_1(
		Array.prototype,
		{ flat: polyfill },
		{ flat: function () { return Array.prototype.flat !== polyfill; } }
	);

	esShimUnscopables('flat');

	return polyfill;
};

var polyfill$2 = polyfill$1();


var boundFlat = callBind(polyfill$2);

defineProperties_1(boundFlat, {
	getPolyfill: polyfill$1,
	implementation: implementation$3,
	shim: shim$1
});

var array_prototype_flat = boundFlat;

if (!Array.prototype.flat) array_prototype_flat.shim();

const ANSIPattern = [
  "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
  "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
].join("|");
const ANSIRegex = new RegExp(ANSIPattern, "g");

const defaults$2 = () => {
  let obj = {};

  obj.breakword = false;
  obj.input = []; // input string split by whitespace
  obj.minWidth = 2; // fallback to if width set too narrow
  obj.paddingLeft = 0;
  obj.paddingRight = 0;
  obj.errorChar = "�";
  obj.returnFormat = "string"; // or 'array'
  obj.skipPadding = false; // set to true when padding set too wide for line length
  obj.splitAt = [" ", "\t"];
  obj.trim = true;
  obj.width = 10;

  return obj
};


const calculateSpaceRemaining = function(lineLength, spacesUsed, config) {
  return Math.max(lineLength - spacesUsed - config.paddingLeft - config.paddingRight, 0)
}; // function to set starting line length


const validateInput = (text, options) => {

  // options validation
  let config = Object.assign({}, defaults$2(), options || {});

  if (config.errorChar) {
    // only allow a single errorChar
    config.errorChar = config.errorChar.split("")[0];

    // errorChar must not be wide character
    if (wcwidth_1(config.errorChar) > 1)
      throw new Error(`Error character cannot be a wide character (${config.errorChar})`)
  }

  // make sure correct sign on padding
  config.paddingLeft = Math.abs(config.paddingLeft);
  config.paddingRight = Math.abs(config.paddingRight);

  let lineLength = config.width
    - config.paddingLeft
    - config.paddingRight;

  if(lineLength < config.minWidth) {
    // skip padding if lineLength too narrow
    config.skipPadding = true;
    lineLength = config.minWidth;
  }

  // to trim or not to trim...
  if(config.trim) {
    text = text.trim();
  }

  return { text, config, lineLength }
};


const wrap = (input, options) => {

  let { text, config, lineLength } = validateInput(input, options);

  // array of characters split by whitespace and/or tabs
  let words = [];

  if(!config.breakword) {
    // break string into words
    if(config.splitAt.indexOf("\t")!==-1) {
      // split at both spaces and tabs
      words = text.split(/ |\t/i);
    } else {
      // split at whitespace
      words = text.split(" ");
    }
  } else {
    // do not break string into words
    words = [text];
  }

  // remove empty array elements
  words = words.filter(val => {
    if (val.length > 0) {
      return true
    }
  });

  // assume at least one line
  let lines = [
    []
  ];

  let spaceRemaining, splitIndex, word;
  let currentLine = 0; // index of current line in 'lines[]'
  let spacesUsed = 0; // spaces used so far on current line

  while(words.length > 0) {
    spaceRemaining = calculateSpaceRemaining(lineLength, spacesUsed, config);
    word = words.shift();
    let wordLength = wcwidth_1(word);

    switch(true) {

      // too long for an empty line and is a single character
      case(lineLength < wordLength && [...word].length === 1):
        words.unshift(config.errorChar);
        break

        // too long for an empty line, must be broken between 2 lines
      case(lineLength < wordLength):
        // break it, then re-insert its parts into words
        // so can loop back to re-handle each word
        splitIndex = main(word, lineLength);
        let splitWord = [...word];
        words.unshift(splitWord.slice(0, splitIndex + 1).join(""));
        words.splice(1, 0, splitWord.slice(splitIndex + 1).join("")); // +1 for substr fn
        break

      // not enough space remaining in line, must be wrapped to next line
      case(spaceRemaining < wordLength):
        // add a new line to our array of lines
        lines.push([]);
        // note carriage to new line in counter
        currentLine++;
        // reset the spacesUsed to 0
        spacesUsed = 0;
        /* falls through */

      // fits on current line
      // eslint-disable-next-line
      default:
        // add word to line
        lines[currentLine].push(word);
        // reduce space remaining (add a space between words)
        spacesUsed += wordLength + 1;
    }
  }

  lines = lines.map( line => {

    // restore spaces to line
    line = line.join(" ");

    // add padding to ends of line
    if(!config.skipPadding) {
      line = Array(config.paddingLeft + 1).join(" ")
        + line
        + Array(config.paddingRight + 1).join(" ");
    }

    return line
  });

  return lines.join("\n")
};


const splitAnsiInput = (text) => {
  // get start and end positions for matches
  let matches = [];
  let textArr = [...text];
  let textLength = textArr.length;

  /* eslint-disable */
  while((result = ANSIRegex.exec(text)) !== null) {
    matches.push({
      start: result.index,
      end: result.index + result[0].length,
      match: result[0],
      length: result[0].length
    });
  }
  /* eslint-enable */


  if (matches.length < 1) return [] // we have no ANSI escapes, we're done here

  // add start and end positions for non matches
  matches = matches.reduce((prev, curr) => {
    // check if space exists between this and last match
    // get end of previous match
    let prevEnd = prev[prev.length -1];

    if (prevEnd.end < curr.start) {
      // insert placeholder
      prev.push({
        start: prevEnd.end,
        end: curr.start,
        length: curr.start - prevEnd.end,
        expand: true
      }, curr);
    } else {
      prev.push(curr);
    }
    return prev
  }, [{start: 0, end: 0}])
    .splice(1); // removes starting accumulator object


  // add trailing match if necessary
  let lastMatchEnd = matches[matches.length - 1].end;
  if (lastMatchEnd < textLength) {
    matches.push({
      start: lastMatchEnd,
      end: textLength,
      expand: true
    });
  }


  let savedArr = matches.map(match => {
    let value = text.substring(match.start, match.end);
    return (match.expand) ? [...value] : [value]
  }).flat(2);

  return savedArr
};


const restoreANSI = (savedArr, processedArr) => {
  return processedArr.map((char) => {
    let result;

    if (char === "\n") {
      result = [char];
    } else {
      // add everything saved before character match
      let splicePoint = savedArr.findIndex(element => element === char ) + 1;
      result = savedArr.splice(0, splicePoint);
    }

    // add all following, consecutive closing tags in case linebreak inerted next
    const ANSIClosePattern = "^\\x1b\\[([0-9]+)*m";
    const ANSICloseRegex = new RegExp(ANSIClosePattern); // eslint-disable-line no-control-regex
    const closeCodes = ["0", "21", "22", "23", "24", "25", "27", "28", "29", "39", "49", "54", "55"];

    let match;
    while (savedArr.length && (match = savedArr[0].match(ANSICloseRegex))) {
      if (!closeCodes.includes(match[1])) break
      result.push(savedArr.shift());
    }

    return result.join("")
  }).concat(savedArr)
};


var main$1 = (input, options) => {

  // {} each existing line separately to respect existing line breaks
  const processedLines = input.toString().split("\n").map( string => {

    // save input ANSI escape codes to be restored later
    const savedANSI = splitAnsiInput(string);

    // strip ANSI
    string = stripAnsi(string);

    // add newlines to string
    string = wrap(string, options);

    // convert into array of characters
    let charArr = [...string];

    // restore input ANSI escape codes
    charArr = (savedANSI.length > 0) ? restoreANSI(savedANSI, charArr) : charArr;

    // convert array of single characters into array of lines
    let outArr  = charArr.join("").split("\n");

    return outArr
  });

  return processedLines.flat(2).join("\n")
};

var format = createCommonjsModule(function (module, exports) {
const addPadding = (config, width) => {
  return width + config.paddingLeft + config.paddingRight
};

/**
 * Returns the widest cell give a collection of rows
 *
 * @param object columnOptions
 * @param array rows
 * @param integer columnIndex
 * @returns string
 */
const getMaxLength = (columnOptions, rows, columnIndex) => {
  let iterable;

  // add header value, alias to calculate width when applicable
  if (columnOptions && (columnOptions.value || columnOptions.alias)) {
    // string we use from header
    let val = columnOptions.alias || columnOptions.value;
    val = val.toString();
    // create a row with value in the current columnIndex
    const headerRow = Array(rows[0].length);
    headerRow[columnIndex] = val;
    // add header row to new array we will check for max value width
    iterable = rows.slice();
    iterable.push(headerRow);
  } else {
    // no header value, just use rows to derive max width
    iterable = rows;
  }

  const widest = iterable.reduce((prev, row) => {
    if (row[columnIndex]) {
      // check cell value is object or scalar
      const value = (row[columnIndex].value) ? row[columnIndex].value : row[columnIndex];
      const width = Math.max(
        ...stripAnsi(value.toString()).split(/[\n\r]/).map((s) => wcwidth_1(s))
      );
      return (width > prev) ? width : prev
    }
    return prev
  }, 0);

  return widest
};

/**
 * Get total width available to this table instance
 *
 *
 */
const getAvailableWidth = config => {
  if ({} && ( ({} && {}.COLUMNS))) {
    // forked calls that do not inherit {}.stdout must use {}
    let viewport =  {}.COLUMNS;
    viewport = viewport - config.marginLeft;

    // table width percentage of (viewport less margin)
    if (config.width !== "auto" && /^\d+%$/.test(config.width)) {
      return Math.min(1, (config.width.slice(0, -1) * 0.01)) * viewport
    }

    // table width fixed
    if (config.width !== "auto" && /^\d+$/.test(config.width)) {
      config.FIXED_WIDTH = true;
      return config.width
    }

    // table width equals viewport less margin
    // @TODO deprecate and remove "auto", which was never documented so should not be
    // an issue
    return viewport
  }

  // browser
  /* istanbul ignore next */
  if (typeof window !== "undefined") return window.innerWidth // eslint-disable-line

  // {}.stdout.columns does not exist. assume redirecting to write stream
  // use 80 columns, which is VT200 standard
  return config.COLUMNS - config.marginLeft
};

module.exports.getStringLength = string => {
  // stripAnsi(string.replace(/[^\x00-\xff]/g,'XX')).length
  return wcwidth_1(stripAnsi(string))
};

module.exports.wrapCellText = (
  config,
  cellValue,
  columnIndex,
  cellOptions,
  rowType
) => {
  // ANSI chararacters that demarcate the start/end of a line
  const startAnsiRegexp = /^(\033\[[0-9;]*m)+/;
  const endAnsiRegexp = /(\033\[[0-9;]*m)+$/;

  // coerce cell value to string
  let string = cellValue.toString();

  // store matching ANSI characters
  const startMatches = string.match(startAnsiRegexp) || [""];

  // remove ANSI start-of-line chars
  string = string.replace(startAnsiRegexp, "");

  // store matching ANSI characters so can be later re-attached
  const endMatches = string.match(endAnsiRegexp) || [""];

  // remove ANSI end-of-line chars
  string = string.replace(endAnsiRegexp, "");

  let alignTgt;

  switch (rowType) {
    case ("header"):
      alignTgt = "headerAlign";
      break
    case ("body"):
      alignTgt = "align";
      break
    default:
      alignTgt = "footerAlign";
  }

  // equalize padding for centered lines
  if (cellOptions[alignTgt] === "center") {
    cellOptions.paddingLeft = cellOptions.paddingRight = Math.max(
      cellOptions.paddingRight,
      cellOptions.paddingLeft,
      0
    );
  }

  const columnWidth = config.table.columnWidths[columnIndex];

  // innerWidth is the width available for text within the cell
  const innerWidth = columnWidth
    - cellOptions.paddingLeft
    - cellOptions.paddingRight
    - config.GUTTER;

  if (typeof config.truncate === "string") {
    string = exports.truncate(string, cellOptions, innerWidth);
  } else {
    string = exports.wrap(string, cellOptions, innerWidth);
  }

  // format each line
  const cell = string.split("\n").map(line => {
    line = line.trim();

    const lineLength = exports.getStringLength(line);

    // alignment
    if (lineLength < columnWidth) {
      let emptySpace = columnWidth - lineLength;

      switch (true) {
        case (cellOptions[alignTgt] === "center"):
          emptySpace--;
          const padBoth = Math.floor(emptySpace / 2);
          const padRemainder = emptySpace % 2;
          line = Array(padBoth + 1).join(" ")
            + line
            + Array(padBoth + 1 + padRemainder).join(" ");
          break

        case (cellOptions[alignTgt] === "right"):
          line = Array(emptySpace - cellOptions.paddingRight).join(" ")
            + line
            + Array(cellOptions.paddingRight + 1).join(" ");
          break

        default:
          line = Array(cellOptions.paddingLeft + 1).join(" ")
            + line
            + Array(emptySpace - cellOptions.paddingLeft).join(" ");
      }
    }

    // put ANSI color codes BACK on the beginning and end of string
    return startMatches[0] + line + endMatches[0]
  });

  return { cell, innerWidth }
};

module.exports.truncate = (string, cellOptions, maxWidth) => {
  const stringWidth = wcwidth_1(string);

  if (maxWidth < stringWidth) {
    // @TODO give user option to decide if they want to break words on wrapping
    string = main$1(string, {
      width: maxWidth - cellOptions.truncate.length,
      breakword: true
    }).split("\n")[0];
    string = string + cellOptions.truncate;
  }

  return string
};

module.exports.wrap = (string, cellOptions, innerWidth) => {
  const outstring = main$1(string, {
    errorChar: cellOptions.defaultErrorValue,
    minWidth: 1,
    trim: true,
    width: innerWidth
  });

  return outstring
};

module.exports.getColumnWidths = (config, rows) => {
  const availableWidth = getAvailableWidth(config);

  // iterate over the header if we have it, iterate over the first row
  // if we do not (to step through the correct number of columns)
  const iterable = (config.table.header[0] && config.table.header[0].length > 0)
    ? config.table.header[0] : rows[0];

  let widths = iterable.map((column, columnIndex) => {
    let result;

    switch (true) {
      // column width is a percentage of table width specified in column header
      case (typeof column === "object" && (/^\d+%$/.test(column.width))):
        result = (column.width.slice(0, -1) * 0.01) * availableWidth;
        result = addPadding(config, result);
        break

      // column width is specified in column header
      case (typeof column === "object" && (/^\d+$/.test(column.width))):
        result = column.width;
        break

      // 'auto' sets column width to its longest value in the initial data set
      default:
        const columnOptions = (config.table.header[0][columnIndex])
          ? config.table.header[0][columnIndex] : {};
        const measurableRows = (rows.length) ? rows : config.table.header[0];

        result = getMaxLength(columnOptions, measurableRows, columnIndex);

        // add spaces for padding if not centered
        // @TODO test with if not centered conditional
        result = addPadding(config, result);
    }

    // add space for gutter
    result = result + config.GUTTER;
    return result
  });

  // calculate sum of all column widths (including marginLeft)
  const totalWidth = widths.reduce((prev, current) => prev + current);

  // proportionately resize columns when necessary
  if (totalWidth > availableWidth || config.FIXED_WIDTH) {
    // proportion wont be exact fit, but this method keeps us safe
    const proportion = (availableWidth / totalWidth).toFixed(2) - 0.01;
    const relativeWidths = widths.map(value => Math.max(2, Math.floor(proportion * value)));
    if (config.FIXED_WIDTH) return relativeWidths

    // when proportion < 0 column cant be resized and totalWidth must overflow viewport
    if (proportion > 0) {
      const totalRelativeWidths = relativeWidths.reduce((prev, current) => prev + current);
      widths = (totalRelativeWidths < totalWidth) ? relativeWidths : widths;
    }
  } else {
    widths = widths.map(Math.floor);
  }

  return widths
};
});
var format_1 = format.getStringLength;
var format_2 = format.wrapCellText;
var format_3 = format.truncate;
var format_4 = format.wrap;
var format_5 = format.getColumnWidths;

var render = createCommonjsModule(function (module, exports) {
/**
 * Converts arrays of data into arrays of cell strings
 * @param {TtyTable.Config} config
 * @param {Array<Array<string>|object|TtyTable.Formatter>} inputData
 * @returns {Array<string>}
 */
module.exports.stringifyData = (config, inputData) => {
  const sections = {
    header: [],
    body: [],
    footer: []
  };
  const marginLeft = Array(config.marginLeft + 1).join(" ");
  const borderStyle = config.borderCharacters[config.borderStyle];
  const borders = [];

  // support backwards compatibility cli-table's multiple constructor geometries
  // @TODO deprecate and support only a single format
  const constructorType = exports.getConstructorGeometry(inputData[0] || [], config);
  const rows = exports.coerceConstructorGeometry(config, inputData, constructorType);

  // when streaming values to tty-table, we don't want column widths to change
  // from one rows set to the next, so we save the first set of widths and reuse
  if (!commonjsGlobal.columnWidths) {
    commonjsGlobal.columnWidths = {};
  }

  if (commonjsGlobal.columnWidths[config.tableId]) {
    config.table.columnWidths = commonjsGlobal.columnWidths[config.tableId];
  } else {
    commonjsGlobal.columnWidths[config.tableId] = config.table.columnWidths = format.getColumnWidths(config, rows);
  }

  // stringify header cells
  // hide header if no column names or if specified in config
  switch (true) {
    case (config.showHeader !== null && !config.showHeader): // explicitly false, hide
      sections.header = [];
      break

    case (config.showHeader === true): // explicitly true, show
    case (!!config.table.header[0].find(obj => obj.value || obj.alias)): //  atleast one named column, show header
      sections.header = config.table.header.map(row => {
        return exports.buildRow(config, row, "header", null, rows, inputData)
      });
      break

    default: // no named columns, hide
      sections.header = [];
  }

  // stringify body cells
  sections.body = rows.map((row, rowIndex) => {
    return exports.buildRow(config, row, "body", rowIndex, rows, inputData)
  });

  // stringify footer cells
  sections.footer = (config.table.footer instanceof Array && config.table.footer.length > 0) ? [config.table.footer] : [];

  sections.footer = sections.footer.map(row => {
    return exports.buildRow(config, row, "footer", null, rows, inputData)
  });

  // apply borders
  // 0=top, 1=middle, 2=bottom
  for (let a = 0; a < 3; a++) {
    // add left border
    borders[a] = borderStyle[a].l;

    // add joined borders for each column
    config.table.columnWidths.forEach((columnWidth, index, arr) => {
      // Math.max because otherwise columns 1 wide wont have horizontal border
      borders[a] += Array(Math.max(columnWidth, 2)).join(borderStyle[a].h);
      borders[a] += ((index + 1 < arr.length) ? borderStyle[a].j : "");
    });

    // add right border
    borders[a] += borderStyle[a].r;

    // no trailing space on footer
    borders[a] = (a < 2) ? `${marginLeft + borders[a]}\n` : marginLeft + borders[a];
  }

  // top horizontal border
  let output = borders[0];

  // for each section (header,body,footer)
  Object.keys(sections).forEach((p, i) => {
    // for each row in the section
    while (sections[p].length) {
      const row = sections[p].shift();

      // if(row.length === 0) {break}

      row.forEach(line => {
        // vertical row borders
        output = `${output
          + marginLeft
          // left vertical border
          + borderStyle[1].v
          // join cells on vertical border
          + line.join(borderStyle[1].v)
          // right vertical border
          + borderStyle[1].v
          // end of line
        }\n`;
      });

      // bottom horizontal row border
      switch (true) {
      // skip if end of body and no footer
        case (sections[p].length === 0
             && i === 1
             && sections.footer.length === 0):
          break

        // skip if end of footer
        case (sections[p].length === 0
             && i === 2):
          break

        // skip if compact
        case (config.compact && p === "body" && !row.empty):
          break

        // skip if border style is "none"
        case (config.borderStyle === "none" && config.compact):
          break

        default:
          output += borders[1];
      }
    }
  });

  // bottom horizontal border
  output += borders[2];

  const finalOutput = Array(config.marginTop + 1).join("\n") + output;

  // record the height of the output
  config.height = finalOutput.split(/\r\n|\r|\n/).length;

  return finalOutput
};

module.exports.buildRow = (config, row, rowType, rowIndex, rowData, inputData) => {
  let minRowHeight = 0;

  // tag row as empty if empty, used for `compact` option
  if (row.length === 0 && config.compact) {
    row.empty = true;
    return row
  }

  // force row to have correct number of columns
  const lengthDifference = config.table.columnWidths.length - row.length;
  if (lengthDifference > 0) {
    // array (row) lacks elements, add until equal
    row = row.concat(Array.apply(null, new Array(lengthDifference)).map(() => null));
  } else if (lengthDifference < 0) {
    // array (row) has too many elements, remove until equal
    row.length = config.table.columnWidths.length;
  }

  // convert each element in row to cell format
  row = row.map((elem, elemIndex) => {
    const cell = exports.buildCell(config, elem, elemIndex, rowType, rowIndex, rowData, inputData);
    minRowHeight = (minRowHeight < cell.length) ? cell.length : minRowHeight;
    return cell
  });

  // apply top and bottom padding to row
  minRowHeight = (rowType === "header") ? minRowHeight
    : minRowHeight + (config.paddingBottom + config.paddingTop);

  const linedRow = Array.apply(null, { length: minRowHeight })
    .map(Function.call, () => []);

  row.forEach(function (cell, a) {
    const whitespace = Array(config.table.columnWidths[a]).join(" ");

    if (rowType === "body") {
      // add whitespace for top padding
      for (let i = 0; i < config.paddingTop; i++) {
        cell.unshift(whitespace);
      }

      // add whitespace for bottom padding
      for (let i = 0; i < config.paddingBottom; i++) {
        cell.push(whitespace);
      }
    }

    // a `row` is divided by columns (horizontally)
    // a `linedRow` becomes the row divided instead into an array of vertical lines
    // each nested line divided by columns
    for (let i = 0; i < minRowHeight; i++) {
      linedRow[i].push((typeof cell[i] !== "undefined")
        ? cell[i] : whitespace);
    }
  });

  return linedRow
};

module.exports.buildCell = (config, elem, columnIndex, rowType, rowIndex, rowData, inputData) => {
  let cellValue = null;

  const cellOptions = Object.assign(
    { reset: false },
    config,
    (rowType === "body") ? config.columnSettings[columnIndex] : {}, // ignore columnSettings for footer
    (typeof elem === "object") ? elem : {}
  );

  if (rowType === "header") {
    config.table.columns.push(cellOptions);
    cellValue = cellOptions.alias || cellOptions.value || "";
  } else {
    // set cellValue
    switch (true) {
      case (typeof elem === "undefined" || elem === null):
        // replace undefined/null elem values with placeholder
        cellValue = (config.errorOnNull) ? config.defaultErrorValue : config.defaultValue;
        // @TODO add to elem defaults
        cellOptions.isNull = true;
        break

      case (typeof elem === "object" && elem !== null && typeof elem.value !== "undefined"):
        cellValue = elem.value;
        break

      case (typeof elem === "function"):
        cellValue = elem.bind({
          configure: function (object) {
            return Object.assign(cellOptions, object)
          },
          style: style.style,
          resetStyle: style.resetStyle
        })(
          (!cellOptions.isNull) ? cellValue : "",
          columnIndex,
          rowIndex,
          rowData,
          inputData
        );
        break

      default:
        // elem is assumed to be a scalar
        cellValue = elem;
    }

    // run formatter
    if (typeof cellOptions.formatter === "function") {
      cellValue = cellOptions.formatter
        .bind({
          configure: function (object) {
            return Object.assign(cellOptions, object)
          },
          style: style.style,
          resetStyle: style.resetStyle
        })(
          (!cellOptions.isNull) ? cellValue : "",
          columnIndex,
          rowIndex,
          rowData,
          inputData
        );
    }
  }

  // colorize cellValue
  // we don't want the formatter to pass a styled cell value with ANSI codes
  // (in case user wants to do math or string operations to cell value), so
  // we apply default styles to the cell after it runs through the formatter
  // and omit those default styles if the user applied `this.resetStyle`
  if (!cellOptions.reset) {
    cellValue = style.colorizeCell(cellValue, cellOptions, rowType);
  }

  // textwrap cellValue
  const { cell, innerWidth } = format.wrapCellText(cellOptions, cellValue, columnIndex, cellOptions, rowType);

  if (rowType === "header") {
    config.table.columnInnerWidths.push(innerWidth);
  }

  return cell
};

/**
 * Check for a backwards compatible (cli-table) constructor
 */
module.exports.getConstructorGeometry = (row, config) => {
  let type;

  // rows passed as an object
  if (typeof row === "object" && !(row instanceof Array)) {
    const keys = Object.keys(row);

    if (config.adapter === "automattic") {
      // detected cross table
      const key = keys[0];

      if (row[key] instanceof Array) {
        type = "automattic-cross";
      } else {
        // detected vertical table
        type = "automattic-vertical";
      }
    } else {
      // detected horizontal table
      type = "o-horizontal";
    }
  } else {
    // rows passed as an array
    type = "a-horizontal";
  }

  return type
};

/**
 * Coerce backwards compatible constructor styles
 */
module.exports.coerceConstructorGeometry = (config, rows, constructorType) => {
  let output = [];
  switch (constructorType) {
    case ("automattic-cross"):
      // assign header styles to first column
      config.columnSettings[0] = config.columnSettings[0] || {};
      config.columnSettings[0].color = config.headerColor;

      output = rows.map(obj => {
        const arr = [];
        const key = Object.keys(obj)[0];
        arr.push(key);
        return arr.concat(obj[key])
      });
      break

    case ("automattic-vertical"):
      // assign header styles to first column
      config.columnSettings[0] = config.columnSettings[0] || {};
      config.columnSettings[0].color = config.headerColor;

      output = rows.map(function (value) {
        const key = Object.keys(value)[0];
        return [key, value[key]]
      });
      break

    case ("o-horizontal"):
      // cell property names are specified in header columns
      if (config.table.header[0].length
        && config.table.header[0].every(obj => obj.value)) {
        output = rows.map(row => config.table.header[0]
          .map(obj => row[obj.value]));
      } // eslint-disable-line brace-style
      // no property names given, default to object property order
      else {
        output = rows.map(obj => Object.values(obj));
      }
      break

    case ("a-horizontal"):
      output = rows;
      break
  }

  return output
};

// @TODO For rotating horizontal data into a vertical table
// assumes all rows are same length
// module.exports.verticalizeMatrix = (config, inputArray) => {
//
//   // grow to # arrays equal to number of columns in input array
//   let outputArray = []
//   let headers = config.table.columns
//
//   // create a row for each heading, and prepend the row
//   // with the heading name
//   headers.forEach(name => outputArray.push([name]))
//
//   inputArray.forEach(row => {
//     row.forEach((element, index) => outputArray[index].push(element))
//   })
//
//   return outputArray
// }
});
var render_1 = render.stringifyData;
var render_2 = render.buildRow;
var render_3 = render.buildCell;
var render_4 = render.getConstructorGeometry;
var render_5 = render.coerceConstructorGeometry;

let counter = 0;

const Factory = function (paramsArr) {
  const _configKey = Symbol.config;
  let header = [];
  const body = [];
  let footer = [];
  let options = {};

  // handle different parameter scenarios
  switch (true) {
    // header, rows, footer, and options
    case (paramsArr.length === 4):
      header = paramsArr[0];
      body.push(...paramsArr[1]); // creates new array to store our rows (body)
      footer = paramsArr[2];
      options = paramsArr[3];
      break

    // header, rows, footer
    case (paramsArr.length === 3 && paramsArr[2] instanceof Array):
      header = paramsArr[0];
      body.push(...paramsArr[1]); // creates new array to store our rows
      footer = paramsArr[2];
      break

    // header, rows, options
    case (paramsArr.length === 3 && typeof paramsArr[2] === "object"):
      header = paramsArr[0];
      body.push(...paramsArr[1]); // creates new array to store our rows
      options = paramsArr[2];
      break

    // header, rows            (rows, footer is not an option)
    case (paramsArr.length === 2 && paramsArr[1] instanceof Array):
      header = paramsArr[0];
      body.push(...paramsArr[1]); // creates new array to store our rows
      break

    // rows, options
    case (paramsArr.length === 2 && typeof paramsArr[1] === "object"):
      body.push(...paramsArr[0]); // creates new array to store our rows
      options = paramsArr[1];
      break

    // rows
    case (paramsArr.length === 1 && paramsArr[0] instanceof Array):
      body.push(...paramsArr[0]);
      break

    // adapter called: i.e. `require('tty-table')('automattic-cli')`
    case (paramsArr.length === 1 && typeof paramsArr[0] === "string"):
      return commonjsRequire(`../adapters/${paramsArr[0]}`)

    /* istanbul ignore next */
    default:
      console.log("Error: Bad params. \nSee docs at github.com/tecfu/tty-table")
      ()();
  }

  // for "deep" copy, use JSON.parse
  const cloneddefaults = JSON.parse(JSON.stringify(defaults_1));
  const config = Object.assign({}, cloneddefaults, options);

  // backfixes for shortened option names
  config.align = config.alignment || config.align;
  config.headerAlign = config.headerAlignment || config.headerAlign;

  // for truncate true is equivalent to empty string
  if (config.truncate === true) config.truncate = "";

  // if borderColor customized, color the border character set
  if (config.borderColor) {
    config.borderCharacters[config.borderStyle]
      = config.borderCharacters[config.borderStyle].map(function (obj) {
        Object.keys(obj).forEach(function (key) {
          obj[key] = style.style(obj[key], config.borderColor);
        });
        return obj
      });
  }

  // save a copy for merging columnSettings into cell options
  config.columnSettings = header.slice(0);

  // header
  config.table.header = header;

  // match header geometry with body array
  config.table.header = [config.table.header];

  // footer
  config.table.footer = footer;

  // counting table enables fixed column widths for streams,
  // variable widths for multiple tables simulateously
  if (config.terminalAdapter !== true) {
    counter++; // fix columnwidths for streams
  }
  config.tableId = counter;

  // create a new object with an Array prototype
  const tableObject = Object.create(body);

  // save configuration to new object
  tableObject[_configKey] = config;

  /**
   * Add method to render table to a string
   * @returns {String}
   * @memberof Table
   * @example
   * ```js
   * let str = t1.render();
   * console.log(str); //outputs table
   * ```
  */
  tableObject.render = function () {
    const output = render.stringifyData(this[_configKey], this.slice(0)); // get string output
    tableObject.height = this[_configKey].height;
    return output
  };

  return tableObject
};

const Table = function () {
  return new Factory(arguments)
};

Table.resetStyle = style.resetStyle;
Table.style = style.styleEachChar;

var factory = Table;

var defaultAdapter = factory;

export default defaultAdapter;
