# npm install uglify-js -g
default:
	uglifyjs -o src/copsy.min.js src/copsy.js
	
doc:
	docco src/copsy.js

jekyll:
	jekyll --server --auto

jekyll&:
	jekyll --server --auto &

sass:
	sass _sass/screen.scss css/screen.css --style=compressed

sass-watch:
	sass _sass/screen.scss:css/screen.css --watch --style=compressed


compass:
	compass compile --sass-dir=_sass --css-dir=css --output-style=compressed --force

wompass:
	compass watch --sass-dir=_sass --css-dir=css --output-style=expanded

dev: jekyll& wompass
