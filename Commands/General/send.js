const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const config = require(path.join(__dirname, `..`, `..`, `config.json`));

module.exports = {
	data: new SlashCommandBuilder()
    .setName("send")
    .setDescription("Send to certain channels")
    .addStringOption((option) =>
        option
            .setName("message_category")
            .setDescription(`What kind of channel am I sending to?`)
            .setRequired(true)
            .addChoices(
                {name: `Server Channel`, value: `Channel`},
                {name: `DM`, value: `DM`}
            ))
    .addStringOption((option) =>
        option
            .setName("id")
            .setDescription("Where am I talking?")
            .setRequired(true)
        )
    .addStringOption((option) =>
        option
            .setName("message_content")
            .setDescription("What am I Saying?")
            .setRequired(true)
    )
,
	async execute(interaction) {
        if (interaction.user.id == config.Arctic) {
        let MessageCategory = interaction.options.getString("message_category");
        let ID = interaction.options.getString("id");
        let MessageContent = interaction.options.getString("message_content");

        if (MessageCategory == "Channel") {
            client.channels.cache.get(`${ID}`).send(`${MessageContent}`);
        } else if (MessageCategory == "DM") {
            client.users.cache.get(`${ID}`).send(`${MessageContent}`);
        }

        interaction.reply(`Message Sent!`);
        }
	},
};