const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const amqp = require('amqplib');  // Add amqplib for RabbitMQ
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
require('dotenv').config();  // Load environment variables

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// Define Match schema and model
const MatchSchema = new mongoose.Schema({
  teams: [String],  // Expecting an array of team names
  date: String,
  time: String
});

const Match = mongoose.model('Match', MatchSchema);

async function connectToRabbitMQ(retryCount = 5, delay = 5000) {
  while (retryCount > 0) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      const channel = await connection.createChannel();
      await channel.assertQueue('invitations');
      console.log('Connected to RabbitMQ');
      return channel;
    } catch (error) {
      console.error('Failed to connect to RabbitMQ, retrying...', error);
      retryCount--;
      await new Promise(res => setTimeout(res, delay)); // Wait 5 seconds before retrying
    }
  }
  throw new Error('Could not connect to RabbitMQ after multiple attempts');
}


// Route to create a match and send an invitation message to RabbitMQ
app.post('/create-match', async (req, res) => {
  const { teams, date, time } = req.body;

  // Validation: there must be exactly 2 teams
  if (teams.length !== 2) {
    return res.status(400).send('There must be two teams');
  }

  try {
    // Create and save new match to MongoDB
    const newMatch = new Match({ teams, date, time });
    await newMatch.save();

    // Connect to RabbitMQ and send an invitation message
    const channel = await connectToRabbitMQ();
    const invitationMessage = {
      match_id: newMatch._id,
      teams,
      date,
      time,
    };
    channel.sendToQueue('invitations', Buffer.from(JSON.stringify(invitationMessage)));
    console.log(`Invitation sent for match ${newMatch._id}`);

    res.status(201).json(newMatch); // Return the created match
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).send('Error creating match');
  }
});

// Fetch matches by team name
app.get('/matches/team/:teamName', async (req, res) => {
  try {
    const teamName = req.params.teamName;
    const matches = await Match.find({ teams: teamName });
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).send('Error fetching matches');
  }
});

// Start the server
app.listen(3003, () => console.log('Match Service running on port 3003'));
