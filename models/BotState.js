const Sequelize = require('sequelize');
const Table = require("../database");

const BotState = Table.define("BotState", {
    state: {
        type: Sequelize.STRING
    }
});

module.exports = BotState;