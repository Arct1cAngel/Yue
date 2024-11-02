const Sequelize = require('sequelize');
const Table = require("../database");

const Items = Table.define("Items", {
    Category: {
        type: Sequelize.STRING,
    },
    Name: {
        type: Sequelize.STRING,
    },
    Damage: {
        type: Sequelize.INTEGER,
    },
    Cost: {
        type: Sequelize.INTEGER,
    },
    Rarity: {
        type: Sequelize.STRING,
    },
    Element: {
        type: Sequelize.STRING,
        defaultValue: `None`
    }
},
{
    timestamps: false,
});

module.exports = Items;