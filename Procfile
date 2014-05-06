web: node src/run.js

test: node node_modules/jasmine-node/lib/jasmine-node/cli.js --matchall test/db

migrate: node node_modules/db-migrate/bin/db-migrate up

sqlgen: node node_modules/sql-generate/bin/node-sql-generate --dsn $DATABASE_URL > src/schema.js
