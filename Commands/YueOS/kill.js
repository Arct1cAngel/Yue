const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("kill")
    .setDescription("I will kill your enemy.")
    .addUserOption((option) => 
    option
        .setName("target")
        .setDescription("Who's my mark, boss?")
        .setRequired(true)
    ),
    async execute(interaction) {
      var dmAble = true;
      var Target = interaction.options.getUser('target');
      await interaction.reply(`Okay, ill go out back and put <@${Target.id}> down like a dog.`);
      Target.send(`:boom: :gun: You're dead :)`).catch(error => { // Cannot DM Target
        dmAble = false;
      }).then(() => {if (dmAble == true) {interaction.followUp(`The job is done, boss. You won't hear of them again.`)} else {interaction.followUp(`They've got barracades, I can't break through. I'm sorry to have failed you, boss. (This user has blocked me or has dms turned off)`)}});
    }
}