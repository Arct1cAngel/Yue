const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Refreshes the bot."),
	async execute(interaction) {
        // Client uptime in days, hours, minutes, and seconds
        var totalSeconds = (client.uptime / 1000);
        var days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        var hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = Math.floor(totalSeconds % 60);

        const sent = interaction.deferReply("Please wait . . .");
        interaction.editReply(`Bot Refreshed!\n----------------\nRoundtrip Ping: ${(await sent).createdTimestamp - await interaction.createdTimestamp}ms\nDiscord API Ping: ${client.ws.ping}ms\nYue has been running for **${days}** days, **${hours}** hours, **${minutes}** minutes, and **${seconds}** seconds.`);  
	},
};