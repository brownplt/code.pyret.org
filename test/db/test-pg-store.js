_ = require("jasmine-node");
pg = require("pg");
sql = require("sql");
Q = require("q");
storage = require("../../src/storage/pg-store.js");

baseTestDatabase = process.env["DATABASE_TEST_NAME"]
dbUser = process.env["DATABASE_TEST_USER"]

function buildConnString(dbname) {
  return process.env["DATABASE_TEST_PREFIX"] + dbname;
}

function randomDbName(base) {
  return "code_pyret_org_" + base + Math.floor(Math.random() * 1000);
}

function makeTestConnection() {
  var c = Q.defer();
  pg.connect(buildConnString("pyret_test"), function(err, client, doneDb) {
    if(err !== null) { c.reject(err); }
    else {
      c.resolve({client: client, done: doneDb});
    }
  });
  return c.promise;
}

function makeFreshDatabase() {
  var c = Q.defer();
  var name = randomDbName();
  pg.connect(buildConnString("pyret_test"), function(err, client, doneDb) {
    if(err !== null) { c.reject(err); }
    else {
      clearDatabase(name, function() {
        var dbcreate = Q.ninvoke(client, "query", "create database " + name + " with template " + baseTestDatabase + " owner " + dbUser);
        dbcreate.then(function(result) {
          client.end();
          pg.connect(buildConnString(name), function(err, client2, doneDb2) {
            c.resolve({client: client2, done: doneDb2, name: name});
          });
        });
        dbcreate.fail(function(err) {
          client.end();
          doneDb();
          c.reject(err);
        });
      });
    }
  });
  return c.promise;
}

function clearDatabase(name, then) {
  pg.connect(buildConnString("pyret_test"), function(err, client, doneDb) {
    var dbdrop = Q.ninvoke(client, "query", "drop database " + name);
    dbdrop.then(function() {
      client.end();
      then();
    });
    dbdrop.fail(function() {
      client.end();
      then();
    });
  });
}


describe("Create a database for testing", function() {
  it("should be able to create test databases, and tear them down",
    function(done) {
      pg.connect(buildConnString("template1"), function(err, client, doneDb) {
        var name = randomDbName("test_setup");
        var dbcreate = Q.ninvoke(client, "query", "create database " + name + " with template " + baseTestDatabase + " owner " + dbUser);
        dbcreate.then(function(result) {
        });
        dbcreate.fail(function(err) {
          console.error("Make sure the user, password, and host are correct, and you've run ALTER USER <database_test_user> CREATEDB.");
          client.end();
          fail(); 
        });
        var dbdrop = dbcreate.then(function(_) {
          return Q.ninvoke(client, "query", "drop database " + name);
        });
        dbdrop.then(function(result) {
          client.end();
          done();
        })
        dbdrop.fail(function(err) {
          console.error("Failed to drop database ", err); 
          client.end();
          fail(); 
        });
      });
    });
});

describe("Users", function() {
  var db;
  var conn;

  beforeEach(function() {
    conn = makeFreshDatabase();
    conn.fail(function(err) {
      console.log("Failed to connect: ", err);
    });
    db = conn.then(function(c) {
      return storage.makeStorage(c.client);
    });
  });

  afterEach(function() {
    conn.then(function(c) { c.client.end(); c.done(); clearDatabase(c.name); });
  });

  it("should complain if two users with the same google id are added", function(done) {
    var email = "joe@cs.brown.edu",
        google_id = "hf0493h7fasf",
        refresh_token = "sjf981ff_fjwqjf809";
    var user1 = db.then(function(db) {
      return db.createUser({
        email: email,
        google_id: google_id,
        refresh_token: refresh_token
      });
    });
    var user2 = Q.all([db, user1]).spread(function(db, _) {
      return db.createUser({
        email: email + ".edu",
        google_id: google_id,
        refresh_token: refresh_token + "unique"
      });
    });
    user2.then(function(result) {
      console.error("user2 should not be created");
      fail();
    });
    user2.fail(function(err) {
      expect(String(err).substring("duplicate key")).not.toEqual(-1);
      done();
    });
  });

  it("should be able to create and fetch a user", function(done) {
    var email = "joe@cs.brown.edu",
        google_id = "hf0493h7fasf",
        refresh_token = "sjf981ff_fjwqjf809";
    var user = db.then(function(db) {
      return db.createUser({
        email: email,
        google_id: google_id,
        refresh_token: refresh_token
      });
    });
    var testResult = Q.all([user, db]).spread(function(_, db) {
      var getUser = db.getUserByGoogle(google_id);
      return getUser.then(function(result) {
        expect(result).not.toBe(null);
        expect(result.google_id).toEqual(google_id);
        done();
      });
    });
    var that = this;
    testResult.fail(function(err) {
      console.error("Failed with: ", err);
      that.fail(new Error(String(err)));
    });
  });

  it("should update users' refresh tokens", function(done) {
    var that = this;
    var email = "joe@cs.brown.edu",
        google_id = "kjfq84fj",
        refresh_token = "refresh_token_1",
        new_refresh_token = "refresh_token_2";
    var user = db.then(function(db) {
      return db.createUser({
        email: email,
        google_id: google_id,
        refresh_token: refresh_token
      });
    });
    var testResult = Q.all([user, db]).spread(function(user, db) {
      var updateToken = db.updateRefreshToken(user[1], new_refresh_token);
      var newUser = updateToken.then(function(_) {
        return db.getUserByGoogle(google_id);
      });
      return newUser.then(function(result) {
        expect(result).not.toBe(null);
        expect(result.refresh_token).toEqual(new_refresh_token);
        done();
      });
    });
    testResult.fail(function(err) {
      console.error("Failed with: ", err);
      that.fail(err);
    });
  });

});

