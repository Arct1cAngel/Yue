const { SlashCommandBuilder, EmbedBuilder, Attachment } = require('discord.js');
const { ActionRowBuilder, ComponentType } = require('discord.js'); // Buttons and Drop-Down Menus
const { ButtonBuilder, ButtonStyle } = require('discord.js'); // Buttons
// File System
const fs = require('fs');
const path = require('path');
const Profile = require(path.join(__dirname, `..`, `..`, `models`, `Profile.js`));
const Items = require(path.join(__dirname, `..`, `..`, `models`, `Items.js`));
const HP = require(path.join(__dirname, `..`, `..`, `HP.json`));
const config = require(path.join(__dirname, `..`, `..`, `config.json`));
const YueMad = path.join(__dirname, `..`, `..`, `Assets`, `Yue Azure Blaze.gif`)
function getRandomInt(max) {return Math.floor(Math.random() * max)}; // Random number generator (getRandomInt(5) returns num from 0-4)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let killMessage;
let Color;

// Format: await updateHP(userID, Health number it is being updated to)
async function updateHP(UserID, Health, KillerID) {
    let HealthString;
    if (Health == 100) HealthString = `${HP.Hundred} ${Health}/100`;
        else if (Health >= 90) HealthString = `${HP.Ninety} ${Health}/100`;
        else if (Health >= 80) HealthString = `${HP.Eighty} ${Health}/100`;
        else if (Health >= 70) HealthString = `${HP.Seventy} ${Health}/100`;
        else if (Health >= 60) HealthString = `${HP.Sixty} ${Health}/100`;
        else if (Health >= 50) HealthString = `${HP.Fifty} ${Health}/100`;
        else if (Health >= 40) HealthString = `${HP.Forty} ${Health}/100`;
        else if (Health >= 30) HealthString = `${HP.Thirty} ${Health}/100`;
        else if (Health >= 20) HealthString = `${HP.Twenty} ${Health}/100`;
        else if (Health >= 10) HealthString = `${HP.Ten} ${Health}/100`;
        else if (Health > 0) HealthString = `${HP.Zero} ${Health}/100`;
        else { // Death
            Color = config.GambleRed;
            let Reward = (getRandomInt(5) + 1)*1000 + 10000;
            if ((await Profile.findByPk(UserID)).Balance - Reward < 0) Reward = (await Profile.findByPk(UserID)).Balance * 0.25;
            Reward = Math.floor(Reward);
            killMessage = `<@${UserID}> was killed by <@${KillerID}>.\n$${Reward} was looted off their body.\n\n**<@${KillerID}>'s New Balance: $${(await Profile.findByPk(KillerID)).Balance + Reward}**`;
            Profile.update({Balance: (await Profile.findByPk(KillerID)).Balance + Reward}, {where: {id: KillerID}});
            Profile.update({Balance: (await Profile.findByPk(UserID)).Balance - Reward}, {where: {id: UserID}});
			HealthString = `${HP.Zero} 0/100`;
		}
		await Profile.update({Health: HealthString}, {where: {id: UserID}});
		return;
}

