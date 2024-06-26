const Sequelize = require('sequelize');
const Table = require("../database");

const Profile = Table.define("Profile", {
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
    LastShop: {
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
    //Equips
    Weapon: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    Magic: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    Shield: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    Armor: {
        type: Sequelize.INTEGER,
        allowNull: true
    }

},
{
    timestamps: false,
});

module.exports = Profile;