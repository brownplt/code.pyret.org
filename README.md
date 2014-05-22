
# code.pyret.org

An IDE and more for Pyret.

First, get a Google API Developer account at
https://console.developers.google.com/, and make a new project called whatever
you want.  Enable the Drive API through "APIs and Auth -> APIs" tab on the
left.  Then create a new client id through the "APIs and Auth -> Credentials
tab".  Also create an API Key (at the bottom).  Copy `.env.example` to `.env`,
and copy the client id (not the client secret) and API Key into `.env`.

Then run:

    $ git submodule init
    $ git submodule update
    $ npm install
    $ foreman run make web

This should populate a `build/web` directory with build html, css, and js
files.  You can run:

    $ heroku start

And then visit the site at

    http://localhost:5000 

To serve over the web at large, you can either run `serve.js` on a different
port, or you can simply point Apache or nginx or whatever web server you like
at the directory `build/web`.  You should make sure that the server you use
supports looking up a `*.gz` version of JavaScript files for clients that
accept `gzip` headers, since the make script pre-gzips a version of the Pyret
compiler to save time and space.

