const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));
const config = require(path.join(__dirname, `..`, `..`, `config.json`));

module.exports = {
	data: new SlashCommandBuilder()
    .setName("reset_daily")
    .setDescription("Globally reset Yue's daily commands :shushing_face:"),
	async execute(interaction) {
        if (interaction.user.id == config.Arctic) {
            Profile.update(
              {
                LastDaily: "No",
                LastShop: "No"
              },
              { where: {} }
            );
            interaction.reply(`Daily commands have been reset for all users.`)
          } else {
            interaction.reply("You don't have access to this command!");
          }
	},
};