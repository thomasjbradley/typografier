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

  $baseFontSize = $('#base-font-size'),
  $fontSizeUnit = $('[name="font-size-unit"]'),
  $fontSizeUnitPx = $('#font-size-px'),
  $baseLineHeight = $('#base-line-height'),
  $lineHeightUnit = $('[name="line-height-unit"]'),
  $lineHeightUnitPx = $('#line-height-px'),
  $typeScale = $('#type-scale'),
  $typeScaleSelect = $('#type-scale-select'),
  $biggerFonts = $('#bigger-fonts'),
  $controls = $('#controls'),
  $cssOutput = $('#output'),
  $sampleOutput = $('#sample-styles'),
  $legacy = $('#legacy'),

  view = function view (name, vals) {
    if (!vals) vals = {};

    vals.legacy = $legacy.is(':checked');

    return prepareTemplate(name, vals);
  },

  validateEvents = function validateEvents () {
    var baseFontSize = Math.round(($fontSizeUnitPx.is(':checked')) ? $baseFontSize.val() : $baseFontSize.val() * 16 / 100),
      baseLineHeight = Math.round(($lineHeightUnitPx.is(':checked')) ? $baseLineHeight.val() : baseFontSize * $baseLineHeight.val());

    if ($baseFontSize.val() && $baseLineHeight.val() && $typeScale.val()) {
      prepareCSS(baseFontSize, baseLineHeight, $typeScale.val(), 'css-base', $cssOutput);
      prepareCSS(baseFontSize, baseLineHeight, $typeScale.val(), 'css-sample', $sampleOutput, '-sample');
    }
  },

  calculateValues = function calculateValues (baseFontSize, baseLineHeight, typeScale, power) {
    var fontSize = (baseFontSize * Math.pow(typeScale, power)) / baseFontSize,
      lineHeight = baseLineHeight / baseFontSize;

    return {
      fontSize: fontSize,
      lineHeight: Math.ceil(fontSize / lineHeight) * (lineHeight / fontSize)
    };
  },

  prepareCSS = function prepareCSS (baseFontSize, baseLineHeight, typeScale, templateView, $output, selectorSuffix) {
    var typeScaleValues = [],
      css = '',
      fontSize = (baseFontSize / 16) * 100,
      lineHeight = baseLineHeight / baseFontSize;

    sizes.forEach(function (elem, index, arr) {
      var
        vals = calculateValues(baseFontSize, baseLineHeight, typeScale, sizes[index].power),
        sel = sizes[index].sel
      ;

      if (selectorSuffix) {
        sel = [sizes[index].sel[sizes[index].sel.length - 1] + selectorSuffix];
      }

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
      'line-height-double': (lineHeight * 2).toFixed(4),
      'line-height-double-px': baseLineHeight * 2,
      'type-scale': typeScaleValues.join(''),
      'bigger-fonts': ($biggerFonts.is(':checked')) ?  prepareTemplate('bigger-fonts'): ''
    });

    $output.html(css);
  };

$controls.on('keyup change submit', function (e) {
  e.preventDefault();
  validateEvents();
});

$fontSizeUnit.on('change', function (e) {
  e.stopPropagation();

  if ($(this).val() == 'px') {
    $baseFontSize.val(16);
  } else {
    $baseFontSize.val(100);
  }

  validateEvents();
});

$lineHeightUnit.on('change', function (e) {
  e.stopPropagation();

  if ($(this).val() == 'px') {
    $baseLineHeight.val(24);
    $baseLineHeight.attr('step', 1);
  } else {
    $baseLineHeight.val(1.5);
    $baseLineHeight.attr('step', 0.001);
  }

  validateEvents();
});

$typeScaleSelect.on('change', function (e) {
  e.stopPropagation();
  $typeScale.val($(this).val());
  validateEvents();
});

$typeScale.on('keyup change', function () {
  $typeScaleSelect.val(0);
});

$biggerFonts.on('change', function (e) {
  validateEvents();
});

validateEvents();
