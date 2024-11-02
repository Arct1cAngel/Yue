const { SlashCommandBuilder } = require('discord.js');
// File System
const path = require('path');
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));
let cost = 2500;

module.exports = {
	data: new SlashCommandBuilder()
    .setName(`heal`)
    .setDescription(`Heal your health to full and clear all status effects. - ${cost}`)
,
	async execute(interaction) {
        let profile = await Profile.findByPk(interaction.user.id);
        if (profile.Balance - cost < 0) { // Check if User has enough money to marry
            interaction.reply(`You lack the funds to heal, it costs ${cost} to heal.`);
            return;
        }
        Profile.update({Balance: profile.Balance - cost, Status: ``, Health: `▰▰▰▰▰▰▰▰▰▰ 100/100`}, {where: {id: interaction.user.id}});
        interaction.reply(`Health restored to full and status effect cleared!\n**New Balance: ${profile.Balance - cost}**`);
	},
};