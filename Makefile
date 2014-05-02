compress-pyret:
	gzip -9 node_modules/pyret-lang/build/phase0/pyret.js -c > src/web/pyret.js.gz

TEACHPACK_JS := $(patsubst teachpacks/%.arr,src/web/teachpacks/%.js,$(wildcard teachpacks/*.arr))

src/web/teachpacks/%.js: teachpacks/%.arr
	node node_modules/pyret-lang/build/phase0/main-wrapper.js \
    --dialect Bootstrap \
    --compile-module-js $< > $@

teachpack-dir:
	mkdir -p src/web/teachpacks

.PHONY : teachpacks
teachpacks: teachpack-dir $(TEACHPACK_JS)

install-link:
	npm link pyret-lang