describe("sessions", function() {

  beforeEach(function() {
    conn = makeFreshDatabase();
    conn.fail(function(err) {
      console.log("Failed to connect: ", err);
    });
    db = conn.then(function(c) {
      return storage.makeStorage(c.client);
    });
  });
  afterEach(function() {
    conn.then(function(c) { c.client.end(); c.done(); clearDatabase(c.name); });
  });


  it("Should create sessions", function(done) {
    var that = this;
    db.then(function(db) {
      var newSession = db.createSession({
        user_id: 42,
        refresh_token: "jf3984jf2943f2",
        auth_token: "38fja98df01f34"
      });
      var checked = newSession.spread(function(_, id) {
        var session = db.getSession(id);
        session.fail(function() { console.log("sessio nfail"); });
        var checked = session.then(function(s) {
          expect(s.user_id).toEqual(42);
          expect(s.refresh_token).toEqual("jf3984jf2943f2");
          expect(s.auth_token).toEqual("38fja98df01f34");
          return s;
        });
        checked.fail(function() { console.log("fail"); });
        return checked;
      });
      checked.then(function() { done() });
      checked.fail(function(err) {
        console.error("Failed to create or fetch session: ", err);
      });
    });
  })

});

describe("Teacher info", function() {
  beforeEach(function() {
    conn = makeFreshDatabase();
    conn.fail(function(err) {
      console.log("Failed to connect: ", err);
    });
    db = conn.then(function(c) {
      return storage.makeStorage(c.client);
    });
  });
  afterEach(function() {
    conn.then(function(c) { c.client.end(); c.done(); clearDatabase(c.name); });
  });

  it("Should create teacher infos", function(done) {
    const name = "Harry Smith";
    const id = 42;
    const alternateEmail = "harry@school.edu";
    const about = "Teaching kids";
    const school = "School Edu Place";
    db.then(function(db) {
      var teacher = db.createTeacherInfo({
        userId: id,
        name: name,
        alternateEmail: alternateEmail,
        about: about,
        school: school
      });
      var res = teacher.spread(function(_, id) {
        return db.getTeacherInfo(id).then(function(t) {
          expect(t.name).toEqual(name);
          expect(typeof t.id).toBe("string", "Id is a string");
          expect(t.alternate_email).toEqual("harry@school.edu");
          expect(t.about).toEqual(about);
          expect(t.school).toEqual(school);
          expect(t.pending).toBe(true);
          return true;
        });
      });
      res.then(function() { done(); });
      var that = this;
      res.fail(function(err) {
        console.error("Failed: ", err, err.stack);
        this.fail(new Error(String(err)));
      });
    });
  });

  it("should validate teachers", function(done) {
    const res = db.then(function(db) {
      const user = db.createUser({
        email: "joe@cs",
        refresh_token: "aaa",
        google_id: "1234"
      });
      const pendingTeacher = user.then(function(_, id) {
        return db.createTeacherInfo({
          userId: id,
          name: "Joe",
          alternateEmail: "foo@bar.edu",
          about: "I like kids",
          school: "Brown"
        });
      });
      const newTeacher = pendingTeacher.spread(function(_, teacherInfoId) {
        const validated = db.validateTeacher(teacherInfoId);
        const newTeacher = validated.spread(function(_, id) {
          return db.getTeacher(id);
        });
        return newTeacher.then(function(t) {
          return db.getTeacherInfo(teacherInfoId).then(function(ti) {
            expect(ti.pending).toBe(false);
            expect(t.user_id).toBe(ti.user_id);
            expect(ti.name).toBe("Joe");
            expect(t.teacher_info_id).toBe(ti.id);
            return true;
          })
        });
      });
      return newTeacher;
    });
    res.then(function(_) { done(); });
    res.fail(function(err) {
      console.error("Failed: ", err, err.stack);
      this.fail(new Error(String(err)));
    });
  });
});

