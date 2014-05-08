web: node src/run.js

test: node node_modules/jasmine-node/lib/jasmine-node/cli.js --matchall test/db

selenium-test-local: TEST_LOC="local" node node_modules/jasmine-node/lib/jasmine-node/cli.js test/browser/
selenium-test-sauce: TEST_LOC="sauce" node node_modules/jasmine-node/lib/jasmine-node/cli.js test/browser/

migrate: node node_modules/db-migrate/bin/db-migrate up

sqlgen: node node_modules/sql-generate/bin/node-sql-generate --dsn $DATABASE_URL > src/schema.js


