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
	foreman run migrate

.PHONY : post-install
post-install: compress-pyret teachpacks db

install-link:
	npm link pyret-lang

