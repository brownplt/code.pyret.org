var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('users', {
    id: { type: 'int', primaryKey: true },
    email: { type: 'string' },
    refresh_token: { type: 'string' },
    google_id: { type: 'string', unique: true }
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('users');  
};

