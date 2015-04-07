var
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

  defaultMinWidths = [0, 38, 60, 90],
  defaultLineHeights = [1.3,  1.4, 1.5],
  defaultFontSizes = [100, 100, 100, 110, 120, 130],
  defaultTypeScales = [1.067, 1.125],
  breakpointCount = 0,

  $breakpoints = $('#breakpoints'),
  $btnAdd = $('#btn-add-breakpoint'),

  $controls = $('#controls'),
  $cssOutput = $('#output'),
  $sampleOutput = $('#sample-styles'),
  $legacy = $('#legacy'),

  view = function view (name, vals) {
    if (!vals) vals = {};

    vals.legacy = $legacy.is(':checked');

    return prepareTemplate(name, vals);
  },

  calculateValues = function calculateValues (baseFontSize, baseLineHeight, typeScale, power) {
    var fontSize = (baseFontSize * Math.pow(typeScale, power)) / baseFontSize,
      lineHeight = baseLineHeight / baseFontSize;

    return {
      fontSize: fontSize,
      lineHeight: Math.ceil(fontSize / lineHeight) * (lineHeight / fontSize)
    };
  },

  typeScales = function prepareCSS (baseFontSize, baseLineHeight, typeScale, templateView) {
    var typeScaleValues = [],
      css = '',
      fontSize = (baseFontSize / 16) * 100,
      lineHeight = baseLineHeight / baseFontSize;

    sizes.forEach(function (elem, index, arr) {
      var
        vals = calculateValues(baseFontSize, baseLineHeight, typeScale, sizes[index].power),
        sel = sizes[index].sel
      ;

      typeScaleValues.push(
        view('css-element', {
          'selectors': sel.join(', '),
          'font-size': vals.fontSize.toFixed(4),
          'font-size-px': Math.round(vals.fontSize * baseFontSize),
          'line-height': vals.lineHeight.toFixed(4),
          'line-height-px': Math.round(vals.lineHeight * baseLineHeight)
        })
      );
    });

    css = view(templateView, {
      'base-font': fontSize,
      'base-font-px': baseFontSize,
      'base-line-height': lineHeight,
      'base-line-height-px': lineHeight * baseFontSize,
      'line-height-half': (lineHeight / 2).toFixed(4),
      'line-height-half-px': Math.round(baseLineHeight / 2),
      'line-height-quarter': (lineHeight / 4).toFixed(4),
      'line-height-quarter-px': Math.round(baseLineHeight / 4),
      'line-height-double': (lineHeight * 2).toFixed(4),
      'line-height-double-px': baseLineHeight * 2,
      'type-scale': typeScaleValues.join(''),
    });

    return css;
  };

$controls.on('keyup change submit', function (e) {
  var typePieces = [],
    output = '',
    defaultFontSize,
    defaultLineHeight,
    previousLineHeight = 0,
    previousTypeScale = 0
  ;

  e.preventDefault();

  $breakpoints.children().each(function () {
    var percentFontSize = $(this).find('.font-size').val(),
      lineHeightMultiplier = $(this).find('.line-height').val(),
      baseFontSize = Math.round(percentFontSize * 16 / 100),
      baseLineHeight = Math.round(baseFontSize * lineHeightMultiplier),
      typeScale = $(this).find('.type-scale').val(),
      $minWidth = $(this).find('.min-width'),
      hasMinWidth = $minWidth.length,
      isOnlyFontSizeChange = (previousLineHeight == lineHeightMultiplier && previousTypeScale == typeScale)
    ;

    if (hasMinWidth) {
      if (isOnlyFontSizeChange) {
        typePieces.push(
          view('media-query-font-size-only', {
              'min-width': $minWidth.val(),
              'font-size': percentFontSize
            })
        );
      } else {
        typePieces.push(
          view('media-query', {
              'min-width': $minWidth.val(),
              'css': typeScales(baseFontSize, baseLineHeight, typeScale, 'scale-base')
            })
        );
      }
    } else {
      defaultFontSize = percentFontSize;
      defaultLineHeight = lineHeightMultiplier;
      typePieces = typePieces.concat(typeScales(baseFontSize, baseLineHeight, typeScale, 'scale-base'));
    }

    previousLineHeight = lineHeightMultiplier;
    previousTypeScale = typeScale;
  });

  output = [view('css-base', {
    'base-font': defaultFontSize,
    'base-line-height': defaultLineHeight,
    'main': typePieces.join('')
  })];

  $cssOutput.html(output);
});

$btnAdd.on('click', function () {
  var lastWidth = defaultMinWidths.length - 1,
    lastSize = defaultFontSizes.length - 1,
    lastLineHeight = defaultLineHeights.length - 1,
    lastTypeScale = defaultTypeScales.length - 1,
    minWidthIncrement = 20,
    extra = (new Array(100)).join("x");

  $breakpoints.append(view('breakpoint', {
      'id': breakpointCount,
      'min-width': defaultMinWidths[breakpointCount] || defaultMinWidths[lastWidth] + ((breakpointCount - lastWidth) * minWidthIncrement),
      'font-size': defaultFontSizes[breakpointCount] || defaultFontSizes[lastSize],
      'line-height': defaultLineHeights[breakpointCount] || defaultLineHeights[lastLineHeight]
    })
  );

  $breakpoints.find('tr:last-child .type-scale').val(defaultTypeScales[breakpointCount] || defaultTypeScales[lastTypeScale]);

  breakpointCount++;

  $controls.trigger('submit');
});

$controls.on('click', '.btn-remove-breakpoint', function (e) {
  e.preventDefault();
  $(this).parent().parent().remove();
  breakpointCount--;
  $controls.trigger('submit');
});

$btnAdd.trigger('click');
$breakpoints.find('.breakpoint-em').html('<span class="infinite">∞</span>');
$breakpoints.find('.btn-remove-breakpoint').remove();
$btnAdd.trigger('click');
$btnAdd.trigger('click');
$btnAdd.trigger('click');
// $controls.trigger('submit');
