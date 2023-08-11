# Personal Website (NodeJs)

A backend service created with NodeJs and ExpressJs frameworks for my personal website.

## Quick commands
* Generate migration file
``npx sequelize-cli migration:generate --name migration-name``

* Run all migrations
``npx sequelize-cli db:migrate``

* Undo all migrations
``npx sequelize-cli db:migrate:undo:all``

* Generate seed
``npx sequelize-cli seed:generate --name seeder-name``

* Run all seeds
``npx sequelize-cli db:seed:all``

* Undo all seeds
``npx sequelize-cli db:seed:undo:all``

* DROP ALL TABLES (PostgreSQL)
``DROP SCHEMA schema CASCADE; CREATE SCHEMA schema;``
