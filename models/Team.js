const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  team_name: { type: String, required: true },
  players: [{ type: String, required: true }]  // Store emails as strings
});

const Team = mongoose.model('Team', TeamSchema);

module.exports = Team;

// OPCION 2
// const mongoose = require('mongoose');

// const TeamSchema = new mongoose.Schema({
//   team_name: { type: String, required: true },
//   players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }]  // Store ObjectId references
// });

// const Team = mongoose.model('Team', TeamSchema);

// module.exports = Team;
