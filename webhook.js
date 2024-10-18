// api.js (Node.js Backend)

const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(express.json());

// Discord Webhook URL for logging actions
const webhookUrl = 'YOUR_DISCORD_WEBHOOK_URL';  // Replace with actual webhook URL

// Example roles for validation
const staffRoles = ['Staff', 'Moderator'];  // Example role names
const botFounders = ['BotFounder'];  // Example bot founder role

// Simulate checking if a user has a valid role (this could be fetched from Discord's API)
function hasRole(userId, roles) {
    // In a real scenario, this would be done through a Discord API request
    return roles.some(role => staffRoles.includes(role));  // Simulate checking roles
}

// Mute User API
app.post('/api/mute', async (req, res) => {
    const { userId, guildId, roles, actionBy } = req.body;

    // Check if the action sender has the required role
    if (!hasRole(actionBy, roles)) {
        return res.status(403).json({ error: 'You do not have permission to mute users.' });
    }

    // Log the mute action to Discord Webhook
    await axios.post(webhookUrl, {
        content: `User ${userId} was muted by ${actionBy} in guild ${guildId}.`
    });

    return res.status(200).json({ message: 'User muted and action logged.' });
});

// Ban User API
app.post('/api/ban', async (req, res) => {
    const { userId, guildId, roles, actionBy } = req.body;

    // Check if the action sender has the required role
    if (!hasRole(actionBy, roles)) {
        return res.status(403).json({ error: 'You do not have permission to ban users.' });
    }

    // Log the ban action to Discord Webhook
    await axios.post(webhookUrl, {
        content: `User ${userId} was banned by ${actionBy} in guild ${guildId}.`
    });

    return res.status(200).json({ message: 'User banned and action logged.' });
});

// Warn User API
app.post('/api/warn', async (req, res) => {
    const { userId, guildId, roles, reason, actionBy } = req.body;

    // Check if the action sender has the required role
    if (!hasRole(actionBy, roles)) {
        return res.status(403).json({ error: 'You do not have permission to warn users.' });
    }

    // Log the warn action to Discord Webhook
    await axios.post(webhookUrl, {
        content: `User ${userId} was warned by ${actionBy} in guild ${guildId} for: ${reason}.`
    });

    return res.status(200).json({ message: 'User warned and action logged.' });
});

// API to get bot founder data
app.get('/api/bot-data', (req, res) => {
    const { botId } = req.query;

    // Check if the botId matches a bot founder
    if (botFounders.includes(botId)) {
        return res.status(200).json({ message: 'Bot Founder data retrieved.' });
    } else {
        return res.status(403).json({ error: 'Access denied to non-founders.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// api.js (Frontend)

const apiUrl = 'http://localhost:3000';  // Your backend API URL

async function sendCommand(endpoint, data) {
    try {
        const response = await fetch(`${apiUrl}/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (response.ok) {
            alert(result.message);  // Display success message
        } else {
            alert(result.error);  // Display error message
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing the request.');
    }
}

// Ban User function
function banUser() {
    const userId = document.querySelector('#userId').value;
    const guildId = document.querySelector('#guildId').value;
    const roles = ['Staff'];  // Example user roles
    const actionBy = 'Admin'; // Example action by user

    const data = {
        userId, guildId, roles, actionBy
    };

    sendCommand('ban', data);
}

// Mute User function
function muteUser() {
    const userId = document.querySelector('#userId').value;
    const guildId = document.querySelector('#guildId').value;
    const roles = ['Staff'];  // Example user roles
    const actionBy = 'Admin'; // Example action by user

    const data = {
        userId, guildId, roles, actionBy
    };

    sendCommand('mute', data);
}

// Warn User function
function warnUser() {
    const userId = document.querySelector('#userId').value;
    const guildId = document.querySelector('#guildId').value;
    const reason = document.querySelector('#warnReason').value;
    const roles = ['Staff'];  // Example user roles
    const actionBy = 'Admin'; // Example action by user

    const data = {
        userId, guildId, roles, reason, actionBy
    };

    sendCommand('warn', data);
}
