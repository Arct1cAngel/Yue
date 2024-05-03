const { Client, GatewayIntentBits, EmbedBuilder, ActivityType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, User, Component, ComponentType, messageLink} = require('discord.js');
const packageJSON = require("./package.json"); //Using Data from Package.json
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { Database } = require('sqlite3');
const config = require("./config.json");
const BotState = require("./models/BotState");
const Suggestion = require('./models/Suggestions');
const Profile = require('./models/Profile');
const YueVersion = "Alpha.6";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) // Delay 1s-> await sleep(1000);

//Random number generator (getRandomInt(5) returns num from 1-5)
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


client.on('ready', () => {
process.stdout.write('\x1Bc') // clears the console
BotState.sync({alter: true}).then(() => {
  return BotState.findByPk(1);
}).then((CurrentState) => {
  console.log(`Logged in as ${client.user.tag}, running on discordjs version: ${packageJSON.dependencies["discord.js"]}!\nYue's state: ${CurrentState.state} Mode\nYue's version: ${YueVersion}`);
  switch (CurrentState.state) {
    case "Developement":
      client.user.setActivity("Arctic update my code.", {type: 3});
      break;
    case "Casual":
      client.user.setActivity({
        type: ActivityType.Custom,
        name: "💛",
        state: "💛Yue Moment" });
        client.channels.cache.get('1228467581979988060').send(`I'm Online!\nState: ${CurrentState.state} Mode\nVersion: ${YueVersion}`); //Sending to Yue Logs channel in Society Sanction
      break;
  }
})
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  switch(interaction.commandName) {
    case "profile":
      var Target = interaction.options.getUser('target');
      if (!Target) Target = interaction.user;
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
        const profiledata = new EmbedBuilder()
        profiledata.setTitle(`${Target.username}`);
        profiledata.setThumbnail(Target.avatarURL());
        switch (Target.id) {
          case config.Arctic:
            profiledata.setDescription(`${profile.Class} class\n\nBalance: $${profile.Balance}\nCreator of Yue`);
            profiledata.setColor(0x00ffaa);
            break;
          case config.Yue:
            profiledata.setDescription(`God class\n\nBalance: Infinity\nCoolest and Richest Bot :sunglasses:`)
            profiledata.setColor(0xffcc00);
            break;
          default:
            profiledata.setDescription(`${profile.Class} class\n\nBalance: $${profile.Balance}\nYou're kind of poor aren't you? :smirk:`)
            profiledata.setColor(0x5000FF);
            break;
        }
        interaction.reply({embeds: [profiledata]});
      });
      break;
    case "kill":
      var DmAble = true;
      var Target = interaction.options.getUser('target');
      interaction.reply(`Okay, ill go out back and put <@${Target.id}> down like a dog.`);
      await client.users.cache.get(Target.id).send(":boom: :gun: You're dead :)").catch(error => {
        interaction.user.send("They've got barracades, I can't break through. I'm sorry to have failed you, boss. (This user has blocked me or has dms turned off)")
        DmAble = false;
        });
      if (DmAble == true) interaction.user.send("The job is done, boss. You won't hear of them again.");
      break;
    case "refresh":
      const sent = interaction.deferReply("Please wait . . .");
      interaction.editReply(`Bot Refreshed!\n----------------\nRoundtrip Ping: ${(await sent).createdTimestamp - await interaction.createdTimestamp}ms\nDiscord API Ping: ${client.ws.ping}ms\nYue has been running for **${days}** days, **${hours}** hours, **${minutes}** minutes, and **${seconds}** seconds.`);
      break;
    case "mode":
      if (interaction.user.id == config.Arctic) {
      const mode = interaction.options.getString("mode_type");
      interaction.reply(`${mode} engaged!`);
      BotState.update(
        {state: mode},
        {where: {id: 1} }
        )
      BotState.sync({alter: true}).then(() => {
        return BotState.findByPk(1);
      }).then((CurrentState) => {
        console.log(`Updated Yue's state to: ${CurrentState.state} Mode`);
      });
      switch (mode) {
        case "Developement":
          client.user.setActivity("Arctic update my code.", {type: 3});
          break;
        case "Casual":
          client.user.setActivity({
            type: ActivityType.Custom,
            name: "💛",
            state: "💛Yue Moment" });
          break;
      }
    } else {
      interaction.reply("You don't have access to this command!");
    }
      break;
      case "suggest":
        Suggestion.create(
          {suggestion: interaction.options.getString("user_suggestion"),
          user: interaction.user.username},
          {where: {} }
          )
        interaction.reply(`Thank you for your suggestion!`);
        break;
      case "give":
        if (interaction.user.id == config.Arctic) {
        var Target = interaction.options.getUser('target');
        var Amount = interaction.options.get("amount").value;
        await Profile.sync({alter: true}).then(() => {
          return Profile.findByPk(Target.id);
        }).then((profile) => {
          Profile.update(
            {
              Balance: profile.Balance + Amount
            },
            {where: {id: Target.id}}
          )
          interaction.reply(`Added $${Amount} to ${Target}'s balance!`);
          console.log(`Added $${Amount} to ${profile.Username.charAt(0).toUpperCase() + profile.Username.slice(1)}'s balance!`);
        }).catch(error => {
          interaction.reply(`Could not add to ${Target}'s balance. Tell them to do /profile to set up an account!`);
        });
        } else {
          interaction.reply("You don't have access to this command!");
        }
        break;
      case "richest":
        Profile.sync({alter: true}).then(() => {
          return Profile.max("Balance", {where: {}});
        }).then((MaxBalance) => {
          return Profile.findOne({where: {Balance: MaxBalance}})
        }).then((RichestUser) => {
          var reply = `${RichestUser.Username} is the current richest user with $${RichestUser.Balance}. Knock them down like the twin towers and become the new richest!`;
          interaction.reply(reply.charAt(0).toUpperCase() + reply.slice(1));
        });
        break;
      case "class":
        const ClassChoice = interaction.options.getString("class_choice");
        var cost;
        switch (ClassChoice) {
          case "Adventurer":
            cost = 500;
            break;
          case "Merchant":
            cost = 1000;
            break;
          case "Solo":
            cost = 200;
            break;
        }
        Profile.sync({alter: true}).then(() => {
          return Profile.findByPk(interaction.user.id);
        }).then((profile) => {
          if (profile.Balance - cost < 0) {
          interaction.reply("You lack the fund to register to this class, go beg on the street you hobo.");
            return;
          } else {
          Profile.update(
            {
              Balance: profile.Balance - cost,
              Class: ClassChoice
            },
            { where: {id: interaction.user.id} }
          )
          interaction.reply(`${ClassChoice} class purchased!`);
          console.log(`Updated ${profile.Username.charAt(0).toUpperCase() + profile.Username.slice(1)}'s class to: ${ClassChoice}`);
        }
        }).catch(error => {
          interaction.reply(`Could not register to a class. Use /profile to set up an account!`);
        });
        break;
      case "help":
        var totalSeconds = (client.uptime / 1000);
        var days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        var hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = Math.floor(totalSeconds % 60);

        const Bot = new ButtonBuilder()
        .setCustomId('bot')
        .setLabel('Bot Help')
        .setStyle(ButtonStyle.Secondary);

        const YueOS = new ButtonBuilder()
        .setCustomId('yueOS')
        .setLabel('YueOS Help')
        .setStyle(ButtonStyle.Secondary);

        //Message as a variable
        var reply = await interaction.reply({content: `Please select a help menu.`, components: [new ActionRowBuilder().addComponents(Bot, YueOS)]});

        //Only take selection from command user
        const collectorFilter = i => i.user.id === interaction.user.id;

        //collect value from button
        const ButtonCollector = reply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          filter: collectorFilter,
          time: 30_000 //Button reads for 15s
        });

        //Upon value taken from button
        ButtonCollector.on('collect', async (i) => {
          const YueOSOptions = new StringSelectMenuBuilder()
          .setCustomId('yueOSCategory')
          .setPlaceholder('YueOS Help Categories')
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel('Classes')
              .setDescription('Class types and their advantages.')
              .setValue('classes'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Commands')
              .setDescription('Command list.')
              .setValue('commands'),
            new StringSelectMenuOptionBuilder()
              .setLabel('Economy')
              .setDescription('Details on how to obtain and lose money.')
              .setValue('economy'),
          );
          const Help = new EmbedBuilder()
          Help.setTitle(`${interaction.client.user.username}`);
          Help.setThumbnail(interaction.client.user.avatarURL());
          Help.setFooter({text: `Yue Version: ${YueVersion}`});
          switch (i.customId) {
            case "bot":
              Help.setDescription(`Made by Arctic_Angel\n=============================\n\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0:yellow_heart:IMPORTANT:yellow_heart:\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\nThis bot is made purely for fun as\na passion project; production\nwill have pauses and only resume\nwhen I have free time.\n\nPlease use the suggest command\nto give suggestions for the\nname of the game portion of\nYue. Or, if you like YueOS,\nlet me know!\n=============================\n\nYue has been running for\n**${days}** days, **${hours}** hours, **${minutes}** minutes,\nand **${seconds}** seconds.`);
              await i.update({embeds: [Help]});
              return;
            case "yueOS":
              Help.setDescription(`Made by Arctic_Angel\n=============================\nUse /profile to register!\n\nSelect one of the options\nbelow to learn more . . .\n=============================\n\n\nYue Version: ${YueVersion}`);
              break;
          }

          //Message as a variable
          reply = await interaction.editReply({embeds: [Help], components: [new ActionRowBuilder().addComponents(YueOSOptions)]});
        });

          //collect value from string selection
          const SelectionCollector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: collectorFilter,
            time: 30_000 //Selection reads for 15s
          })

          //Upon value taken from selection menu
          SelectionCollector.on('collect', async (i) => {
            var Title;
            var Description;
            switch (i.values[0]) {
              case "classes":
                Title = `Class Details`;
                Description = `Merchant Class: 20% chance to\ngain a small increase of cash\non the daily command.\n\nAdventurer Class: 10% chance to\ngain a medium increase of\ncash on the daily command.\n\nSolo Class: 2% chance to gain\na large increase of cash on\nthe daily command.`;
                break;
              case "commands":
                Title = `Master Command List`;
                Description = `:gear: General Commands :gear:\n=============================\n:grey_question: **Help:** Get information on Yue\nor YueOS\n:arrows_counterclockwise: **Refresh:** Refresh Yue!\n:thought_balloon: **Suggest:** Make a suggestion\nfor Yue!\n\n:yellow_heart: YueOS :yellow_heart:\n=============================\n:yellow_square: **Profile:** Set up or view your\nstats!\n:shield: **Class:** Choose a class and gain their\nrespective buffs!\n:date: **Daily:** Claim your daily paycheque!\n:moneybag: **Richest:** See who the current\nrichest user is (global)\n:knife: **Kill:** Yue will attempt to\nkill your enemy.\n\n:closed_lock_with_key: Developer Commands :closed_lock_with_key:\n=============================\n:tools: **Mode:** Change Yue's Mode.\n:money_with_wings: **Give:** Give money to a user.\n:date: **Reset Daily:** Reset daily\ntimer (global)\n:warning: **Test:** Perform a test.`;
                break;
              case "economy":
                Title = `Economy Details`;
                Description = `:one: Use /profile to set up an\naccount!\n\n:two: Check class details for\ninformation on class buffs!\n\n:three: Use /daily for daily cash!\n\n:four: Check out /shop for items and\nloot boxes! (WIP)\n\n:five: Dont get killed . . . :smirk:`;
                break;
            }

            const Help = new EmbedBuilder()
            Help.setTitle(Title);
            Help.setThumbnail(interaction.client.user.avatarURL());
            Help.setDescription(Description);
            await i.update({embeds: [Help]});
          })
        break;
        case "daily":
          var RandomNumber = getRandomInt(100); // Random number from 1-100
          var Reply = "";
          var Bonus = 0;
          var daily = 100;
          if (!interaction.inGuild()) {
            interaction.reply({content: "This command is only for use in servers!", ephemeral: true});
            return;
          }
          Profile.sync({alter: true}).then(() => {
            return Profile.findByPk(interaction.user.id);
          }).then((profile) => {
            if (profile.LastDaily == null) {
              var LastDaily = "NoDate";
            } else {
              var LastDaily = profile.LastDaily.toDateString();
            }
            if (LastDaily == new Date().toDateString()) {
              interaction.reply(`You already claimed your daily today! Come back tomorrow to use the command again. (Refreshes at 4:00am GMT)`);
            } else {
              switch (profile.Class) {
                case "Merchant":
                  if (RandomNumber <= 20) {
                  Bonus = getRandomInt(50) * 3;
                  Reply = " :star: Merchant bonus!";
                  }
                  break;
                case "Adventurer":
                  if (RandomNumber <= 10) {
                    Bonus = (getRandomInt(25) * 4) + 150;
                    Reply = " :star: Adventurer bonus!";
                  }
                  break;
                case "Solo":
                  if (RandomNumber <= 2) {
                    Bonus = (getRandomInt(10) *10) + 400;
                    Reply = " :star: Solo bonus!";
                  }
                  break;
              }
              Profile.update(
                {
                  Balance: profile.Balance + daily + Bonus,
                  LastDaily: new Date().toDateString()
                },
                { where: {id: interaction.user.id} }
              );
              interaction.reply(`Daily Claimed!${Reply} **$${daily + Bonus}** added to your daily paycheque! Your new balance is: __**$${profile.Balance + daily + Bonus}**__`);
            }
          }).catch(error => {
            interaction.reply(`Could not claim daily. Use /profile to set up an account!`);
            console.log(error);
          });
          break;
        case "reset_daily":
          if (interaction.user.id == config.Arctic) {
          Profile.update(
            {
              LastDaily: "No"
            },
            { where: {} }
          );
          interaction.reply(`Daily has been reset for all users.`)
        } else {
          interaction.reply("You don't have access to this command!");
        }
          break;
        case "test":

          break;
  }
});

  client.login(config.Token);