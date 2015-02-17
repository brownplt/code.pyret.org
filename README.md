
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

## What Does `OK_GOOGLE_IDS` Mean?

The special `gdrive-js` import form:

    import gdrive-js("stuff.arr", "0B32bNEogmncOdUZkTmZ5dVJsNGs") as S

is only allowed to work with a statically-configured set of accounts.  These
are configured via the `OK_GOOGLE_IDS` config variable, encoded as a JSON
string mapping ids to email addresses.  The email addresses are purely
documentary.  The 12-digit ID is unique to each Google account, and it is the
first 12 digits of any share URL made by a user.  If you want to add a user to
your deployment as gdrive-js capable, just ask them for a share link and get
those digits.

(NOTE(joe Jan 2015): There isn't documentation indicating that this is a stable
way to do this, so this is an interim note.  We may need a more complicated
identity-checking mechanism, but this is super-simple and easier to change/rip
out if necessary.)

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


## Setting up your own remote version of code.pyret.org with Heroku:

If you are doing development on code.pyret.org, it can be useful to run it on a remote server (for sharing purposes, etc.). Heroku allows us to do this easily.

### Before you begin:

Make sure you have cloned the code.pyret.org git repository. Then follow the instructions to get it running locally.

The Heroku getting started guide is helpful, but it will be easier if you set things up in the order below
https://devcenter.heroku.com/articles/getting-started-with-nodejs

### To run remotely:
1. Make an account at http://heroku.com/ and from a terminal run `heroku login`
2. Navigate to your local code.pyret.org repository in a terminal.
3.	Run `heroku create <appname>`. This will create an app on Heroku linked to your local repository.
4.	Set the config variables found in `.env` (or `.env.example`) on Heroku. You can enter them using `heroku config:set NAME1=VALUE1 NAME2=VALUE2` or in the online control panel.
5.	Add a Redis Cloud database using `heroku addons:add rediscloud` or at addons.heroku.com. You will likely have to verify first (enter a credit card), but you shouldn’t actually be charged for the most basic level (but check for yourself!).
6.	Now, still in your code.pyret.org repo, run
```
 $ git push heroku <localbranch>:master
 $ heroku ps:scale web=1
```
7.	Now run `heroku open` or visit appname.herokuapp.com.

