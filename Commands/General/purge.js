const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
    .setName(`purge`)
    .setDescription(`Purge max 100 messages (Cannot delete messages older than 2 weeks due to Discord API limitations.)`)
    .addNumberOption(option =>
        option
        .setName(`number`)
        .setDescription(`How many messages are you deleting?`)
        .setRequired(true)
    )
,
	async execute(interaction) {
        let PurgeAmount = interaction.options.get(`number`).value
        if (PurgeAmount > 100) {
            interaction.reply({content: `You can only delete 100 or less messages!`, ephemeral: true})
            return;
        }
        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageMessages)) {
            interaction.reply({content:`You dont have permission to delete messages!`, ephemeral: true});
            return;
          }
        await interaction.channel.bulkDelete(PurgeAmount);
        interaction.reply({content: `${PurgeAmount} messages cleared!`, ephemeral: true});
	},
};