const Sequelize = require('sequelize');
const Table = require("../database");

const Suggestion = Table.define("Suggestion", {
    suggestion: {
        type: Sequelize.STRING
    },
    user: {
        type: Sequelize.STRING
    }
});

module.exports = Suggestion;