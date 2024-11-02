const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));
const Items = require(path.join(__dirname, `..`, `..`, `models`, `Items.js`));
const config = require(path.join(__dirname, `..`, `..`, `config.json`));
const BetaTesters = ["383068633645187092","259462956675366922","437342477205241858","804774845753458709","600775123808550932","262886999550066690","348226359476224000", "262886999550066690"];

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
        await Profile.findByPk(Target.id).then(async (profile) => {
          let Spouse = `<@${profile.MarriedTo}>`;
          let Customization = profile.Customization.split(`,`);
          let CustomColor = Customization[0];
          let CustomMessage = Customization[1];
          let Balance;
          let Status = `__***${profile.Status}***__`
          let MagicEmoji;
          if (profile.Status == ``) Status = ``;
          if (profile.id == config.Yue) Balance = `Infinity`;
            else Balance = `$${profile.Balance}`;
          if (Spouse == `<@null>`) Spouse = `Nobody`;
          let Weapon = await Items.findOne({where: {Name: profile.Weapon}});
          let Magic = await Items.findOne({where: {Name: profile.Magic}});
          let Armor = await Items.findOne({where: {Name: profile.Armor}});
          let Shield = await Items.findOne({where: {Name: profile.Shield}});
          switch (Magic.Element) {
            case `Fire`:
              MagicEmoji = `🔥`;
              break;
            case `Ice`:
              MagicEmoji = `🧊`;
              break;
            case `Water`:
              MagicEmoji = `💧`;
              break;
            case `Lightning`:
              MagicEmoji = `⚡`;
              break;
            case `Wind`:
              MagicEmoji = `🍃`;
              break;
            default:
              MagicEmoji = `✨`;
              break;
          }
          let BetaTestBadge = ``;
          if (BetaTesters.includes(Target.id.toString())) BetaTestBadge = config.BetaTester;
          const profiledata = new EmbedBuilder()
          profiledata.setTitle(`${BetaTestBadge}  ${Target.username.charAt(0).toUpperCase() + Target.username.slice(1)}`);
          profiledata.setThumbnail(Target.avatarURL());
          profiledata.setColor(CustomColor);
          profiledata.setDescription(`${profile.Class} class\n**Balance: ${Balance}**`);
          profiledata.addFields(
            {name: `Health`, value: `${profile.Health} ${Status}`},
            {name: `Weapon ⚔️`, value: `${profile.Weapon}\nAttack: **${Weapon.Damage}**`, inline: true},
            {name: `Magic ${MagicEmoji}`, value: `${profile.Magic}\nAttack: **${Magic.Damage}**\nElement: **${Magic.Element}**`, inline: true},
            {name: `\t`, value: `\t`},
            {name: `Shield 🛡️`, value: `${profile.Shield}\nDefense: **${Shield.Damage.toString().replace(`-`,``)}**`, inline: true},
            {name: `Armor 👕`, value: `${profile.Armor}\nDefense: **${Armor.Damage.toString().replace(`-`,``)}**`, inline: true},
            {name: `\t`, value: `${CustomMessage}\nMarried to: ${Spouse}`},
            )
          interaction.reply({embeds: [profiledata]});
        }).catch(error => console.log(`${error}\n\nPrevented a crash`));
    },
}