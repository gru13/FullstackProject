const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  difficultyDistribution: {
    easy: {
      type: Number,
      required: true
    },
    medium: {
      type: Number,
      required: true
    },
    hard: {
      type: Number,
      required: true
    }
  },
  students: {
    type: Map,
    of: {
      questionIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuestionText'
      }],
      seed: String
    },
    default: {}
  }
}, { timestamps: true });

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;