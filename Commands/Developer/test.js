const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ComponentType } = require('discord.js'); // Buttons and Drop-Down Menus
const { ButtonBuilder, ButtonStyle } = require('discord.js'); // Buttons
const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, UserSelectMenuBuilder } = require('discord.js'); // Drop-Down Menus
function getRandomInt(max) {return Math.floor(Math.random() * max)}; // Random number generator (getRandomInt(5) returns num from 0-4)
const fs = require('fs');
const path = require('path');
const config = require(path.join(__dirname, `..`, `..`, `config.json`));
const Items = require(path.join(__dirname, `..`, `..`, `models`, `Items.js`));
const HP = require(path.join(__dirname, `..`, `..`, `HP.json`));
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function viewInventory(Target) {
    
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('testy')
		.addStringOption((option) =>
			option
			  .setName("tester")
			  .setDescription("option test")
			  .setRequired(true)),

	async execute(interaction) {
		
	},
};