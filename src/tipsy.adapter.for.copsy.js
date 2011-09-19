(function ($) {
  //
  // Add validation handlers to enable Tipsy tooltips.
  // `validation` represent a Promise object.
  //
  $.fn.copsy.addHandler(function (validation) {
    // Hide tooltip when validation pass
    validation.done(function (element) {
      var t = element.tipsy(true);
      if (t) {
        t.hide();
      }
    })
    // Show tooltip when validation fail
    .fail(function (element, id) {
      var t = element.tipsy(true);
      if (!t) {
        element.tipsy({trigger: 'manual', gravity: 'w'});
        t = element.tipsy(true);
      }
      t.options.title = function () {
        return $.fn.copsy.message[id];
      };
      t.show();
    });
  });

})(jQuery);