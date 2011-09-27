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

    var v, args,
      i = 0,
      l = this.validators.length,
      value = this.$element.val(),
      // Create a [Deferred object](http://api.jquery.com/category/deferred-object/) that wrap the validation result.
      dfd = $.Deferred();
    
    for (; i < l; i++) {
      v = this.validators[i];
      args = (v.test.length === 2) ? [this.$element, value] : [value];
      
      //* Deferred is rejected if validation fails.
      if (!v.test.apply(null, args)) {
        dfd.reject(this.$element, v.name);
        break;
      }
    }

    //* Or successfully resolved otherwise.
    if (!dfd.isRejected()) {
      dfd.resolve(this.$element);
    }
    
    // Finally the [Promise object](http://api.jquery.com/deferred.promise/) of the Deferred is returned.
    return dfd.promise();
  };
  
  //## Copsy jQuery plugin
  $.fn.copsy = function (options) {
    if (options === true) {
      return get(this);
    }
    if (typeof options === 'string') {
      options = { trigger: options };
    }
    
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
      element = $(element);
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

    function validate() {
      // Validate element
      var promise = get(this).validate();
  
      // Add validation handlers to Promise object
      $.each($.fn.copsy.handlers, function () {
        this(promise);
      });
      
      // Return `false` if validation has failed.
      return promise.isRejected();
    }
    
    // If some trigger events have been passed, bind validation to them.
    if (typeof options.trigger === 'string') {
      return this.bind(options.trigger, validate);
    }
    
    // Else apply default trigger events.
    for (var i = 0, l = options.trigger.length; i < l; i += 2) {
      if(this.is(options.trigger[i])) {
        this.bind(options.trigger[i+1], validate);
        break;
      }
    }
    
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