const Items = require("../models/Items.js")
Items.sync({alter: true});
console.log("Items database updated! (Added or changed a column)");