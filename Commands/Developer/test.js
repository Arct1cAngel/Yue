const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('testy2'),
	async execute(interaction) {
		await interaction.reply('ayo whats up bro');
	},
};