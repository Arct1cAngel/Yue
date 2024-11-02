const { SlashCommandBuilder, EmbedBuilder, UserSelectMenuBuilder } = require('discord.js');
const { ActionRowBuilder, ComponentType } = require('discord.js'); // Buttons and Drop-Down Menus
const { ButtonBuilder, ButtonStyle } = require('discord.js'); // Buttons
const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js'); // Drop-Down Menus
// File System
const fs = require('fs');
const path = require('path');
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));
const Items = require(path.join(__dirname, `..`, `..`, `models`, `Items.js`));
const config = require(path.join(__dirname, `..`, `..`, `config.json`));

async function viewInventory(Target, Equipped) {
    if (Equipped) Equipped = `***${Equipped} equipped!***\n\n`;
        else Equipped = ``;
    let profile = await Profile.findByPk(Target.id);
    let Inventory = profile.Inventory.split(`\r\n`);
    if (Inventory.includes("Nothing")) Inventory.splice(Inventory.indexOf("Nothing"));
    Profile.update({Inventory: Inventory.join(`\r\n`)}, {where: {id: Target.id}});
    profile = await Profile.findByPk(Target.id);
    let Customization = profile.Customization.split(`,`);
    let CustomColor = Customization[0];
    let remainingInventory = 24 - profile.Inventory.split(`\r\n`).length;
    if (profile.Inventory == "") remainingInventory = 24;
    const inventoryData = new EmbedBuilder()
    .setTitle(`${Target.username.charAt(0).toUpperCase() + Target.username.slice(1)}'s Inventory`)
    .setThumbnail(Target.avatarURL())
    .setColor(CustomColor)
    .setDescription(`${Equipped}Equiped:\n**⚔️Weapon:** ${profile.Weapon}\n**✨Magic:** ${profile.Magic}\n**🛡️Shield:** ${profile.Shield}\n**👕Armor:** ${profile.Armor}\n\nInventory:\n${profile.Inventory}`)
    .setFooter({text: `💼Remaining inventory slots: ${remainingInventory}/24💼`})
    return inventoryData;
}

