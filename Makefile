.PHONY: lint test

default: test

lint:
	find bin lib test -name "*.js" | xargs node_modules/jshint/bin/jshint --verbose

test: lint
	node_modules/mocha/bin/mocha --reporter=spec --ui tdd

# This rule should only be executed manually. Do not add it to default or test targets.
expected: test/data/*.expected

test/data/%.expected : test/data/%.txt
	bin/gremlin-repl.js < $< > $@

