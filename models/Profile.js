const Sequelize = require('sequelize');
const sequelize = require("../database");

const Profile = sequelize.define("Profile", {
    Username: {
        type: Sequelize.STRING
    },
    Balance: {
        type: Sequelize.INTEGER,
        defaultValue: 100
    },
    Class: {
        type: Sequelize.STRING,
        defaultValue: "No"
    },
    LastDaily: {
        type: Sequelize.DATE,
        allowNull: true
    },
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    MarriedTo: {
        type: Sequelize.STRING,
        allowNull: true
    },
},
{
    timestamps: false,
});

module.exports = Profile;