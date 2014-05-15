compress-pyret:
	gzip -9 node_modules/pyret-lang/build/phase0/pyret.js -c > src/web/pyret.js.gz

.PHONY : post-install
post-install: compress-pyret

install-link:
	npm link pyret-lang

.PHONY : selenium-test-local
selenium-test-local:
	TEST_LOC="local" node node_modules/jasmine-node/lib/jasmine-node/cli.js test/browser/

.PHONY : selenium-test-sauce
selenium-test-sauce:
	TEST_LOC="sauce" node node_modules/jasmine-node/lib/jasmine-node/cli.js test/browser/


OUT_HTML := $(patsubst src/web/%.template.html,build/web/%.html,$(wildcard src/web/*.template.html))

build/web/%.html: src/web/%.template.html
	node make.js $< > $@

COPY_HTML := $(patsubst src/web/%.html,build/web/%.html,$(wildcard src/web/*.html))

build/web/%.html: src/web/%.html
	cp $< > $@

OUT_CSS := $(patsubst src/web/%.template.css,build/web/%.css,$(wildcard src/web/*.template.css))

build/web/%.css: src/web/%.template.css
	node make.js $< > $@

COPY_CSS := $(patsubst src/web/%.css,build/web/%.css,$(wildcard src/web/*.css))

build/web/%.html: src/web/%.html
	cp $< > $@

COPY_JS := $(patsubst src/web/js/%.html,build/web/js/%.js,$(wildcard src/web/*.js))

build/web/js/%.js: src/web/%.js
	cp $< > $@

WEB = "build/web"
WEBJS = "build/web/js"
WEBCSS = "build/web/css"

$(WEB):
	mkdir -p $(WEB)

$(WEBJS):
	mkdir -p $(WEBJS)

$(WEBCSS):
	mkdir -p $(WEBCSS)

web: $(WEB) $(WEBJS) $(WEBCSS) $(OUT_HTML) $(COPY_HTML) $(OUT_CSS) $(COPY_CSS) $(COPY_JS)

