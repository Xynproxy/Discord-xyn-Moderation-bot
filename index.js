const { Client, Intents, MessageEmbed } = require('discord.js');
const ms = require('ms');  // Add this to handle time formats like '10m', '2h'
const config = require('./config.json');  // Import your config.json file

const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ] 
});

const prefix = '!';

client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    // Check if the user has the required permissions to execute the command
    if (!message.member.permissions.has('MODERATE_MEMBERS')) {
        return message.reply("You don't have permission to use this command.");
    }

    if (!target) {
        return message.reply("Please mention a user or provide a valid ID.");
    }

    // Mute Command
    if (command === 'mute') {
        const muteDuration = args[1] ? ms(args[1]) : 600000; // Default mute for 10 minutes (600000ms)
        if (!muteDuration) return message.reply("Invalid time format.");

        try {
            await target.timeout(muteDuration, "Muted by moderator");
            const muteEmbed = new MessageEmbed()
                .setColor('YELLOW')
                .setTitle('User Muted')
                .addField('User:', target.user.tag, true)
                .addField('Duration:', ms(muteDuration, { long: true }), true)
                .setFooter(`Muted by ${message.author.tag}`, message.author.displayAvatarURL())
                .setTimestamp();
            message.channel.send({ embeds: [muteEmbed] });
        } catch (error) {
            message.reply("Failed to mute the user.");
        }
    }

    // Unmute Command
    if (command === 'unmute') {
        try {
            await target.timeout(null); // Remove mute
            const unmuteEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle('User Unmuted')
                .addField('User:', target.user.tag, true)
                .setFooter(`Unmuted by ${message.author.tag}`, message.author.displayAvatarURL())
                .setTimestamp();
            message.channel.send({ embeds: [unmuteEmbed] });
        } catch (error) {
            message.reply("Failed to unmute the user.");
        }
    }

    // Ban Command
    if (command === 'ban') {
        const reason = args.slice(1).join(' ') || 'No reason provided';
        try {
            await target.ban({ reason });
            const banEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('User Banned')
                .addField('User:', target.user.tag, true)
                .addField('Reason:', reason, true)
                .setFooter(`Banned by ${message.author.tag}`, message.author.displayAvatarURL())
                .setTimestamp();
            message.channel.send({ embeds: [banEmbed] });
        } catch (error) {
            message.reply("Failed to ban the user.");
        }
    }

    // Unban Command
    if (command === 'unban') {
        const userId = args[0];
        if (!userId) return message.reply("Please provide a valid user ID.");

        try {
            await message.guild.members.unban(userId);
            const unbanEmbed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle('User Unbanned')
                .addField('User ID:', userId, true)
                .setFooter(`Unbanned by ${message.author.tag}`, message.author.displayAvatarURL())
                .setTimestamp();
            message.channel.send({ embeds: [unbanEmbed] });
        } catch (error) {
            message.reply("Failed to unban the user.");
        }
    }

    // Warn Command
    if (command === 'warn') {
        const reason = args.slice(1).join(' ') || 'No reason provided';
        const warnEmbed = new MessageEmbed()
            .setColor('ORANGE')
            .setTitle('User Warned')
            .addField('User:', target.user.tag, true)
            .addField('Reason:', reason, true)
            .setFooter(`Warned by ${message.author.tag}`, message.author.displayAvatarURL())
            .setTimestamp();
        message.channel.send({ embeds: [warnEmbed] });
    }

    // Unwarn Command
    if (command === 'unwarn') {
        const unwarnEmbed = new MessageEmbed()
            .setColor('BLUE')
            .setTitle('Warn Removed')
            .addField('User:', target.user.tag, true)
            .setFooter(`Unwarned by ${message.author.tag}`, message.author.displayAvatarURL())
            .setTimestamp();
        message.channel.send({ embeds: [unwarnEmbed] });
    }

    // Kick Command
    if (command === 'kick') {
        const reason = args.slice(1).join(' ') || 'No reason provided';
        try {
            await target.kick(reason);
            const kickEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('User Kicked')
                .addField('User:', target.user.tag, true)
                .addField('Reason:', reason, true)
                .setFooter(`Kicked by ${message.author.tag}`, message.author.displayAvatarURL())
                .setTimestamp();
            message.channel.send({ embeds: [kickEmbed] });
        } catch (error) {
            message.reply("Failed to kick the user.");
        }
    }

    // Ping Command
    if (command === 'ping') {
        const pingEmbed = new MessageEmbed()
            .setColor('BLUE')
            .setTitle('Pong!')
            .addField('Bot Latency:', `${Math.round(client.ws.ping)}ms`, true)
            .addField('API Latency:', `${message.client.ws.ping}ms`, true)
            .setFooter(`Ping requested by ${message.author.tag}`, message.author.displayAvatarURL())
            .setTimestamp();
        message.channel.send({ embeds: [pingEmbed] });
    }
});

// Log in with the token stored in config.json
client.login(config.token);
