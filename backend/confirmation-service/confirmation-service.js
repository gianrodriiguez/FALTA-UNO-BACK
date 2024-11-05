const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const amqp = require('amqplib');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

const Match = mongoose.model('Match', new mongoose.Schema({
  teams: [String],
  date: String,
  time: String,
  confirmed_players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }]
}));

const PlayerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }
  });
  
const Player = mongoose.model('Player', PlayerSchema);

// Route to confirm a player’s invitation to a match via HTTP
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

// Start the Confirmation Service
app.listen(3004, () => console.log('Confirmation Service running on port 3004'));