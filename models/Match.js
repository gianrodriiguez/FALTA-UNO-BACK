const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  teams: [String],  // Expecting an array of team names or IDs
  date: String,
  time: String
});

const Match = mongoose.model('Match', MatchSchema);  // Create the model

module.exports = Match;

// OPCION 2
// const mongoose = require('mongoose');

// const MatchSchema = new mongoose.Schema({
//   teams: [String],
//   date: String,
//   time: String,
//   confirmed_players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }]
// });

// const Match = mongoose.model('Match', MatchSchema);

// module.exports = Match;