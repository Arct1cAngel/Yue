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
        var DmAble = true;
        var Target = interaction.options.getUser('target');
        interaction.reply(`Okay, ill go out back and put <@${Target.id}> down like a dog.`);
        Target.send(":boom: :gun: You're dead :)").catch(error => {
        interaction.user.send("They've got barracades, I can't break through. I'm sorry to have failed you, boss. (This user has blocked me or has dms turned off)")
        DmAble = false;
        return;
        }).catch(error => {
          interaction.editReply(`There seems to be a lot of radio interference, I cannot kill that target. (Both you and your target have dms turned off)`)
          DmAble = false;
          return;
        });
      if (DmAble == true) interaction.user.send("The job is done, boss. You won't hear of them again.").catch(error => {interaction.editReply("Your dms seem to be off, boss. However I killed them anyway for you.")});
    }
}