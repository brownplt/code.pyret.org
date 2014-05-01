compress-pyret:
	gzip -9 node_modules/pyret-lang/build/phase0/pyret.js -c > src/web/pyret.js.gz

install:
	npm install git://github.com/brownplt/pyret-lang#new-world

install-link:
	npm link pyret-lang

