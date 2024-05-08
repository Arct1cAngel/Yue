const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));
function getRandomInt(max) { //Random number generator (getRandomInt(5) returns num from 1-5)
    return Math.floor(Math.random() * max);
}

module.exports = {
	data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Obtain a daily cash paycheque!"),
	async execute(interaction) {
        var RandomNumber = getRandomInt(100); // Random number from 1-100
        var Reply = "";
        var Bonus = 0;
        var daily = 100;
        if (!interaction.inGuild()) {
          interaction.reply({content: "This command is only for use in servers!", ephemeral: true});
          return;
        }
        Profile.sync({alter: true}).then(() => {
          return Profile.findByPk(interaction.user.id);
        }).then((profile) => {
          if (profile.LastDaily == null) {
            var LastDaily = "NoDate";
          } else {
            var LastDaily = profile.LastDaily.toDateString();
          }
          if (LastDaily == new Date().toDateString()) {
            interaction.reply(`You already claimed your daily today! Come back tomorrow to use the command again. (Refreshes at 4:00am GMT)`);
          } else {
            switch (profile.Class) {
              case "Merchant":
                if (RandomNumber <= 20) {
                Bonus = getRandomInt(50) * 3;
                Reply = " :star: Merchant bonus!";
                }
                break;
              case "Adventurer":
                if (RandomNumber <= 10) {
                  Bonus = (getRandomInt(25) * 4) + 150;
                  Reply = " :star: Adventurer bonus!";
                }
                break;
              case "Solo":
                if (RandomNumber <= 2) {
                  Bonus = (getRandomInt(10) *10) + 400;
                  Reply = " :star: Solo bonus!";
                }
                break;
            }
            Profile.update(
              {
                Balance: profile.Balance + daily + Bonus,
                LastDaily: new Date().toDateString()
              },
              { where: {id: interaction.user.id} }
            );
            interaction.reply(`Daily Claimed!${Reply} **$${daily + Bonus}** added to your daily paycheque! Your new balance is: __**$${profile.Balance + daily + Bonus}**__`);
          }
        }).catch(error => {
          interaction.reply(`Could not claim daily. Message Arctic_Angel for assistance.`);
          console.log(error);
        });
	},
};