const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  teams: [String],
  date: String,
  time: String,
  confirmed_players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }]
});

const Match = mongoose.model('Match', MatchSchema);

module.exports = Match;
