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
  topic: {
    type: String,
    required: true,
    trim: true
  },
  easyCount: {
    type: Number,
    required: true
  },
  mediumCount: {
    type: Number,
    required: true
  },
  hardCount: {
    type: Number,
    required: true
  },
  students: {
    type: Map,
    of: {
      questionIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuestionText'
        // questionName will be available via population if needed
      }],
      seed: String
    },
    default: {}
  }
}, { timestamps: true });

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;