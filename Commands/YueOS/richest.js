//This command uses the GUILD_MEMBERS priviledged intent. When verified, apply for this intent.
const { SlashCommandBuilder } = require('discord.js');
const path = require('path');
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));

module.exports = {
	data: new SlashCommandBuilder()
    .setName("richest")
    .setDescription("See who the current richest user is!")
    .addStringOption(option =>
        option
        .setName(`location`)
        .setDescription(`Which leaderboard would you like to view?`)
        .setRequired(true)
        .addChoices(
            {name: `Global`, value: `Global`},
            {name: `Server`, value: `Server`}
        )
    ),
	async execute(interaction) {
        if (interaction.options.getString(`location`) == `Global`) {
        await Profile.max("Balance", {where: {}}).then((MaxBalance) => {
            return Profile.findOne({where: {Balance: MaxBalance}})
        }).then((RichestUser) => {
            var reply = `${RichestUser.Username} is the current richest user with $${RichestUser.Balance}. Knock them down like the twin towers and become the new richest!`;
            interaction.reply(reply.charAt(0).toUpperCase() + reply.slice(1));
        });
    } else if (interaction.options.getString(`location`) == `Server`) {
        let Users = [];
        let Members = await interaction.guild.members.fetch(); // cache all users in sever
        Members.forEach(member => {
            Users.push(member.id) // push user id to array for each user
        });
        console.log(Users); //array of all user ids in the current server
        interaction.reply(`WORK IN PROGRESS!`);
    }
	},
};