var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('courses', {
    id: { type: 'uuid', primaryKey: true },
    name: { type: 'string' },
    owner_id: { type: 'uuid' }
  }, function(_) {
  db.createTable('teachers',  {
    id: { type: 'uuid', primaryKey: true },
    user_id: { type: 'uuid' },
    teacher_info_id: { type: 'uuid' }
  }, function(_) {
  db.createTable('teacher_infos', {
    id: { type: 'uuid', primaryKey: true },
    user_id: { type: 'int' },
    name: { type: 'string' },
    school: { type: 'string' },
    about: { type: 'text' },
    pending: { type: 'boolean' },
    applied_at: { type: 'timestamp with time zone' },
    alternate_email: { type: 'string' }
  }, function(_) {
  db.createTable('assignment_template', {
    id: { type: 'uuid', primaryKey: true },
    link: { type: 'string' }
  }, callback)
  })})});
};

exports.down = function(db, callback) {
  db.dropTable("assignment_template", function() {
    db.dropTable("teacher_infos", function() {
      db.dropTable("teachers", function() {
        db.dropTable("courses", callback)})})});
};
