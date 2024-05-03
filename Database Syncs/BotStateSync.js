const BotState = require("../models/BotState")
BotState.sync({alter: true});
console.log("BotState database updated! (Added or changed a column)");