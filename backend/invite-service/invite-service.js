const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// Define Invite Schema and Model
const InviteSchema = new mongoose.Schema({
  match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  status: { type: String, enum: ['sent', 'accepted', 'declined'], default: 'sent' },
  sent_at: { type: Date, default: Date.now }
});

const Invite = mongoose.model('Invite', InviteSchema);

const PlayerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }
  });
  
const Player = mongoose.model('Player', PlayerSchema);

const MatchSchema = new mongoose.Schema({
    teams: [String],  // Expecting an array of team names or IDs
    date: String,
    time: String
  });
  
  const Match = mongoose.model('Match', MatchSchema);  // Create the model

// Route to Send Invites for a Match
app.post('/send-invite', async (req, res) => {
  const { match_id } = req.body;

  try {
    // Find the match
    const match = await Match.findById(match_id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Fetch all players from both teams in the match
    const teamPlayers = await Player.find({ team_name: { $in: match.teams } });

    // Send invites to all players in the match
    const invites = teamPlayers.map(player => ({
      match_id: match._id,
      player_id: player._id,
      status: 'sent'
    }));

    // Save invites to the database
    await Invite.insertMany(invites);

    // Log each invite to simulate sending an email
    teamPlayers.forEach(player => {
      console.log(`Sending invite to ${player.email} for match ${match_id}`);
    });

    res.status(200).json({ message: 'Invites sent successfully', invites });
  } catch (error) {
    console.error('Error sending invites:', error);
    res.status(500).json({ error: 'Error sending invites' });
  }
});

// Start the Invite Service
app.listen(3005, () => console.log('Invite Service running on port 3005'));