const { SlashCommandBuilder } = require('discord.js');
const path = require('path'); // File System
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));
const config = require(path.join(__dirname, `..`, `..`, `config.json`));

module.exports = {
	data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Pay another user.")
    .addUserOption((option) => 
    option
      .setName("target")
      .setDescription("Who would you like to pay?")
      .setRequired(true)
    )
    .addNumberOption((option) =>
    option
      .setName("amount")
      .setDescription("How much are you paying?")
      .setRequired(true)
    ),
	async execute(interaction) {
            var Target = interaction.options.getUser('target');
            var Amount = interaction.options.get("amount").value;
            let targetProfile = await Profile.findByPk(Target.id);
            let userProfile = await Profile.findByPk(interaction.user.id);
            if (Amount < 0) {
              interaction.reply(`You can't pay a negative number!`);
              return;
            } else if (Amount == 0) {
              interaction.reply(`You can't pay $0!`);
              return;
            } else if (Target == interaction.user) {
              interaction.reply(`You can't pay yourself!`);
              return;
            } else if (userProfile.Balance - Amount < 0) {
              interaction.reply(`You lack the funds to pay this user that much!`);
              return;
            }
              Profile.update(
                {
                  Balance: targetProfile.Balance + Amount
                },
                {where: {id: Target.id}}
              ).catch(error => {
                interaction.reply(`Could not add to ${Target}'s balance because they don't have an account. Use /profile to make an account!`);
                return;
              });
              Profile.update(
                {
                    Balance: userProfile.Balance - Amount
                },
                {where: {id: interaction.user.id}}
              )
              interaction.reply(`Paid $${Amount} to ${Target}!\n**New Balance: ${userProfile.Balance - Amount}**`);
	},
};