async function findItem(Inventory, UserID, EquipOrTrade) {
    Inventory = (await Profile.findByPk(UserID)).Inventory.split(`\r\n`);
    const ItemMenu = new StringSelectMenuBuilder()
    .setCustomId('EquipMenu')
    .setPlaceholder(`What would you like to ${EquipOrTrade}`)
    .addOptions(new StringSelectMenuOptionBuilder().setLabel(`Nothing`).setValue(`Nothing`).setDescription(`Nothing`))
    if (Inventory == "") {
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
    .setName(`inventory`)
    .setDescription(`View the contents of your inventory.`)
    .addUserOption((option) => 
        option
            .setName("target")
            .setDescription("Who's inventory would you like to view?")
        )
,
	async execute(interaction) {
        let Target = interaction.options.getUser('target');
        if (Target) {
            interaction.reply({embeds: [await viewInventory(Target)]});
            return;
        }
        if (!Target) Target = interaction.user;
        let Inventory = (await Profile.findByPk(interaction.user.id)).Inventory.split(`\r\n`);

        const Trade = new ButtonBuilder() // Trade
        .setCustomId('trade')
        .setLabel('Trade Menu')
        .setStyle(ButtonStyle.Primary);

        const Equip = new ButtonBuilder() // Equip
        .setCustomId('equip')
        .setLabel("Equip Menu")
        .setStyle(ButtonStyle.Primary);
        
        const reply = await interaction.reply({embeds: [await viewInventory(Target)], components: [new ActionRowBuilder().addComponents(Trade, Equip)]});

        // Collect value from button
        const ButtonCollector = reply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          filter: i => i.user.id === interaction.user.id, // Only take selection from User
          time: 30_000 // Button reads for 30s
        });

        // On button pressed:
        ButtonCollector.on('collect', async (i) => {
          switch (i.customId) {
            case "trade":

                const Confirm = new ButtonBuilder() // Confirm
                .setCustomId('confirm')
                .setLabel('Confirm Offer')
                .setStyle(ButtonStyle.Success);

                const userMenu = new UserSelectMenuBuilder()
                .setCustomId(`userMenu`)

                let TradeReply = await i.update({content: `Who are you trading with and what would you like to trade?`, embeds: [], components: [new ActionRowBuilder().addComponents(userMenu), new ActionRowBuilder().addComponents(await findItem(Inventory, interaction.user.id, "trade?")), new ActionRowBuilder().addComponents(Confirm)]});

                let currentUser = interaction.user.id
                // Collect value from user menu
                const UserCollector = TradeReply.createMessageComponentCollector({
                    componentType: ComponentType.UserSelect,
                    filter: i => i.user.id === interaction.user.id, // Only take selection from User,
                    time: 120_000 // Menu reads for 2m
                });
            
                let tradeTarget;
                // On option pressed:
                UserCollector.on('collect', async (i) => {
                    tradeTarget = i.values.toString();
                    if (tradeTarget == interaction.user.id) {
                        i.update({content: `You cannot trade with yourself! Ending trade . . .`, embeds: [], components: []});
                        return;
                    }
                    await Profile.findByPk(tradeTarget).catch(await Profile.upsert({Username: (await client.users.fetch(tradeTarget)).username, id: tradeTarget}, {where: {}})).catch(error => console.log(`${error}\n\nPrevented a crash in inventory.js (line 127).`));
                    TradeReply = await i.update(`Trading with <@${tradeTarget}> . . .`)
                });

                // Collect value from trade menu
                const TradeMenuCollector = TradeReply.createMessageComponentCollector({
                    componentType: ComponentType.StringSelect,
                    filter: i => i.user.id === currentUser, // Only take selection from User responding,
                    time: 120_000 // Menu reads for 2m
                });
            
                let userOffer;
                let targetOffer;
                let confirmPress = 0;
                // On option pressed:
                TradeMenuCollector.on('collect', async (i) => {
                    if (currentUser == interaction.user.id) {
                        userOffer = i.values.toString();
                        let targetUser;
                        if (!tradeTarget) targetUser = `nobody`;
                            else {
                                targetUser = `<@${tradeTarget}>`;
                            }
                        TradeReply = await i.update(`Trading ***${i.values.toString()}*** with ${targetUser}`);
                    } else {
                        targetOffer = i.values.toString();
                        TradeReply = await i.update({content: `<@${interaction.user.id}> receives: ***${targetOffer}***\n\n<@${tradeTarget}> receives: ***${userOffer}***\n\n<@${interaction.user.id}>, do you accept this trade?`, components: [new ActionRowBuilder().addComponents(Confirm)]});
                        currentUser = interaction.user.id;
                    }
                });

                // Collect value from confirm button
                const ConfirmButtonCollector = TradeReply.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    filter: i => i.user.id === currentUser, // Only take selection from User responding
                    time: 120_000 // Button reads for 2m
                });
        
                // On confirm button pressed:
                ConfirmButtonCollector.on('collect', async (i) => {
                    if (confirmPress == 0) {
                        currentUser = tradeTarget;
                        TradeReply = await i.update({content: `<@${tradeTarget}> what are you trading against ${userOffer}?\n⚠️ What you select is what you offer ⚠️`, embeds: [], components: [new ActionRowBuilder().addComponents(await findItem(Inventory, tradeTarget, "trade?"))]});
                    } else {
                        await i.update({content: `Trade complete!\n<@${interaction.user.id}> traded their ${userOffer} for <@${tradeTarget}>'s ${targetOffer}!`, components: []})
                        
                        let userInventory = (await Profile.findByPk(interaction.user.id)).Inventory.split(`\r\n`);
                        let targetInventory = (await Profile.findByPk(tradeTarget)).Inventory.split(`\r\n`);
                        userInventory.splice(userInventory.indexOf(userOffer), 1, targetOffer);
                        targetInventory.splice(targetInventory.indexOf(targetOffer), 1, userOffer);
                        Profile.update({Inventory: userInventory.join(`\r\n`)}, {where: {id: interaction.user.id}});
                        Profile.update({Inventory: targetInventory.join(`\r\n`)}, {where: {id: tradeTarget}});
                    }
                    confirmPress++;
                });
                break;
            case "equip":
                let InitialReply = await i.update({content: ``, embeds: [await viewInventory(Target)], components: [new ActionRowBuilder().addComponents(await findItem(Inventory, interaction.user.id, "equip?")), new ActionRowBuilder().addComponents(Trade)]})
        
                // Collect value from menu
                const MenuCollector = InitialReply.createMessageComponentCollector({
                    componentType: ComponentType.StringSelect,
                    filter: i => i.user.id === interaction.user.id, // Only take selection from User,
                    time: 30_000 // Menu reads for 30s
                });
            
                // On option pressed:
                MenuCollector.on('collect', async (i) => {
                    if (i.values.toString() == "Nothing") return;
                    let EquipItem = await Items.findOne({where: {Name: i.values.toString()}});
                    switch (EquipItem.Category) {
                        case "Weapon":
                            if ((await Profile.findByPk(interaction.user.id)).Weapon != "None") Profile.update({Inventory: (await Profile.findByPk(interaction.user.id)).Inventory.concat(`\r\n`, (await Profile.findByPk(interaction.user.id)).Weapon)}, {where: {id: interaction.user.id}});
                            Profile.update({Weapon: EquipItem.Name}, {where: {id: interaction.user.id}})
                            break;
                        case "Magic":
                            if ((await Profile.findByPk(interaction.user.id)).Magic != "None") Profile.update({Inventory: (await Profile.findByPk(interaction.user.id)).Inventory.concat(`\r\n`, (await Profile.findByPk(interaction.user.id)).Magic)}, {where: {id: interaction.user.id}});
                            Profile.update({Magic: EquipItem.Name}, {where: {id: interaction.user.id}})
                            break;
                        case "Shield":
                            if ((await Profile.findByPk(interaction.user.id)).Shield != "None") Profile.update({Inventory: (await Profile.findByPk(interaction.user.id)).Inventory.concat(`\r\n`, (await Profile.findByPk(interaction.user.id)).Shield)}, {where: {id: interaction.user.id}});
                            Profile.update({Shield: EquipItem.Name}, {where: {id: interaction.user.id}})
                            break;
                        case "Armor":
                            if ((await Profile.findByPk(interaction.user.id)).Armor != "None") Profile.update({Inventory: (await Profile.findByPk(interaction.user.id)).Inventory.concat(`\r\n`, (await Profile.findByPk(interaction.user.id)).Armor)}, {where: {id: interaction.user.id}});
                            Profile.update({Armor: EquipItem.Name}, {where: {id: interaction.user.id}})
                            break;
                    }
                    let newInventory = (await Profile.findByPk(interaction.user.id)).Inventory.split(`\r\n`);
                    for (let i=0;i<newInventory.length;i++) {
                        if (newInventory[i] == EquipItem.Name) {
                            newInventory.splice(i,1);
                            Profile.update({Inventory: newInventory.join(`\r\n`)}, {where: {id: interaction.user.id}});
                            break;
                        }
                    }
                    i.update({embeds: [await viewInventory(Target, EquipItem.Name)], components: [new ActionRowBuilder().addComponents(await findItem(Inventory, interaction.user.id, "equip?"))]});
                });
              break;
          }
        })
	},
};