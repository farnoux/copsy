// copsy, input form validation for tipsy
// version 0.1.0
// (c) 2011 Fred Arnoux / f@farnoux.com
// released under the MIT license

(function ($) {
  
  function getKeys(object) {
    return $.map(object, function (v, k) {
      return k;
    });
  }

  function Copsy(element, validators) {
    this.$element = $(element);
    this.validators = validators;
  }

  Copsy.prototype = {
    
    // return an error message if validation fails, false otherwise.
    validate: function () {
      if ($.fn.copsy.skip(this.$element)) {
        return false;
      }
      var i, v, args, value = this.$element.val();
      for (i = 0; i < this.validators.length; i++) {
        v = this.validators[i];
        args = (v.test.length === 2) ? [this.$element, value] : [value];
        if (!v.test.apply(null, args)) {
          return v.message;
        }
      }
      return false;
    }
  };
  
  // Copsy jQuery plugin
  $.fn.copsy = function (handler) {
    var $form = this, 
        $elements = $form.find(":input." + getKeys($.fn.copsy.validators).join(",:input."));
        // $form.find(':input.required, :input.email, :input.numeric');

    if (handler) {
      $.fn.copsy.addHandler(handler);
    }

    function getValidator(element, name) {
      // Is there selector-specific validators matching this name ?
      if ($.fn.copsy.specifics[name] !== undefined) {
        var selector, specifics = $.fn.copsy.specifics[name];
        for (selector in specifics) {
          if (element.is(selector)) {
            return specifics[selector];
          }
        }
      }
      // Otherwise return default validators if exist, else undefined
      return $.fn.copsy.validators[name];
    }
    
    function getValidators(element) {
      // extract class attributes
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
    
    function validate() {
      var element = $(this),
        // Validate element
        message = get(element).validate(),
        // Create Promise object with the result of the validation
        promise = $.Deferred(function (dfd) {
          if (message === false) {
            dfd.resolve(element);
          } else {
            dfd.reject(element, message);
          }
        }).promise();

      // Add validation handlers to Promise object
      $.each($.fn.copsy.handlers, function () {
        this(promise);
      });

      return !message;
    }
    
    // On form submit, validate all form elements
    function submit() {
      var valid = true;
      $elements.each(function () {
        valid = validate.apply(this) && valid;
      });
      return valid;
    }
    
    // Bind fields' trigger events    
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
  
  
  function validator(message, fn) {
    return { message: message, test: fn };
  }

  // 
  //  { <className> : 
  //    message: "validation message",
  //    test: function([element,] value) {
  //      return ...;
  //    }
  //  }
  $.fn.copsy.validators = {
    "required" : validator("Please, specify", function (value) {
      return value && value.length > 0;
    }),
    "email" : validator("Please, enter a valid email", function (value) {
      return value.length < 1 || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
    }),
    "numeric" : validator("Please, enter only numeric values (0-9)", function (value) {
      return value.length < 1 || /^\d+$/i.test(value);
    })
  };
  
  $.fn.copsy.specifics = {
    required: { 
      'input:radio': {
        test: function (element, value) {
          return $('input[name=' + element.attr('name') + ']:radio').is(':checked');
        }
      }
    }
  };

  // Array of validation handlers defining validation behavior
  $.fn.copsy.handlers = [];
  
  // Handy helper function to add new validation handlers.
  // <fn> argument is a handler function that should accept a Promise object as unique argument.
  $.fn.copsy.addHandler = function (fn) {
    if ($.isFunction(fn) && fn.length === 1) {
      $.fn.copsy.handlers.push(fn);
    }
  };


  //
  // Add validation handlers to enable Tipsy tooltips.
  // <validation> represent a validation Promise object.
  //
  $.fn.copsy.addHandler(function (validation) {
    // Hide tooltip when validation pass
    validation.done(function (element) {
      var t = element.tipsy(true);
      if (t !== undefined) {
        t.hide();
      }
    })
    // Show tooltip when validation fail
    .fail(function (element, message) {
      var tipsy = element.tipsy(true);
      if (tipsy === undefined) {
        element.tipsy({trigger: 'manual', gravity: 'w'});
        tipsy = element.tipsy(true);
      }
      tipsy.options.title = function () {
        return message;
      };
      tipsy.show();
    });
  });

})(jQuery);