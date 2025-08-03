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
        doc.fontSize(22).fillColor('#1a202c').text('Assignment', { align: 'center', underline: true });
        doc.moveDown(0.5);
        doc.fontSize(16).fillColor('#2b6cb0').text(assignment.name, { align: 'center', underline: false });
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1);

        // Assignment topic and description
        doc.fontSize(13).fillColor('black').text(`Topic: `, { continued: true }).font('Helvetica-Bold').text(assignment.topic || 'N/A', { continued: false });
        doc.font('Helvetica').fontSize(13).text(`Description: `, { continued: true }).font('Helvetica-Bold').text(assignment.description || 'No description provided', { continued: false });
        doc.moveDown(1);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1);

        // Add course and student info
        doc.font('Helvetica').fontSize(12).fillColor('black');
        doc.text(`Course: `, { continued: true }).font('Helvetica-Bold').text(course.courseName, { continued: false });
        doc.font('Helvetica').text(`Due Date: `, { continued: true }).font('Helvetica-Bold').text(new Date(assignment.dueDate).toLocaleDateString(), { continued: false });
        doc.font('Helvetica').text(`Total Marks: `, { continued: true }).font('Helvetica-Bold').text(assignment.totalMarks, { continued: false });
        doc.moveDown(0.5);
        doc.font('Helvetica').text(`Student Name: `, { continued: true }).font('Helvetica-Bold').text(student.name, { continued: false });
        doc.font('Helvetica').text(`Roll Number: `, { continued: true }).font('Helvetica-Bold').text(student.rollNumber, { continued: false });
        doc.moveDown(1);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(1);

        // Add questions
        doc.fontSize(15).fillColor('#2b6cb0').text('Questions', { underline: true });
        doc.moveDown(0.5);

        let totalMarks = 0;

        questions.forEach((question, index) => {
          // Question header
          doc.fontSize(13).fillColor('#1a202c').font('Helvetica-Bold').text(`Question ${index + 1}:`, { underline: true });
          doc.fontSize(12).fillColor('black').font('Helvetica').text(`Difficulty: `, { continued: true }).font('Helvetica-Bold').text(question.difficulty, { continued: true }).font('Helvetica').text(`   Marks: `, { continued: true }).font('Helvetica-Bold').text(question.marks, { continued: false });
          doc.moveDown(0.5);

          // Description
          doc.fontSize(11).font('Helvetica').text('Description:', { bold: true });
          doc.fontSize(11).font('Helvetica-Bold').text(question.description);
          doc.moveDown(0.5);

          // Input format
          doc.fontSize(10).font('Helvetica').text('Input Format:', { bold: true });
          doc.fontSize(10).font('Helvetica-Bold').text(question.inputFormat);
          doc.moveDown(0.5);

          // Output format
          doc.fontSize(10).font('Helvetica').text('Output Format:', { bold: true });
          doc.fontSize(10).font('Helvetica-Bold').text(question.outputFormat);
          doc.moveDown(0.5);

          // Constraints
          doc.fontSize(10).font('Helvetica').text('Constraints:', { bold: true });
          doc.fontSize(10).font('Helvetica-Bold').text(question.constraints);
          doc.moveDown(0.5);

          // Sample inputs and outputs
          doc.fontSize(10).font('Helvetica').text('Sample Test Cases:', { bold: true });
          for (let i = 0; i < question.sampleInputs.length; i++) {
            doc.fontSize(10).font('Helvetica').text(`Sample Input ${i + 1}:`, { italic: true });
            doc.fontSize(9).font('Helvetica-Bold').text(question.sampleInputs[i]);
            doc.fontSize(10).font('Helvetica').text(`Sample Output ${i + 1}:`, { italic: true });
            doc.fontSize(9).font('Helvetica-Bold').text(question.sampleOutputs[i]);
            doc.moveDown(0.5);
          }

          totalMarks += question.marks;
          doc.moveDown(1);

          // Add a line after each question except the last one
          if (index < questions.length - 1) {
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.addPage();
          }
        });

        // Add footer with total marks
        doc.moveDown(1);
        doc.fontSize(12).fillColor('#2b6cb0').font('Helvetica-Bold').text(`Total Marks: ${totalMarks}`, { align: 'right' });

        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
};

module.exports = pdfService;