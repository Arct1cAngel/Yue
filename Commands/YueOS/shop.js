const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ComponentType } = require('discord.js'); // Buttons and Drop-Down Menus
const { ButtonBuilder, ButtonStyle } = require('discord.js'); // Buttons
// File System
const fs = require('fs');
const path = require('path');
const Profiles = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));
const Items = require(path.join(__dirname, `..`, `..`, `models`, `Items.js`));
const config = require(path.join(__dirname, `..`, `..`, `config.json`));
function getRandomInt(max) {return Math.floor(Math.random() * max)}; // Random number generator (getRandomInt(5) returns num from 1-5) 

module.exports = {
	data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Daily shop."),
	async execute(interaction) {
    let ItemBought = false;
    let Balance;
    await Profiles.findByPk(interaction.user.id).then(async profile => {
      Balance = profile.Balance;
      if (profile.LastShop == null || profile.LastShop.toDateString() != new Date().toDateString()) {
        //make random shop pool for the day
        let Pool = [];
        for (var i=0;i<3;i++) {
          let Rare = getRandomInt(1000);
          let RareMath = 1;
          let LootRoll;
            if (Rare <= 900) { // Common
              LootRoll = 14; // Amount of items of that rarity in database
            } else if (Rare > 900 && Rare <= 990) { // Epic
              LootRoll = 14;
              RareMath = 1000;
            } else if (Rare > 990) { // Legendary
              LootRoll = 12;
              RareMath = 2000;
            }
          let Unit = getRandomInt(LootRoll) + RareMath;
          if (Unit == Pool[i-1] || Unit == Pool[i-2]) i--;
            else Pool.push(Unit);
        }
        await Profiles.update({LastShop: new Date().toDateString(), ShopPool: Pool.join(`,`)}, {where: {id: interaction.user.id}});
      }
    });

    const ShopMenu = fs.readFileSync('./EmbedMessages/ShopMenu.txt').toString();
    const Shop = new EmbedBuilder()
    .setTitle(`Shop`)
    .setThumbnail(`https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/256x256/store.png`)
    .setColor(config.YueYellow)
    .setDescription(ShopMenu)
    .setFooter({text: `Yue Version: ${config.YueVersion}`})

    // Buttons for shop command
    const Back = new ButtonBuilder()
    .setCustomId('back')
    .setLabel('Back')
    .setStyle(ButtonStyle.Primary);

    const Buy = new ButtonBuilder()
    .setCustomId('buy')
    .setLabel('Buy')
    .setStyle(ButtonStyle.Success)
    .setDisabled(true);

    const Next = new ButtonBuilder()
    .setCustomId('next')
    .setLabel('Next')
    .setStyle(ButtonStyle.Primary);

    const ShopReply = await interaction.reply({embeds: [Shop], components: [new ActionRowBuilder().addComponents(Back, Buy, Next)]}); // Initial message as a variable

    // Collect value from button
    const ShopCollector = ShopReply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.user.id === interaction.user.id, // Only take selection from User,
      time: 60_000 // Button reads for 60s
    });

    let Page = 0;
    let Pool = await Profiles.findByPk(interaction.user.id).then((pool) => pool = pool.ShopPool.split(`,`));
    ShopCollector.on('collect', async (i) => { // On button clicked . . .
      // Button presses
      switch (i.customId) {
        case "back":
          Page--;
          if (Page == -1) Page = 2;
          break;
        case "next":
          Page++;
          if (Page == 3) Page = 0;
          break;
      }

      Buy.setDisabled(false); // Reactivate Buy button

      // Find item
      const Item = await Items.findByPk(Pool[Page]).catch(error => { // Error (Usually can't find item)
        interaction.editReply("Shit's fucked check logs for info");
        console.log(error);
      });

      if (i.customId == "buy") {
        if ((Balance - Item.Cost) < 0) {
          i.update({content: `You lack the funds for this purchase!`});
          return;
        } else if ((await Profiles.findByPk(interaction.user.id)).Inventory.includes(Item.Name) || (await Profiles.findByPk(interaction.user.id)).Weapon.includes(Item.Name) || (await Profiles.findByPk(interaction.user.id)).Magic.includes(Item.Name) || (await Profiles.findByPk(interaction.user.id)).Shield.includes(Item.Name) || (await Profiles.findByPk(interaction.user.id)).Armor.includes(Item.Name)) {
          i.update({content: `You already have this item in your inventory!`});
          return;
        } else if ((await Profiles.findByPk(interaction.user.id)).Inventory.split(`\r\n`).length == 24) {
          i.update({content: `Your inventory is full! Sell some items to make space for more. (Max inventory space: 24)`});
          return;
        } else {
          ItemBought = true;
          i.update({content: `Thank you for your purchase of: ${Item.Name}`, embeds: [], components: []});
          if ((await Profiles.findByPk(interaction.user.id)).Inventory == "") Profiles.update({Inventory: Item.Name, Balance: Balance - Item.Cost}, {where: {id: interaction.user.id}});
            else Profiles.update({Inventory: (await Profiles.findByPk(interaction.user.id)).Inventory.concat(`\r\n`, Item.Name), Balance: Balance - Item.Cost}, {where: {id: interaction.user.id}});
        }
      }
      
      if (ItemBought) return; // End command if User purchased an item

      var Rarity
      switch (Item.Rarity) {
        case `Beginner`:
          Rarity = config.YueYellow;
          break;
        case `Common`:
          Rarity = config.CommonGreen;
          break;
        case `Epic`:
          Rarity = config.EpicPurple;
          break;
        case `Legendary`:
          Rarity = config.LegendaryGold;
          break;
        case `God`:
          Rarity = config.GodPink;
          break;
      }

      let Property = "Damage";
      if (Item.Category == "Shield" || Item.Category == "Armor") {
        Property = "Defense";
      }
      // Set Shop embed as per item requirements
      Shop.setTitle(`Shop`);
      //Shop.setThumbnail();
      Shop.setColor(Rarity);
      Shop.setDescription(`${Item.Name}\n\nType: ${Item.Category}\n${Property}: ${Item.Damage}\nPrice: $${Item.Cost}\nRarity: ${Item.Rarity}`);
      Shop.setFooter({text: `Yue Version: ${config.YueVersion}`});

      i.update({embeds: [Shop], components: [new ActionRowBuilder().addComponents(Back, Buy, Next)]}); // Message update on button press
    });
	},
};