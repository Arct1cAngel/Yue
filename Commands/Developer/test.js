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
    let profile = await Profile.findByPk(Target.id);
    let Customization = profile.Customization.split(`,`);
    let CustomColor = Customization[0];
    let remainingInventory = 25 - profile.Inventory.split(`\r\n`).length;
    if (profile.Inventory == "") remainingInventory = 25;
    const inventoryData = new EmbedBuilder()
    .setTitle(`${Target.username.charAt(0).toUpperCase() + Target.username.slice(1)}'s Inventory`)
    .setThumbnail(Target.avatarURL())
    .setColor(CustomColor)
    .setDescription(`Equiped:\n**⚔️Weapon:** ${profile.Weapon}\n**✨Magic:** ${profile.Magic}\n**🛡️Shield:** ${profile.Shield}\n**👕Armor:** ${profile.Armor}\n\nInventory:\n${profile.Inventory}`)
    .setFooter({text: `💼Remaining inventory slots: ${remainingInventory}💼`})
    return inventoryData;
}

async function findItem(Inventory, UserID, EquipOrTrade) {
    let Max = 1;
    if (EquipOrTrade != "equip?") {
        Max = 4;
    } 
    Inventory = (await Profile.findByPk(UserID)).Inventory.split(`\r\n`);
    const ItemMenu = new StringSelectMenuBuilder()
    .setCustomId('EquipMenu')
    .setPlaceholder(`What would you like to ${EquipOrTrade}`)
    if (Inventory == "") {
        ItemMenu.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(`You currently have no items in your inventory!`)
                .setValue(`You currently have no items in your inventory!`)
                .setDescription(`No items found!`)
        );
        return ItemMenu;
    }
    for (let i=0;i < Inventory.length;i++) {
        let Item = await Items.findOne({where: {Name: Inventory[i]}})
        let Property = "Damage";
        let SellPrice = Math.floor(Item.Cost * 0.25);
        if (Item.Category == "Shield" || Item.Category == "Armor") {
            Property = "Defense";
            PosNegChanger = -1;
        }
        ItemMenu.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(Inventory[i])
                .setValue(Inventory[i])
                .setDescription(`${Property}: ${Item.Damage} | Sell Price: ${SellPrice}`)
                .setEmoji('😈')
        );
    }
    return ItemMenu;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('testy2'),
	async execute(interaction) {
		interaction.reply(`testing . . .`);
	},
};