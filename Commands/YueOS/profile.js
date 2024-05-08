const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));
const config = require(path.join(__dirname, `..`, `..`, `config.json`));

module.exports = {
    data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription('Displays a simple user profile.')
    .addUserOption((option) => 
    option
        .setName("target")
        .setDescription("Who's profile would you like to view?")
    ),
    async execute(interaction) {
        var Target = interaction.options.getUser('target');
        if (!Target) Target = interaction.user;
        // If Target does not own an account, create one
        Profile.upsert(
          {
            Username: Target.username,
            id: Target.id
          },
          {where: {id: Target.id}}
        )
        Profile.sync({alter: true}).then(() => {
          return Profile.findByPk(Target.id);
        }).then((profile) => {
          var Spouse = `<@${profile.MarriedTo}>`;
          if (Spouse == `<@null>`) Spouse = `Nobody`;
          const profiledata = new EmbedBuilder()
          profiledata.setTitle(`${Target.username}`);
          profiledata.setThumbnail(Target.avatarURL());
          switch (Target.id) {
            case config.Arctic:
              profiledata.setDescription(`${profile.Class} class\n\nBalance: $${profile.Balance}\nCreator of Yue\nMarried to: ${Spouse}`);
              profiledata.setColor(0x00ffaa);
              break;
            case config.Yue:
              profiledata.setDescription(`God class\n\nBalance: Infinity\nCoolest and Richest Bot :sunglasses:\nMarried to: ${Spouse}`);
              profiledata.setColor(0xffcc00);
              break;
            default:
              profiledata.setDescription(`${profile.Class} class\n\nBalance: $${profile.Balance}\nYou're kind of poor aren't you? :smirk:\nMarried to: ${Spouse}`);
              profiledata.setColor(0x5000FF);
              break;
          }
          interaction.reply({embeds: [profiledata]});
        });
    },
}