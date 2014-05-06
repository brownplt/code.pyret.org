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
        pg.connect(buildConnString(name), function(err, client2, doneDb2) {
          c.resolve({client: client2, done: doneDb2});
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
    conn.then(function(c) { c.client.end(); c.done(); });
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
  })
});

