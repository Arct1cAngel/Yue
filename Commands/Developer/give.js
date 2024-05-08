const { SlashCommandBuilder } = require('discord.js');
const path = require('path'); // File System
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));
const config = require(path.join(__dirname, `..`, `..`, `config.json`));

module.exports = {
	data: new SlashCommandBuilder()
    .setName("give")
    .setDescription("Add cash to a user's balance.")
    .addUserOption((option) => 
    option
      .setName("target")
      .setDescription("Who would you like to add money to?")
      .setRequired(true)
    )
    .addNumberOption((option) =>
    option
      .setName("amount")
      .setDescription("How much are you adding to your balance?")
      .setRequired(true)
    ),
	async execute(interaction) {
        if (interaction.user.id == config.Arctic) {
            var Target = interaction.options.getUser('target');
            var Amount = interaction.options.get("amount").value;
            await Profile.sync({alter: true}).then(() => {
              return Profile.findByPk(Target.id);
            }).then((profile) => {
              Profile.update(
                {
                  Balance: profile.Balance + Amount
                },
                {where: {id: Target.id}}
              )
              interaction.reply(`Added $${Amount} to ${Target}'s balance!`);
              console.log(`Added $${Amount} to ${profile.Username.charAt(0).toUpperCase() + profile.Username.slice(1)}'s balance!`);
            }).catch(error => {
              interaction.reply(`Could not add to ${Target}'s balance because they don't have an account. Use /profile to make an account!`);
            });
        } else {
              interaction.reply("You don't have access to this command!");
        }
	},
};