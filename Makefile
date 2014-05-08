compress-pyret:
	gzip -9 node_modules/pyret-lang/build/phase0/pyret.js -c > src/web/pyret.js.gz

TEACHPACK_ARR := $(patsubst teachpacks/%.arr,src/web/teachpacks/%.js,$(wildcard teachpacks/*.arr))
TEACHPACK_JS := $(patsubst teachpacks/%.js,src/web/teachpacks/%.js,$(wildcard teachpacks/*.js))

src/web/teachpacks/%.js: teachpacks/%.arr
	node node_modules/pyret-lang/build/phase0/main-wrapper.js \
    --dialect Bootstrap \
    --compile-module-js $< > $@

src/web/teachpacks/%.js: teachpacks/%.js
	cp $< $@

TEACHPACK_STATIC := $(patsubst teachpacks/static/%,src/web/teachpacks/static/%,$(wildcard teachpacks/static/*))

src/web/teachpacks/static/%: teachpacks/static/%
	cp $< $@

teachpack-dir:
	mkdir -p src/web/teachpacks
	mkdir -p src/web/teachpacks/static

.PHONY : teachpacks
teachpacks: teachpack-dir $(TEACHPACK_ARR) $(TEACHPACK_JS) $(TEACHPACK_STATIC)

db:
	node node_modules/db-migrate/bin/db-migrate up


.PHONY : post-install
post-install: compress-pyret teachpacks db

install-link:
	npm link pyret-lang

test:
	foreman run node node_modules/jasmine-node/lib/jasmine-node/cli.js --matchall test/db

selenium-test-local:
	TEST_LOC="local" foreman run node node_modules/jasmine-node/lib/jasmine-node/cli.js test/browser/
selenium-test-sauce:
	TEST_LOC="sauce" node node_modules/jasmine-node/lib/jasmine-node/cli.js test/browser/

migrate:
	foreman run node node_modules/db-migrate/bin/db-migrate up

sqlgen:
	node node_modules/sql-generate/bin/node-sql-generate --dsn $(DATABASE_URL) > src/schema.js 

