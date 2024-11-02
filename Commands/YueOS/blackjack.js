const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ComponentType } = require('discord.js'); // Buttons and Drop-Down Menus
const { ButtonBuilder, ButtonStyle } = require('discord.js'); // Buttons
// File System
const fs = require('fs');
const path = require('path');
const config = require(path.join(__dirname, `..`, `..`, `config.json`));
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));
const BlackjackHelp = fs.readFileSync(path.join(__dirname, `..`, `..`, `EmbedMessages`, `BlackjackHelp.txt`)).toString();

const Deck = [
  `**A**${config.Spade}`,`**2**${config.Spade}`,`**3**${config.Spade}`,`**4**${config.Spade}`,`**5**${config.Spade}`,`**6**${config.Spade}`,`**7**${config.Spade}`,`**8**${config.Spade}`,`**9**${config.Spade}`,`**10**${config.Spade}`,`**J**${config.Spade}`,`**Q**${config.Spade}`,`**K**${config.Spade}`,
  `**A**${config.Heart}`,`**2**${config.Heart}`,`**3**${config.Heart}`,`**4**${config.Heart}`,`**5**${config.Heart}`,`**6**${config.Heart}`,`**7**${config.Heart}`,`**8**${config.Heart}`,`**9**${config.Heart}`,`**10**${config.Heart}`,`**J**${config.Heart}`,`**Q**${config.Heart}`,`**K**${config.Heart}`,
  `**A**${config.Club}`,`**2**${config.Club}`,`**3**${config.Club}`,`**4**${config.Club}`,`**5**${config.Club}`,`**6**${config.Club}`,`**7**${config.Club}`,`**8**${config.Club}`,`**9**${config.Club}`,`**10**${config.Club}`,`**J**${config.Club}`,`**Q**${config.Club}`,`**K**${config.Club}`,
  `**A**${config.Diamond}`,`**2**${config.Diamond}`,`**3**${config.Diamond}`,`**4**${config.Diamond}`,`**5**${config.Diamond}`,`**6**${config.Diamond}`,`**7**${config.Diamond}`,`**8**${config.Diamond}`,`**9**${config.Diamond}`,`**10**${config.Diamond}`,`**J**${config.Diamond}`,`**Q**${config.Diamond}`,`**K**${config.Diamond}`,
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
function getRandomInt(max) {return Math.floor(Math.random() * max)}; // Random number generator (getRandomInt(5) returns num from 0-4)
function NewCard(D,P) {
	let j;
	while (true) {
		j = getRandomInt(52); // generate a random number
		if (!(P.includes(Deck[j]) || D.includes(Deck[j]))) { // check if equal to a number already in either arrays passed
			break; // break if number available
		} // if not keeps looping
	}
	return j;
}

function HandValue(P) {
  let Value = [];
  let TotalValue = 0;
  for (let i=0;i<P.length;i++) {
    Value[i] = P[i].toString().substring(2,3);
    switch (Value[i]) {
      case `A`:
        Value[i] = `11`;
        break;
      case `1`: 
      Value[i] = `10`;
        break;
      case `J`:
        Value[i] = `10`;
        break;
      case `Q`:
        Value[i] = `10`;
        break;
      case `K`:
        Value[i] = `10`;
        break;
    }
  }
  Value = Value.map(i => parseInt(i,10));
  for (let i=0;i<Value.length;i++) {
    TotalValue += Value[i];
  }
  if (TotalValue > 21) {
    for (let i=0;i<Value.length;i++) {
      if (Value[i] == 11) {
          Value[i] = 1;
          TotalValue = 0;
          for (let i=0;i<Value.length;i++) {
            TotalValue += Value[i];
          }
          if (TotalValue <= 21) {
            break;
          }
      }
    }
  }
  return(TotalValue);
}

function Blackjack(P) {
	let Jacks = [`**J**${config.Spade}`,`**J**${config.Heart}`,`**J**${config.Club}`,`**J**${config.Diamond}`];
  let Aces = [`**A**${config.Spade}`,`**A**${config.Heart}`,`**A**${config.Club}`,`**A**${config.Diamond}`];
	if (HandValue(P) == 21 && Jacks.some(i => P.includes(i)) && Aces.some(i => P.includes(i))) {
		return true;
	} else {
		return false;
	}
}

module.exports = {
	data: new SlashCommandBuilder()
    .setName(`blackjack`)
    .setDescription(`Play a game of 1 deck blackjack`)
    .addNumberOption((option) =>
        option
          .setName("bet")
          .setDescription("How much are you betting?")
          .setRequired(true)
        )
,
	async execute(interaction) {
    let Dealer = [];
    let Player = [];
    let bet = Math.floor(interaction.options.get(`bet`).value);
    let profile = await Profile.findByPk(interaction.user.id);
    let Streak = profile.GambleStreak;

    const BlackJackUI = new EmbedBuilder()
    .setTitle(`Bet: ${bet}`)
    .setDescription(BlackjackHelp)
    .setColor(config.GambleRed)

    if (bet < 0) {
      interaction.reply(`You can't bet a negative number!`);
      return;
    } else if (profile.Balance - bet < 0) {
      interaction.reply(`You can't bet that much!`);
      return;
    }

    const Yes = new ButtonBuilder() // Know how to play
    .setCustomId('yes')
    .setLabel('Yes, lets gamble')
    .setEmoji('🎲')
    .setStyle(ButtonStyle.Danger);

    const No = new ButtonBuilder() // Dont know how to play
    .setCustomId('no')
    .setLabel("No, teach me")
    .setEmoji('🏧')
    .setStyle(ButtonStyle.Primary);

    const Hit = new ButtonBuilder() // Hit
    .setCustomId('hit')
    .setLabel('Hit')
    .setEmoji('🔥')
    .setStyle(ButtonStyle.Danger);

    const Stay = new ButtonBuilder() // Stay
    .setCustomId('stay')
    .setLabel("Stay")
    .setEmoji('🛏️')
    .setStyle(ButtonStyle.Primary);

    const reply = await interaction.reply({content: `Welcome to Blackjack. I will be your dealer today . . .\nDo you know how to play?`, components: [new ActionRowBuilder().addComponents(Yes, No)]});

    // Collect value from button
    const ButtonCollector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.user.id === interaction.user.id, // Only take selection from User
      time: 240_000 // Button reads for 240s (4min)
    });

    // On button pressed:
    ButtonCollector.on('collect', async (i) => {
      switch (i.customId) {
        case "yes":
          profile = await Profile.findByPk(interaction.user.id);
          if (profile.Balance - bet < 0) {
            i.update({content: `You can't afford to play two games at once! Bet smaller.`, components: []});
            return;
          }
          Profile.update({Balance: (profile.Balance - bet)}, {where: {id: interaction.user.id}}); // Take bet from User
          Dealer.push(Deck[NewCard(Player, Dealer)]);
          for (let i=0;i<2;i++) Player.push(Deck[NewCard(Dealer,Player)]); // Generate 2 cards for player (in for loop to prevent 2 identical cards)
          BlackJackUI.setDescription(`Yue: ${Dealer.toString()},❓ (${HandValue(Dealer)})\n\nYou: ${Player.toString()} (${HandValue(Player)})`);
          await i.update({content: ``, embeds: [BlackJackUI], components: [new ActionRowBuilder().addComponents(Hit, Stay)]});
          if (Blackjack(Player)) {
            Streak++;
            Profile.update({Balance: (profile.Balance + bet*1.5), GambleStreak: Streak}, {where: {id: interaction.user.id}});
            BlackJackUI.setDescription(`Yue: ${Dealer.toString()} (${HandValue(Dealer)})\n\nYou: ${Player.toString()} (${HandValue(Player)})\n**New Balance: ${profile.Balance + bet*1.5}**`);
            BlackJackUI.setColor(config.YueYellow);
            BlackJackUI.setFooter({text: `🔥Current Streak: ${Streak}🔥`});
            await i.editReply({content: `Woah! You got blackjack! (x1.5)\n`, embeds: [BlackJackUI], components: []});
          }
          if (HandValue(Player == 21)) {
            Hit.setDisabled(true);
          }
          break;
        case "no":
          No.setDisabled(true);
          await i.update({embeds: [BlackJackUI], components: [new ActionRowBuilder().addComponents(Yes, No)]});
          break;
        case "hit":
          profile = await Profile.findByPk(interaction.user.id);
          await Player.push(Deck[NewCard(Dealer,Player)])
          if (HandValue(Player) > 21) {
            BlackJackUI.setDescription(`Yue: ${Dealer.toString()},❓ (${HandValue(Dealer)})\n\nYou: ${Player.toString()} (${HandValue(Player)})\n**New Balance: ${profile.Balance}**`)
            Profile.update({GambleStreak: 0}, {where: {id: interaction.user.id}});
            await i.update({content: `Oh no, you bust!\nBetter luck next time . . .\n`, embeds: [BlackJackUI], components: []});
            break;
          } else {
            BlackJackUI.setDescription(`Yue: ${Dealer.toString()},❓ (${HandValue(Dealer)})\n\nYou: ${Player.toString()} (${HandValue(Player)})`);
            await i.update({embeds: [BlackJackUI], components: [new ActionRowBuilder().addComponents(Hit, Stay)]});
          }
          break;
        case "stay":
          profile = await Profile.findByPk(interaction.user.id);
          BlackJackUI.setDescription(`Yue: ${Dealer.toString()} (${HandValue(Dealer)})\n\nYou: ${Player.toString()} (${HandValue(Player)})`);
          await i.update({content: `Let's see if you can beat me . . .\n`, embeds: [BlackJackUI], components: []});
          for (;HandValue(Dealer) <= 16;) {
            await delay(500);
            Dealer.push(Deck[NewCard(Player, Dealer)]);
            if (Blackjack(Dealer) == true) {
              Profile.update({GambleStreak: 0}, {where: {id: interaction.user.id}});
              BlackJackUI.setDescription(`Yue: ${Dealer.toString()} (${HandValue(Dealer)})\n\nYou: ${Player.toString()} (${HandValue(Player)})\n**New Balance: ${profile.Balance}**`);
              await i.editReply({content: `Blackjack! I win, you lose!\n`, embeds: [BlackJackUI], components: []});
              return;
            }
            BlackJackUI.setDescription(`Yue: ${Dealer.toString()} (${HandValue(Dealer)})\n\nYou: ${Player.toString()} (${HandValue(Player)})`);
            await i.editReply({content: `Looking good so far.\n`, embeds: [BlackJackUI], components: []});
          }
          if (HandValue(Dealer) > 21) {
            Streak++;
            Profile.update({Balance: (profile.Balance + bet*2), GambleStreak: Streak}, {where: {id: interaction.user.id}});
            BlackJackUI.setDescription(`Yue: ${Dealer.toString()} (${HandValue(Dealer)})\n\nYou: ${Player.toString()} (${HandValue(Player)})\n**New Balance: ${profile.Balance + bet*2}**`);
            BlackJackUI.setColor(config.CommonGreen);
            BlackJackUI.setFooter({text: `🔥Current Streak: ${Streak}🔥`});
            await i.editReply({content: `Oh no, looks like I lose! (x1)\n`, embeds: [BlackJackUI], components: []});
          } else {
            if (HandValue(Player) > HandValue(Dealer)) {
            Streak++
            Profile.update({Balance: (profile.Balance + bet*2), GambleStreak: Streak}, {where: {id: interaction.user.id}});
            BlackJackUI.setDescription(`Yue: ${Dealer.toString()} (${HandValue(Dealer)})\n\nYou: ${Player.toString()} (${HandValue(Player)})\n**New Balance: ${profile.Balance + bet*2}**`);
            BlackJackUI.setColor(config.CommonGreen);
            BlackJackUI.setFooter({text: `🔥Current Streak: ${Streak}🔥`});
            await i.editReply({content: `Darn, you win! (x1)\n`, embeds: [BlackJackUI], components: []});
            } else if (HandValue(Player) == HandValue(Dealer)) {
              Profile.update({Balance: (profile.Balance + bet)}, {where: {id: interaction.user.id}});
              BlackJackUI.setDescription(`Yue: ${Dealer.toString()} (${HandValue(Dealer)})\n\nYou: ${Player.toString()} (${HandValue(Player)})\n**New Balance: ${profile.Balance + bet}**`);
              BlackJackUI.setColor(config.StandardPurple);
              BlackJackUI.setFooter({text: `🔥Current Streak: ${Streak}🔥`});
              await i.editReply({content: `Looks like we pushed. (No wins no losses)\n`, embeds: [BlackJackUI], components: []});
            } else {
              Profile.update({GambleStreak: 0}, {where: {id: interaction.user.id}});
              BlackJackUI.setDescription(`Yue: ${Dealer.toString()} (${HandValue(Dealer)})\n\nYou: ${Player.toString()} (${HandValue(Player)})\n**New Balance: ${profile.Balance}**`);
              await i.editReply({content: `Hehe, I win!\n`, embeds: [BlackJackUI], components: []});
            }
          }
          break;
      }
    });
	},
};