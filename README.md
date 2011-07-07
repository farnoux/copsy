Copsy is a jQuery plugin that performs html form validation.

## Dependencies

- [jQuery](http://jquery.com)
- [Tipsy](https://github.com/jaz303/tipsy) plugin for displaying validation messages.


## Usage

1. In the `<head>` of your document, link jQuery, Tipsy and Copsy:

  ```html
  <script src="/js/jquery.min.js"></script>
  <script src="/js/jquery.tipsy.js"></script>
  <script src="/js/jquery.copsy.js"></script>
  ```

2. Also link tipsy stylesheet so that tooltips display correctly:

  ```html
  <link href="css/tipsy.css" rel="stylesheet" media="screen">
  ```

3. Add some copsy-specific classname to your inputs to define the type of validation to perform. 

  ```html
  <form>
    <input type="text" class="required"><br>
    <input type="text" class="required email"><br>
  
    <input type="submit" value="Submit">
  </form>
  ```

4. Then when document's ready, initialize Copsy for your `<form>`:
  
  ```html
  <script>
    $(document).ready(function(){
      $('form').copsy();
    });
  </script>
  ```


