build/web/js/pyret.js.gz: node_modules/pyret-lang/build/phase0/pyret.js
	gzip -9 node_modules/pyret-lang/build/phase0/pyret.js -c > build/web/js/pyret.js.gz

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
	cp $< $@

OUT_CSS := $(patsubst src/web/%.template.css,build/web/%.css,$(wildcard src/web/css/*.template.css))

build/web/css/%.css: src/web/css/%.template.css
	node make.js $< > $@

COPY_CSS := $(patsubst src/web/%.css,build/web/%.css,$(wildcard src/web/css/*.css))

build/web/css/%.css: src/web/css/%.css
	cp $< $@

build/web/css/codemirror.css: lib/CodeMirror/lib/codemirror.css
	cp $< $@

MISC_CSS = build/web/css/codemirror.css

COPY_JS := $(patsubst src/web/js/%.js,build/web/js/%.js,$(wildcard src/web/js/*.js))

build/web/js/%.js: src/web/js/%.js
	cp $< $@

build/web/js/q.js: node_modules/q/q.js
	cp $< $@

build/web/js/url.js: node_modules/url.js/url.js
	cp $< $@

build/web/js/require.js: node_modules/requirejs/require.js
	cp $< $@

build/web/js/codemirror.js: lib/CodeMirror/lib/codemirror.js
	cp $< $@

build/web/js/matchbrackets.js: lib/CodeMirror/addon/edit/matchbrackets.js
	cp $< $@

build/web/js/pyret-mode.js: lib/CodeMirror/mode/pyret/pyret.js
	cp $< $@

MISC_JS = build/web/js/q.js build/web/js/url.js build/web/js/require.js build/web/js/codemirror.js build/web/js/matchbrackets.js build/web/js/pyret-mode.js

MISC_IMG = build/web/img/pyret-logo.png build/web/img/pyret-spin.gif build/web/img/up-arrow.png build/web/img/down-arrow.png

build/web/img/%: node_modules/pyret-lang/img/%
	cp $< $@


WEB = "build/web"
WEBJS = "build/web/js"
WEBCSS = "build/web/css"
WEBIMG = "build/web/img"

$(WEB):
	mkdir -p $(WEB)

$(WEBJS):
	mkdir -p $(WEBJS)

$(WEBCSS):
	mkdir -p $(WEBCSS)

$(WEBIMG):
	mkdir -p $(WEBIMG)

web: $(WEB) $(WEBJS) $(WEBCSS) $(WEBIMG) $(OUT_HTML) $(COPY_HTML) $(OUT_CSS) $(COPY_CSS) $(COPY_JS) build/web/js/pyret.js.gz $(MISC_JS) $(MISC_CSS) $(MISC_IMG)

