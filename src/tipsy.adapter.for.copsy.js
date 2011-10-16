(function ($) {
  //
  // Add validation handlers to enable Tipsy tooltips.
  // `promise` represent a Promise object.
  //
  $.copsy.addHandler(function (promise) {
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
        var reg = /%/;
        return $.copsy.messages[id].replace(reg, element.val());
      };
      t.show();
    });
  });
  
  //
  //### Define validation messages
  //
  $.copsy.messages = {
    mandatory : "Please, specify",
    email : "Please, enter a valid email",
    numeric : "Please, enter only numeric values (0-9)",
    is_github_user: "User '%' doesn't exist..."
  };

})(jQuery);