// Discord.js
const { Client, GatewayIntentBits, ActivityType, Collection } = require('discord.js'); // Bot
//const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js'); // Drop-Down Menus
const packageJSON = require("./package.json"); // Using Data from Package.json
global.client = new Client({ intents: [GatewayIntentBits.Guilds] }); // Define the bot
const config = require("./config.json");
const BotState = require("./models/BotState");
client.commands = new Collection(); // Collection (Array) of Commands
 // File System
const fs = require('fs');
const path = require('path');

client.on('ready', () => { // On Bot Login. . .
  process.stdout.write('\x1Bc') // Clears The Console
  BotState.sync({alter: true}).then(() => { // Find BotState Stored in Database
    return BotState.findByPk(1);
  }).then((CurrentState) => { // Log Relevent Information to The Console and Set State to BotState
    console.log(`Logged in as ${client.user.tag}, running on discordjs version: ${packageJSON.dependencies["discord.js"]}!\nYue's state: ${CurrentState.state} Mode\nYue's version: ${config.YueVersion}`);
    
    switch (CurrentState.state) {
      case "Developement":
        client.user.setActivity("Arctic update my code.", {type: 3});
        break;
      case "Casual":
        client.user.setActivity({
          type: ActivityType.Custom,
          name: "💛",
          state: "💛Yue Moment" });
          client.channels.cache.get('1228467581979988060').send(`I'm Online!\nState: ${CurrentState.state} Mode\nVersion: ${config.YueVersion}`); // Sending to Yue Logs Channel in Society Sanction
        break;
    }

  })
});

// Command Handler
for (const folder of fs.readdirSync(path.join(__dirname, `Commands`))) { // For Each Folder in Commands Folder . . .
	const CommandsPath = path.join(path.join(__dirname, `Commands`), folder); // . . .Add Folder to CommandsPath
	for (const file of fs.readdirSync(CommandsPath).filter(file => file.endsWith('.js'))) { // For Each Command File Found That Ends With '.js' . . .
		const FilePath = path.join(CommandsPath, file); // . . .Set File to FilePath
		const Command = require(FilePath); // Command is Each File Path 
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in Command && 'execute' in Command) { // If Each Command Has Required 'data' And 'execute' lines . . .
			client.commands.set(Command.data.name, Command); // . . .Set it as a Command in Client
		} else { // Read Error lol
			console.log(`[WARNING] The command at ${FilePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return; // Return if Not a Slash Command
  const command = interaction.client.commands.get(interaction.commandName);
  await command.execute(interaction);
});

client.login(config.Token);