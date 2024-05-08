const { REST, Routes} = require('discord.js');
const config = require('./config.json');

 // File System
const fs = require('fs');
const path = require('path');

const commands = [];

for (const folder of fs.readdirSync(path.join(__dirname, `Commands`))) { // For Each Folder in Commands Folder . . .
	const CommandsPath = path.join(path.join(__dirname, `Commands`), folder); // . . .Add Folder to CommandsPath
	for (const file of fs.readdirSync(CommandsPath).filter(file => file.endsWith('.js'))) { // For Each Command File Found That Ends With '.js' . . .
		const FilePath = path.join(CommandsPath, file); // . . .Set File to FilePath
		const Command = require(FilePath); // Command is Each File Path 
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in Command && 'execute' in Command) { // If Each Command Has Required 'data' And 'execute' lines . . .
			commands.push(Command.data.toJSON()); // . . .Set it as a Command in 'commands' Array
		} else { // Read Error lol
			console.log(`[WARNING] The command at ${FilePath} is missing a required "data" or "execute" property.`);
		}
	}
}
  
const rest = new REST({ version: '10' }).setToken(config.Token);

  try {
    console.log('Started refreshing application (/) commands.');
    rest.put(Routes.applicationCommands(config.Yue), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) { console.error(error); }