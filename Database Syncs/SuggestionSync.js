const Suggestion = require("../models/Suggestions");
Suggestion.sync({alter: true});
console.log("Suggestions database updated! (Added or changed a column)");