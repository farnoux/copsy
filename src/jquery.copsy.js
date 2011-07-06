// copsy, input form validation for tipsy
// version 0.1.0
// (c) 2011 Fred Arnoux / f@farnoux.com
// released under the MIT license

(function($) {
  
  function Validator(message, validate) {
    this.message = message;
    this.validate = validate || function(field, value){return true;};
  }
    
  Validator.prototype = {
//    trigger: 'focus blur change keyup',
  };
  
  function Field(input, validators){
    this.input = input;
    this.validators = validators;
  }
  
  Field.prototype = {
    // return an error message if validation fails, false otherwise.
    validate: function() {
      var validator, valid = true, value = this.input.val();
      $.each(this.validators, $.proxy(function(i, v){
        validator = v;
        // break if non valid (false value), otherwise continue (non-false value)
        return valid = v.validate(this.input, value);
      }, this));
      return valid ? false : validator.message;
    }  
  };
  
  
  // Copsy jQuery plugin
  ////////////////////////////////////////////////////////////////////////////////
  $.fn.copsy = function(options){
    options = $.extend({}, $.fn.copsy.defaults, options);
    var $form = this, $fields = $form.find(':input.required, :input.email');
    
    function get_validators(ele){
      var v = [];
      // extract class attributes
      $.each(ele.attr('class').split(/\s+/), function(){
        (this in options.validators) && v.push(options.validators[this]);
      });
      return v;
    }
    
    // Get the Field corresponding to the element
    function get(ele){
      var f = $.data(ele, 'field-validator');
      if (!f) {
        f = new Field(ele, get_validators(ele));
        $.data(ele, 'field-validator', f);
      }
      return f;
    }
    
    function toggle_tooltip(ele, message){
      var tipsy = ele.tipsy(true);
      tipsy.options.title = function(){return message;};
      message? tipsy.show() : tipsy.hide();
    }
    
    function toggle_class(ele, valid){
      ele[(valid?'add':'remove')+'Class']('valid');
    }
    
    function validate(){
      var $input = $(this);
      if($input.is(':hidden')) return true;
      
      // validate and get message if not valid
      var message = get($input).validate();
      
      // toggle tooltip
      toggle_tooltip($input, message);
      
      // toggle input class
      toggle_class($input, !message);
      
      return !message;
    }
    
    function submit(){
      var valid = true;
      $fields.each(function(){
        valid = validate.apply(this) && valid;
      });
      return valid;
    }
    
    // Bind fields' trigger events
//    $fields.tooltip({trigger: 'manual'}).bind('focus blur change keyup', validate);
    $fields.tipsy({trigger: 'manual', gravity: 'w'});
    
    $fields.filter(':radio').bind('change', validate);
    $fields.not(':radio').bind('focus blur change keyup', validate);
    
    // Bind form submit
    $form.submit(submit);
    
    return this;
  };
  
  $.fn.copsy.defaults = {
    
  };
  
  $.fn.copsy.defaults.validators = {
    
    required: new Validator("Please, specify", function(field, value){
      if(field.is('input:radio')) return $('input[name='+ field.attr('name') +']:radio').is(':checked');
//    if(field.is('input:radio')) return field.is(':checked');
      return value.length > 0;
    }),
    
    email: new Validator("Please, enter a valid email", function(field, v){
      return v.length < 1 || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(v);
    }),
    
    numeric: new Validator("Please, enter only numeric values (0-9)", function(field, v){
      return v && /^\d+$/i.test(v);
    })
  };
          
})(jQuery);