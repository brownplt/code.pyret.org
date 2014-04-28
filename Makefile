install:
	npm install git://github.com/brownplt/pyret-lang#new-world

install-link:
	npm link pyret-lang

non-npm-install:
	git submodule init
	git submodule update

