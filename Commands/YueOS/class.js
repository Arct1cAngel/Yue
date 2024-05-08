const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));

module.exports = {
	data: new SlashCommandBuilder()
    .setName("class")
    .setDescription("Choose your class!")
    .addStringOption((option) =>
    option
      .setName("class_choice")
      .setDescription("What class are you registering for?")
      .setRequired(true)
      .addChoices(
        { name: "Merchant - $1000", value: "Merchant" },
        { name: "Adventurer - $500", value: "Adventurer" },
        { name: "Solo - $200", value: "Solo"}
      )
    ),
	async execute(interaction) {
        const ClassChoice = interaction.options.getString("class_choice");
        var cost;
        switch (ClassChoice) {
          case "Adventurer":
            cost = 500;
            break;
          case "Merchant":
            cost = 1000;
            break;
          case "Solo":
            cost = 200;
            break;
        }
        Profile.sync({alter: true}).then(() => {
          return Profile.findByPk(interaction.user.id);
        }).then((profile) => {
          if (profile.Balance - cost < 0) {
          interaction.reply("You lack the funds to register to this class, go beg on the street you hobo.");
            return;
          } else {
          Profile.update(
            {
              Balance: profile.Balance - cost,
              Class: ClassChoice
            },
            { where: {id: interaction.user.id} }
          )
          interaction.reply(`${ClassChoice} class purchased!`);
          console.log(`Updated ${profile.Username.charAt(0).toUpperCase() + profile.Username.slice(1)}'s class to: ${ClassChoice}`);
        }
        }).catch(error => {
          interaction.reply(`Could not register to a class. Message Arctic_Angel for assistance.`);
        });
	},
};