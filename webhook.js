//

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy: DiscordStrategy } = require('passport-discord');
const axios = require('axios');
const config = require('./config.json');  // Import config.json
const app = express();

const PORT = process.env.PORT || 3000;

// Setting up session and passport
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// Configure Discord OAuth2 Strategy
passport.use(new DiscordStrategy({
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    callbackURL: config.redirectURI,
    scope: ['identify', 'guilds', 'guilds.members.read'],
}, async (accessToken, refreshToken, profile, done) => {
    // Add user's profile to the session
    profile.accessToken = accessToken;
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// API for Discord Authentication
app.get('/login', (req, res) => {
    res.redirect('/auth/discord');
});

// Handle Discord OAuth2 Redirect
app.get('/auth/discord', passport.authenticate('discord'));

// Handle Callback from Discord
app.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/' }), async (req, res) => {
    res.redirect('/dashboard');
});

// Dashboard Route
app.get('/dashboard', async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/login');

    const userId = req.user.id;
    const accessToken = req.user.accessToken;
    const guildId = config.guildID;

    try {
        // Fetch the guild's members using the bot token
        const members = await axios.get(`https://discord.com/api/v10/guilds/${guildId}/members`, {
            headers: {
                Authorization: `Bot ${config.botToken}`,
            },
        });

        const member = members.data.find(member => member.user.id === userId);

        if (!member) return res.send('You are not part of this guild.');

        // Check if the user has the necessary permissions
        const hasPermission = member.roles.some(role => role === 'Staff Team' || member.permissions.includes('MANAGE_GUILD') || member.permissions.includes('ADMINISTRATOR'));

        if (hasPermission) {
            res.send(`
                <h1>Welcome to the Moderation Dashboard</h1>
                <p>You have the required permissions to moderate actions in this server.</p>
                <p>Your Discord ID: ${userId}</p>
                <p>Guild ID: ${guildId}</p>
                <a href="/ban">Ban a User</a><br>
                <a href="/mute">Mute a User</a><br>
                <a href="/warn">Warn a User</a><br>
                <a href="/kick">Kick a User</a><br>
            `);
        } else {
            res.send('You do not have the required permissions to access this dashboard.');
        }

    } catch (error) {
        console.error('Error fetching members:', error);
        res.send('An error occurred while fetching guild members.');
    }
});

// API for banning a user
app.post('/api/ban', async (req, res) => {
    const { userId, reason } = req.body;
    if (!req.isAuthenticated()) return res.status(401).send('You must be logged in.');

    const { accessToken, id: actionById } = req.user;
    const guildId = config.guildID;

    try {
        // Check user permissions before proceeding
        const isPermitted = await checkPermissions(guildId, actionById);
        if (!isPermitted) return res.status(403).send('You do not have permission to ban users.');

        await axios.post(`https://discord.com/api/v10/guilds/${guildId}/bans/${userId}`, {
            reason: reason,
        }, {
            headers: {
                Authorization: `Bot ${config.botToken}`,
            },
        });

        res.send({ message: 'User banned successfully!' });
    } catch (error) {
        console.error('Error banning user:', error);
        res.status(500).send('An error occurred while banning the user.');
    }
});

// Check if the user has permission
async function checkPermissions(guildId, userId) {
    try {
        const { data: member } = await axios.get(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
            headers: { Authorization: `Bot ${config.botToken}` },
        });

        // Check if the user has 'Admin' or 'Manage Guild' permission or belongs to the 'Staff Team' role
        return member.roles.some(role => role === 'Staff Team' || member.permissions.includes('MANAGE_GUILD') || member.permissions.includes('ADMINISTRATOR'));
    } catch (error) {
        console.error('Error checking permissions:', error);
        return false;
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
