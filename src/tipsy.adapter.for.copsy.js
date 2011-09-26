(function ($) {
  //
  // Add validation handlers to enable Tipsy tooltips.
  // `promise` represent a Promise object.
  //
  $.fn.copsy.addHandler(function (promise) {
    // Hide tooltip when validation pass
    promise.done(function (element) {
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