const { SlashCommandBuilder, EmbedBuilder, } = require('discord.js');
const path = require('path');
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));
const config = require(path.join(__dirname, `..`, `..`, `config.json`));
function getRandomInt(max) {return Math.floor(Math.random() * max)}; // Random number generator (getRandomInt(5) returns num from 0-5)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));


//path.join(__dirname, `..`, `..`, `roulette.gif`)

module.exports = {
	data: new SlashCommandBuilder()
    .setName("roulette")
    .setDescription("You can only not win if you dont try")
    .addStringOption((option) => 
        option
          .setName("slot")
          .setDescription("Red, Black, or Green?")
          .setRequired(true)
          .addChoices(
            { name: "Red (x2)", value: "Red" },
            { name: "Black (x2)", value: "Black" },
            { name: "Green (x8)", value: "Green" }
          )
        )
    .addNumberOption((option) =>
        option
          .setName("bet")
          .setDescription("How much are you betting?")
          .setRequired(true)
        ),
	async execute(interaction) {
        const choice = interaction.options.getString("slot");
        let bet = Math.floor(interaction.options.get(`bet`).value);
        let profile = await Profile.findByPk(interaction.user.id);
        let Color;
        let Response = "Better luck next time..";
        let Streak = profile.GambleStreak;

        const RouletteUI = new EmbedBuilder()
        .setTitle(`You bet: ${choice} for $${bet}, Ready?`)
        .setColor(config.White)

        if (bet < 0) {
            interaction.reply(`You can't bet a negative number!`);
            return;
        } else if (profile.Balance - bet < 0) {
            interaction.reply(`You can't bet that much!`)
        } else {
            await Profile.update({Balance: (profile.Balance - bet)}, {where: {id: interaction.user.id}});
            await interaction.reply({embeds: [RouletteUI]});
            await delay(1000)
            RouletteUI.setTitle(`You bet: ${choice} for $${bet}.`);
            RouletteUI.setImage(`https://cdn.discordapp.com/attachments/511016797294690314/1241820665124884662/roulette.gif?ex=664b971e&is=664a459e&hm=f18be6a4070bf96eb6b6a0fadee2b010e78094a89a27166a4fabd10a00e606b8&`);
            await interaction.editReply({embeds: [RouletteUI]});
            const LandedOn = getRandomInt(38);

        // Roulette
        if (LandedOn <= 18) {
            Color = `Red`
            RouletteUI.setColor(config.GambleRed)
        } else if (LandedOn > 18 && LandedOn < 37) {
            Color = `Black`
            RouletteUI.setColor(config.Black)
        } else {
            Color = `Green`
            RouletteUI.setColor(config.CommonGreen)
        }

        // Payouts
        if (Color == "Green" && choice == "Green") {
            Response = `Congratulations you win **BIG**! (Bet x 8)`;
            Streak++
            bet *= 8;
        } else if (Color == choice) {
            Response = `Congratulations you win! (Bet x 2)`;
            Streak++
            bet *= 2;
        } else {
            if (getRandomInt(20) == 0 && profile.Class == "Gambler") {
                Response = `Oh, you're a registered gambler? I can let it slide this one time . . .`
            } else {
                Streak = 0;
                bet = 0;
            }
        }

        // Final Message
        await delay(5000)
        profile = await Profile.findByPk(interaction.user.id);
        RouletteUI.setImage();
        RouletteUI.setTitle(`It landed on ${Color}!`);
        RouletteUI.setDescription(`${Response}\n**New Balance: ${profile.Balance + bet}**`);
        profile = await Profile.findByPk(interaction.user.id); // Take most recent profile
        await Profile.update({Balance: (profile.Balance + bet), GambleStreak: Streak}, {where: {id: interaction.user.id}});
        if (Streak != 0) {
            RouletteUI.setFooter({text: `🔥Current Streak: ${Streak}🔥`});
        }
        await interaction.editReply({embeds: [RouletteUI]});
    }
	},
};