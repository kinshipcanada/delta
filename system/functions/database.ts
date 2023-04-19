require('dotenv').config();

const database = require('knex')({
    client: "pg",
    connection: process.env.DATABASE_URL
})

