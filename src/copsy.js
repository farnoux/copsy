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
    var self = this,
      length = self.validators.length,
      elementValue = self.$element.val(),
      // The final [Deferred object](http://api.jquery.com/category/deferred-object/) that wrap the result of the the whole validation process.
      dfd = $.Deferred();

    function test(i) {
      //* No more validators to test means all validators have been succesful. Final Deferred `dfd` is resolved.
      if (i >= length) {
        return dfd.resolve(self.$element);
      }

      var validator = self.validators[i],
        args = (validator.test.length === 2) ? [self.$element, elementValue] : [elementValue],
        promiseOrResult = validator.test.apply(null, args);

      $.when(promiseOrResult)
        //* Filter the succesful result and reject it in case it equals `false`.
        .pipe(function (result) {
          if (result === false) {
            return $.Deferred().reject();
          }
          return result;
        })
        //* Current validator failed, so no need to go further. Final Deferred `dfd` is rejected.
        .fail(function () {
          dfd.reject(self.$element, validator.id);
        })
        //* Current validator is successful, so test the next one.
        .done(function () {
          test(i + 1);
        });
    }

    // Start the validation test execution.
    test(0);

    // Finally return the Deferred's [Promise object](http://api.jquery.com/deferred.promise/).
    return dfd.promise();
  };

  //
  //## Plugin variables.

  // Default options.
  var defaults = {
    // Different selectors and their corresponding trigger events.
    trigger: [
      ':radio', 'change',
      ':input:not(:radio):not(:submit)', 'blur change keyup'
    ]
  },
    // Array of available validator objects.
    validators = {},
    // Array of validation handlers.
    handlers = [];


  //
  //## Plugin methods.

  // Return the validator object corresponding to `id` for the `element`.
  function getValidator(element, id) {
    // Is there validators matching this `id` ?
    var test, v = validators[id];
    if (!v) {
      return null;
    }

    // Iterate over validators of type `id`
    $.each(v, function (selector, fn) {
      if (element.is(selector)) {
        test = fn;
        return false; // Break the loop
      }
    });

    return { id: id, test: test };
  }

  // Return all validators to apply for the `element`.
  function getValidators(element) {
    element = $(element);
    var classnames = element.attr('class');
    if (classnames === undefined) {
      return null;
    }
    return $.map(classnames.split(/\s+/), function (name) {
      return getValidator(element, name) || null;
    });
  }

  // Lazy getter that return the Copsy object corresponding to the `element`.
  function get(element) {
    var c = $.data(element, 'copsy');
    if (!c) {
      c = new Copsy(element, getValidators(element));
      $.data(element, 'copsy', c);
    }
    return c;
  }

  // Handler to one or more events for an element.
  // It triggers validation for the target element (referenced as `this`).
  function validate() {
    // Get the Copsy object associated to the element. 
    // Start validation.
    // Get the returned promise.
    var promise = get(this).validate();

    // Apply validation handlers to the promise object
    $.each(handlers, function () {
      this(promise);
    });

    // Return `false` if validation has failed.
    return promise.isRejected();
  }

  //
  //## Copsy jQuery plugin
  $.fn.copsy = function (options) {
    if (options === true) {
      return get(this);
    }
    if (typeof options === 'string') {
      options = { trigger: options };
    }

    options = $.extend({}, defaults, options);

    //### Event Binding Options

    //* If some specific trigger events have been passed, bind validation to them.
    if (typeof options.trigger === 'string') {
      return this.bind(options.trigger, validate);
    }

    var i, l;

    //* Else apply default trigger events corresponding to the selector this element matches.
    for (i = 0, l = options.trigger.length; i < l; i += 2) {
      if (this.is(options.trigger[i])) {
        this.bind(options.trigger[i + 1], validate);
        break;
      }
    }

    return this;
  };

  $.copsy = {
    // Handy helper function to easily register new validators.
    // `id` is the unique id.
    // `selector` is a CSS selector.
    // `fn` is the test function.
    addValidator : function (id, selector, fn) {
      var v = validators[id];
      if (!v) {
        validators[id] = v = {};
      }
      v[selector] = fn;
    },
    // Handy helper function to add new validation handlers.
    // `fn` argument is a handler function that should accept a Promise object as unique argument.    
    addHandler : function (fn) {
      if ($.isFunction(fn) && fn.length === 1) {
        handlers.push(fn);
      }
    }
  };

})(jQuery);