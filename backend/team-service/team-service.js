const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');  // Import Mongoose
const app = express();

app.use(cors());
app.use(express.json());
require('dotenv').config();  // Load environment variables

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Define the Player schema directly within this file
const PlayerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
});
const Player = mongoose.model('Player', PlayerSchema);

// Define the Team schema directly within this file
const TeamSchema = new mongoose.Schema({
  team_name: { type: String, required: true },
  players: [{ type: String, required: true }]  // Store emails as strings
});

const Team = mongoose.model('Team', TeamSchema);

// Create a new team
app.post('/create-team', async (req, res) => {
  const { team_name, players } = req.body;

  // Check if the number of players exceeds the limit
  if (players.length > 5) {
    return res.status(400).json({ error: 'A team cannot have more than 5 players' });
  }

  try {
    const newTeam = new Team({ team_name, players });
    await newTeam.save();
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ error: 'Error creating team' });
    console.error(error);
  }
});

// Get all teams
app.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find();  // Fetch all teams from MongoDB
    res.json(teams);  // Return the teams as a JSON response
  } catch (error) {
    console.error("Error fetching teams:", error);  // Log the error for better debugging
    res.status(500).send('Error fetching teams');
  }
});

// Search for teams by player email
app.get('/teams/player/:email', async (req, res) => {
  try {
    // Find teams where the player's email is in the 'players' array
    const teams = await Team.find({ players: req.params.email });
    if (teams.length === 0) {
      return res.status(404).send('No teams found for this player');
    }
    res.json(teams);
  } catch (error) {
    res.status(500).send('Error fetching teams');
    console.error(error);
  }
});


app.listen(3002, () => console.log('Team Service running on port 3002'));