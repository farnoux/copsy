// copsy, input form validation for tipsy
// version 0.1.0
// (c) 2011 Fred Arnoux / fred@farnoux.com
// released under the MIT license

(function ($) {

  function Copsy(element, validators) {
    this.$element = $(element);
    this.validators = validators;
  }

  // Return the validator that didn't pass, false otherwise.
  Copsy.prototype.validate = function () {
    if ($.fn.copsy.skip(this.$element)) {
      return false;
    }

    var i, v, args, value = this.$element.val();
    for (i = 0; i < this.validators.length; i++) {
      v = this.validators[i];
      args = (v.test.length === 2) ? [this.$element, value] : [value];
      if (!v.test.apply(null, args)) {
        return v;
      }
    }
    return false;
  };
  
  // Copsy jQuery plugin
  $.fn.copsy = function (handler) {
    var $form = this, 
      $elements = $form.find(":input");
    
    if (handler) {
      $.fn.copsy.addHandler(handler);
    }

    function getValidator(element, name) {
      // Is there validators matching this <name> ?
      var test, v = $.fn.copsy.validators[name];
      if (!v) {
        return null;
      }

      // Iterate over validators of type <name>
      $.each(v, function (selector, fn) {
        if (element.is(selector)) {
          test = fn;
          return false; // Break the loop
        }
      });

      return { name : name, test : test };
    }
    
    function getValidators(element) {
      return $.map(element.attr('class').split(/\s+/), function (name) {
        return getValidator(element, name) || null;
      });
    }

    // Get the Copsy object corresponding to the element
    function get(ele) {
      var c = $.data(ele, 'copsy');
      if (!c) {
        c = new Copsy(ele, getValidators(ele));
        $.data(ele, 'copsy', c);
      }
      return c;
    }
    
    // Validate a form element
    function validate() {
      var element = $(this),
        v = get(element).validate(),  // Validate element
        promise = $.Deferred(function (dfd) { // Create Promise object with the result of the validation
          if (v) {
            dfd.reject(element, $.fn.copsy.message[v.name]);
          } else {
            dfd.resolve(element);
          }
        }).promise();

      // Add validation handlers to Promise object
      $.each($.fn.copsy.handlers, function () {
        this(promise);
      });

      return !v;
    }
    
    // On form submit, validate all form elements
    function submit() {
      var valid = true;
      $elements.each(function () {
        valid = validate.apply(this) && valid;
      });
      return valid;
    }

    // Bind fields' events
    // TODO: put this in $.fn.copsy.defaults options
    $elements.filter(':radio').bind('change', validate);
    $elements.not(':radio').bind('focus blur change keyup', validate);
    
    // Bind form submit
    $form.submit(submit);

    return this;
  };
  
  $.fn.copsy.skip = function (element) {
    if (element.is(':hidden')) {
      return true;
    }
  };

  $.fn.copsy.validators = {}; // Array of available validators
  $.fn.copsy.handlers = [];   // Array of validation handlers

  // Handy helper function to easily add new validators
  // <id> - the unique id
  // <selector> - 
  $.fn.copsy.addValidator = function (id, selector, fn) {
    var v = $.fn.copsy.validators[id];
    if (!v) {
      $.fn.copsy.validators[id] = v = {};
    }
    v[selector] = fn;
  };

  // Handy helper function to add new validation handlers.
  // <fn> argument is a handler function that should accept a Promise object as unique argument.
  $.fn.copsy.addHandler = function (fn) {
    if ($.isFunction(fn) && fn.length === 1) {
      $.fn.copsy.handlers.push(fn);
    }
  };

  /////////////////////////////////////////////////////////////////////////////
  // Add validation handlers to enable Tipsy tooltips.
  // <validation> represent a validation Promise object.
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
    .fail(function (element, message) {
      var t = element.tipsy(true);
      if (!t) {
        element.tipsy({trigger: 'manual', gravity: 'w'});
        t = element.tipsy(true);
      }
      t.options.title = function () {
        return message;
      };
      t.show();
    });
  });


  /////////////////////////////////////////////////////////////////////////////
  // Define some validators
  $.fn.copsy.addValidator("mandatory", "input.mandatory", function (value) {
    return value && value.length > 0;
  });

  $.fn.copsy.addValidator("numeric", "input.numeric", function (value) {
    return value.length < 1 || /^\d+$/i.test(value);
  });
  
  $.fn.copsy.addValidator("email", "input.email", function (value) {
    return value.length < 1 || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
  });

  /////////////////////////////////////////////////////////////////////////////
  // Define corresponding validation messages
  $.fn.copsy.message = {
    mandatory : "Please, specify",
    email : "Please, enter a valid email",
    numeric : "Please, enter only numeric values (0-9)"
  };
  

})(jQuery);