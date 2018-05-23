'use strict';

var hash = window.location.hash.replace(/#/, '');
var hashBits;
var previewWin;

var sizes = [
  { sel: ['.tenamega'], power: 11},
  { sel: ['.tenakilo'], power: 10},
  { sel: ['.tena'], power: 9},
  { sel: ['.nina'], power: 8},
  { sel: ['.yotta'], power: 7},
  { sel: ['.zetta'], power: 6},
  { sel: ['h1', '.exa'], power: 5},
  { sel: ['h2', '.peta'], power: 4},
  { sel: ['h3', '.tera'], power: 3},
  { sel: ['h4', '.giga'], power: 2},
  { sel: ['h5', '.mega'], power: 1},
  { sel: ['h6', '.kilo', 'input', 'textarea'], power: 0},
  { sel: ['small', '.milli'], power: -1},
  { sel: ['.micro'], power: -2},
];

var originalFontSize = 16;
var superDefaults = [
  [0, 100, 1.3, 1.067, 0],
  [38, 110, 1.4, 1.125, 1],
  [60, 120, 1.5, 1.125, 1],
  [90, 130, 1.5, 1.125, 1]
];
var defaults = superDefaults;
var breakpointCount = 0;

var $breakpoints = $('#breakpoints');
var $btnAdd = $('#btn-add-breakpoint');
var $controls = $('#controls');
var $cssOutput = $('#output');
var $legacy = $('#legacy');

var removeTrailingLeadingZeros = function (num) {
  return num.replace(/^0*\./, '.').replace(/\.?0*$/, '');
};

var formatNumber = function (num) {
  return removeTrailingLeadingZeros(num.toFixed(4));
};

var view = function view (name, vals) {
  if (!vals) vals = {};

  vals.legacy = $legacy.is(':checked');

  return prepareTemplate(name, vals);
};

var convertToPx = function (val) {
  return formatNumber(Math.round(val * originalFontSize));
};

var calculateLineHeight = function (baseLineHeight, power, fontSize) {
  var lhRatioMax = 1.9; // Magic numbers, determined by looking at nice line-heights for bunch of text
  var lhRatioMin = 1.3;
  var ratio = baseLineHeight / fontSize;
  var increment = parseFloat(baseLineHeight) / 4;
  var newLineHeight = parseFloat(baseLineHeight);

  while (ratio < lhRatioMin) {
    newLineHeight += increment;
    ratio = newLineHeight / fontSize;
  }

  while (ratio > lhRatioMax) {
    newLineHeight -= increment;
    ratio = newLineHeight / fontSize;
  }

  return newLineHeight;
};

var calculateValues = function (baseFontSize, baseLineHeight, typeScale, power) {
  var fontSize = (baseFontSize / 100) * Math.pow(typeScale, power);
  var lineHeight = calculateLineHeight(baseLineHeight, power, fontSize);

  return {
    fontSize: fontSize,
    lineHeight: lineHeight,
  };
};

var typeScales = function (baseFontSize, baseLineHeight, typeScale, hangPunc, templateView) {
  var typeScaleValues = [];
  var css = '';

  sizes.forEach(function (elem, index, arr) {
    var vals = calculateValues(baseFontSize, baseLineHeight, typeScale, sizes[index].power);
    var sel = sizes[index].sel;

    typeScaleValues.push(
      view('css-element', {
        'selectors': sel.join(',\n'),
        'font-size': formatNumber(vals.fontSize),
        'font-size-px': convertToPx(vals.fontSize),
        'line-height': formatNumber(vals.lineHeight),
        'line-height-px': convertToPx(vals.lineHeight),
      })
    );
  });

  css = view(templateView, {
    'base-line-height': baseLineHeight,
    'base-line-height-px': convertToPx(baseLineHeight),
    'line-height-three-quarters': formatNumber(baseLineHeight * .75),
    'line-height-three-quarters-px': convertToPx(Math.round(baseLineHeight * .75)),
    'line-height-half': formatNumber(baseLineHeight / 2),
    'line-height-half-px': convertToPx(Math.round(baseLineHeight / 2)),
    'line-height-quarter': formatNumber(baseLineHeight / 4),
    'line-height-quarter-px': convertToPx(Math.round(baseLineHeight / 4)),
    'line-height-eighth': formatNumber(baseLineHeight / 8),
    'line-height-eighth-px': convertToPx(Math.round(baseLineHeight / 8)),
    'line-height-one-one-quarter': formatNumber(baseLineHeight * 1.25),
    'line-height-one-one-quarter-px': convertToPx(baseLineHeight * 1.25),
    'line-height-one-one-half': formatNumber(baseLineHeight * 1.5),
    'line-height-one-one-half-px': convertToPx(baseLineHeight * 1.5),
    'line-height-one-three-quarters': formatNumber(baseLineHeight * 1.75),
    'line-height-one-three-quarters-px': convertToPx(baseLineHeight * 1.75),
    'line-height-double': formatNumber(baseLineHeight * 2),
    'line-height-double-px': convertToPx(baseLineHeight * 2),
    'type-scale': typeScaleValues.join(''),
    'hang-punc': hangPunc,
    'not-hang-punc': !hangPunc
  });

  return css;
};

var indent = function (code) {
  var codeLines = code.split('\n');

  codeLines.forEach(function (line, i) {
    if (!line) return;

    codeLines[i] = '  ' + line;
  });

  return codeLines.join('\n');
};

var addNewBreakpoint = function () {
  var minWidthIncrement = 20;
  var data = [];

  if (defaults[breakpointCount]) {
    data = defaults[breakpointCount];
  } else {
    data = [
      parseInt(defaults[defaults.length - 1][0], 10) + (breakpointCount - (defaults.length - 1)) * minWidthIncrement,
      defaults[defaults.length - 1][1],
      defaults[defaults.length - 1][2],
      defaults[defaults.length - 1][3],
      defaults[defaults.length - 1][4]
    ];
  }

  $breakpoints.append(view('breakpoint', {
      'id': breakpointCount,
      'min-width': data[0],
      'font-size': data[1],
      'line-height': data[2],
      'hang-punc': data[4] ? 'checked' : ''
    })
  );

  $breakpoints.find('tr:last-child .type-scale').val(data[3]);

  breakpointCount++;
};

var buildOutput = function () {
  var typePieces = [];
  var output = '';
  var defaultFontSize;
  var defaultLineHeight;
  var buildHash = [];

  $breakpoints.children().each(function () {
    var baseFontSize = $.trim($(this).find('.font-size').val());
    var baseLineHeight = $.trim($(this).find('.line-height').val());
    var typeScale = $.trim($(this).find('.type-scale').val());
    var $minWidth = $(this).find('.min-width');
    var minWidthVal = $.trim($minWidth.val());
    var hasMinWidth = (parseInt(minWidthVal, 10) > 0);
    var hangPunc = $(this).find('.hang-punc').is(':checked');

    if (hasMinWidth) {
      buildHash.push([minWidthVal, baseFontSize, baseLineHeight, typeScale, hangPunc ? 1 : 0]);

      typePieces.push(
        view('media-query', {
            'min-width': minWidthVal,
            'font-size': baseFontSize,
            'line-height': baseLineHeight,
            // This should be 100 because no matter what the base font of the HTML element is,
            //   the rem calculations always treat the HTML font size as "1"
            'css': indent(typeScales(100, baseLineHeight, typeScale, hangPunc, 'scale-base'))
          })
      );
    } else {
      defaultFontSize = baseFontSize;
      defaultLineHeight = baseLineHeight;
      buildHash.push([0, baseFontSize, baseLineHeight, typeScale, hangPunc ? 1 : 0]);
      typePieces = typePieces.concat(typeScales(baseFontSize, baseLineHeight, typeScale, hangPunc, 'scale-base'));
    }
  });

  output = [view('css-base', {
    'build': window.location.protocol + '//' + window.location.host + window.location.pathname + '#' + buildHash.join(';'),
    'base-font': defaults[0][1],
    'base-line-height': defaults[0][2],
    'main': typePieces.join('')
  })];

  $cssOutput.text(output);
  window.location.hash = buildHash.join(';');

  if (previewWin) {
    previewWin.location = window.location.href.replace('#', 'preview/#');
    previewWin.location.reload();
  }
};

$controls.on('keyup change submit', function (e) {
  e.preventDefault();
  buildOutput();
});

$btnAdd.on('click', function () {
  addNewBreakpoint();
  buildOutput();
});

$controls.on('click', '.btn-remove-breakpoint', function (e) {
  e.preventDefault();
  $(this).parent().parent().remove();
  breakpointCount--;
  buildOutput();
});

if (hash) {
  hashBits = hash.split(';');
  defaults = [];

  hashBits.forEach(function (item) {
    var data = item.split(',');

    data[4] = data[4] === '1' ? true : false;
    defaults.push(data);
  });
}

defaults.forEach(function() {
  addNewBreakpoint();
  buildOutput();
});

$breakpoints.find('.breakpoint:first-child .breakpoint-em').html('<span class="infinite">∞</span>');
$breakpoints.find('.breakpoint:first-child .btn-remove-breakpoint').remove();

$('#preview').on('click', function (e) {
  e.preventDefault();
  previewWin = window.open('/preview/' + window.location.hash, 'preview');
});
