const Suggestion = require("../models/Suggestions");
Suggestion.sync({force: true});
console.log("Suggestions database cleared!");