async function attack(OffenderData, DefenderData, AttackType) {
    let CritDmg = 0;
    let StatusDmg = 0;
    let StatusMessage = ``;
    let Crit = false;

    if (AttackType == `Weapon`) {
        AttackType = 0;
        DefenseType = 3;
    } else if (AttackType == `Magic`) {
        AttackType = 1;
        DefenseType = 2;
    }

    if ((await Profile.findByPk(DefenderData[4])).Status == `Burning 🔥`) {
        // If Defender is burning, do extra (1-3) damage
        StatusDmg = getRandomInt(3) + 1;
        StatusMessage = ` + ${StatusDmg} Burning damage!`;
    }

    if ((await Profile.findByPk(OffenderData[4])).Status == `Frozen 🧊` && !Crit) {
        // If Offender is Frozen, have a 20% chance to deal 0 damage
        if (getRandomInt(5) == 0) {
            let ResultingHP = DefenderData[5] - StatusDmg;
            await updateHP(DefenderData[4], ResultingHP, OffenderData[4]); // Update HP of Defender to ResultingHP (if killed it will say killed by Offender)
            return {
            Damage: 0,
            StatusMessage: ` because you're frozen in place!${StatusMessage}`,
            TotalDmg: StatusDmg
            }
        }
    } else if ((await Profile.findByPk(OffenderData[4])).Status == `Drenched 💧` && !Crit) {
        // If Offender is drenched, deal 25% less damage
        StatusDmg = Math.floor((OffenderData[AttackType].Damage) * -0.25)
        StatusMessage = ` - ${StatusDmg*-1} damage because you're drenched!`;
    }

    let CritCheck = getRandomInt(32) + 1 // 1-32
    // 1/32 chance to crit for Lightning, 1/16 chance to crit, 1/8 chance for Wind
    if ((CritCheck <= 2 && OffenderData[AttackType].Element != `Lightning`) || (CritCheck <= 4 && OffenderData[AttackType].Element == `Wind`) || (CritCheck <= 1)) Crit = true;

    if (Crit) {
        switch (OffenderData[AttackType].Element) {
            case `Fire`:
                await Profile.update({Status: `Burning 🔥`}, {where: {id: DefenderData[4]}});
                StatusMessage = ` and burned <@${DefenderData[4]}>! (Critical Hit!)`;
                break;
            case `Ice`:
                await Profile.update({Status: `Frozen 🧊`}, {where: {id: DefenderData[4]}});
                StatusMessage = ` and froze <@${DefenderData[4]}>! (Critical Hit!)`;
                break;
            case `Water`:
                await Profile.update({Status: `Drenched 💧`}, {where: {id: DefenderData[4]}});
                StatusMessage = ` and drenched <@${DefenderData[4]}>! (Critical Hit!)`;
                break;
            case `Lightning`:
                CritDmg = (OffenderData[AttackType].Damage);
                StatusMessage = ` and did double damage to <@${DefenderData[4]}>! (Critical Hit!)`;
                break;
            case `Wind`:
                CritDmg = (OffenderData[AttackType].Damage) * 0.25;
                StatusMessage = ` and did 25% extra damage to <@${DefenderData[4]}>! (Critical Hit!)`;
                break;
            default:
                CritDmg = (OffenderData[AttackType].Damage) * 0.5;
                StatusMessage = ` and did 50% extra damage to <@${DefenderData[4]}>! (Critical Hit!)`;
        }
    }

    //dmg formula
    let Damage = OffenderData[AttackType].Damage + DefenderData[DefenseType].Damage*-1 + CritDmg + StatusDmg;
    if (Damage < 0) Damage = 0;
    let ResultingHP = DefenderData[5] - Damage;
    await updateHP(DefenderData[4], ResultingHP, OffenderData[4]); // Update HP of Defender to ResultingHP (if killed it will say killed by Offender)
    return {
        Damage: Damage - StatusDmg - CritDmg,
        StatusMessage: `${StatusMessage}`,
        TotalDmg: Damage
    }
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName("attack")
    .setDescription("Attack another user.")
    .addUserOption((option) => 
    option
        .setName("target")
        .setDescription("Who would you like to attack?")
        .setRequired(true)
    ),
    async execute(interaction) {
        killMessage = false;
        var Target = interaction.options.getUser('target');
        if (Target.id == interaction.user.id) {
            interaction.reply(`You can't attack yourself!`);
            return;
        } else if (Target.id == config.Yue) {
            interaction.reply({content: `Foolish of you to think you have any chance against me. Go fight someone else.`, files: [YueMad]});
            Profile.update({Weapon: `None`, Magic: `None`}, {where: {id: interaction.user.id}});
            await delay(3000);
            await interaction.editReply({content: `I'm also taking your offenses before you do something else stupid. Check your profile ${config.Yuelick}`, files: []});
            return;
        }
        let targetProfile = await Profile.findByPk(Target.id);
        let userProfile = await Profile.findByPk(interaction.user.id);

        // User and Target Inventories: [0->3] Weapon, Magic, Armor, Shield | [4] ID | [5] Health | [6] Profile
        let userData = [
            await Items.findOne({where: {Name: userProfile.Weapon}}), await Items.findOne({where: {Name: userProfile.Magic}}),
            await Items.findOne({where: {Name: userProfile.Armor}}), await Items.findOne({where: {Name: userProfile.Shield}}),
            interaction.user.id, parseInt(userProfile.Health.slice(11,14))
        ]
        let targetData = [
            await Items.findOne({where: {Name: targetProfile.Weapon}}), await Items.findOne({where: {Name: targetProfile.Magic}}),
            await Items.findOne({where: {Name: targetProfile.Armor}}), await Items.findOne({where: {Name: targetProfile.Shield}}),
            Target.id, parseInt(targetProfile.Health.slice(11,14))
        ]

        let userStatus = `__***${userProfile.Status}***__`;
        let targetStatus = `__***${targetProfile.Status}***__`;
        if (userProfile.Status == ``) userStatus = ``;
        if (targetProfile.Status == ``) targetStatus = ``;
        Color = config.YueYellow;
        const UI = new EmbedBuilder()
        .setTitle(`Attacking ${Target.username}`)
        .setThumbnail(`https://media.discordapp.net/attachments/1228497873042145351/1241858410715156691/MiyuGunCropped.png?ex=664bba45&is=664a68c5&hm=6bc0864134f889e03763d02d5383d8b85b58230569f8aaf3ce157236a58ce215&=&format=webp&quality=lossless`)
        .setColor(Color)
        .setFooter({text: `Yue Version: ${config.YueVersion}`})
        .setFields(
            {name: `Name:`, value: `<@${Target.id}>`},
            {name: `Health`, value: `${targetProfile.Health} ${targetStatus}`},
            {name: `Shield 🛡️`, value: `${targetProfile.Shield}\nDefense: **${targetData[3].Damage.toString().replace(`-`,``)}**`, inline: true},
            {name: `Armor 👕`, value: `${targetProfile.Armor}\nDefense: **${targetData[2].Damage.toString().replace(`-`,``)}**`, inline: true},
            {name: `\t`, value: `\t`},
            {name: `${config.YueSmile} VS ${config.YueSmile}`, value: `\t`},
            {name: `\t`, value: `\t`},
            {name: `Name:`, value: `<@${interaction.user.id}>`},
            {name: `Health`, value: `${userProfile.Health} ${userStatus}`},
            {name: `Shield 🛡️`, value: `${userProfile.Shield}\nDefense: **${userData[3].Damage.toString().replace(`-`,``)}**`, inline: true},
            {name: `Armor 👕`, value: `${userProfile.Armor}\nDefense: **${userData[2].Damage.toString().replace(`-`,``)}**`, inline: true},
        )

        // Buttons for attack command
        const Weapon = new ButtonBuilder()
        .setCustomId('weapon')
        .setLabel('Weapon')
        .setEmoji(config.Schlag)
        .setStyle(ButtonStyle.Success);

        const Retreat = new ButtonBuilder()
        .setCustomId('retreat')
        .setLabel('Retreat')
        .setEmoji(`🏳️`)
        .setStyle(ButtonStyle.Secondary)

        const Magic = new ButtonBuilder()
        .setCustomId('magic')
        .setLabel('Magic')
        .setEmoji(config.Lightning_Wyrm)
        .setStyle(ButtonStyle.Success)

        const InitialReply = await interaction.reply({embeds: [UI], components: [new ActionRowBuilder().addComponents(Weapon, Retreat, Magic)]}); // Initial message as a variable

        // Collect value from button
        const ButtonCollector = InitialReply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: i => i.user.id === interaction.user.id, // Only take selection from User,
        time: 240_000 // Button reads for 240s (4min)
        });

        // On button pressed:
        ButtonCollector.on('collect', async (i) => {
            let AttackType = `Null`;
            switch (i.customId) {
                case "weapon":
                    AttackType = `Weapon`;
                    break;
                case "retreat":
                    UI.setColor(config.White);
                    UI.setFields();
                    UI.setTitle(`Retreating from battle.`);
                    let Drop = 1000
                    if (userProfile.Balance - Drop < 0) Drop = userProfile.Balance;
                    UI.setDescription(`In your retreat you clumsily dropped $${Drop}.\n**New Balance: $${userProfile.Balance - Drop}**`);
                    Profile.update({Balance: userProfile.Balance - Drop}, {where: {id: interaction.user.id}});
                    await i.update({content: ``, embeds: [UI], components: []});
                    return;
                case "magic":
                    AttackType = `Magic`;
                    break;
            }

            // User attack
            let userAttack = await attack(userData, targetData, AttackType);
            if (!killMessage) {
                // Target return attack
                AttackType = [`Weapon`, `Magic`];
                var targetAttack = await attack(targetData, userData, AttackType[getRandomInt(2)]);
            } else { // If User kills Target, Target does not attack in return (because they're dead)
                var targetAttack = false;
            }

            // Update profiles
            targetProfile = await Profile.findByPk(Target.id);
            userProfile = await Profile.findByPk(interaction.user.id);
            userData = [
                await Items.findOne({where: {Name: userProfile.Weapon}}), await Items.findOne({where: {Name: userProfile.Magic}}),
                await Items.findOne({where: {Name: userProfile.Armor}}), await Items.findOne({where: {Name: userProfile.Shield}}),
                interaction.user.id, parseInt(userProfile.Health.slice(11,14))
            ]
            targetData = [
                await Items.findOne({where: {Name: targetProfile.Weapon}}), await Items.findOne({where: {Name: targetProfile.Magic}}),
                await Items.findOne({where: {Name: targetProfile.Armor}}), await Items.findOne({where: {Name: targetProfile.Shield}}),
                Target.id, parseInt(targetProfile.Health.slice(11,14))
            ]

            // Update UI
            userStatus = `__***${userProfile.Status}***__`;
            targetStatus = `__***${targetProfile.Status}***__`;
            if (userProfile.Status == ``) userStatus = ``;
            if (targetProfile.Status == ``) targetStatus = ``;
            UI.setColor(Color)
            if (!killMessage) {
            UI.setFields(
                {name: `Name:`, value: `<@${Target.id}>`},
                {name: `Health`, value: `${targetProfile.Health} ${targetStatus}`},
                {name: `Shield 🛡️`, value: `${targetProfile.Shield}\nDefense: **${targetData[3].Damage.toString().replace(`-`,``)}**`, inline: true},
                {name: `Armor 👕`, value: `${targetProfile.Armor}\nDefense: **${targetData[2].Damage.toString().replace(`-`,``)}**`, inline: true},
                {name: `\t`, value: `\t`},
                {name: `${config.YueSmile} VS ${config.YueSmile}`, value: `\t`},
                {name: `\t`, value: `\t`},
                {name: `Name:`, value: `<@${interaction.user.id}>`},
                {name: `Health`, value: `${userProfile.Health} ${userStatus}`},
                {name: `Shield 🛡️`, value: `${userProfile.Shield}\nDefense: **${userData[3].Damage.toString().replace(`-`,``)}**`, inline: true},
                {name: `Armor 👕`, value: `${userProfile.Armor}\nDefense: **${userData[2].Damage.toString().replace(`-`,``)}**`, inline: true},
            )
            } else {
                UI.setFields();
            }

            let userResponse = `You hit <@${Target.id}> for ${userAttack.Damage} damage${userAttack.StatusMessage}\nTotal Damage: **${userAttack.TotalDmg}**`;
            let targetResponse = `\n\n<@${Target.id}> responded with ${targetAttack.Damage} damage${targetAttack.StatusMessage}\nTotal Damage: **${targetAttack.TotalDmg}**`;
            if (killMessage) {
                UI.setDescription(`${userResponse}\n\n${killMessage}`);
                await i.update({content: ``, embeds: [UI], components: []});
                // If anybody is dead, heal to full
                if (userData[5] == 0) Profile.update({Status: ``, Health: `▰▰▰▰▰▰▰▰▰▰ 100/100`}, {where: {id: interaction.user.id}});
                if (targetData[5] == 0) Profile.update({Status: ``, Health: `▰▰▰▰▰▰▰▰▰▰ 100/100`}, {where: {id: Target.id}});
            } else {
                if (!targetAttack) targetResponse = ``
                UI.setDescription(userResponse+targetResponse);
                await i.update({content: ``, embeds: [UI], components: [new ActionRowBuilder().addComponents(Weapon, Retreat, Magic)]});
            }
        });
    },
};