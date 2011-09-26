// Copsy, event-driven form validation for jQuery, using `$.Deferred`.
// Version 0.1
// (c) 2011 [Fred Arnoux](mailto:fred@farnoux.com)
// Released under the MIT license

(function ($) {

  //## Copsy object
  function Copsy(element, validators) {
    this.$element = $(element);
    this.validators = validators;
  }

  // Return the validator that didn't pass, `false` otherwise.
  Copsy.prototype.validate = function () {
    if ($.fn.copsy.skip(this.$element)) {
      return false;
    }

    var i, v, args, l = this.validators.length, value = this.$element.val();
    for (i = 0; i < l; i++) {
      v = this.validators[i];
      args = (v.test.length === 2) ? [this.$element, value] : [value];
      if (!v.test.apply(null, args)) {
        return v;
      }
    }
    return false;
  };
  
  //## Copsy jQuery plugin
  $.fn.copsy = function (options) {
    var $form = this, 
        options = $.extend({}, $.fn.copsy.defaults, options);

    function getValidator(element, name) {
      // Is there validators matching this `name` ?
      var test, v = $.fn.copsy.validators[name];
      if (!v) {
        return null;
      }

      // Iterate over validators of type `name`
      $.each(v, function (selector, fn) {
        if (element.is(selector)) {
          test = fn;
          return false; // Break the loop
        }
      });

      return { name: name, test: test };
    }
    
    function getValidators(element) {
      var classnames = element.attr('class');
      if(classnames === undefined) {
        return null;
      }
      return $.map(classnames.split(/\s+/), function (name) {
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
    
    // Validate a form input element
    function validate() {
      var element = $(this),
        // Validate element
        v = get(element).validate(),
        // Create a [Deferred object](http://api.jquery.com/category/deferred-object/) that wrap the validation result.
        promise = $.Deferred(function (dfd) {
          //* Deferred is rejected when validation fails.
          if (v) {
            dfd.reject(element, v.name);
          } 
          //* Or susccessfully resolved otherwise.
          else {
            dfd.resolve(element);
          }
        // Finally the [Promise object](http://api.jquery.com/deferred.promise/) of the Deferred is returned.
        }).promise();

      // Add validation handlers to Promise object
      $.each($.fn.copsy.handlers, function () {
        this(promise);
      });

      return !v;
    }
    
    // When form is submitted, validate all its elements.
    function submit() {
      var valid = true;
      for(var i = 0, l = options.trigger.length; i < l; i += 2) {
        $form.find(options.trigger[i]).each(function () {
          valid = validate.apply(this) && valid;
        });
      }
      return valid;
    }

    for(var i = 0, l = options.trigger.length; i < l; i += 2) {
      // Bind events that trigger validation.
      this.find(options.trigger[i]).bind(options.trigger[i+1], validate);
    }
    
    // Bind form submit
    $form.submit(submit);

    return this;
  };
  
  $.fn.copsy.skip = function (element) {
    if (element.is(':hidden')) {
      return true;
    }
  };
  
  //### Default configuration
  $.fn.copsy.defaults = {
    // Different selectors and their corresponding trigger events.
    trigger: [
      ':radio', 'change', 
      ':input:not(:radio):not(:submit)', 'blur change keyup'
    ]
  }

  // Array of available validator objects.
  $.fn.copsy.validators = {};
  // Array of validation handlers.
  $.fn.copsy.handlers = [];

  // Handy helper function to easily register new validators.
  // `id` is the unique id
  // `selector` is a CSS selector 
  $.fn.copsy.addValidator = function (id, selector, fn) {
    var v = $.fn.copsy.validators[id];
    if (!v) {
      $.fn.copsy.validators[id] = v = {};
    }
    v[selector] = fn;
  };

  // Handy helper function to add new validation handlers.
  // `fn` argument is a handler function that should accept a Promise object as unique argument.
  $.fn.copsy.addHandler = function (fn) {
    if ($.isFunction(fn) && fn.length === 1) {
      $.fn.copsy.handlers.push(fn);
    }
  };

})(jQuery);

//
//## Configuration
//
(function ($) {
  //
  //### Define validators
  //
  $.fn.copsy.addValidator("mandatory", "input.mandatory", function (value) {
    return value && value.length > 0;
  });

  $.fn.copsy.addValidator("numeric", "input.numeric", function (value) {
    return value.length < 1 || /^\d+$/i.test(value);
  });
  
  $.fn.copsy.addValidator("email", "input.email", function (value) {
    return value.length < 1 || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
  });

})(jQuery);