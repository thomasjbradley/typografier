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
  $controls = $('#controls'),
  $output = $('#output'),

  templates = {
    base: $('#css-base').html(),
    element: $('#css-element').html()
  },

  validateEvents = function validateEvents () {
    var baseFontSize = Math.round(($fontSizeUnitPx.is(':checked')) ? $baseFontSize.val() : $baseFontSize.val() * 16 / 100),
      baseLineHeight = Math.round(($lineHeightUnitPx.is(':checked')) ? $baseLineHeight.val() : baseFontSize * $baseLineHeight.val());

    if ($baseFontSize.val() && $baseLineHeight.val() && $typeScale.val()) {
      prepareCSS(baseFontSize, baseLineHeight, $typeScale.val());
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

  prepareCSS = function prepareCSS (baseFontSize, baseLineHeight, typeScale) {
    var fontSize = (baseFontSize / 16) * 100,
      lineHeight = baseLineHeight / baseFontSize,
      css = [
        templates.base
          .replace('{{base-font}}', fontSize)
          .replace(/\{\{base\-line\-height\}\}/g, lineHeight)
          .replace('{{line-height-half}}', (lineHeight / 2).toFixed(4))
          .replace('{{line-height-double}}', (lineHeight * 2).toFixed(4))
      ];

    sizes.forEach(function (elem, index, arr) {
      var vals = calculateValues(baseFontSize, baseLineHeight, typeScale, sizes[index].power);
      css.push(
        templates.element
          .replace('{{selectors}}', sizes[index].sel.join(', '))
          .replace('{{font-size}}', vals.fontSize.toFixed(4))
          .replace('{{line-height}}', vals.lineHeight.toFixed(4))
      );
    });

    $output.html(css.join(''));
  };

$controls.on('keyup change submit', function (e) {
  e.preventDefault();
  validateEvents();
});

$('#type-scale-select').on('change', function (e) {
  e.stopPropagation();
  $typeScale.val($(this).val());
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

validateEvents();
