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
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    MarriedTo: {
        type: Sequelize.STRING,
        allowNull: true
    },
    Customization: {
        type: Sequelize.STRING,
        defaultValue: "5000FF,You're kind of poor aren't you? :smirk:"
    },
    // Equips
    // ▰▱
    Health: {
        type: Sequelize.STRING,
        defaultValue: "▰▰▰▰▰▰▰▰▰▰ 100/100"
    },
    Status: {
        type: Sequelize.STRING,
        defaultValue: "",
    },
    Weapon: {
        type: Sequelize.STRING,
        defaultValue: "None",
    },
    Magic: {
        type: Sequelize.STRING,
        defaultValue: "None",
    },
    Shield: {
        type: Sequelize.STRING,
        defaultValue: "None",
    },
    Armor: {
        type: Sequelize.STRING,
        defaultValue: "None",
    },
    // Dates
    LastDaily: {
        type: Sequelize.DATE,
        allowNull: true
    },
    LastShop: {
        type: Sequelize.DATE,
        allowNull: true
    },
    ShopPool: {
        type: Sequelize.STRING,
        allowNull: true
    },
    GambleStreak: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    DailyStreak: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    Inventory: {
        type: Sequelize.STRING,
        defaultValue: ""
    }

},
{
    timestamps: false,
});

module.exports = Profile;