
# code.pyret.org

An IDE and more for Pyret.  Use 

    $ git submodule init
    $ git submodule update
    $ npm install

You also need to take `.env.example` and make it into a real `.env` that has a
Google client secret and client ID.  You can easily make a free one for
development at https://console.developers.google.com/project, then make a
project, then go

    APIs & Auth -> Credentials -> Create New Client Id

You should set the javascript origins to `http://localhost:5000` and the
redirect URI to `http://localhost:5000/oauth2callback`.  Then copy
`.env.example` to `.env`, and populate the `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET` fields from your dashboard at Google.

Then get the Heroku toolbelt (https://toolbelt.heroku.com/), and you should
now be able to run `foreman start`, and the app should be running at
`http://localhost:5000`.


# Building a database

To keep the development system close to what happens in production, you must
install Postgres to work with the development system.  You should create a
user and a database (with names of your choice), and put an entry for them
into your `.env` that looks like:

    postgres://<username>:<password>@<your-postgres-host>/<dbname>

Then, to set up the database, you can run:

    $ foreman run migrate
    $ foreman run sqlgen

And it will build an empty database for doing development.

# Testing



## Testing Databases

Some of our testing requires creating databases, so you need a user with that
permission to run all the tests:

    $ psql
    > ALTER USER <your-user> GRANT CREATEDB;

You should make a separate environment for testing, which can use the same
client secret from Google, but should be a separate databse from development.
You also need a few extra entries in the test environment for the database,
which are used to create fresh databases; see `.env.test.example`.

To migrate the test database, use:

    $ foreman run -e .env.test migrate

This will put the testing database in the right shape.

To run the basic server tests, use:

    $ foreman run -e .env.test test


## Selenium

We use Selenium to test flows of authentication and initial signup.  If you
want to run tests on your own, you'll need a Google account that you don't
mind potentially getting locked out (for too many weird sign-in attempts) or
potentially lose data.  It also can't have 2-factor auth enabled, so you
probably don't want to use your main account for this.  You can email Joe if
you want, and he might be able to help.

To run Selenium tests, add `SELENIUM_GOOGLE_USER` and
`SELENIUM_GOOGLE_PASSWORD` to your `.env.test`, and run:

    $ foreman -e .env.test selenium-test-local

## Sauce

We also support running tests remotely at Sauce labs.  Email joe for the
account information if you need to set this up.  Since we've only configured
ourselves to have Sauce point at a public server (no reverse tunnelling back
to our localhost), you need to put a `SAUCE_TEST_TARGET` that can be seen by
the world (for example, `http://patch-experiment.herokuapp.com` will host the
test site).  You also need to define `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY`.
The command to run on Sauce is:

    $ foreman -e .env.test selenium-test-sauce

Note that `selenium-test-sauce` and `selenium-test-local` run the same set of
tests, so you can do Selenium test development locally, and they will be run
when the live test site is pushed (this is a good thing!).



## TODO

1. Linking to a development copy of Pyret for quicker turnaround on the
   language interface.
2. Getting access to Heroku deployment (set the same env vars with `heroku
   config:set GOOGLE_CLIENT_ID`, etc, and use `git push heroku master` after
   doing the right git config, for people other than Joe.

