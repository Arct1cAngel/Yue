const { Client, GatewayIntentBits, EmbedBuilder, ActivityType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle, User, Component, ComponentType, messageLink, italic} = require('discord.js');
const packageJSON = require("./package.json"); //Using Data from Package.json
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { Database } = require('sqlite3');
const fs = require('fs')
const config = require("./config.json");
const BotState = require("./models/BotState");
const Suggestion = require('./models/Suggestions');
const Profile = require('./models/Profile');
const YueVersion = "Beta.2.2";
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

  // Client uptime in days, hours, minutes, and seconds
  var totalSeconds = (client.uptime / 1000);
  var days = Math.floor(totalSeconds / 86400);
  totalSeconds %= 86400;
  var hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  var minutes = Math.floor(totalSeconds / 60);
  var seconds = Math.floor(totalSeconds % 60);

  if (!interaction.isChatInputCommand()) return;

  Profile.upsert(
    {
      Username: interaction.user.username,
      id: interaction.user.id
    },
    {where: {id: interaction.user.id}}
  )

  switch(interaction.commandName) {
    case "profile":
      var Target = interaction.options.getUser('target');
      if (!Target) Target = interaction.user;
      // If Target does not own an account, create one
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
        var Spouse = `<@${profile.MarriedTo}>`;
        if (Spouse == `<@null>`) Spouse = `Nobody`;
        const profiledata = new EmbedBuilder()
        profiledata.setTitle(`${Target.username}`);
        profiledata.setThumbnail(Target.avatarURL());
        switch (Target.id) {
          case config.Arctic:
            profiledata.setDescription(`${profile.Class} class\n\nBalance: $${profile.Balance}\nCreator of Yue\nMarried to: ${Spouse}`);
            profiledata.setColor(0x00ffaa);
            break;
          case config.Yue:
            profiledata.setDescription(`God class\n\nBalance: Infinity\nCoolest and Richest Bot :sunglasses:\nMarried to: ${Spouse}`);
            profiledata.setColor(0xffcc00);
            break;
          default:
            profiledata.setDescription(`${profile.Class} class\n\nBalance: $${profile.Balance}\nYou're kind of poor aren't you? :smirk:\nMarried to: ${Spouse}`);
            profiledata.setColor(0x5000FF);
            break;
        }
        interaction.reply({embeds: [profiledata]});
      });
      break;
    case "kill":
      var DmAble = true;
      var Target = interaction.options.getUser('target');
      await interaction.reply(`Okay, ill go out back and put <@${Target.id}> down like a dog.`);
      await client.users.cache.get(Target.id).send(":boom: :gun: You're dead :)").catch(async error => {
        await interaction.editReply("They've got barracades, I can't break through. I'm sorry to have failed you, boss. (This user has blocked me or has dms turned off)")
        DmAble = false;
        return;
        }).catch(error => {
          console.log(error);
        });
      if (DmAble == true) interaction.user.send("The job is done, boss. You won't hear of them again.").catch(error => {interaction.editReply("Your dms seem to be off, boss. However I killed them anyway for you.")});
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
          interaction.reply(`Could not add to ${Target}'s balance because they don't have an account. Use /profile to make an account!`);
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
          interaction.reply("You lack the funds to register to this class, go beg on the street you hobo.");
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
          interaction.reply(`Could not register to a class. Message Arctic_Angel for assistance.`);
        });
        break;
      case "help":
        const CommandList = fs.readFileSync('./HelpInfo/CommandList.txt').toString();
        const BotHelp = fs.readFileSync('./HelpInfo/BotHelp.txt').toString();
        const EconomyDetails = fs.readFileSync('./HelpInfo/EconomyDetails.txt').toString();
        const ClassDetails = fs.readFileSync('./HelpInfo/ClassDetails.txt').toString();
        Description = BotHelp;
        
        const Help = new EmbedBuilder() // Help embed
        Help.setTitle(`${interaction.client.user.username}`);
        Help.setThumbnail(interaction.client.user.avatarURL());
        Help.setFooter({text: `Yue Version: ${YueVersion}`});
        Help.setDescription(Description);
        Help.setColor("#aaaaaa");

        // Buttons for help command
        const CommandButton = new ButtonBuilder()
        .setCustomId('commands')
        .setLabel('Command List')
        .setStyle(ButtonStyle.Secondary);

        const EconomyButton = new ButtonBuilder()
        .setCustomId('economy')
        .setLabel('Economy Info')
        .setStyle(ButtonStyle.Secondary);

        const ClassButton = new ButtonBuilder()
        .setCustomId('classes')
        .setLabel('Class Info')
        .setStyle(ButtonStyle.Secondary);

        const reply = await interaction.reply({embeds: [Help], components: [new ActionRowBuilder().addComponents(CommandButton, ClassButton, EconomyButton)]}); // Message as a variable

        const collectorFilter = i => i.user.id === interaction.user.id; // Only take selection from command user

        // Collect value from button
        const ButtonCollector = reply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          filter: collectorFilter,
          time: 30_000 // Button reads for 30s
        });

        // Upon value taken from button
        ButtonCollector.on('collect', async (i) => {
          switch (i.customId) {
            case "commands":
              Description = CommandList;
              break;
            case "economy":
              Description = EconomyDetails;
              break;
            case "classes":
              Description = ClassDetails;
              break;
          }
          Help.setDescription(Description);
          i.update({embeds: [Help]});
        });
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
            interaction.reply(`Could not claim daily. Message Arctic_Angel for assistance.`);
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
        case "marry":
          var Target = interaction.options.getUser('target'); // Targetting user selected in the slash command
          var CanMarry = true;
          var cost = 1000;
          var Balance;
          await Profile.sync({alter: true}).then(() => {
            return Profile.findByPk(interaction.user.id); // Find account owned by User
          }).then(async (profile) => {
            Balance = profile.Balance;
            if (profile.MarriedTo) {
              interaction.reply(`You're already married! Don't be a cheater.`); // If User is already married
              CanMarry = false;
              return;
            }
            if (profile.Balance - cost < 0) { // Check if User has enough money to marry
              interaction.reply("You lack the funds to propose, it costs $1000 to propose to somebody.");
              CanMarry = false;
              return;
            }
          });
          if (!CanMarry) return; // If User cannot marry, cancel command

          var Yes = new ButtonBuilder() // "I do"
          .setCustomId('yes')
          .setLabel('I do.')
          .setEmoji('💒')
          .setStyle(ButtonStyle.Success);

          var No = new ButtonBuilder() // "I don't"
          .setCustomId('no')
          .setLabel("I'm sorry I do not.")
          .setEmoji('💔')
          .setStyle(ButtonStyle.Primary);

          await Profile.sync({alter: true}).then(() => {
            return Profile.findByPk(Target.id); // Find account owned by Target
          }).then(async (profile) => { // Target found
            if (profile.MarriedTo == null) { // Target is not married
              var reply = await interaction.reply({content: `<@${Target.id}>, <@${interaction.user.id}> is proposing to you! Do you take them as your spouse? (You have 30s to respond)`, components: [new ActionRowBuilder().addComponents(Yes, No)]});
              
            // Only take selection from Target
            var collectorFilter = i => i.user.id === Target.id;

            // Collect value from button
            var ButtonCollector = reply.createMessageComponentCollector({
              componentType: ComponentType.Button,
              filter: collectorFilter,
              time: 30_000 //Button reads for 30s
            });

            // On button pressed:
            ButtonCollector.on('collect', async (i) => {
              switch (i.customId) {
                case "yes":
                  await Profile.update({MarriedTo: Target.id, Balance: Balance - cost},{where: {id: interaction.user.id}}); // Marry User to Target
                  await Profile.update({MarriedTo: interaction.user.id},{where: {id: Target.id}}); // Marry Target to User
                  interaction.editReply({content: `Congratulations! <@${interaction.user.id}> and <@${Target.id}> are now married!`, components: []});
                  break;
                case "no":
                  interaction.editReply({content: `I'm terribly sorry. But, <@${Target.id}> declined your proposal.`, components: []});
                  break;
              }
            });

            } else { // Already married
              interaction.reply(`This user is already in a relationship!`);
            }
          }).catch(async (error) => { // Target not found
            await interaction.reply({content: `Could not propose to ${Target} because they don't have an account. Use /profile to make an account!`});
          });
          break;
        case "divorce":
          var canDivorce = false;
          var cost = 2000;
          var Balance;
          await Profile.sync({alter: true}).then(() => {
            return Profile.findByPk(interaction.user.id); // Find account owned by User
          }).then(async (profile) => {
            Balance = profile.Balance;
            if (!profile.MarriedTo) {
              interaction.reply(`You aren't married to anybody!`);
              return;
            } else {
              if (profile.Balance - cost < 0) { // Check if User has enough money to marry
                interaction.reply("You lack the funds to file a divorce, it costs $2000 to divorce your spouse.");
                canDivorce = false;
                return;
              } else { canDivorce = true; }
            }
          });
          if (canDivorce == true) {
          var Yes = new ButtonBuilder() // Divorce
          .setCustomId('yes')
          .setLabel('Yes')
          .setEmoji('❤️‍🔥')
          .setStyle(ButtonStyle.Danger);

          var No = new ButtonBuilder() // Stay married
          .setCustomId('no')
          .setLabel("No")
          .setEmoji('❤️')
          .setStyle(ButtonStyle.Primary);

          await Profile.sync({alter: true}).then(() => {
            return Profile.findByPk(interaction.user.id); // Find account owned by User
          }).then(async (profile) => {
          var reply = await interaction.reply({content: `Are you sure you want to divorce <@${profile.MarriedTo}>? (You have 30s to respond)`, components: [new ActionRowBuilder().addComponents(Yes, No)]});
          
          // Only take selection from User
          var collectorFilter = i => i.user.id === interaction.user.id;

          // Collect value from button
          var ButtonCollector = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: collectorFilter,
            time: 30_000 //Button reads for 30s
          });

          // On button pressed:
          ButtonCollector.on('collect', async (i) => {
            switch (i.customId) {
              case "yes":
                interaction.editReply({content: `You and <@${profile.MarriedTo}> are nolonger married.`, components: []});
                await Profile.update({MarriedTo: null},{where: {id: profile.MarriedTo}}); // Divorce User from Spouse
                await Profile.update({MarriedTo: null, Balance: Balance - cost},{where: {id: interaction.user.id}}); // Divorce Spouse from User
                break;
              case "no":
                interaction.editReply({content: `Don't play with feelings like that.`, components: []});
                break;
            }
          });
          });
        } else {
          return;
        }
          break;
        case "test":
          
          break;
  }
});

  client.login(config.Token);