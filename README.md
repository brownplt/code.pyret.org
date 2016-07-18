[![Build Status](https://travis-ci.org/brownplt/code.pyret.org.svg)](https://travis-ci.org/brownplt/code.pyret.org)

# code.pyret.org

## Simple Configuration

Configuration is controlled through a file called `.env` in the base
directory.  This jives with how Heroku manages configuration variables;
everything in `.env` is just an environment variable if you really want to
manage things yourself, but using Heroku tools makes sure you run like things
do in production.

First, get the Heroku toolbelt (https://toolbelt.heroku.com/).

Then, copy `.env.example` to `.env`.  If all you want to do is run Pyret code
and test out the REPL, you only need to edit a few variables.  If you want to
use the standalone pyret that comes with the checkout, you can just set

```
PYRET="http://localhost:5000/js/cpo-main.jarr"
```

Then you can run

```
$ npm run local-install
$ ln -s node_modules/pyret-lang pyret
$ npm run build
```

and the dependencies will be installed.

To run the server, run:

```
$ npm start
```

The editor will be served from `http://localhost:5000/editor`.

If you edit JavaScript or HTML files in `src/web`, run

```
$ heroku local:run make web
```

and then refresh the page.

## Running with Development Pyret

If you'd like to run with a development copy of Pyret, you can simply symlink
`pyret` elsewhere.  For example, if your development environment has
`code.pyret.org` and `pyret-lang` both checked out in the same directory, you
could just run this from the CPO directory:

```
$ ln -s ../pyret-lang pyret
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

## Testing with Selenium

There are tests in `test-util/` and `test/` that use Selenium to script a
browser.

The instructions for setting up Selenium to open Chrome locally are somewhat
platform-specific, but you can try just running:

```
heroku local:run mocha
```

with Selenium installed and a development server running.  You can refine this
with, e.g.

```
heroku local:run mocha -g "errors"
```

to only run the tests in `test/errors.js`.

Another options to run all the tests on Sauce Labs (https://saucelabs.com).
You can also get a personal free account with unlimited testing if you only
test open-source stuff (which Pyret/CPO are).  Sauce also stores screencasts
and logs of your tests, which can be helpful with debugging.

First, add your sauce username and access key (from your account page at
Sauce) to `.env`:

```
SAUCE_USERNAME="gibbs"
SAUCE_ACCESS_KEY="deadbeef-2671-11e5-a6a1-206a8a0824be"
```

(Not my real access key)

First, install the Sauce Connect client for your system from
https://docs.saucelabs.com/reference/sauce-connect/.  Follow the instructions
for starting the server (the default configuration should work fine), using
the same username and access key, for example, on Ubuntu I run:

```
~/sc-4.3.9-linux32$ ./bin/sc -u gibbs -k deadbeef-2671-11e5-a6a1-206a8a0824be
```

That sets up a tunnel to Sauce Labs, and on the same machine you should now be
able to run:

```
$ foreman run mocha
```

To run only a particular file, pass in one of the filenames in `test/`, e.g.

```
$ foreman run mocha test/world.js
```

Check out how `world.js` and `image.js` are written: they look up files from
`test-util/pyret-programs` and run them according to Selenium testers in
`test-util/util.js`.  The best way to test a whole new library is probably to
add a directory here and figure out a good predicate that can be applied
across the files (`runAndCheckAllTestsPassed` is probably a good candidate for
many use cases).

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


## Production Deployment

This branch (`release`) is pushed to in order to trigger deploys of the "real"
version of code.pyret.org.  If you have permission to push to this branch, you
can cause code.pyret.org to update simply by pushing.

There are several encrypted credentials stored in Travis.  Anyone's will work,
they just need to have access to the right places. 

- The access key id and access token for an appropriate S3 bucket.  This is
  where the built and compressed `cpo-main.jarr.gz` file will go.
- The access key for a Heroku account, which goes in two places; first, in the
  `global` section so the heroku toolbelt can run, and second in the api\_key
  field of the Heroku deployment itself.  This needs to be a Heroku account
  that has access to the `code-pyret-org` project

The build creates `cpo-main.jarr.gz`, stores it in
`build/release/<short-commit-id>/cpo-main.jarr.gz`, and then copies that
directory over to the given S3 bucket.

It then sets the current Heroku `PYRET` variable to point to the appropriate
URL – in the current deployment, this URL is an AWS CloudFront endpoint that
is backed by a S3 bucket, but any path to the bucket with the right ending
commit hash will work.  Note that it is quite useful to update this variable
because it changes the URL that is fetched on loading CPO, so it will bypass
the users' browser cache the next time they visit.  It's a Good Idea to have
very long cache settings on the CPO main JavaScript file, and also good to make
sure folks get the update.

In addition, this means that it's easy to roll back using Heroku's rollback
feature, since all the copies of the built standalones are available.

This branch doesn't run the Selenium tests; the various development branches
and master do that.  Mainly this is for expedience, since all commits go
through a development branch that runs tests anyway, so it would merely
lengthen the path to deploying.  Also, running the tests on multiple browsers
causes the heroku build to fire twice, which causes an error (see
https://github.com/travis-ci/travis-ci/issues/929).

This branch is access-controlled to admins of brownplt and a few others.  This
is mainly to prevent _mistakes_ (Oops!  I pushed to `release` and it broke!)
more than to lock anyone out.


