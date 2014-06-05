
# code.pyret.org

## Simple Configuration

Configuration is controlled through a file called `.env` in the base
directory.  This jives with how Heroku manages configuration variables;
everything in `.env` is just an environment variable if you really want to
manage things yourself, but using Heroku tools makes sure you run like things
do in production.

First, get Heroku toolbelt (https://toolbelt.heroku.com/).

Then, copy `.env.example` to `.env`.  If all you want to do is run Pyret code
and test out the REPL, you only need to edit a few variables.  If you want to
use the standalone pyret that comes with the checkout, use these settings:

```
USE_STANDALONE_PYRET=true
PYRET_RELEASE_BASE="/js"
CURRENT_PYRET_RELEASE=""
```

Then you can run

```
$ git submodule init
$ git submodule update
$ npm install
```

and the dependencies will be installed.

To run the server, run:

```
$ foreman start
```

The editor will be served from `http://localhost:5000`.

If you edit JavaScript or HTML files in `src/web`, run

```
$ foreman run make web
```

and then refresh the page.

## Configuration with Google Auth and Storage


You also need to take `.env.example` and make it into a real `.env` that has a
Google client secret and client ID.  You can easily make a free one for
development at https://console.developers.google.com/project, then make a
project, then go

    APIs & Auth -> Credentials -> Create New Client Id

You should set the javascript origins to `http://localhost:5000` and the
redirect URI to `http://localhost:5000/oauth2callback`.  Then copy
`.env.example` to `.env`, and populate the `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET` fields from your dashboard at Google.

TODO: Redis details
