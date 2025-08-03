const nodemailer = require('nodemailer');

/**
 * Service for sending emails
 */
const emailService = {
  /**
   * Send an assignment email to a student with PDF attachment
   * @param {string} studentEmail - Student's email address
   * @param {string} studentName - Student's name
   * @param {string} assignmentName - Assignment name
   * @param {string} courseName - Course name
   * @param {Date} dueDate - Assignment due date
   * @param {Buffer} pdfBuffer - PDF document as buffer
   * @param {Object} faculty - Faculty user object
   * @returns {Promise} - Result of email sending
   */
  sendAssignmentEmail: async (studentEmail, studentName, assignmentName, courseName, dueDate, pdfBuffer, faculty) => {
    // Create a transporter using faculty's email credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: faculty.email,
        pass: faculty.appPassword // App password for Gmail
      }
    });

    // Format due date
    const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Email options
    const mailOptions = {
      from: faculty.email,
      to: studentEmail,
      subject: `${courseName}: ${assignmentName}`,
      text: `Dear ${studentName},

Please find attached your personalized assignment for ${courseName}.

Assignment: ${assignmentName}
Due Date: ${formattedDueDate}

Please submit your completed assignment by the due date.

Best regards,
${faculty.name}`,
      html: `
        <p>Dear ${studentName},</p>
        <p>Please find attached your personalized assignment for <strong>${courseName}</strong>.</p>
        <p>
          <strong>Assignment:</strong> ${assignmentName}<br>
          <strong>Due Date:</strong> ${formattedDueDate}
        </p>
        <p>Please submit your completed assignment by the due date.</p>
        <p>
          Best regards,<br>
          ${faculty.name}
        </p>
      `,
      attachments: [
        {
          filename: `${courseName}_${assignmentName}_${studentName}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Send email
    return transporter.sendMail(mailOptions);
  }
};

module.exports = emailService;