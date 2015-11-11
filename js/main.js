var
  hash = window.location.hash.replace(/#/, ''),
  hashBits,
  previewWin,

  sizes = [
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
  ],

  originalFontSize = 16,
  superDefaults = [
    [0, 100, 1.3, 1.067, 0],
    [38, 110, 1.4, 1.125, 1],
    [60, 120, 1.5, 1.125, 1],
    [90, 130, 1.5, 1.125, 1]
  ],
  defaults = superDefaults,
  breakpointCount = 0,

  $breakpoints = $('#breakpoints'),
  $btnAdd = $('#btn-add-breakpoint'),

  $controls = $('#controls'),
  $cssOutput = $('#output'),
  $legacy = $('#legacy'),

  view = function view (name, vals) {
    if (!vals) vals = {};

    vals.legacy = $legacy.is(':checked');

    return prepareTemplate(name, vals);
  },

  convertToPx = function (val) {
    return Math.round(val * originalFontSize);
  },

  calculateLineHeight = function (baseLineHeight, power, fontSize) {
    var lh = Math.ceil(fontSize / baseLineHeight) * (baseLineHeight / fontSize);

    // Fixes a few line-heights that were too loose or too tight
    // .33 is just a magic number after about 3 hours of futzing
    if (power >= 3) {
      lh = Math.ceil(fontSize / (baseLineHeight * .33)) * ((baseLineHeight * .33) / fontSize);
    }

    return lh;
  }

  calculateValues = function (baseFontSize, baseLineHeight, typeScale, power) {
    var fontSize = (baseFontSize / 100) * Math.pow(typeScale, power),
      lineHeight = calculateLineHeight(baseLineHeight, power, fontSize);

    return {
      fontSize: fontSize,
      lineHeight: lineHeight,
    };
  },

  typeScales = function (baseFontSize, baseLineHeight, typeScale, hangPunc, templateView) {
    var typeScaleValues = [], css = '';

    sizes.forEach(function (elem, index, arr) {
      var
        vals = calculateValues(baseFontSize, baseLineHeight, typeScale, sizes[index].power),
        sel = sizes[index].sel
      ;

      typeScaleValues.push(
        view('css-element', {
          'selectors': sel.join(', '),
          'font-size': vals.fontSize.toFixed(4),
          'font-size-px': convertToPx(vals.fontSize),
          'line-height': vals.lineHeight.toFixed(4),
          'line-height-px': convertToPx(vals.lineHeight),
        })
      );
    });

    css = view(templateView, {
      'base-line-height': baseLineHeight,
      'base-line-height-px': convertToPx(baseLineHeight),
      'line-height-half': (baseLineHeight / 2).toFixed(4),
      'line-height-half-px': convertToPx(Math.round(baseLineHeight / 2)),
      'line-height-quarter': (baseLineHeight / 4).toFixed(4),
      'line-height-quarter-px': convertToPx(Math.round(baseLineHeight / 4)),
      'line-height-double': (baseLineHeight * 2).toFixed(4),
      'line-height-double-px': convertToPx(baseLineHeight * 2),
      'type-scale': typeScaleValues.join(''),
      'hang-punc': hangPunc,
      'not-hang-punc': !hangPunc
    });

    return css;
  },

  addNewBreakpoint = function () {
    var
      minWidthIncrement = 20,
      data = []
    ;

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
  },

  buildOutput = function () {
    var typePieces = [],
      output = '',
      defaultFontSize,
      defaultLineHeight,
      buildHash = []
    ;

    $breakpoints.children().each(function () {
      var baseFontSize = $.trim($(this).find('.font-size').val()),
        baseLineHeight = $.trim($(this).find('.line-height').val()),
        typeScale = $.trim($(this).find('.type-scale').val()),
        $minWidth = $(this).find('.min-width'),
        minWidthVal = $.trim($minWidth.val()),
        hasMinWidth = (parseInt(minWidthVal, 10) > 0),
        hangPunc = $(this).find('.hang-punc').is(':checked')
      ;

      if (hasMinWidth) {
        buildHash.push([minWidthVal, baseFontSize, baseLineHeight, typeScale, hangPunc ? 1 : 0]);

        typePieces.push(
          view('media-query', {
              'min-width': minWidthVal,
              'font-size': baseFontSize,
              'line-height': baseLineHeight,
              // This should be 100 because no matter what the base font of the HTML element is,
              //   the rem calculations always treat the HTML font size as "1"
              'css': typeScales(100, baseLineHeight, typeScale, hangPunc, 'scale-base')
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
   }
;

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
