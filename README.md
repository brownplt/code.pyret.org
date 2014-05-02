An IDE for Pyret.  Use 

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


TODO:

1. Linking to a development copy of Pyret for quicker turnaround on the
   language interface.
2. Getting access to Heroku deployment (set the same env vars with `heroku
   config:set GOOGLE_CLIENT_ID`, etc, and use `git push heroku master` after
   doing the right git config, for people other than Joe.
