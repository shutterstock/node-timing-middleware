install:
	npm install

clean:
	rm -rf node_modules

test:
	./node_modules/.bin/mocha -R list --recursive spec/

testwatch:
	./node_modules/.bin/mocha -w -R list --recursive spec/

.PHONY: install clean test testwatch
