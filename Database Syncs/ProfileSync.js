const Profile = require("../models/Profile");
Profile.sync({alter: true});
console.log("Profile database updated! (Added or changed a column)");