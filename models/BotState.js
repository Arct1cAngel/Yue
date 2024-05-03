const Sequelize = require('sequelize');
const sequelize = require("../database");

const BotState = sequelize.define("BotState", {
    state: {
        type: Sequelize.STRING
    }
});

module.exports = BotState;