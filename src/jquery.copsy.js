// copsy, input form validation for tipsy
// version 0.1.0
// (c) 2011 Fred Arnoux / f@farnoux.com
// released under the MIT license

(function($) {
  
  function extractKeys(object) {
    var keys = [];
    for(key in object) {
      keys.push(key);
    }
    return keys;
  }

  function Copsy(element, validators) {
    this.$element = $(element);
    this.validators = validators;
  }

  Copsy.prototype = {
    
    // return an error message if validation fails, false otherwise.
    validate: function() {
      if ($.fn.copsy.skip(this.$element)) {
        return false;
      }
      var v, args, value = this.$element.val();
      for each(v in this.validators) {
        args = (v.test.length == 2) ? [this.$element, value] : [value];
        if (!v.test.apply(null, args)) return v.message;
      }
      return false;
    }  
  };
  
  // Copsy jQuery plugin
  $.fn.copsy = function(options) {
    var $form = this, 
        $elements = $form.find(":input." + extractKeys($.fn.copsy.validators).join(",:input."));
        // $form.find(':input.required, :input.email, :input.numeric');

    // options = $.extend({}, $.fn.copsy.defaults, g);
    
    function getValidators(ele){
      var validators = [];
      // extract class attributes
      for each (var name in ele.attr('class').split(/\s+/)) {
        var v = getValidator(ele, name);
        if (v) validators.push(v);
      }
      return validators;
    }
    
    function getValidator(element, name) {
      // Is there selector-specific validators matching this name ?
      if (name in $.fn.copsy.specifics) {
        var specifics = $.fn.copsy.specifics[name];
        for(var selector in specifics) {
          if (element.is(selector)) return specifics[selector];
        }
      }
      // Otherwise inspect default validators
      if (name in $.fn.copsy.validators) {
        return $.fn.copsy.validators[name];
      }
      return undefined;
    }
    
    // Get the Copsy object corresponding to the element
    function get(ele){
      var c = $.data(ele, 'copsy');
      if (!c) {
        c = new Copsy(ele, getValidators(ele));
        $.data(ele, 'copsy', c);
      }
      return c;
    }
    
    function toggleTooltip(ele, message) {
      var tipsy = ele.tipsy(true);
      tipsy.options.title = function(){ return message; };
      message? tipsy.show() : tipsy.hide();
    }
    
    function toggleClass(ele, valid) {
      ele[(valid?'add':'remove')+'Class']('valid');
    }
    
    function validate() {
      var $element = $(this);
      
      // validate and get message if not valid
      var message = get($element).validate();
      
      // toggle tooltip
      toggleTooltip($element, message);
      
      // toggle input class
      toggleClass($element, !message);
      
      return !message;
    }
    
    function submit(){
      var valid = true;
      $elements.each(function() {
        valid = validate.apply(this) && valid;
      });
      return valid;
    }
    
    // Bind fields' trigger events
//    $fields.tooltip({trigger: 'manual'}).bind('focus blur change keyup', validate);
    $elements.tipsy({trigger: 'manual', gravity: 'w'});
    
    $elements.filter(':radio').bind('change', validate);
    $elements.not(':radio').bind('focus blur change keyup', validate);
    
    // Bind form submit
    $form.submit(submit);
    
    return this;
  };
  
  $.fn.copsy.defaults = {
  };
  
  $.fn.copsy.skip = function(element) {
    if (element.is(':hidden')) return true;
  };
  
  
  // 
  //  { <className> : 
  //    message: "validation message",
  //    test: function([element], value) {
  //      return ...;
  //    }
  //  }
  $.fn.copsy.validators = {
    required: {
      message: "Please, specify", test: function(value) {
        return value && value.length > 0;
      }
    },
    email: {
      message: "Please, enter a valid email", test: function(value) {
        return value.length < 1 || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
      }
    },
    numeric: {
      message: "Please, enter only numeric values (0-9)", test: function(value) {
        return value.length < 1 || /^\d+$/i.test(value);
      }
    }
  };
  
  $.fn.copsy.specifics = {
    required: { 
      'input:radio': {
        test: function(element, value) {
          return $('input[name='+ element.attr('name') +']:radio').is(':checked');
        }
      }
    }
  };
          
})(jQuery);