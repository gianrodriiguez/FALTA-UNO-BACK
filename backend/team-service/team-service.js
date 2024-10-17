const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');  // Import Mongoose
const app = express();

app.use(cors());
app.use(express.json());
require('dotenv').config();  // Add this line at the top to load environment variables

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Define Team schema
const TeamSchema = new mongoose.Schema({
  team_name: String,
  players: [String]
});

const Team = mongoose.model('Team', TeamSchema);

// Create a new team
app.post('/create-team', async (req, res) => {
    const { team_name, players } = req.body;
    const newTeam = new Team({ team_name, players });
    await newTeam.save();
    res.status(201).json(newTeam);
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

// app.get('/teams/:playerId', async (req, res) => {
//   const { playerId } = req.params;
//   try {
//     const teams = await Team.find({ players: playerId });  // Find teams that contain the player's ID
//     res.json(teams);
//   } catch (error) {
//     console.error('Error fetching teams:', error);
//     res.status(500).send('Error fetching teams');
//   }
// });

app.get('/teams/player/:playerId', async (req, res) => {
  try {
    const teams = await Team.find({ players: req.params.playerId });  // Assuming teams have player IDs
    res.json(teams);
  } catch (error) {
    res.status(500).send('Error fetching teams');
  }
});


app.listen(3002, () => console.log('Team Service running on port 3002'));
