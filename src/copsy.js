// Copsy, event-driven form validation for jQuery, using `$.Deferred`.
// Version 0.2
// (c) 2012 [Fred Arnoux](mailto:fred@farnoux.com)
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
      // The final [Deferred object](http://api.jquery.com/category/deferred-object/) that wrap the result of the whole validation process.
      dfd = $.Deferred();

    function test(i) {
      //* No more validators to test means all validators have been succesful. Final Deferred `dfd` is resolved.
      if (i >= length) {
        return dfd.resolve(self.$element);
      }

      var validator = self.validators[i],
        args = (validator.fn.length === 2) ? [self.$element, elementValue] : [elementValue],
        promiseOrResult = validator.fn.apply(null, args);

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
    ],
    // By default get the validator ids for an element from its class attribute.
    getValidatorIds: function (element) {
      var classnames = element.attr('class');
      return classnames ? classnames.split(/\s+/) : undefined;
    }
  },
    // Array of available validator objects.
    validators = {},
    // Array of validation handlers.
    handlers = [];


  //
  //## Plugin methods.

  // Return the validator object corresponding to `id`.
  function getValidator(id) {
    return validators[id] || null;
  }

  // Return validators corresponding to the list of `ids`.
  function getValidators(ids) {
    return $.map(ids, function (id) {
      return getValidator(id);
    });
  }

  // Lazy getter that return the Copsy object corresponding to the `element`.
  function getCopsy(element, options) {
    var c = $.data(element, 'copsy');
    if (!c) {
      var ids = options.getValidatorIds($(element));
      c = new Copsy(element, getValidators(ids));
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
    var promise = getCopsy(this).validate();

    // Apply validation handlers to the promise object
    $.each(handlers, function () {
      this(promise);
    });

    // Return `false` if validation has failed.
    return promise.isRejected();
  }

  //
  //## Copsy jQuery plugin
  $.fn.copsy = function (noBinding, options) {
    // We can skip the `noBinding` parameter by directly passing the options.
    if (typeof noBinding !== 'boolean') {
      options = noBinding;
    }

    // If `options` is a string, assume it's the `trigger` parameter.
    if (typeof options === 'string') {
      options = { trigger: options };
    }
    // If `options` is a function, assume it's the `getValidatorIds` parameter.
    else if (typeof options === 'function') {
      options = { getValidatorIds: options };
    }

    options = $.extend({}, defaults, options);

    // If `noBinding` is true, don't bind events on matching elements,
    // but directly return their associated Copsy objects.
    if (noBinding === true) {
      return this.map(function () {
        return getCopsy(this, options);
      });
    }

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

  $.copsy = $.extend({}, {
    // Handy helper function to easily register new validators.
    // `id` is the unique id of this validator.
    // `fn` is the associated validation function.
    addValidator : function (id, fn) {
      validators[id] = { id: id, fn: fn };
    },
    // Handy helper function to add new validation handlers.
    // `fn` argument is a handler function that should accept a Promise object as unique argument.    
    addHandler : function (fn) {
      if ($.isFunction(fn) && fn.length === 1) {
        handlers.push(fn);
      }
    }
  });

})(jQuery);