const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { ActionRowBuilder, ComponentType } = require('discord.js'); // Buttons and Drop-Down Menus
const { ButtonBuilder, ButtonStyle } = require('discord.js'); // Buttons
// File System
const path = require('path');
const config = require(path.join(__dirname, `..`, `..`, `config.json`));
const Servers = require(path.join(__dirname, `..`, `..`, `models`, `Servers.js`));

async function deleteGuild(Guild) {
    let Owner = await Guild.fetchOwner();
    const Goodbye = new EmbedBuilder()
    .setThumbnail(client.user.avatarURL())
    .setTitle(`Successfully removed from **${Guild.name}.**`)
    .setDescription(`Thank you for having me! I went and removed all of your data from our database.`)
    .setColor(config.YueYellow)
    .setFooter({text: `Yue Version: ${config.YueVersion}`})
    Owner.send({embeds: [Goodbye]});
    await Servers.destroy({where: {id: Guild.id}});
    Guild.leave();
}

module.exports = {
	data: new SlashCommandBuilder()
    .setName(`remove_yue`)
    .setDescription(`Remove Yue from your server and remove your data from her database.`)
,
	async execute(interaction) {
        let Guild = interaction.guild;
        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.KickMembers)) {
          interaction.reply({content:`You dont have permission to kick users!`, ephemeral: true});
          return;
        }

        const No = new ButtonBuilder() // Keep Yue
        .setCustomId('no')
        .setLabel("No")
        .setEmoji('😇')
        .setStyle(ButtonStyle.Primary);

        const Yes = new ButtonBuilder() // Remove Yue
        .setCustomId('yes')
        .setLabel('Yes')
        .setEmoji('😭')
        .setStyle(ButtonStyle.Danger);
        
        const reply = await interaction.reply({content: `Are you sure you want to remove Yue from your server? ⚠️ This will delete all of your server data off the database. ⚠️ (You have 30s to respond)`, components: [new ActionRowBuilder().addComponents(No, Yes)]});

        // Collect value from button
        const ButtonCollector = reply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          filter: i => i.user.id === interaction.user.id, // Only take selection from User
          time: 30_000 // Button reads for 30s
        });

        // On button pressed:
        ButtonCollector.on('collect', async (i) => {
          switch (i.customId) {
            case "yes":
                i.update({content: `I am leaving the server; goodbye everyone!`, components: []});
                await deleteGuild(Guild)
                break;
            case "no":
                i.update({content: `Why must you scare me like that!`, components: []});
                break;
          }
        });
	},
};