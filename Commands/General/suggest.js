const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const Suggestion = require(path.join(__dirname, `..`, `..`, `models`, `Suggestions.js`));

module.exports = {
	data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Suggest things to make Yue better!")
    .addStringOption((option) =>
    option
      .setName("user_suggestion")
      .setDescription("What are you suggesting?")
      .setRequired(true)
    ),
	async execute(interaction) {
        Suggestion.create(
            {suggestion: interaction.options.getString("user_suggestion"),
            user: interaction.user.username},
            {where: {} }
            )
        interaction.reply(`Thank you for your suggestion!`);
	},
};