const sql = require('sql');
const schema = require('../schema');
const Q = require('q');
const uuid = require('node-uuid');

const users = schema.users;
const sessions = schema.sessions;
const teachers = schema.teachers;
const teacher_infos = schema.teacher_infos;

function PgStorage(conn) {
  this.conn = conn;
}

PgStorage.prototype = {
  getUserByGoogle: function(googleId) {
    const query = users.where(users.google_id.equals(googleId)).toQuery();
    return this.invokeP1Row(query);
  },
  getUserById: function(id) {
    const query = users.where(users.id.equals(googleId)).toQuery();
    return this.invokeP1Row(query);
  },
  // Used when we see a new refresh token for a user; it means the old
  // one has been expired
  updateRefreshToken: function(userId, newToken) {
    const query = users.update({
      refresh_token: newToken
    }).where(users.id.equals(userId)).toQuery();
    return this.invokeP(query);
  },
  createUser: function(user) {
    const maxQuery = users.select(sql.functions.MAX(users.id)).toQuery();
    const conn = this.conn;
    const that = this;
    const withMax = Q.ninvoke(conn, "query", maxQuery);
    return withMax.then(function(max) {
      var id;
      if(max.rows[0].max === null) { id = 1; }
      else { id = max.rows[0].max + 1 }
      const query = users.insert({
        id: id,
        google_id: user.google_id,
        email: user.email,
        refresh_token: user.refresh_token
      }).toQuery();
      return that.idInvokeP(query, id);
    });
  },
  deleteSession: function(sessionId) {
    const query = sessions.delete().where(sessions.id.equals(sessionId)).toQuery();
    return this.invokeP(query);
  },
  createSession: function(session) {
    const conn = this.conn;
    // NOTE(joe): Yes, time is hard.  But we'll expire things roughly one
    // month from now and call it good, and not worry about being exactly
    // correct
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);
    const id = uuid();
    const query = sessions.insert({
      id: id,
      user_id: session.user_id,
      refresh_token: session.refresh_token,
      auth_token: session.auth_token,
      expiry: expires.toISOString()
    }).toQuery();
    return this.idInvokeP(query, id);
  },
  updateSessionAccessToken: function(sessionId, newToken) {
    const query = sessions.update({
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
    const query = sessions.select(sessions.star()).where(sessions.id.equals(sessionId)).toQuery();
    return this.invokeP1Row(query);
  },

  createTeacherInfo: function(teacherInfo) {
    const id = uuid();
    const now = new Date();
    const query = teacher_infos.insert({
      id: id,
      user_id: teacherInfo.userId,
      name: teacherInfo.name,
      school: teacherInfo.school,
      about: teacherInfo.about,
      pending: true,
      applied_at: now.toISOString(),
      alternate_email: teacherInfo.alternateEmail
    }).toQuery();
    return this.idInvokeP(query, id);
  },
  
  getTeacherInfo: function(id) {
    const query = teacher_infos.where(teacher_infos.id.equals(id)).toQuery();
    return this.invokeP1Row(query);
  },

  getTeacherInfoByUser: function(userId) {
    console.log("Getting teacher info: ", userId);
    const query = teacher_infos.where(teacher_infos.user_id.equals(userId)).toQuery();
    return this.invokeP1Row(query);
  },

  validateTeacher: function(teacherInfoId) {
    const that = this;
    return this.getTeacherInfo(teacherInfoId).then(function(ti) {
      const id = uuid();
      const newTeacher = teachers.insert({
        id: id,
        teacher_info_id: ti.id,
        user_id: ti.user_id
      }).toQuery();
      const noLongerPending = teacher_infos.update({
        pending: false
      }).where(teacher_infos.id.equals(teacherInfoId)).toQuery();
      return that.invokeP(newTeacher).then(function(_) {
        return that.idInvokeP(noLongerPending, id);
      });
    });
  },

  getTeacher: function(id) {
    const query = teachers.where(teachers.id.equals(id)).toQuery();
    return this.invokeP1Row(query);
  },

  invokeP: function(query) {
    return Q.ninvoke(this.conn, "query", query);
  },
  idInvokeP: function(query, id) {
    return Q.all([this.invokeP(query), id]);
  },
  invokeP1Row: function(query) {
    function get1(result) {
      if (result.rows && result.rows.length === 1) { return result.rows[0]; }
      else if (!result.rows || result.rows.length > 1) {
        throw Error("Badly formed query response", result);
      }
      else {
        return null;
      }
    }
    return this.invokeP(query).then(get1);
  }
}

exports.makeStorage = function(conn) { return new PgStorage(conn); };

