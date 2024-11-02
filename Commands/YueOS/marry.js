const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, ComponentType } = require('discord.js'); // Buttons and Drop-Down Menus
const { ButtonBuilder, ButtonStyle } = require('discord.js'); // Buttons
const path = require('path');
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));

module.exports = {
	data: new SlashCommandBuilder()
    .setName("marry")
    .setDescription("Marry another user.")
    .addUserOption((option) =>
    option
      .setName("target")
      .setDescription("Who are you proposing to?")
      .setRequired(true)
    ),
	async execute(interaction) {
        var Target = interaction.options.getUser('target');
        var CanMarry = true;
        var cost = 1000;
        var Balance;
        // If User does not own an account, create one
        await Profile.findByPk(interaction.user.id).catch(await Profile.upsert({Username: interaction.user.username, id: interaction.user.id}, {where: {}})).then(async (profile) => {
          Balance = profile.Balance;
          if (profile.MarriedTo) {
            interaction.reply(`You're already married! Don't be a cheater.`); // If User is already married
            CanMarry = false;
            return;
          }
          if (profile.Balance - cost < 0) { // Check if User has enough money to marry
            interaction.reply("You lack the funds to propose, it costs $1000 to propose to somebody.");
            CanMarry = false;
            return;
          } else if (Target == interaction.user) {
            interaction.reply("You can't marry yourself!");
            CanMarry = false;
            return;
          }
        });
        if (!CanMarry) return; // If User cannot marry, cancel command

        const Yes = new ButtonBuilder() // "I do"
        .setCustomId('yes')
        .setLabel('I do.')
        .setEmoji('💒')
        .setStyle(ButtonStyle.Success);

        const No = new ButtonBuilder() // "I don't"
        .setCustomId('no')
        .setLabel("I'm sorry I do not.")
        .setEmoji('💔')
        .setStyle(ButtonStyle.Primary);

        await Profile.findByPk(Target.id).then(async (profile) => { // Target found
          if (profile.MarriedTo == null) { // Target is not married
            const reply = await interaction.reply({content: `<@${Target.id}>, <@${interaction.user.id}> is proposing to you! Do you take them as your spouse? (You have 30s to respond)`, components: [new ActionRowBuilder().addComponents(Yes, No)]});
            
            // Only take selection from Target
            const collectorFilter = i => i.user.id === Target.id;

            // Collect value from button
            const ButtonCollector = reply.createMessageComponentCollector({
              componentType: ComponentType.Button,
              filter: collectorFilter,
              time: 30_000 // Button reads for 30s
            });

            // On button pressed:
            ButtonCollector.on('collect', async (i) => {
              switch (i.customId) {
                case "yes":
                  await Profile.update({MarriedTo: Target.id, Balance: Balance - cost},{where: {id: interaction.user.id}}); // Marry User to Target
                  await Profile.update({MarriedTo: interaction.user.id},{where: {id: Target.id}}); // Marry Target to User
                  interaction.editReply({content: `Congratulations! <@${interaction.user.id}> and <@${Target.id}> are now married!`, components: []});
                  break;
                case "no":
                  interaction.editReply({content: `I'm terribly sorry. But, <@${Target.id}> declined your proposal.`, components: []});
                  break;
              }
            });

          } else { // Already married
            interaction.reply(`This user is already in a relationship!`);
          }
        }).catch(async (error) => { // Target not found
          await interaction.reply({content: `Could not propose to ${Target} try again later.`});
        });
	},
};