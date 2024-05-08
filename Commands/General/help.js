const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'); // Slash Commands and Embeds
const { ActionRowBuilder, ComponentType } = require('discord.js'); // Buttons and Drop-Down Menus
const { ButtonBuilder, ButtonStyle } = require('discord.js'); // Buttons
// File System
const fs = require('fs');
const path = require('path');
const config = require(path.join(__dirname, `..`, `..`, `config.json`)); // Config

module.exports = {
	data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get information regarding Yue and how she works."),
	async execute(interaction) {
        const CommandList = fs.readFileSync(path.join(__dirname, `..`, `..`, `EmbedMessages`, `CommandList.txt`)).toString();
        const BotHelp = fs.readFileSync(path.join(__dirname, `..`, `..`, `EmbedMessages`, `BotHelp.txt`)).toString();
        const EconomyDetails = fs.readFileSync(path.join(__dirname, `..`, `..`, `EmbedMessages`, `EconomyDetails.txt`)).toString();
        const ClassDetails = fs.readFileSync(path.join(__dirname, `..`, `..`, `EmbedMessages`, `ClassDetails.txt`)).toString();
        var Description = BotHelp;
        
        const Help = new EmbedBuilder() // Help embed
        Help.setTitle(`${interaction.client.user.username}`);
        Help.setThumbnail(interaction.client.user.avatarURL());
        Help.setFooter({text: `Yue Version: ${config.YueVersion}`});
        Help.setDescription(Description);
        Help.setColor("#aaaaaa");

        // Buttons for help command
        const CommandButton = new ButtonBuilder()
        .setCustomId('commands')
        .setLabel('Command List')
        .setStyle(ButtonStyle.Secondary);

        const EconomyButton = new ButtonBuilder()
        .setCustomId('economy')
        .setLabel('Economy Info')
        .setStyle(ButtonStyle.Secondary);

        const ClassButton = new ButtonBuilder()
        .setCustomId('classes')
        .setLabel('Class Info')
        .setStyle(ButtonStyle.Secondary);

        const reply = await interaction.reply({embeds: [Help], components: [new ActionRowBuilder().addComponents(CommandButton, ClassButton, EconomyButton)]}); // Message as a variable

        const collectorFilter = i => i.user.id === interaction.user.id; // Only take selection from command user

        // Collect value from button
        const ButtonCollector = reply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          filter: collectorFilter,
          time: 30_000 // Button reads for 30s
        });

        // Upon value taken from button
        ButtonCollector.on('collect', async (i) => {
          switch (i.customId) {
            case "commands":
              Description = CommandList;
              break;
            case "economy":
              Description = EconomyDetails;
              break;
            case "classes":
              Description = ClassDetails;
              break;
          }
          Help.setDescription(Description);
          i.update({embeds: [Help]});
        });
	},
};