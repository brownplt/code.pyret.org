# NOTE: Needs TWO blank lines here, dunno why
define \n


endef
ifneq ($(findstring .exe,$(SHELL)),)
	override SHELL:=$(COMSPEC)$(ComSpec)
	MKDIR = $(foreach dir,$1,if not exist "$(dir)". (md "$(dir)".)$(\n))
	RMDIR = $(foreach dir,$1,if exist "$(dir)". (rd /S /Q "$(dir)".)$(\n))
	RM = if exist "$1". (del $1)
else
	MKDIR = mkdir -p $1
	RMDIR = rm -rf $1
	RM = rm -f $1
endif


build/web/js/pyret.js.gz: node_modules/pyret-lang/build/phase0/pyret.js
	gzip -9 node_modules/pyret-lang/build/phase0/pyret.js -c > build/web/js/pyret.js.gz
	touch build/web/js/pyret.js

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
	node make-template.js $< > $@

COPY_HTML := $(patsubst src/web/%.html,build/web/%.html,$(wildcard src/web/*.html))

build/web/%.html: src/web/%.html
	cp $< $@

OUT_CSS := $(patsubst src/web/%.template.css,build/web/%.css,$(wildcard src/web/css/*.template.css))

build/web/css/%.css: src/web/css/%.template.css
	node make-template.js $< > $@

COPY_CSS := $(patsubst src/web/%.css,build/web/%.css,$(wildcard src/web/css/*.css))

build/web/css/%.css: src/web/css/%.css
	cp $< $@

build/web/css/codemirror.css: lib/CodeMirror/lib/codemirror.css
	cp $< $@

MISC_CSS = build/web/css/codemirror.css

COPY_GIF := $(patsubst src/web/img/%.gif,build/web/img/%.gif,$(wildcard src/web/img/*.gif))

build/web/img/%.gif: src/web/img/%.gif
	cp $< $@

COPY_JS := $(patsubst src/web/js/%.js,build/web/js/%.js,$(wildcard src/web/js/*.js))

build/web/js/%.js: src/web/js/%.js
	cp $< $@

build/web/js/q.js: node_modules/q/q.js
	cp $< $@

build/web/js/s-expression-lib.js: node_modules/s-expression/index.js
	cp $< $@

build/web/js/seedrandom.js: node_modules/seedrandom/seedrandom.js
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

MISC_JS = build/web/js/q.js build/web/js/url.js build/web/js/require.js build/web/js/codemirror.js build/web/js/matchbrackets.js build/web/js/pyret-mode.js build/web/js/s-expression-lib.js build/web/js/seedrandom.js

MISC_IMG = build/web/img/pyret-icon.png build/web/img/pyret-logo.png build/web/img/pyret-spin.gif build/web/img/up-arrow.png build/web/img/down-arrow.png

build/web/img/%: node_modules/pyret-lang/img/%
	cp $< $@


WEB = build/web
WEBJS = build/web/js
WEBCSS = build/web/css
WEBIMG = build/web/img

$(WEB):
	@$(call MKDIR,$(WEB))

$(WEBJS):
	@$(call MKDIR,$(WEBJS))

$(WEBCSS):
	@$(call MKDIR,$(WEBCSS))

$(WEBIMG):
	@$(call MKDIR,$(WEBIMG))

web: $(WEB) $(WEBJS) $(WEBCSS) $(WEBIMG) $(OUT_HTML) $(COPY_HTML) $(OUT_CSS) $(COPY_CSS) $(COPY_JS) $(COPY_GIF) build/web/js/pyret.js.gz $(MISC_JS) $(MISC_CSS) $(MISC_IMG)

