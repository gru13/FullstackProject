const express = require('express');
const User = require('../models/User');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply auth and isAdmin middleware to all routes
router.use(auth, isAdmin);

// Create a new faculty user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with faculty role
    const user = new User({
      name,
      email,
      password,
      phone,
      role: 'faculty'
    });

    await user.save();

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all faculty users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'faculty' }).select('-password -appPassword');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a faculty user
router.put('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is faculty
    if (user.role !== 'faculty') {
      return res.status(400).json({ message: 'Can only update faculty users' });
    }

    // Check if email is already in use by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    // Update user
    user.name = name;
    user.email = email;
    user.phone = phone;
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a faculty user
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is faculty
    if (user.role !== 'faculty') {
      return res.status(400).json({ message: 'Can only delete faculty users' });
    }
    
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'Faculty user deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new student
router.post('/students', async (req, res) => {
  try {
    const { rollNumber, name, email } = req.body;

    // Validate input
    if (!rollNumber || !name || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ $or: [{ rollNumber }, { email }] });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    // Create new student
    const student = new Student({
      rollNumber,
      name,
      email
    });

    await student.save();

    res.status(201).json(student);
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a student
router.put('/students/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const { rollNumber, name, email } = req.body;

    // Validate input
    if (!rollNumber || !name || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if rollNumber or email is already in use by another student
    const existingStudent = await Student.findOne({
      $or: [{ rollNumber }, { email }],
      _id: { $ne: studentId }
    });
    if (existingStudent) {
      return res.status(400).json({ message: 'Roll number or email is already in use' });
    }

    // Update student
    student.rollNumber = rollNumber;
    student.name = name;
    student.email = email;
    await student.save();

    res.json(student);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a student
router.delete('/students/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await Student.findByIdAndDelete(studentId);
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new course
router.post('/courses', async (req, res) => {
  try {
    const { courseName, teacherId } = req.body;

    // Validate input
    if (!courseName || !teacherId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if teacher exists and is faculty
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'faculty') {
      return res.status(400).json({ message: 'Invalid teacher ID' });
    }

    // Create new course
    const course = new Course({
      courseName,
      teacherId,
      students: [],
      assignments: []
    });

    await course.save();

    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all courses
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('teacherId', 'name email')
      .populate('students', 'rollNumber name email');
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get course by ID
router.get('/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId)
      .populate('teacherId', 'name email')
      .populate('students', 'rollNumber name email');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a course
router.put('/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const { courseName } = req.body;

    // Validate input
    if (!courseName) {
      return res.status(400).json({ message: 'Course name is required' });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Update course
    course.courseName = courseName;
    await course.save();

    res.json(course);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a course
router.delete('/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    await Course.findByIdAndDelete(courseId);
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign faculty to course
router.put('/courses/:id/assign-faculty', async (req, res) => {
  try {
    const { teacherId } = req.body;
    const courseId = req.params.id;

    // Validate input
    if (!teacherId) {
      return res.status(400).json({ message: 'Teacher ID is required' });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if teacher exists and is faculty
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'faculty') {
      return res.status(400).json({ message: 'Invalid teacher ID' });
    }

    // Update course
    course.teacherId = teacherId;
    await course.save();

    res.json(course);
  } catch (error) {
    console.error('Assign faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign students to course
router.put('/courses/:id/assign-students', async (req, res) => {
  try {
    const { studentIds } = req.body;
    const courseId = req.params.id;

    // Validate input
    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ message: 'Student IDs array is required' });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if all students exist
    const students = await Student.find({ _id: { $in: studentIds } });
    if (students.length !== studentIds.length) {
      return res.status(400).json({ message: 'One or more student IDs are invalid' });
    }

    // Update course
    course.students = studentIds;
    await course.save();

    res.json(course);
  } catch (error) {
    console.error('Assign students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all assignments (admin can view all)
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('courseId', 'courseName teacherId')
      .populate({
        path: 'courseId',
        populate: {
          path: 'teacherId',
          select: 'name email'
        }
      });
    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;