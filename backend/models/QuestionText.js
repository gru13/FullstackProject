const mongoose = require('mongoose');

const questionTextSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionName: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  marks: {
    type: Number,
    required: true
  },
  source: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  inputFormat: {
    type: String,
    required: true
  },
  outputFormat: {
    type: String,
    required: true
  },
  constraints: {
    type: String,
    required: true
  },
  sampleInputs: [{
    type: String,
    required: true
  }],
  sampleOutputs: [{
    type: String,
    required: true
  }]
}, { timestamps: true });

const QuestionText = mongoose.model('QuestionText', questionTextSchema);

module.exports = QuestionText;