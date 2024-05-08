const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ComponentType } = require('discord.js'); // Buttons and Drop-Down Menus
const { ButtonBuilder, ButtonStyle } = require('discord.js'); // Buttons
// File System
const fs = require('fs');
const path = require('path');
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));
const Items = require(path.join(__dirname, `..`, `..`, `models`, `Items.js`));
const config = require(path.join(__dirname, `..`, `..`, `config.json`));
function getRandomInt(max) { //Random number generator (getRandomInt(5) returns num from 1-5)
    return Math.floor(Math.random() * max);
}

module.exports = {
	data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Daily shop."),
	async execute(interaction) {
    var ItemOne;
    var ItemTwo;
    var ItemThree;
    var Page = 1;
    var cost;
    var ItemOneCost;
    var ItemTwoCost;
    var ItemThreeCost;
    var RandomNumberOne = getRandomInt(5);
    var RandomNumberTwo = RandomNumberOne;
    var RandomNumberThree = RandomNumberOne;
    var ItemOneCat;
    var ItemTwoCat;
    var ItemThreeCat;
    var Item;
    var ItemCat;
    var ShopClosed = false;
    while (RandomNumberTwo == RandomNumberOne) {
      RandomNumberTwo = getRandomInt(5);
    }
    while (RandomNumberThree == RandomNumberTwo || RandomNumberThree == RandomNumberOne) {
      RandomNumberThree = getRandomInt(5);
    }
    const ShopMenu = fs.readFileSync('./EmbedMessages/ShopMenu.txt').toString();
    const Shop = new EmbedBuilder()
    .setTitle(`Shop`)
    .setThumbnail(`https://d1nhio0ox7pgb.cloudfront.net/_img/g_collection_png/standard/256x256/store.png`)
    .setColor(0xffcc00)
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

    const ShopReply = await interaction.reply({embeds: [Shop], components: [new ActionRowBuilder().addComponents(Back, Buy, Next)]}); // Message as a variable

    // Only take selection from User
    const ShopFilter = i => i.user.id === interaction.user.id;

    // Collect value from button
    const ShopCollector = ShopReply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: ShopFilter,
      time: 30_000 // Button reads for 30s
    });

    ShopCollector.on('collect', async (i) => { // On button clicked

      Buy.setDisabled(false);

      await Items.sync({alter: true}).then(() => {
        return Items.findByPk(RandomNumberOne); // Find item
      }).then(async (Item) => {
        ItemOne = `${Item.Name}\nType: ${Item.Category}\nDamage: ${Item.Damage}\nPrice: $${Item.Cost}\nRarity: ${Item.Rarity}`;
        ItemOneCost = Item.Cost;
        ItemOneCat = Item.Category;
      }).catch(error => {
        interaction.editReply("Shit's fucked check logs for info");
        console.log(error);
      });

      await Items.sync({alter: true}).then(() => {
        return Items.findByPk(RandomNumberTwo); // Find item
      }).then(async (Item) => {
        ItemTwo = `${Item.Name}\nType: ${Item.Category}\nDamage: ${Item.Damage}\nPrice: $${Item.Cost}\nRarity: ${Item.Rarity}`;
        ItemTwoCost = Item.Cost;
        ItemTwoCat = Item.Category;
      }).catch(error => {
        interaction.editReply("Shit's fucked check logs for info");
        console.log(error);
      });

      await Items.sync({alter: true}).then(() => {
        return Items.findByPk(RandomNumberThree); // Find item
      }).then(async (Item) => {
        ItemThree = `${Item.Name}\nType: ${Item.Category}\nDamage: ${Item.Damage}\nPrice: $${Item.Cost}\nRarity: ${Item.Rarity}`;
        ItemThreeCost = Item.Cost;
        ItemThreeCat = Item.Category;
      }).catch(error => {
        interaction.editReply("Shit's fucked check logs for info");
        console.log(error);
      });

      switch (i.customId) {
        case "back":
          Page--;
          break;
        case "buy":
          await Profile.sync({alter: true}).then(() => {
            return Profile.findByPk(interaction.user.id); // Find account owned by User
          }).then(async (profile) => {
              Balance = profile.Balance;
              if (profile.Balance - cost < 0) { // Check if User has enough money to marry
                interaction.editReply("You lack the funds to purchase this item!");
                return;
              } else {
                ShopClosed = true;
              }
        });
          break;
        case "next":
          Page++;
          break;
      }
      if (ShopClosed) {
        switch (ItemCat) {
          case `Weapon`:
            await Profile.update({Balance: Balance - cost, Weapon: Item, LastShop: new Date().toDateString()},{where: {id: interaction.user.id}});
            break;
          case `Magic`:
            await Profile.update({Balance: Balance - cost, Magic: Item, LastShop: new Date().toDateString()},{where: {id: interaction.user.id}});
            break;
          case `Shield`:
            await Profile.update({Balance: Balance - cost, Shield: Item, LastShop: new Date().toDateString()},{where: {id: interaction.user.id}});
            break;
          case `Armor`:
            await Profile.update({Balance: Balance - cost, Armor: Item, LastShop: new Date().toDateString()},{where: {id: interaction.user.id}});
            break;
        }
        i.update({content: `Thank you for your purchase!`, components: []});
        return;
      }
      if (Page == 0) {
        Page = 3;
      } else if (Page == 4) {
        Page = 1;
      }
      switch (Page) {
        case 1:
          Description = ItemOne;
          cost = ItemOneCost;
          Item = RandomNumberOne;
          ItemCat = ItemOneCat;
          break;
        case 2:
          Description = ItemTwo;
          cost = ItemTwoCost;
          Item = RandomNumberTwo;
          ItemCat = ItemTwoCat;
          break;
        case 3:
          Description = ItemThree;
          cost = ItemThreeCost;
          Item = RandomNumberThree;
          ItemCat = ItemThreeCat;
          break
      }
      Shop.setTitle(`Shop`)
      //Shop.setThumbnail()
      //Shop.setColor(Rarity)
      Shop.setDescription(Description)
      Shop.setFooter({text: `Yue Version: ${config.YueVersion}`})
      i.update({embeds: [Shop], components: [new ActionRowBuilder().addComponents(Back, Buy, Next)]})
    });
	},
};