const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));

module.exports = {
	data: new SlashCommandBuilder()
    .setName("richest")
    .setDescription("See who the current richest user is!"),
	async execute(interaction) {
        Profile.sync({alter: true}).then(() => {
            return Profile.max("Balance", {where: {}});
        }).then((MaxBalance) => {
            return Profile.findOne({where: {Balance: MaxBalance}})
        }).then((RichestUser) => {
            var reply = `${RichestUser.Username} is the current richest user with $${RichestUser.Balance}. Knock them down like the twin towers and become the new richest!`;
            interaction.reply(reply.charAt(0).toUpperCase() + reply.slice(1));
        });
	},
};