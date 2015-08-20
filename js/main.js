var
  hash = window.location.hash.replace(/#/, ''),
  hashBits,
  sizes = [
    { sel: ['.yotta'], power: 7},
    { sel: ['.zetta'], power: 6},
    { sel: ['h1', '.exa'], power: 5},
    { sel: ['h2', '.peta'], power: 4},
    { sel: ['h3', '.tera'], power: 3},
    { sel: ['h4', '.giga'], power: 2},
    { sel: ['h5', '.mega'], power: 1},
    { sel: ['h6', '.kilo'], power: 0},
    { sel: ['small', '.milli'], power: -1},
    { sel: ['.micro'], power: -2},
  ],

  originalFontSize = 16,
  superDefaults = [
    [0, 100, 1.3, 1.067],
    [38, 110, 1.4, 1.125],
    [60, 120, 1.5, 1.125],
    [90, 130, 1.5, 1.125]
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

  calculateValues = function calculateValues (baseFontSize, baseLineHeight, typeScale, power) {
    var fontSize = (baseFontSize / 100) * Math.pow(typeScale, power),
      lineHeight = Math.ceil(fontSize / baseLineHeight) * (baseLineHeight / fontSize);

    return {
      fontSize: fontSize,
      lineHeight: lineHeight,
    };
  },

  typeScales = function prepareCSS (baseFontSize, baseLineHeight, typeScale, templateView) {
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
          'line-height-px': convertToPx(vals.lineHeight)
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
      'type-scale': typeScaleValues.join('')
    });

    return css;
  };

$controls.on('keyup change submit', function (e) {
  var typePieces = [],
    output = '',
    defaultFontSize,
    defaultLineHeight
  ;

  e.preventDefault();

  $breakpoints.children().each(function () {
    var baseFontSize = $.trim($(this).find('.font-size').val()),
      baseLineHeight = $.trim($(this).find('.line-height').val()),
      typeScale = $.trim($(this).find('.type-scale').val()),
      $minWidth = $(this).find('.min-width'),
      hasMinWidth = (parseInt($.trim($minWidth.val()), 10) > 0)
    ;

    if (hasMinWidth) {
      typePieces.push(
        view('media-query', {
            'min-width': $.trim($minWidth.val()),
            'font-size': baseFontSize,
            'line-height': baseLineHeight,
            // This should be 100 because no matter what the base font of the HTML element is,
            //   the rem calculations always treat the HTML font size as "1"
            'css': typeScales(100, baseLineHeight, typeScale, 'scale-base')
          })
      );
    } else {
      defaultFontSize = baseFontSize;
      defaultLineHeight = baseLineHeight;
      typePieces = typePieces.concat(typeScales(baseFontSize, baseLineHeight, typeScale, 'scale-base'));
    }
  });

  output = [view('css-base', {
    'base-font': defaults[0][1],
    'base-line-height': defaults[0][2],
    'main': typePieces.join('')
  })];

  $cssOutput.html(output);
});

$btnAdd.on('click', function () {
  var lastWidth = defaults[defaults.length - 1][0],
    lastSize = defaults[defaults.length - 1][1],
    lastLineHeight = defaults[defaults.length - 1][2],
    lastTypeScale = defaults[defaults.length - 1][3],
    data = []
  ;

  if (defaults[breakpointCount]) {
    data = defaults[breakpointCount];
  } else {
    data = [
      lastWidth,
      lastSize,
      lastLineHeight,
      lastTypeScale
    ];
  }

  $breakpoints.append(view('breakpoint', {
      'id': breakpointCount,
      'min-width': data[0],
      'font-size': data[1],
      'line-height': data[2]
    })
  );

  $breakpoints.find('tr:last-child .type-scale').val(data[3]);

  breakpointCount++;

  $controls.trigger('submit');
});

$controls.on('click', '.btn-remove-breakpoint', function (e) {
  e.preventDefault();
  $(this).parent().parent().remove();
  breakpointCount--;
  $controls.trigger('submit');
});

if (hash) {
  hashBits = hash.split(';');
  defaults = [];

  hashBits.forEach(function (item) {
    defaults.push(item.split(','));
  });
}

defaults.forEach(function() {
  $btnAdd.trigger('click');
});

$breakpoints.find('.breakpoint:first-child .breakpoint-em').html('<span class="infinite">∞</span>');
$breakpoints.find('.breakpoint:first-child .btn-remove-breakpoint').remove();
// $controls.trigger('submit');
