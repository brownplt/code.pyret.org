var sql = require('sql');
var schema = require('../schema');
var Q = require('q');
var uuid = require('node-uuid');

var users = schema.users;
var sessions = schema.sessions;

function PgStorage(conn) {
  this.conn = conn;
}

PgStorage.prototype = {
  getUserByGoogle: function(googleId) {
    var query = users.where(users.google_id.equals(googleId)).toQuery();
    return Q.ninvoke(this.conn, "query", query);
  },
  getUserById: function(id) {
    var query = users.where(users.id.equals(googleId)).toQuery();
    return Q.ninvoke(this.conn, "query", query);
  },
  // Used when we see a new refresh token for a user; it means the old
  // one has been expired
  updateRefreshToken: function(userId, newToken) {
    var query = users.update({
      refresh_token: newToken
    }).where(users.id.equals(userId)).toQuery();
    return Q.ninvoke(this.conn, "query", query);
  },
  createUser: function(user) {
    var maxQuery = users.select(sql.functions.MAX(users.id)).toQuery();
    var conn = this.conn;
    var withMax = Q.ninvoke(conn, "query", maxQuery);
    return withMax.then(function(max) {
      var id;
      if(max.rows[0].max === null) { id = 1; }
      else { id = max.rows[0].max + 1 }
      var query = users.insert({
        id: id,
        google_id: user.google_id,
        email: user.email,
        refresh_token: user.refresh_token
      }).toQuery();
      return Q.all([Q.ninvoke(conn, "query", query), id]);
    });
  },
  deleteSession: function(sessionId) {
    var query = sessions.delete().where(sessions.id.equals(sessionId)).toQuery();
    return Q.ninvoke(this.conn, "query", query);
  },
  createSession: function(session) {
    var conn = this.conn;
    // NOTE(joe): Yes, time is hard.  But we'll expire things roughly one
    // month from now and call it good, and not worry about being exactly
    // correct
    var expires = new Date();
    expires.setMonth(expires.getMonth() + 1);
    var id = uuid();
    var query = sessions.insert({
      id: id,
      user_id: session.user_id,
      refresh_token: session.refresh_token,
      auth_token: session.auth_token,
      expiry: expires.toISOString()
    }).toQuery();
    console.log("create session", query, session);
    return Q.all([Q.ninvoke(conn, "query", query), id]);
  },
  updateSessionAccessToken: function(sessionId, newToken) {
    var query = sessions.update({
      auth_token: newToken
    }).where(sessions.id.equals(sessionId)).toQuery();
    return Q.ninvoke(this.conn, "query", query);
  },
  createSessionForUser: function(user, auth_token) {
    return this.createSession({
      refresh_token: user.refresh_token,
      auth_token: auth_token,
      user_id: user.id
    });
  },
  getSession: function(sessionId) {
    var query = sessions.select(sessions.star()).where(sessions.id.equals(sessionId)).toQuery();
    return Q.ninvoke(this.conn, "query", query);
  },
  getUserSessions: function(userId) {

  }
}

exports.makeStorage = function(conn) { return new PgStorage(conn); };
