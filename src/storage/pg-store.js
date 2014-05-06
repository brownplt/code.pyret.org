var sql = require('sql');
var schema = require('../schema');
var Q = require('q');

var users = schema.users;

function PgStorage(conn) {
  this.conn = conn;
}

PgStorage.prototype = {
  getUserByGoogle: function(googleId) {
    var query = users.where(users.google_id.equals(googleId)).toQuery();
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
      return Q.ninvoke(conn, "query", query);
    });
  }
}

exports.makeStorage = function(conn) { return new PgStorage(conn); };
