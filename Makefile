.PHONY: lint test

default: lint test

lint:
	find bin lib test -name "*.js" | xargs node_modules/jshint/bin/jshint

test:
	DEBUG=repl-sever node_modules/mocha/bin/mocha --reporter=spec --ui tdd
