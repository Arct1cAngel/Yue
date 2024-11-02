const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// File System
const fs = require('fs');
const path = require('path');
const PrivacySafety = fs.readFileSync('./EmbedMessages/Privacy&Safety.txt').toString();
const config = require(path.join(__dirname, `..`, `..`, `config.json`));

module.exports = {
	data: new SlashCommandBuilder()
    .setName("legal")
    .setDescription("Read Yue's Privacy and Safety information and Legal Disclaimer."),

	async execute(interaction) {
        const PandSMessage = new EmbedBuilder()
        .setThumbnail(client.user.avatarURL())
        .setTitle(`Privacy and Safety Agreement + Legal Disclaimer`)
        .setDescription(PrivacySafety)
        .setColor(config.YueYellow)
        .setFooter({text: `Yue Version: ${config.YueVersion}`})
        interaction.reply({embeds: [PandSMessage]});
	},
};