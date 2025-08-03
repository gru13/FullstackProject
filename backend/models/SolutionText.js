const mongoose = require('mongoose');

const solutionTextSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionText',
    required: true
    // questionName will be available via population if needed
  },
  answerCode: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  }
}, { timestamps: true });

const SolutionText = mongoose.model('SolutionText', solutionTextSchema);

module.exports = SolutionText;