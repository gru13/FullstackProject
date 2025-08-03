const express = require("express");
const QuestionText = require("../models/QuestionText");
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const { auth, isFaculty } = require("../middleware/auth");
const pdfService = require("../services/pdf.service");
const emailService = require("../services/email.service");
const randomizer = require("../services/randomizer.service");

const router = express.Router();

// Apply auth and isFaculty middleware to all routes
router.use(auth, isFaculty);

// Get faculty's courses
router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find({ teacherId: req.user._id }).populate(
      "students",
      "rollNumber name email"
    );
    res.json(courses);
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single course by ID for faculty
router.get("/courses/:id", async (req, res) => {
  try {
    const courseId = req.params.id;
    // Only allow access if the course belongs to the logged-in faculty
    const course = await Course.findOne({
      _id: courseId,
      teacherId: req.user._id,
    }).populate("students", "rollNumber name email");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    console.error("Get course by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new question
router.post("/questions", async (req, res) => {
  try {
    const {
      questionName,
      topic,
      difficulty,
      marks,
      source,
      description,
      inputFormat,
      outputFormat,
      constraints,
      sampleInputs,
      sampleOutputs,
    } = req.body;

    // Validate input
    if (
      !questionName ||
      !topic ||
      !difficulty ||
      !marks ||
      !description ||
      !inputFormat ||
      !outputFormat ||
      !constraints
    ) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    if (
      !sampleInputs ||
      !sampleOutputs ||
      !Array.isArray(sampleInputs) ||
      !Array.isArray(sampleOutputs) ||
      sampleInputs.length !== sampleOutputs.length
    ) {
      return res
        .status(400)
        .json({
          message: "Sample inputs and outputs must be arrays of equal length",
        });
    }

    // Create new question
    const question = new QuestionText({
      teacherId: req.user._id,
      questionName,
      topic,
      difficulty,
      marks,
      source: source || "",
      description,
      inputFormat,
      outputFormat,
      constraints,
      sampleInputs,
      sampleOutputs,
    });

    await question.save();

    res.status(201).json(question);
  } catch (error) {
    console.error("Create question error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get faculty's questions
router.get("/questions", async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = { teacherId: req.user._id };

    // If courseId is provided, we could filter by course in the future
    // Currently, questions are only associated with teachers, not courses

    const questions = await QuestionText.find(query);
    res.json(questions);
  } catch (error) {
    console.error("Get questions error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a question
router.put("/questions/:id", async (req, res) => {
  try {
    const questionId = req.params.id;
    const {
      questionName,
      topic,
      difficulty,
      marks,
      source,
      description,
      inputFormat,
      outputFormat,
      constraints,
      sampleInputs,
      sampleOutputs,
    } = req.body;

    // Find question and check ownership
    const question = await QuestionText.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.teacherId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this question" });
    }
    console.log(req.body);

    // Update question fields
    if (questionName !== undefined) question.questionName = questionName;
    if (topic) question.topic = topic;
    if (difficulty) question.difficulty = difficulty;
    if (marks) question.marks = marks;
    if (source !== undefined) question.source = source;
    if (description) question.description = description;
    if (inputFormat) question.inputFormat = inputFormat;
    if (outputFormat) question.outputFormat = outputFormat;
    if (constraints) question.constraints = constraints;
    if (sampleInputs && Array.isArray(sampleInputs))
      question.sampleInputs = sampleInputs;
    if (sampleOutputs && Array.isArray(sampleOutputs))
      question.sampleOutputs = sampleOutputs;

    await question.save();

    res.json(question);
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a question
router.delete("/questions/:id", async (req, res) => {
  try {
    const questionId = req.params.id;

    // Find question and check ownership
    const question = await QuestionText.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.teacherId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this question" });
    }

    await QuestionText.findByIdAndDelete(questionId);

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new assignment
router.post("/assignments", async (req, res) => {
  try {
    const {
      name,
      description,
      dueDate,
      courseId,
      totalMarks,
      difficultyDistribution,
    } = req.body;

    // Validate input
    if (
      !name ||
      !description ||
      !dueDate ||
      !courseId ||
      !totalMarks ||
      !difficultyDistribution
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if course exists and faculty is assigned to it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.teacherId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          message: "Not authorized to create assignment for this course",
        });
    }

    // Create new assignment
    const assignment = new Assignment({
      name,
      description,
      dueDate,
      courseId,
      totalMarks,
      difficultyDistribution,
      students: {},
    });

    // For each student in the course, select questions and assign
    if (course.students && course.students.length > 0) {
      for (const studentId of course.students) {
        try {
          const questions = await randomizer.selectQuestionsForStudent(
            req.user._id,
            studentId,
            difficultyDistribution
          );
          assignment.students.set(studentId.toString(), {
            questionIds: questions.map((q) => q._id),
            seed: `${Date.now()}-${studentId}`,
          });
        } catch (err) {
          console.error(`Error selecting questions for student ${studentId}:`, err);
        }
      }
    }

    await assignment.save();

    // Add assignment to course
    course.assignments.push(assignment._id);
    await course.save();

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Create assignment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get faculty's assignments
router.get("/assignments", async (req, res) => {
  try {
    // Find courses taught by this faculty
    const courses = await Course.find({ teacherId: req.user._id });
    const courseIds = courses.map((course) => course._id);

    // Find assignments for these courses
    const assignments = await Assignment.find({
      courseId: { $in: courseIds },
    }).populate("courseId", "courseName");

    res.json(assignments);
  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get assignment details by ID for faculty
router.get("/assignments/:id", async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.json(assignment);
  } catch (error) {
    console.error("Get assignment by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Generate and preview assignment PDF for a student
router.get("/assignments/:id/preview", async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if faculty is authorized for this assignment
    const course = await Course.findById(assignment.courseId);
    if (!course || course.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to access this assignment" });
    }

    // Check if student is enrolled in the course
    if (!course.students.includes(studentId)) {
      return res.status(400).json({ message: "Student not enrolled in this course" });
    }

    // Generate questions for student if not already generated
    if (!assignment.students.get(studentId)) {
      // Use randomizer service to select questions
      const questions = await randomizer.selectQuestionsForStudent(
        req.user._id,
        studentId,
        assignment.difficultyDistribution
      );

      // Save selected questions to assignment
      assignment.students.set(studentId, {
        questionIds: questions.map((q) => q._id),
        seed: `${Date.now()}-${studentId}`,
      });

      await assignment.save();
    }

    // Get student's questions
    const studentAssignment = assignment.students.get(studentId);
    if (!studentAssignment || !studentAssignment.questionIds) {
      return res.status(400).json({ message: "No questions assigned to this student." });
    }
    const questions = await QuestionText.find({
      _id: { $in: studentAssignment.questionIds },
    });

    // Get student details
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Generate PDF
    let pdfBuffer;
    try {
      pdfBuffer = await pdfService.generateAssignmentPDF(
        assignment,
        course,
        student,
        questions
      );
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      return res.status(500).json({ message: "PDF generation failed", error: pdfError.message });
    }

    // Send PDF as response
    res.contentType("application/pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Preview assignment error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Email assignments to all students
router.post("/assignments/:id/email", async (req, res) => {
  try {
    const assignmentId = req.params.id;

    // Find assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if faculty is authorized for this assignment
    const course = await Course.findById(assignment.courseId);
    if (!course || course.teacherId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this assignment" });
    }

    // Get all students in the course
    const students = await Student.find({ _id: { $in: course.students } });

    // For each student, generate questions if not already generated
    for (const student of students) {
      if (!assignment.students.get(student._id.toString())) {
        // Use randomizer service to select questions
        const questions = await randomizer.selectQuestionsForStudent(
          req.user._id,
          student._id,
          assignment.difficultyDistribution
        );

        // Save selected questions to assignment
        assignment.students.set(student._id.toString(), {
          questionIds: questions.map((q) => q._id),
          seed: `${Date.now()}-${student._id}`,
        });
      }
    }

    await assignment.save();

    // For each student, generate PDF and send email
    const emailResults = [];
    for (const student of students) {
      try {
        // Get student's questions
        const studentAssignment = assignment.students.get(
          student._id.toString()
        );
        const questions = await QuestionText.find({
          _id: { $in: studentAssignment.questionIds },
        });

        // Generate PDF
        const pdfBuffer = await pdfService.generateAssignmentPDF(
          assignment,
          course,
          student,
          questions
        );

        // Send email with PDF attachment
        await emailService.sendAssignmentEmail(
          student.email,
          student.name,
          assignment.name,
          course.courseName,
          assignment.dueDate,
          pdfBuffer,
          req.user
        );

        emailResults.push({
          student: student.name,
          email: student.email,
          status: "success",
        });
      } catch (error) {
        console.error(`Error sending email to ${student.email}:`, error);
        emailResults.push({
          student: student.name,
          email: student.email,
          status: "failed",
          error: error.message,
        });
      }
    }

    res.json({
      message: "Assignment emails sent",
      results: emailResults,
    });
  } catch (error) {
    console.error("Email assignment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
