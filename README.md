
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
USE_STANDALONE_PYRET="true"
PYRET_RELEASE_BASE="/js"
CURRENT_PYRET_RELEASE=""
```

Then you can run

```
$ git submodule init
$ git submodule update
$ foreman run npm install
```

and the dependencies will be installed.

Note that if you just run `npm install`, environment variables will not be set
correctly when building templated HTML.  You can accomplish the same thing as
`foreman run` by setting the environment variables in `.env` via your
environments' mechanisms for doing so.  `foreman` just happens to also be
useful for starting the server the same way Heroku does, etc.

To run the server, run:

```
$ foreman start
```

The editor will be served from `http://localhost:5000/editor`.

If you edit JavaScript or HTML files in `src/web`, run

```
$ foreman run make web
```

and then refresh the page.

## Running with Development Pyret

If you'd like to run with a development copy of Pyret, you can change the
environment configuration to:

```
USE_STANDALONE_PYRET="false"
PYRET_RELEASE_BASE="<url-to-your-pyret-checkout>/build"
CURRENT_PYRET_RELEASE=""
```

So for example, if your Pyret checkout is in `/home/joe/src/pyret`, you would
use:

```
PYRET_RELEASE_BASE="file:///home/joe/src/pyret/build"
```

Or if you were runnning it on another web server, hosted at `/pyret`:

```
PYRET_RELEASE_BASE="http://your-server/pyret/build"
```


## Configuration with Google Auth and Storage


In order to have share links, saving, and other docs-related functionality
work, you need to add to your `.env` a Google client secret and client ID.
You can easily make a free one for development at
https://console.developers.google.com/project.  At that page, make a project,
then go through

    APIs & Auth -> Credentials -> Create New Client Id

You should set the javascript origins to `http://localhost:5000` and the
redirect URI to `http://localhost:5000/oauth2callback`.  Then copy
`.env.example` to `.env`, and populate the `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET` fields from your dashboard at Google.


