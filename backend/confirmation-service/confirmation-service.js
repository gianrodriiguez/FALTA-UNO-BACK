const express = require('express');
const cors = require('cors');  // Import CORS
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(cors());  // Enable CORS
app.use(express.json());

let matches = []; // Reference to match data

app.post('/confirm', (req, res) => {
    const { match_id, player_id } = req.body;
    const match = matches.find(m => m.id === match_id);
    if (!match) {
        return res.status(404).send('Match not found');
    }
    if (!match.confirmed_players.includes(player_id)) {
        match.confirmed_players.push(player_id);
    }
    res.status(200).json(match);
});

app.listen(3004, () => console.log('Confirmation Service running on port 3004'));
