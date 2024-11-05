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

// Define Invite Schema and Model
const InviteSchema = new mongoose.Schema({
  match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  status: { type: String, enum: ['sent', 'accepted', 'declined'], default: 'sent' },
  sent_at: { type: Date, default: Date.now }
});
const Invite = mongoose.model('Invite', InviteSchema);

const Player = mongoose.model('Player', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
}));

const Match = mongoose.model('Match', new mongoose.Schema({
  teams: [String],  // Array of team names or IDs
  date: String,
  time: String
}));

// Connect to RabbitMQ with retry logic
async function connectToRabbitMQ(retryCount = 5, delay = 5000) {
  while (retryCount > 0) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
      const channel = await connection.createChannel();
      await channel.assertQueue('invitations');

      channel.consume('invitations', async (msg) => {
        const { match_id, teams } = JSON.parse(msg.content.toString());
        console.log(`Received invite for match ${match_id}`);

        try {
          // Fetch all players from both teams
          const teamPlayers = await Player.find({ team_name: { $in: teams } });

          // Create invite entries for each player
          const invites = teamPlayers.map(player => ({
            match_id,
            player_id: player._id,
            status: 'sent'
          }));

          await Invite.insertMany(invites);
          teamPlayers.forEach(player => {
            console.log(`Sending invite to ${player.email} for match ${match_id}`);
          });

          channel.ack(msg);  // Acknowledge the message
        } catch (error) {
          console.error('Error processing invitation:', error);
          channel.nack(msg);  // Retry message if processing fails
        }
      });

      console.log('Connected to RabbitMQ');
      return channel;  // Return the channel if connection is successful
    } catch (error) {
      console.error('Failed to connect to RabbitMQ, retrying...', error);
      retryCount--;
      if (retryCount === 0) {
        throw new Error('Could not connect to RabbitMQ after multiple attempts');
      }
      await new Promise(res => setTimeout(res, delay)); // Wait before retrying
    }
  }
}


// Route to get invites for a specific player
app.get('/invites/player/:playerId', async (req, res) => {
  const { playerId } = req.params;
  try {
    const invites = await Invite.find({ player_id: playerId }).populate('match_id');
    res.status(200).json(invites);
  } catch (error) {
    console.error('Error fetching invites for player:', error);
    res.status(500).json({ error: 'Error fetching invites' });
  }
});


// Initialize RabbitMQ listener
connectToRabbitMQ().then(() => console.log('Listening for invitation messages'));

// Start the Invite Service
app.listen(3005, () => console.log('Invite Service running on port 3005'));