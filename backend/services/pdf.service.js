const PDFDocument = require('pdfkit');

/**
 * Service for generating PDF documents for assignments
 */
const pdfService = {
  /**
   * Generate a PDF document for a student's assignment
   * @param {Object} assignment - The assignment object
   * @param {Object} course - The course object
   * @param {Object} student - The student object
   * @param {Array} questions - Array of question objects for this student
   * @returns {Promise<Buffer>} - PDF document as buffer
   */
  generateAssignmentPDF: async (assignment, course, student, questions) => {
    return new Promise((resolve, reject) => {
      try {
        // Create a new PDF document
        const doc = new PDFDocument({ margin: 50 });
        
        // Collect PDF data in a buffer
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Add header
        doc.fontSize(20).text('Assignment', { align: 'center' });
        doc.moveDown();

        // Add assignment details
        doc.fontSize(16).text(assignment.name, { align: 'center' });
        doc.moveDown();

        // Add course and student info
        doc.fontSize(12);
        doc.text(`Course: ${course.courseName}`);
        doc.text(`Due Date: ${new Date(assignment.dueDate).toLocaleDateString()}`);
        doc.text(`Total Marks: ${assignment.totalMarks}`);
        doc.moveDown();

        doc.text(`Student Name: ${student.name}`);
        doc.text(`Roll Number: ${student.rollNumber}`);
        doc.moveDown();

        // Add questions
        doc.fontSize(14).text('Questions', { underline: true });
        doc.moveDown();

        let totalMarks = 0;

        questions.forEach((question, index) => {
          // Question number and marks
          doc.fontSize(12).text(`Question ${index + 1} (${question.difficulty} - ${question.marks} marks)`, { underline: true });
          doc.moveDown(0.5);

          // Description
          doc.fontSize(11).text(question.description);
          doc.moveDown(0.5);

          // Input format
          doc.fontSize(10).text('Input Format:', { bold: true });
          doc.fontSize(10).text(question.inputFormat);
          doc.moveDown(0.5);

          // Output format
          doc.fontSize(10).text('Output Format:', { bold: true });
          doc.fontSize(10).text(question.outputFormat);
          doc.moveDown(0.5);

          // Constraints
          doc.fontSize(10).text('Constraints:', { bold: true });
          doc.fontSize(10).text(question.constraints);
          doc.moveDown(0.5);

          // Sample inputs and outputs
          doc.fontSize(10).text('Sample Test Cases:', { bold: true });
          for (let i = 0; i < question.sampleInputs.length; i++) {
            doc.fontSize(10).text(`Sample Input ${i + 1}:`, { italic: true });
            doc.fontSize(9).text(question.sampleInputs[i]);
            doc.fontSize(10).text(`Sample Output ${i + 1}:`, { italic: true });
            doc.fontSize(9).text(question.sampleOutputs[i]);
            doc.moveDown(0.5);
          }

          totalMarks += question.marks;
          doc.moveDown();

          // Add a page break after each question except the last one
          if (index < questions.length - 1) {
            doc.addPage();
          }
        });

        // Add footer with total marks
        doc.fontSize(12).text(`Total Marks: ${totalMarks}`, { align: 'right' });

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
};

module.exports = pdfService;