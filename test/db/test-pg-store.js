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
      var dbcreate = Q.ninvoke(client, "query", "create database " + name + " with template " + baseTestDatabase + " owner " + dbUser);
      dbcreate.then(function(result) {
        client.end();
        console.log("Created test database " + name);
        pg.connect(buildConnString(name), function(err, client2, doneDb2) {
          c.resolve({client: client2, done: doneDb2, name: name});
        });
      });
      dbcreate.fail(function(err) {
        client.end();
        doneDb();
        c.reject(err);
      });
    }
  });
  return c.promise;
}

function clearDatabase(name) {
  pg.connect(buildConnString("pyret_test"), function(err, client, doneDb) {
    var dbdrop = Q.ninvoke(client, "query", "drop database " + name);
    dbdrop.then(function() {
      client.end();
    });
    dbdrop.fail(function() {
      client.end();
      console.log("Failed to clean up test database " + name);
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
        expect(result.rows.length).toBe(1);
        var row = result.rows[0];
        expect(row.google_id).toEqual(google_id);
        done();
      });
    });
    testResult.fail(function(err) {
      console.error("Failed with: ", err);
      fail();
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
        expect(result.rows.length).toBe(1);
        var row = result.rows[0];
        expect(row.refresh_token).toEqual(new_refresh_token);
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
        var checked = session.then(function(session) {
          var s = session.rows[0];
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
