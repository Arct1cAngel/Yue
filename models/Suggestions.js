const Sequelize = require('sequelize');
const sequelize = require("../database");

const Suggestion = sequelize.define("Suggestion", {
    suggestion: {
        type: Sequelize.STRING
    },
    user: {
        type: Sequelize.STRING
    }
});

module.exports = Suggestion;