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
PYRET_MODE=node_modules/pyret-codemirror-mode
CPOMAIN=build/web/js/cpo-main.jarr
CPOGZ=build/web/js/cpo-main.jarr.gz.js
CPOIDEHOOKS=build/web/js/cpo-ide-hooks.jarr
PHASEA=pyret/build/phaseA/pyret.jarr

BUNDLED_DEPS=build/web/js/bundled-npm-deps.js

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

COPY_FONTS := $(patsubst src/web/%,build/web/%,$(wildcard src/web/css/fonts/*))

build/web/css/fonts/%: src/web/css/fonts/%
	cp $< $@

build/web/css/codemirror.css: $(CM)/lib/codemirror.css
	cp $< $@

build/web/css/foldgutter.css: $(CM)/addon/fold/foldgutter.css
	cp $< $@

MISC_CSS = build/web/css/codemirror.css build/web/css/foldgutter.css

COPY_GIF := $(patsubst src/web/img/%.gif,build/web/img/%.gif,$(wildcard src/web/img/*.gif))

COPY_SVG := $(patsubst src/web/img/%.svg,build/web/img/%.svg,$(wildcard src/web/img/*.svg))

build/web/img/%.gif: src/web/img/%.gif
	cp $< $@

build/web/img/%.svg: src/web/img/%.svg
	cp $< $@

COPY_JS := $(patsubst src/web/js/%.js,build/web/js/%.js,$(wildcard src/web/js/*.js))

build/web/js/%.js: src/web/js/%.js
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

build/web/js/source-map.js: node_modules/source-map/dist/source-map.js
	cp $< $@

build/web/js/url.js: node_modules/url.js/url.js
	cp $< $@

build/web/js/require.js: node_modules/requirejs/require.js
	cp $< $@

build/web/js/codemirror.js: $(CM)/lib/codemirror.js
	cp $< $@

build/web/js/rulers.js: $(CM)/addon/display/rulers.js
	cp $< $@

build/web/js/mark-selection.js: $(CM)/addon/selection/mark-selection.js
	cp $< $@

build/web/js/runmode.js: $(CM)/addon/runmode/runmode.js
	cp $< $@

build/web/js/pyret-fold.js: $(PYRET_MODE)/addon/pyret-fold.js
	cp $< $@

build/web/js/matchkw.js: $(PYRET_MODE)/addon/matchkw.js
	cp $< $@

build/web/js/foldcode.js: $(CM)/addon/fold/foldcode.js
	cp $< $@

build/web/js/foldgutter.js: $(CM)/addon/fold/foldgutter.js
	cp $< $@

build/web/js/pyret-mode.js: $(PYRET_MODE)/mode/pyret.js
	cp $< $@

build/web/js/mousetrap.min.js: node_modules/mousetrap/mousetrap.min.js
	cp $< $@

build/web/js/mousetrap-global-bind.min.js: node_modules/mousetrap/plugins/global-bind/mousetrap-global-bind.min.js
	cp $< $@

MISC_JS = build/web/js/q.js build/web/js/url.js build/web/js/require.js \
          build/web/js/codemirror.js \
					build/web/js/rulers.js \
          build/web/js/mark-selection.js \
          build/web/js/pyret-mode.js build/web/js/s-expression-lib.js \
          build/web/js/seedrandom.js \
          build/web/js/source-map.js \
          build/web/js/pyret-fold.js \
          build/web/js/matchkw.js \
          build/web/js/foldcode.js \
          build/web/js/foldgutter.js \
          build/web/js/colorspaces.js \
          build/web/js/es6-shim.js \
          build/web/js/runmode.js \
					build/web/js/mousetrap.min.js \
					build/web/js/mousetrap-global-bind.min.js

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
WEBFONTS = $(WEBCSS)/fonts
WEBIMG = build/web/img
WEBARR = build/web/arr

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

$(WEBFONTS):
	@$(call MKDIR,$(WEBFONTS))

$(WEBIMG):
	@$(call MKDIR,$(WEBIMG))

$(WEBARR):
	@$(call MKDIR,$(WEBARR))

web-local: $(WEB) $(WEBV) $(WEBJS) $(WEBJSGOOG) $(WEBCSS) $(WEBFONTS) $(WEBIMG) $(WEBARR) $(OUT_HTML) $(COPY_HTML) $(OUT_CSS) $(COPY_CSS) $(COPY_FONTS) $(COPY_JS) $(COPY_ARR) $(COPY_GIF) $(COPY_SVG) $(MISC_JS) $(MISC_CSS) $(MISC_IMG) $(COPY_NEW_CSS) $(COPY_NEW_JS) $(COPY_GOOGLE_JS) $(CPOMAIN) $(CPOGZ) $(CPOIDEHOOKS)

web: $(WEB) $(WEBV) $(WEBJS) $(WEBJSGOOG) $(WEBCSS) $(WEBFONTS) $(WEBIMG) $(WEBARR) $(OUT_HTML) $(COPY_HTML) $(OUT_CSS) $(COPY_CSS) $(COPY_FONTS) $(COPY_JS) $(COPY_ARR) $(COPY_GIF) $(COPY_SVG) $(MISC_JS) $(MISC_CSS) $(MISC_IMG) $(COPY_NEW_CSS) $(COPY_NEW_JS) $(COPY_GOOGLE_JS)

link-pyret:
	ln -s node_modules/pyret-lang pyret;
	(cd node_modules/pyret-lang && $(MAKE) phaseA-deps);

deploy-cpo-main: link-pyret $(CPOMAIN) $(CPOIDEHOOKS) $(CPOGZ)

TROVE_JS := src/web/js/trove/*.js
TROVE_ARR := src/web/arr/trove/*.arr

$(PHASEA): libpyret ;

.PHONY: libpyret
libpyret:
	$(MAKE) phaseA -C pyret/

$(BUNDLED_DEPS): src/scripts/npm-dependencies.js
	node_modules/.bin/browserify src/scripts/npm-dependencies.js -o $(BUNDLED_DEPS)

$(CPOMAIN): $(BUNDLED_DEPS) $(TROVE_JS) $(TROVE_ARR) $(WEBJS) src/web/js/*.js src/web/arr/*.arr cpo-standalone.js cpo-config.json src/web/arr/cpo-main.arr $(PHASEA)
	mkdir -p compiled/;
	#cp pyret/build/phaseA/compiled/*.js ./compiled/
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
    --deps-file $(BUNDLED_DEPS) \
    --outfile $(CPOMAIN) -no-check-mode

# NOTE(joe): Need to do .gz.js because Firefox doesn't like gzipped JS having a
# non-.js extension.
$(CPOGZ): $(CPOMAIN)
	gzip -c -f $(CPOMAIN) > $(CPOGZ)

$(CPOIDEHOOKS): $(TROVE_JS) $(WEBJS) src/web/js/*.js src/web/arr/*.arr cpo-standalone.js cpo-config.json src/web/arr/cpo-ide-hooks.arr $(PHASEA) $(BUNDLED_DEPS)
	mkdir -p compiled/;
	#cp pyret/build/phaseA/compiled/*.js ./compiled/
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
    --deps-file $(BUNDLED_DEPS) \
    --outfile $(CPOIDEHOOKS) -no-check-mode

clean:
	rm -rf build/
	rm -rf compiled/
