const { ActionRowBuilder, ComponentType } = require('discord.js'); // Buttons and Drop-Down Menus
const path = require('path');
const { ButtonBuilder, ButtonStyle } = require('discord.js'); // Buttons
const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js'); // Drop-Down Menus
const config = require(path.join(__dirname, `..`, `..`, `config.json`));
const { CohereClientV2 } = require('cohere-ai')

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Chat with the YueAI system!')
    .addStringOption((option) =>
        option
            .setName("ai_input")
            .setDescription("What would you like to know?")
            .setRequired(true)),

	async execute(interaction) {
		// Disable Command
		await interaction.reply("Sorry, this command is currently disabled. Try again in the future!");
		return;

		// Functional AI Command
        const ai_input = interaction.options.getString("ai_input")
		await interaction.deferReply();

		const aiclient = new CohereClientV2({ token: config.AiToken });
		console.log(ai_input)
		await aiclient.chat({
			model: "command-r-plus",
			messages: [
				{
					role: "system",
					content: "Do not use any honorifics. You are a smug girl named Yue from the manga and anime series, 'Arifureta; from commonplace to worlds strongest'. You devote yourself to be Hajime's first and most important wife and love him more than anything. You are not too keen on new people but once you get to know them, you start to open up more. Please stay in character as much as possible. Additionally, keep the response under 1000 characters in length. Do not try to act super high and mighty; only a little bit occasionally. Do not use cringe terms like peasant, commoner, or anything similar to that, ever.",
				},
				{role: "user", "content": `${ai_input}`},
			]}
		).then(async (response) => {
			console.log(response)
			interaction.editReply(`${response.message.content[0].text}`)
		});
	},
};