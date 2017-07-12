/**
 * Created by tu on 09/07/2017.
 */
const path = require('path');
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, 'config', 'config.json'))[env];
const sequelize = require('sequelize');


const db = new sequelize({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.username,
    password: config.password,
    dialect: config.dialect,
    dialectOptions: {
        ssl: false
    },
    define: {
        freezeTableName: true
    }
})

module.exports.db = db;
module.exports.config = config;
