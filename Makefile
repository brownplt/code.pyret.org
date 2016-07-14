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

CM=node_modules/codemirror
CPOMAIN=build/web/js/cpo-main.jarr
CPOGZ=build/web/js/cpo-main.jarr.gz.js
CPOIDEHOOKS=build/web/js/cpo-ide-hooks.jarr
PHASEA=pyret/build/phaseA/pyret.jarr

.PHONY : post-install
post-install: compress-pyret

install-link:
	npm link pyret-lang

.PHONY : selenium-test-local
selenium-test-local:
	TEST_LOC="local" node test/test.js test/browser

.PHONY : selenium-test-sauce
selenium-test-sauce:
	TEST_LOC="sauce" node test/test.js test/browser/pyret

OUT_HTML := $(patsubst src/web/%.template.html,build/web/views/%.html,$(wildcard src/web/*.template.html))

build/web/views/%.html: src/web/%.template.html
	node make-template.js $< > $@

COPY_HTML := $(patsubst src/web/%.html,build/web/views/%.html,$(wildcard src/web/*.html))

build/web/views/%.html: src/web/%.html
	cp $< $@

OUT_CSS := $(patsubst src/web/%.template.css,build/web/%.css,$(wildcard src/web/css/*.template.css))

build/web/css/%.css: src/web/css/%.template.css
	node make-template.js $< > $@

COPY_CSS := $(patsubst src/web/%.css,build/web/%.css,$(wildcard src/web/css/*.css))

build/web/css/%.css: src/web/css/%.css
	cp $< $@

COPY_NEW_CSS := $(patsubst src/web/%.css,build/web/%.css,$(wildcard src/web/neweditor/css/*.css))

build/web/neweditor/css/%.css: src/web/neweditor/css/%.css
	cp $< $@

COPY_NEW_JS := $(patsubst src/web/%.js,build/web/%.js,$(wildcard src/web/neweditor/js/*.js))

build/web/neweditor/js/%.js: src/web/neweditor/js/%.js
	cp $< $@

build/web/css/codemirror.css: $(CM)/lib/codemirror.css
	cp $< $@

MISC_CSS = build/web/css/codemirror.css

COPY_GIF := $(patsubst src/web/img/%.gif,build/web/img/%.gif,$(wildcard src/web/img/*.gif))

build/web/img/%.gif: src/web/img/%.gif
	cp $< $@

COPY_JS := $(patsubst src/web/js/%.js,build/web/js/%.js,$(wildcard src/web/js/*.js))

build/web/js/%.js: src/web/js/%.js
	cp $< $@

COPY_BLOCKS_JS := $(patsubst src/web/js/codemirror-blocks-dist/%.js,build/web/js/%.js,$(wildcard src/web/js/codemirror-blocks-dist/*.js))

build/web/js/%.js: src/web/js/codemirror-blocks-dist/%.js
	cp $< $@

COPY_GOOGLE_JS := $(patsubst src/web/js/google-apis/%.js,build/web/js/google-apis/%.js,$(wildcard src/web/js/google-apis/*.js))

build/web/js/google-apis/%.js: src/web/js/google-apis/%.js
	cp $< $@

build/web/js/beforePyret.js: src/web/js/beforePyret.js
	`npm bin`/webpack

build/web/js/q.js: node_modules/q/q.js
	cp $< $@

build/web/js/s-expression-lib.js: node_modules/s-expression/index.js
	cp $< $@

build/web/js/colorspaces.js: node_modules/colorspaces/colorspaces.js
	cp $< $@

build/web/js/es6-shim.js: node_modules/es6-shim/es6-shim.min.js
	cp $< $@

build/web/js/seedrandom.js: node_modules/seedrandom/seedrandom.js
	cp $< $@

build/web/js/url.js: node_modules/url.js/url.js
	cp $< $@

build/web/js/require.js: node_modules/requirejs/require.js
	cp $< $@

build/web/js/codemirror.js: $(CM)/lib/codemirror.js
	cp $< $@

build/web/js/mark-selection.js: $(CM)/addon/selection/mark-selection.js
	cp $< $@

build/web/js/runmode.js: $(CM)/addon/runmode/runmode.js
	cp $< $@

build/web/js/pyret-fold.js: src/web/js/codemirror/pyret-fold.js
	cp $< $@

build/web/js/matchkw.js: src/web/js/codemirror/matchkw.js
	cp $< $@

build/web/js/pyret-mode.js: src/web/js/codemirror/pyret-mode.js
	cp $< $@

MISC_JS = build/web/js/q.js build/web/js/url.js build/web/js/require.js \
          build/web/js/codemirror.js \
          build/web/js/mark-selection.js \
          build/web/js/pyret-mode.js build/web/js/s-expression-lib.js \
          build/web/js/seedrandom.js \
          build/web/js/pyret-fold.js \
          build/web/js/matchkw.js \
          build/web/js/colorspaces.js \
          build/web/js/es6-shim.js \
          build/web/js/runmode.js

MISC_IMG = build/web/img/pyret-icon.png build/web/img/pyret-logo.png build/web/img/pyret-spin.gif build/web/img/up-arrow.png build/web/img/down-arrow.png

build/web/img/%: node_modules/pyret-lang/img/%
	cp $< $@

COPY_ARR := $(patsubst ./pyret/src/arr/trove/%.arr,build/web/arr/%.arr,$(wildcard ./pyret/src/arr/trove/*.arr))
COPY_ARR :=

# build/web/arr/%: pyret/src/arr/trove/%
# 	cp $< $@

WEB = build/web
WEBV = build/web/views
WEBJS = build/web/js
WEBJSGOOG = build/web/js/google-apis
WEBCSS = build/web/css
WEBIMG = build/web/img
WEBARR = build/web/arr
WEBCOLL = build/web/collections
NEWCSS = build/web/neweditor/css
NEWJS = build/web/neweditor/js

$(WEBV):
	@$(call MKDIR,$(WEBV))

$(WEB):
	@$(call MKDIR,$(WEB))

$(WEBJS):
	@$(call MKDIR,$(WEBJS))

$(WEBJSGOOG):
	@$(call MKDIR,$(WEBJSGOOG))

$(WEBCSS):
	@$(call MKDIR,$(WEBCSS))

$(WEBIMG):
	@$(call MKDIR,$(WEBIMG))

$(WEBARR):
	@$(call MKDIR,$(WEBARR))

$(WEBCOLL):
	@$(call MKDIR,$(WEBCOLL))
	cp -pr src/web/collections/* $@

$(NEWCSS):
	@$(call MKDIR,$(NEWCSS))

$(NEWJS):
	@$(call MKDIR,$(NEWJS))

web-local: $(WEB) $(WEBV) $(WEBJS) $(WEBJSGOOG) $(WEBCSS) $(WEBIMG) $(WEBARR) $(WEBCOLL) $(NEWCSS) $(NEWJS) $(OUT_HTML) $(COPY_HTML) $(OUT_CSS) $(COPY_CSS) $(COPY_JS) $(COPY_BLOCKS_JS) $(COPY_ARR) $(COPY_GIF) $(MISC_JS) $(MISC_CSS) $(MISC_IMG) $(COPY_NEW_CSS) $(COPY_NEW_JS) $(COPY_GOOGLE_JS) $(CPOMAIN) $(CPOGZ) $(CPOIDEHOOKS)

web: $(WEB) $(WEBV) $(WEBJS) $(WEBJSGOOG) $(WEBCSS) $(WEBIMG) $(WEBARR) $(WEBCOLL) $(NEWCSS) $(NEWJS) $(OUT_HTML) $(COPY_HTML) $(OUT_CSS) $(COPY_CSS) $(COPY_JS) $(COPY_BLOCKS_JS) $(COPY_ARR) $(COPY_GIF) build/web/js/pyret.js.gz $(MISC_JS) $(MISC_CSS) $(MISC_IMG) $(COPY_NEW_CSS) $(COPY_NEW_JS) $(COPY_GOOGLE_JS)

link-pyret:
	ln -s node_modules/pyret-lang pyret;
	cd node_modules/pyret-lang && $(MAKE) phaseA-deps && cd ../../;

deploy-cpo-main: link-pyret $(CPOMAIN) $(CPOIDEHOOKS) $(CPOGZ)

TROVE_JS := $(wildcard src/web/js/trove/*.js)

$(PHASEA): libpyret ;

.PHONY: libpyret
libpyret:
	$(MAKE) phaseA -C pyret/

$(CPOMAIN): $(TROVE_JS) $(WEBJS) src/web/js/*.js src/web/arr/*.arr cpo-standalone.js cpo-config.json src/web/arr/cpo-main.arr $(PHASEA)
	mkdir -p compiled/;
	cp pyret/build/phaseA/compiled/*.js ./compiled/
	node pyret/build/phaseA/pyret.jarr \
    --builtin-js-dir src/web/js/trove/ \
    --builtin-js-dir pyret/src/js/trove/ \
    -allow-builtin-overrides \
    --builtin-arr-dir src/web/arr/trove/ \
    --builtin-arr-dir pyret/src/arr/trove/ \
    --require-config cpo-config.json \
    --build-runnable src/web/arr/cpo-main.arr \
    --standalone-file cpo-standalone.js \
    --compiled-dir ./compiled \
    --outfile $(CPOMAIN) -no-check-mode

# NOTE(joe): Need to do .gz.js because Firefox doesn't like gzipped JS having a
# non-.js extension.
$(CPOGZ): $(CPOMAIN)
	gzip -c -f $(CPOMAIN) > $(CPOGZ)

$(CPOIDEHOOKS): $(TROVE_JS) $(WEBJS) src/web/js/*.js src/web/arr/*.arr cpo-standalone.js cpo-config.json src/web/arr/cpo-ide-hooks.arr $(PHASEA)
	mkdir -p compiled/;
	cp pyret/build/phaseA/compiled/*.js ./compiled/
	node pyret/build/phaseA/pyret.jarr \
    --builtin-js-dir src/web/js/trove/ \
    --builtin-js-dir pyret/src/js/trove/ \
    -allow-builtin-overrides \
    --builtin-arr-dir src/web/arr/trove/ \
    --builtin-arr-dir pyret/src/arr/trove/ \
    --require-config cpo-config.json \
    --build-runnable src/web/arr/cpo-ide-hooks.arr \
    --standalone-file cpo-standalone.js \
    --compiled-dir ./compiled \
    --outfile $(CPOIDEHOOKS) -no-check-mode

clean:
	rm -rf build/
	rm -rf compiled/
