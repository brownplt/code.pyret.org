var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('sessions', {
    // Using a string so we can just uuidv4() it and not have guessable
    // session ids
    id: { type: 'string', primaryKey: true },
    user_id: { type: 'int' },
    refresh_token: { type: 'string' },
    auth_token: { type: 'string' },
    expiry: { type: 'timestamp with time zone' }
  }, callback);
  
};

exports.down = function(db, callback) {
  db.dropTable('sessions', callback);
};

