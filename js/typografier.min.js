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
  $baseLineHeight = $('#base-line-height'),
  $typeScale = $('#type-scale'),
  $controls = $('#controls'),
  $output = $('#output'),

  templates = {
    base: $('#css-base').html(),
    element: $('#css-element').html()
  },

  validateEvents = function validateEvents () {
    if ($baseFontSize.val() && $baseLineHeight.val() && $typeScale.val()) {
      prepareCSS($baseFontSize.val(), $baseLineHeight.val(), $typeScale.val());
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
          .replace('{{base-font-size-px}}', baseFontSize)
          .replace('{{base-line-height-px}}', baseLineHeight)
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
