// File to verify system integrity, config. Run this on startup.
import * as dotenv from 'dotenv' 

dotenv.config()

// Verify that all required environment variables are present.
const required_env_vars = [
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
]

for (const env_var of required_env_vars) {
    if (!process.env[env_var]) {
        throw new Error(`Missing required environment variable: ${env_var}`)
    }
}

// Run tests on database connection.
const testingDatabase = require('knex')({
    client: "pg",
    connection: process.env.DATABASE_URL
})

testingDatabase.raw('SELECT NOW()').then(() => {
    console.log("Database connection verified.")
})