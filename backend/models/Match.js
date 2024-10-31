const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    teams: [String],  // Expecting an array of team names or IDs
    date: String,
    time: String
  });
  
const Match = mongoose.model('Match', MatchSchema); 

module.exports = Match;