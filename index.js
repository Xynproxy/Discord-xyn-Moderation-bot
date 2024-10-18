const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
const prefix = '!';

client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!message.member.permissions.has('MODERATE_MEMBERS')) {
        return message.reply("You don't have permission to use this command.");
    }

    if (!target) {
        return message.reply("Please mention a user or provide a valid ID.");
    }

    // Mute Command
    if (command === 'mute') {
        const muteDuration = args[1] || '10m'; // Default mute for 10 minutes
        try {
            await target.timeout(ms(muteDuration), "Muted by moderator");
            message.channel.send(`${target.user.tag} has been muted for ${muteDuration}.`);
        } catch (error) {
            message.reply("Failed to mute the user.");
        }
    }

    // Unmute Command
    if (command === 'unmute') {
        try {
            await target.timeout(null); // Remove mute
            message.channel.send(`${target.user.tag} has been unmuted.`);
        } catch (error) {
            message.reply("Failed to unmute the user.");
        }
    }

    // Ban Command
    if (command === 'ban') {
        const reason = args.slice(1).join(' ') || 'No reason provided';
        try {
            await target.ban({ reason });
            message.channel.send(`${target.user.tag} has been banned. Reason: ${reason}`);
        } catch (error) {
            message.reply("Failed to ban the user.");
        }
    }

    // Unban Command
    if (command === 'unban') {
        const userId = args[0];
        try {
            await message.guild.members.unban(userId);
            message.channel.send(`User with ID ${userId} has been unbanned.`);
        } catch (error) {
            message.reply("Failed to unban the user.");
        }
    }

    // Warn Command (This can be enhanced with a database system)
    if (command === 'warn') {
        const reason = args.slice(1).join(' ') || 'No reason provided';
        message.channel.send(`${target.user.tag} has been warned. Reason: ${reason}`);
    }

    // Unwarn Command (Also works well with a database)
    if (command === 'unwarn') {
        message.channel.send(`The warn for ${target.user.tag} has been removed.`);
    }

    // Kick Command
    if (command === 'kick') {
        const reason = args.slice(1).join(' ') || 'No reason provided';
        try {
            await target.kick(reason);
            message.channel.send(`${target.user.tag} has been kicked. Reason: ${reason}`);
        } catch (error) {
            message.reply("Failed to kick the user.");
        }
    }
});

client.login('YOUR_BOT_TOKEN');
