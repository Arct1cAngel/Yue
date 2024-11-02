const Sequelize = require('sequelize');
const Table = require("../database");

const Servers = Table.define("Server", {
    Name: {
        type: Sequelize.STRING
    },
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    AnnouncementsChannel: {
        type: Sequelize.INTEGER
    },
    PublicMessageChannel: {
        type: Sequelize.INTEGER
    }
},
{
    timestamps: false,
});

module.exports = Servers;