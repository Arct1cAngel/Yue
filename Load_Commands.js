const { REST, Routes, ApplicationCommandOptionType, SlashCommandBuilder } = require('discord.js');
const config = require('./config.json');

const profile = new SlashCommandBuilder()
  .setName("profile")
  .setDescription('Displays a simple user profile.')
  .addUserOption((option) => 
  option
    .setName("target")
    .setDescription("Who's profile would you like to view?")
  );

const kill = new SlashCommandBuilder()
  .setName("kill")
  .setDescription("I will kill your enemy.")
  .addUserOption((option) => 
  option
    .setName("target")
    .setDescription("Who's my mark, boss?")
    .setRequired(true)
  );

const refresh = new SlashCommandBuilder()
  .setName("refresh")
  .setDescription("Refreshes the bot.");

const mode = new SlashCommandBuilder()
  .setName("mode")
  .setDescription("Changes Yue's current mode.")
  .addStringOption((option) =>
  option
    .setName("mode_type")
    .setDescription("What is Yue's mode being set to?")
    .setRequired(true)
    .addChoices(
      { name: "developement", value: "Developement" },
      { name: "casual", value: "Casual" },
    )
  );

  const suggest = new SlashCommandBuilder()
  .setName("suggest")
  .setDescription("Suggest things to make Yue better!")
  .addStringOption((option) =>
  option
    .setName("user_suggestion")
    .setDescription("What are you suggesting?")
    .setRequired(true)
  );

  const UpdateBalance = new SlashCommandBuilder()
  .setName("give")
  .setDescription("Add cash to a user's balance.")
  .addUserOption((option) => 
  option
    .setName("target")
    .setDescription("Who would you like to add money to?")
    .setRequired(true)
  )
  .addNumberOption((option) =>
  option
    .setName("amount")
    .setDescription("How much are you adding to your balance?")
    .setRequired(true)
  );

  const Richest = new SlashCommandBuilder()
  .setName("richest")
  .setDescription("See who the current richest user is!");

  const Class = new SlashCommandBuilder()
  .setName("class")
  .setDescription("Choose your class!")
  .addStringOption((option) =>
  option
    .setName("class_choice")
    .setDescription("What class are you registering for?")
    .setRequired(true)
    .addChoices(
      { name: "Merchant - $1000", value: "Merchant" },
      { name: "Adventurer - $500", value: "Adventurer" },
      { name: "Solo - $200", value: "Solo"}
    )
  );

  const Help = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Get information regarding Yue and how she works.");

  const Daily = new SlashCommandBuilder()
  .setName("daily")
  .setDescription("Obtain a daily cash paycheque!");

  const Reset = new SlashCommandBuilder()
  .setName("reset_daily")
  .setDescription("Globally reset Yue's daily command :shushing_face:");

  const Test = new SlashCommandBuilder()
  .setName("test")
  .setDescription("For testing purposes.")

  const Marry = new SlashCommandBuilder()
  .setName("marry")
  .setDescription("Marry another user.")
  .addUserOption((option) =>
  option
    .setName("target")
    .setDescription("Who are you proposing to?")
    .setRequired(true)
  );

  const Divorce = new SlashCommandBuilder()
  .setName("divorce")
  .setDescription("Divorce your spouse.");

  const Shop = new SlashCommandBuilder()
  .setName("shop")
  .setDescription("Daily shop.");

const commands = [
  profile.toJSON(),
  kill.toJSON(),
  refresh.toJSON(),
  mode.toJSON(),
  suggest.toJSON(),
  UpdateBalance.toJSON(),
  Richest.toJSON(),
  Class.toJSON(),
  Help.toJSON(),
  Daily.toJSON(),
  Reset.toJSON(),
  Test.toJSON(),
  Marry.toJSON(),
  Divorce.toJSON(),
  Shop.toJSON(),
];
  
const rest = new REST({ version: '10' }).setToken(config.Token);

  try {
    console.log('Started refreshing application (/) commands.');
    rest.put(Routes.applicationCommands(config.Yue), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) { console.error(error); }