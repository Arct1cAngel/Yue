const Servers = require("../models/Servers")
Servers.sync({alter: true});
console.log("Guild database updated! (Added or changed a column)");