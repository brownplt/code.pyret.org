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
PHASEA=pyret/build/phaseA/pyret.jarr
COMMITID=$(shell git rev-parse --short HEAD)

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

COPY_THEMES := $(patsubst src/web/%.css,build/web/%.css,$(wildcard src/web/css/themes/*.css))

build/web/css/themes/%.css: src/web/css/themes/%.css
	cp $< $@

COPY_FONTS := $(patsubst src/web/%,build/web/%,$(wildcard src/web/css/fonts/*))

build/web/css/fonts/%: src/web/css/fonts/%
	cp $< $@

build/web/css/codemirror.css: $(CM)/lib/codemirror.css
	cp $< $@

build/web/css/foldgutter.css: $(CM)/addon/fold/foldgutter.css
	cp $< $@

build/web/css/dialog.css: $(CM)/addon/dialog/dialog.css
	cp $< $@

build/web/css/matchesonscrollbar.css: $(CM)/addon/search/matchesonscrollbar.css
	cp $< $@

MISC_CSS = build/web/css/codemirror.css \
	build/web/css/foldgutter.css \
	build/web/css/dialog.css \
	build/web/css/matchesonscrollbar.css

COPY_GIF := $(patsubst src/web/img/%.gif,build/web/img/%.gif,$(wildcard src/web/img/*.gif))

COPY_SVG := $(patsubst src/web/img/%.svg,build/web/img/%.svg,$(wildcard src/web/img/*.svg))

COPY_PNG := $(patsubst src/web/img/%.png,build/web/img/%.png,$(wildcard src/web/img/*.png))

build/web/img/%.gif: src/web/img/%.gif
	cp $< $@

build/web/img/%.svg: src/web/img/%.svg
	cp $< $@

build/web/img/%.png: src/web/img/%.png
	cp $< $@

COPY_JS := $(patsubst src/web/js/%.js,build/web/js/%.js,$(wildcard src/web/js/*.js))

build/web/js/%.js: src/web/js/%.js
	cp $< $@

COPY_GOOGLE_JS := $(patsubst src/web/js/google-apis/%.js,build/web/js/google-apis/%.js,$(wildcard src/web/js/google-apis/*.js))

build/web/js/google-apis/%.js: src/web/js/google-apis/%.js
	cp $< $@

build/web/js/events.js: src/web/js/events.js
	cp $< $@

build/web/js/snap: src/web/js/snap
	cp -r $< $@
	rm -rf $@/.git*

build/web/js/transpile.xml: src/web/js/transpile.xml
	cp -r $< $@

build/web/js/beforePyret.js: src/web/js/beforePyret.js
	npx webpack

build/web/js/beforeBlocks.js: src/web/js/beforeBlocks.js
	npx webpack

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

build/web/js/scrollpastend.js: $(CM)/addon/scroll/scrollpastend.js
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

build/web/js/comment.js: $(CM)/addon/comment/comment.js
	cp $< $@

build/web/js/dialog.js: $(CM)/addon/dialog/dialog.js
	cp $< $@

build/web/js/search.js: $(CM)/addon/search/search.js
	cp $< $@

build/web/js/searchcursor.js: $(CM)/addon/search/searchcursor.js
	cp $< $@

build/web/js/annotatescrollbar.js: $(CM)/addon/scroll/annotatescrollbar.js
	cp $< $@

build/web/js/matchesonscrollbar.js: $(CM)/addon/search/matchesonscrollbar.js
	cp $< $@

build/web/js/jump-to-line.js: $(CM)/addon/search/jump-to-line.js
	cp $< $@

build/web/js/pyret-mode.js: $(PYRET_MODE)/mode/pyret.js
	cp $< $@

build/web/js/mousetrap.min.js: node_modules/mousetrap/mousetrap.min.js
	cp $< $@

build/web/js/mousetrap-global-bind.min.js: node_modules/mousetrap/plugins/global-bind/mousetrap-global-bind.min.js
	cp $< $@

MISC_JS = build/web/js/q.js \
	   build/web/js/url.js \
	   build/web/js/require.js \
	   build/web/js/codemirror.js \
	   build/web/js/rulers.js \
	   build/web/js/mark-selection.js \
	   build/web/js/pyret-mode.js \
	   build/web/js/s-expression-lib.js \
	   build/web/js/seedrandom.js \
	   build/web/js/source-map.js \
	   build/web/js/pyret-fold.js \
	   build/web/js/scrollpastend.js \
	   build/web/js/matchkw.js \
	   build/web/js/foldcode.js \
	   build/web/js/foldgutter.js \
	   build/web/js/comment.js \
	   build/web/js/dialog.js \
	   build/web/js/search.js \
	   build/web/js/searchcursor.js \
	   build/web/js/annotatescrollbar.js \
	   build/web/js/matchesonscrollbar.js \
	   build/web/js/jump-to-line.js \
	   build/web/js/colorspaces.js \
	   build/web/js/es6-shim.js \
	   build/web/js/runmode.js \
	   build/web/js/mousetrap.min.js \
	   build/web/js/mousetrap-global-bind.min.js

EDITOR_MISC_JS = build/web/js/q.js \
		  build/web/js/loader.js \
		  build/web/js/codemirror.js \
		  build/web/js/rulers.js \
		  build/web/js/scrollpastend.js \
		  build/web/js/foldcode.js \
		  build/web/js/foldgutter.js \
		  build/web/js/comment.js \
		  build/web/js/dialog.js \
		  build/web/js/search.js \
		  build/web/js/searchcursor.js \
		  build/web/js/annotatescrollbar.js \
		  build/web/js/matchesonscrollbar.js \
		  build/web/js/jump-to-line.js \
		  build/web/js/mark-selection.js \
		  build/web/js/runmode.js \
		  build/web/js/pyret-mode.js \
		  build/web/js/pyret-fold.js \
		  build/web/js/matchkw.js \
		  build/web/js/mousetrap.min.js \
		  build/web/js/mousetrap-global-bind.min.js \
		  build/web/js/log.js \
		  build/web/js/share.js \
		  build/web/js/google-apis/api-wrapper.js \
		  build/web/js/google-apis/drive.js \
		  build/web/js/google-apis/picker.js \
		  build/web/js/google-apis/sheets.js \
		  build/web/js/authenticate-storage.js

build/web/js/editor-misc.min.js: $(EDITOR_MISC_JS)
	npm exec -- uglifyjs --compress -o $@ -- $^

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
WEBTHEMES = build/web/css/themes
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

$(WEBTHEMES):
	@$(call MKDIR,$(WEBTHEMES))

$(WEBFONTS):
	@$(call MKDIR,$(WEBFONTS))

$(WEBIMG):
	@$(call MKDIR,$(WEBIMG))

$(WEBARR):
	@$(call MKDIR,$(WEBARR))

web-local: $(WEB) $(WEBV) $(WEBJS) $(WEBJSGOOG) $(WEBCSS) $(WEBTHEMES) $(WEBFONTS) $(WEBIMG) $(WEBARR) $(OUT_HTML) $(COPY_HTML) $(OUT_CSS) $(COPY_CSS) $(COPY_THEMES) $(COPY_FONTS) $(COPY_JS) $(COPY_ARR) $(COPY_GIF) $(COPY_SVG) $(COPY_PNG) $(MISC_JS) $(MISC_CSS) $(MISC_IMG) $(COPY_NEW_CSS) $(COPY_NEW_JS) $(COPY_GOOGLE_JS) $(CPOMAIN) $(CPOGZ) build/web/js/editor-misc.min.js build/web/js/snap build/web/js/transpile.xml

web: $(WEB) $(WEBV) $(WEBJS) $(WEBJSGOOG) $(WEBCSS) $(WEBTHEMES) $(WEBFONTS) $(WEBIMG) $(WEBARR) $(OUT_HTML) $(COPY_HTML) $(OUT_CSS) $(COPY_CSS) $(COPY_THEMES) $(COPY_FONTS) $(COPY_JS) $(COPY_ARR) $(COPY_GIF) $(COPY_SVG) $(COPY_PNG) $(MISC_JS) $(MISC_CSS) $(MISC_IMG) $(COPY_NEW_CSS) $(COPY_NEW_JS) $(COPY_GOOGLE_JS) build/web/js/editor-misc.min.js build/web/js/snap build/web/js/transpile.xml

link-pyret:
	ln -s node_modules/pyret-lang pyret
	(cd node_modules/pyret-lang && $(MAKE) phaseA-deps)

deploy-cpo-main: link-pyret $(CPOMAIN) cpo-main-release 

cpo-main-release: $(CPOGZ)
	mkdir -p build/release/$(COMMITID);
	cp $(CPOGZ) build/release/$(COMMITID)/

TROVE_JS := src/web/js/trove/*.js
TROVE_ARR := src/web/arr/trove/*.arr

$(PHASEA): libpyret ;

.PHONY: libpyret
libpyret:
	$(MAKE) phaseA -C pyret/

$(BUNDLED_DEPS): src/scripts/npm-dependencies.js
	# Explicitly exclude crypto, buffer, and stylus, nested npm dependencies that aren't needed
	node_modules/.bin/browserify src/scripts/npm-dependencies.js -x crypto -x buffer -x stylus -o $(BUNDLED_DEPS)

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
	npm exec -- uglifyjs --compress -o $(CPOMAIN).min -- $(CPOMAIN)
	gzip -c -f $(CPOMAIN).min > $(CPOGZ)

clean:
	rm -rf build/
	rm -rf compiled/
