const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const Player = require('../models/Player');
const Team = require('../models/Team');
const Match = require('../models/Match');

const app = express();
require('dotenv').config();

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.post('/confirm', async (req, res) => {
    const { match_id, player_id } = req.body;

    try {
        const match = await Match.findById(match_id);
        if (!match) {
            return res.status(404).send('Match not found');
        }

        if (!match.confirmed_players.includes(player_id)) {
            match.confirmed_players.push(player_id);
            await match.save();
        }

        res.status(200).json(match);
    } catch (error) {
        console.error('Error confirming player:', error);
        res.status(500).send('Error confirming player');
    }
});

app.listen(3004, () => console.log('Confirmation Service running on port 3004'));