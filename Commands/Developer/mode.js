const { SlashCommandBuilder, ActivityType } = require('discord.js');
const path = require('path');
const BotState = require(path.join(__dirname, `..`, `..`, `models`, `BotState.js`));
const config = require(path.join(__dirname, `..`, `..`, `config.json`));

module.exports = {
	data: new SlashCommandBuilder()
    .setName("mode")
    .setDescription("Changes Yue's current mode.")
    .addStringOption((option) =>
    option
      .setName("mode_type")
      .setDescription("What is Yue's mode being set to?")
      .setRequired(true)
      .addChoices(
        { name: "developement", value: "Developement" },
        { name: "casual", value: "Casual" },
      )
    ),
	async execute(interaction) {
        if (interaction.user.id == config.Arctic) {
            const mode = interaction.options.getString("mode_type");
            interaction.reply(`${mode} engaged!`);
            BotState.update(
              {state: mode},
              {where: {id: 1} }
              )
            BotState.sync({alter: true}).then(() => {
              return BotState.findByPk(1);
            }).then((CurrentState) => {
              console.log(`Updated Yue's state to: ${CurrentState.state} Mode`);
            });
            switch (mode) {
              case "Developement":
                client.user.setActivity("Arctic update my code.", {type: 3});
                break;
              case "Casual":
                client.user.setActivity({
                  type: ActivityType.Custom,
                  name: "💛",
                  state: "💛Yue Moment" });
                break;
            }
          } else {
            interaction.reply("You don't have access to this command!");
          }
	},
};