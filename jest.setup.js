const { PostgreSqlContainer } = require("@testcontainers/postgresql");
const dotenv = require('dotenv');

dotenv.config();

let container, databaseUrl;

beforeAll(async () => {
    container = await new PostgreSqlContainer()
        .withDatabase('test')
        .start()
    databaseUrl = container.getConnectionUri();
    process.env.DATABASE_URL = databaseUrl;
});

afterAll(async () => {
    if(container){
        await container.stop();
    }
});

module.exports = { databaseUrl }