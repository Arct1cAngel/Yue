const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, ComponentType } = require('discord.js'); // Buttons and Drop-Down Menus
const { ButtonBuilder, ButtonStyle } = require('discord.js'); // Buttons
const path = require('path');
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));

module.exports = {
	data: new SlashCommandBuilder()
    .setName("divorce")
    .setDescription("Divorce your spouse."),
	async execute(interaction) {
        var canDivorce = false;
        var cost = 2000;
        var Balance;
        // Find account owned by User
        await Profile.findByPk(interaction.user.id).then(async (profile) => {
          Balance = profile.Balance;
          if (!profile.MarriedTo) {
            interaction.reply(`You aren't married to anybody!`);
            return;
          } else {
            if (profile.Balance - cost < 0) { // Check if User has enough money to marry
              interaction.reply("You lack the funds to file a divorce, it costs $2000 to divorce your spouse.");
              canDivorce = false;
              return;
            } else { canDivorce = true; }
          }
        });
        if (canDivorce == true) {
        const Yes = new ButtonBuilder() // Divorce
        .setCustomId('yes')
        .setLabel('Yes')
        .setEmoji('❤️‍🔥')
        .setStyle(ButtonStyle.Danger);

        const No = new ButtonBuilder() // Stay married
        .setCustomId('no')
        .setLabel("No")
        .setEmoji('❤️')
        .setStyle(ButtonStyle.Primary);
        
        // Find account owned by User
        await Profile.findByPk(interaction.user.id).then(async (profile) => {
        const reply = await interaction.reply({content: `Are you sure you want to divorce <@${profile.MarriedTo}>? (You have 30s to respond)`, components: [new ActionRowBuilder().addComponents(Yes, No)]});

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
              interaction.editReply({content: `You and <@${profile.MarriedTo}> are nolonger married.`, components: []});
              await Profile.update({MarriedTo: null},{where: {id: profile.MarriedTo}}); // Divorce User from Spouse
              await Profile.update({MarriedTo: null, Balance: Balance - cost},{where: {id: interaction.user.id}}); // Divorce Spouse from User
              break;
            case "no":
              interaction.editReply({content: `Don't play with feelings like that.`, components: []});
              break;
          }
        });
        });
      } else {
        return;
      }
	},
};