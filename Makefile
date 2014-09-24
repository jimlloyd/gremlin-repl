.PHONY: lint test

default: test

lint:
	find bin lib test -name "*.js" | xargs node_modules/jshint/bin/jshint --verbose

test: lint
	node_modules/mocha/bin/mocha --reporter=spec --ui tdd
