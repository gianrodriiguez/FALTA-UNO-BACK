const express = require('express');
const cors = require('cors');  // Import CORS
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(cors());  // Enable CORS
app.use(express.json());

let players = []; // Assume player data is here
let matches = [];

app.post('/send-invite', (req, res) => {
    const { match_id } = req.body;
    const match = matches.find(m => m.id === match_id);
    if (!match) {
        return res.status(404).send('Match not found');
    }
    const teamPlayers = match.teams.flatMap(teamId => 
        players.filter(player => player.team_id === teamId)
    );
    
    teamPlayers.forEach(player => {
        // Assume we send an email invite (simulation)
        console.log(`Sending invite to ${player.email} for match ${match_id}`);
    });

    res.status(200).send('Invites sent');
});

app.listen(3005, () => console.log('Invite Service running on port 3005'));
