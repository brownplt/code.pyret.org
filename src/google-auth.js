var gapi = require('googleapis');
var jwt = require('jwt-simple');
var OAuth2 = gapi.auth.OAuth2;

// Relevant README/docs at https://github.com/google/google-api-nodejs-client/

function makeAuth(config) {
  var OAUTH_SCOPES = ["email",
                      "https://www.googleapis.com/auth/spreadsheets",
                      // The `drive` scope allows us to open files
                      // (particularly spreadsheets)made outside of
                      // the Pyret ecosystem.
                      "https://www.googleapis.com/auth/drive",
                      "https://www.googleapis.com/auth/drive.file",
                      "https://www.googleapis.com/auth/drive.install",
                      "https://www.googleapis.com/auth/drive.photos.readonly",
                      "https://www.googleapis.com/auth/photos"];
  var oauth2Client =
      new OAuth2(
          config.google.clientId,
          config.google.clientSecret,
          config.baseUrl + config.google.redirect
        );

  return {
    refreshAccess: function(refreshToken, callback) {
      var oauth2Client =
          new OAuth2(
              config.google.clientId,
              config.google.clientSecret,
              config.baseUrl + config.google.redirect
            );
      oauth2Client.credentials = { refresh_token: refreshToken };
      oauth2Client.refreshAccessToken(function(err, tokens) {
        if(err !== null) { callback(err, null); return; }
        callback(null, tokens.access_token);
      });
    },
    getAuthUrl: function(afterUrl) {
        return oauth2Client.generateAuthUrl({
        // Offline lets us handle refreshing access on our own (rather than
        // popping up a dialog every half hour)
        access_type: 'offline',
        // Skip permission confirmation if the user has confirmed with us before
        approval_prompt: 'auto',
        // NOTE(joe): We do not use the drive scope on the server, but we ask
        // for it so that we don't have to do another popup on the client.
        // #notpola
        scope: OAUTH_SCOPES.join(' '),
        state: afterUrl
      });
    },
    serveRedirect: function(req, callback) {
      var authCode = req.param("code");
      var oauth2Client =
          new OAuth2(
              config.google.clientId,
              config.google.clientSecret,
              config.baseUrl + config.google.redirect
            );
      oauth2Client.getToken(authCode, function(err, tokens) {
        if(err !== null) {
          console.error("Error in Google login: ", err);
          callback(err, null); return;
        }
        if(!(typeof tokens.id_token === "string")) {
          callback(new Error("No identity information provided"), null); return;
        }
        if(!(typeof tokens.access_token === "string")) {
          callback(new Error("No access information provided"), null); return;
        }
        // NOTE(joe): These few lines make security assumptions and you should
        // edit with care.  I wrote this when Google was deprecating one OAuth
        // library in favor of another (deprecation to occur in Sept 2014), so
        // I'm pasting a few links that will hopefully be enlightening down the
        // road.
        //
        // See https://developers.google.com/accounts/docs/OAuth2Login#obtainuserinfo
        // for an explanation of what we are getting from the id_token
        //
        // Also see
        //
        // https://developers.google.com/+/api/auth-migration#email
        //
        // as this appears to be the only way to get a user's email address and
        // a unique identifier for them without trying to gain access to
        // their entire G+ profile (which includes things that we have no
        // reason to know, like where they live and what their gender is).
        //
        // Note also that id_token should not escape from this function: if
        // other contexts start using id_token-like data, something is wrong
        // because they can't guarantee that the tokens came over an https
        // connection to Google (which getToken above does).

        // The {}, true below indicate that we are completely trusting our HTTPS
        // connection to Google for the validity of the information in id_token
        // (justified by the first link above).  If we end up getting id_tokens
        // from elsewhere, we need to set up polling of Google's public key
        // servers to get the correct public key of the day to validate these
        // tokens cryptographically.
        var decodedId = jwt.decode(tokens.id_token, {}, true);
        callback(null, { googleId: decodedId["sub"], access: tokens.access_token, refresh: tokens.refresh_token });
      });
    }
  };
}

module.exports = {
  makeAuth: makeAuth
};
