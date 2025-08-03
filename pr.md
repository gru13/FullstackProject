## Intelligent Assignment Distribution System: Project Overview

This project outlines a full-stack application designed to streamline the creation, distribution, and management of personalized assignments for educational institutions. The system comprises a **React frontend** with distinct **Admin** and **Faculty panels**, and a **Node.js/Express backend** powered by **MongoDB Atlas**. Key functionalities include robust user management, course administration, question banking, personalized assignment generation (including PDF creation), and automated email distribution.
Use only JavaScript and no TypeScript

---

## Technical Stack

### Frontend

* **Framework:** React
* **UI Library:** Tailwind CSS
* **Routing:** React Router
* **State Management:** `useState` and `useEffect` (for simplicity, no complex global state management like Redux is required)
* **User Roles UI:** Separate views and navigation for Admin and Faculty.

### Backend

* **Language:** JavaScript (Node.js)
* **Framework:** Express
* **Database:** MongoDB Atlas
* **ODM:** Mongoose
* **PDF Generator:** `pdfkit` (preferred for its simplicity and direct PDF generation capabilities)
* **Email Service:** `nodemailer`

---

## Core Modules & Functionality

### Admin Controller

Manages the foundational data of the system.

* **User Management (Faculty):** Create, update, and delete user records where role is `faculty`.
* **Student Management:** Create, update, and delete student records. Student identification uses `rollNumber` (string).
* **Course Management:** Create, update, and delete courses.
* **User Assignment:** Assign users (faculty) to courses and enroll students in courses.

### Faculty Controller

Focuses on the creation and management of academic content.

* **Question Management:** Create, read, update, and delete questions. Questions are associated with the user who created them (role: faculty).
* **Assignment Management:** Create, read, update, and delete assignments for their assigned courses.
* **Assignment Generation:** Triggers the personalized PDF generation and email distribution.

### PDF Service

Responsible for generating individualized assignment PDFs.

* Creates a PDF document for each student assigned to a particular assignment.
* The PDF includes the assignment title, course name, due date, student name, roll number, and the full text of the personalized questions with sample inputs and outputs.

### Email Service

Handles the automated distribution of assignments.

* Utilizes the `nodemailer` library to send emails.
* use user auth to send email
* Sends emails to students with their personalized assignment PDFs attached.
* The email subject and body are templated for consistency.

### Randomizer

Ensures fair and unique assignment distribution.

* Uses a combination of timestamp and student ID as a seed for randomizing question selection.
* Filters the question pool based on topic and difficulty.
* Selects questions according to the specified difficulty distribution (easy, medium, hard) for each student.

---

## User Roles & Permissions

The system implements a robust role-based access control (RBAC) system to ensure data security and prevent unauthorized actions.

### Admin Permissions

| Feature                         | Admin Access | Notes                                       |
| :------------------------------ | :----------- | :------------------------------------------ |
| Create User (Faculty)           | `true`       |                                             |
| Create Student (in DB)          | `true`       | Student identifier is `rollNumber` (string) |
| Create Course                   | `true`       |                                             |
| Assign Faculty to Course        | `true`       |                                             |
| Assign Students to Course       | `true`       |                                             |
| View Users / Students / Courses | `true`       |                                             |
| Create Question                 | `false`      |                                             |
| Read/View Questions             | `false`      |                                             |
| Update Question                 | `false`      |                                             |
| Delete Question                 | `false`      |                                             |
| Create Assignment               | `false`      |                                             |
| Read/View Assignment            | `true`       | Can view all assignments.                   |
| Update Assignment               | `false`      |                                             |
| Delete Assignment               | `false`      |                                             |

### Faculty Permissions

| Feature                         | Faculty Access | Notes                                              |
| :------------------------------ | :------------- | :------------------------------------------------- |
| Create User (Faculty)           | `false`        |                                                    |
| Create Student (in DB)          | `false`        |                                                    |
| Create Course                   | `false`        |                                                    |
| Assign Faculty to Course        | `false`        |                                                    |
| Assign Students to Course       | `false`        |                                                    |
| View Users / Students / Courses | `true`         | Can only view their own courses.                   |
| Create Question                 | `true`         | Can only create their own questions.               |
| Read/View Questions             | `true`         | Can only read their own questions.                 |
| Update Question                 | `true`         | Can only update their own questions.               |
| Delete Question                 | `true`         | Can only delete their own questions.               |
| Create Assignment               | `true`         | Can only create assignments for their own courses. |
| Read/View Assignment            | `true`         | Can only view their own assignments.               |
| Update Assignment               | `true`         | Can only update their own assignments.             |
| Delete Assignment               | `true`         | Can only delete their own assignments.             |

### Student Permissions

* **Receives email only:** Students have no login or direct UI access to the system. They interact solely through the personalized assignment PDFs sent via email.

---

## Database Schema (MongoDB Collections)

The application will leverage the following MongoDB collections:

* **`users`**: Stores user authentication and role information.

  ```
  _id: ObjectId
  name: string
  email: string
  role: 'admin' | 'faculty'
  password: string
  appPassword: string # SECURITY NOTE: Storing app passwords directly is not recommended. Use environment variables.
  ```

* **`students`**: Contains details about registered students.

  ```
  _id: ObjectId
  rollNumber: string
  name: string
  email: string
  ```

* **`courses`**: Manages course information and associations.

  ```
  _id: ObjectId
  courseName: string
  teacherId: ObjectId (refers to users collection where role is 'faculty')
  students: [ObjectId] (array of student _id's)
  assignments: [ObjectId] (array of assignment _id's)
  ```

* **`questionTexts`**: Stores the details of each question.

  ```
  _id: ObjectId
  teacherId: ObjectId (refers to users collection where role is 'faculty')
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  marks: number
  source: string
  description: string
  inputFormat: string
  outputFormat: string
  constraints: string
  sampleInputs: [string]
  sampleOutputs: [string]
  ```

* **`solutionTexts`**: (Optional, if solutions are to be stored separately for internal use)

  ```
  questionId: ObjectId (refers to questionTexts collection)
  answerCode: string
  explanation: string
  ```

* **`assignments`**: Stores assignment details and student-specific question sets.

  ```
  _id: ObjectId
  name: string
  description: string
  dueDate: ISODate
  courseId: ObjectId (refers to courses collection)
  totalMarks: number
  difficultyDistribution: {
      easy: number
      medium: number
      hard: number
  }
  students: {
      <studentId>: {
          questionIds: [ObjectId] # Array of question _id's for this specific student
          seed: string # Seed used for randomizing this student's assignment
      }
  }
  ```

---

## API Routes

The backend will expose a set of RESTful API endpoints.

### Admin APIs

* `POST /admin/users`: Create a new user with faculty role.
* `POST /admin/students`: Create a new student.
* `POST /admin/courses`: Create a new course.
* `PUT /admin/courses/:id/assign-faculty`: Assign a faculty member to a specific course.
* `PUT /admin/courses/:id/assign-students`: Assign students to a specific course.
* `GET /admin/users` (for viewing faculty/students)
* `GET /admin/courses`
* `GET /admin/assignments`

### Faculty APIs

* `POST /faculty/questions`: Create a new question.
* `GET /faculty/questions?courseId=`: Retrieve questions for a specific course (or all questions by the faculty).
* `PUT /faculty/questions/:id`: Update an existing question.
* `DELETE /faculty/questions/:id`: Delete a question.
* `POST /faculty/assignments`: Create a new assignment.
* `GET /faculty/assignments/:id/preview`: Generate and preview an assignment PDF for a selected student.
* `POST /faculty/assignments/:id/email`: Trigger the email distribution of personalized assignments for a given assignment.
* `GET /faculty/courses`
* `GET /faculty/assignments`

---


## UI Details

The frontend will be a single-page application built with React, featuring separate panels for the Admin and Faculty roles. The design will be clean and intuitive, leveraging Tailwind CSS for a responsive and consistent user experience across all devices.

### 1\. Admin Panel UI

The Admin panel is designed for system-level management. The layout will feature a persistent sidebar for navigation and a main content area.

#### A. Dashboard

  * **Purpose:** Provide a high-level overview of the system's health.
  * **Design:** A grid of data cards, each with a clear title and a large number.
  * **Cards:**
      * **Total Faculty:** Count of all faculty members.
      * **Total Students:** Count of all registered students.
      * **Active Courses:** Count of all active courses in the system.
      * **Total Assignments:** Count of all assignments created.

#### B. Manage Faculty

  * **Purpose:** Create, view, update, and delete faculty members.
  * **Design:** A page with a prominent "Add New Faculty" button that opens a modal form. The main content is a table listing all faculty. The "Edit" button for an existing faculty member will open a pre-populated form, allowing all fields to be changed.
  * **Components:**
      * **Form (Modal):** Input fields for `name`, `email`, and a placeholder for the initial `password`.
      * **Table:** Displays faculty data with columns for `Name`, `Email`, and **Actions** (with "Edit" and "Delete" buttons).

#### C. Manage Students

  * **Purpose:** Manage student records.
  * **Design:** Similar to the Manage Faculty page, with a modal form for adding new students and a table for viewing existing ones. The "Edit" button for a student will open a pre-populated form, making all fields editable.
  * **Components:**
      * **Form (Modal):** Input fields for `rollNumber`, `name`, and `email`.
      * **Table:** Displays student data with columns for `Roll Number`, `Name`, `Email`, and **Actions**.

#### D. Manage Courses

  * **Purpose:** Manage courses and assign users to them.
  * **Design:** A page with a list of all courses. Each course entry will be a card or a row with an "Assign" button leading to the Course Details page. The course name itself will also be editable from a form.
  * **Components:**
      * **Course List:** A responsive list of cards, each showing the `courseName` and the assigned faculty member's name.

#### E. Course Details

  * **Purpose:** Assign faculty and students to a specific course.
  * **Design:** A page with two distinct sections: one for assigning a faculty and another for managing student enrollment.
  * **Components:**
      * **Assign Faculty:** A dropdown/select field populated with a list of available faculty members. A button to submit the assignment.
      * **Assign Students:** A search bar and a list of all students. The admin can check a box next to each student's name to enroll them. A final "Save" button updates the student roster for the course.

### 2\. Faculty Panel UI

The Faculty panel is tailored to a teacher's specific courses and tasks.

#### A. Dashboard

  * **Purpose:** Show an overview of the faculty member's assigned courses.
  * **Design:** A list of course cards.
  * **Components:**
      * **Course Cards:** Each card displays the `courseName`, the number of enrolled students, and a link or button to navigate to the Course Details page.

#### B. Manage Questions

  * **Purpose:** Create and manage questions for a specific course.
  * **Design:** A split-view page with a form on one side for creating/editing questions, and a table on the other side for viewing all questions for that course.
  * **Components:**
      * **Question Form:** A detailed form with fields for `topic`, `difficulty` (a dropdown with 'easy', 'medium', 'hard' options), `marks`, and multi-line text areas for `description`, `inputFormat`, `outputFormat`, and `constraints`. There will also be a feature to dynamically add multiple `sampleInputs` and `sampleOutputs` pairs.
      * **Question Table:** A list of questions with columns for `Topic`, `Difficulty`, `Marks`, and **Actions** (with "Edit" and "Delete" buttons).

#### C. Manage Assignments

  * **Purpose:** Create, view, and distribute assignments.
  * **Design:** A page with a form for creating new assignments and a list of existing assignments.
  * **Components:**
      * **Assignment Form:** A form with inputs for `name`, `description`, `dueDate` (using a date picker), `totalMarks`, and numerical inputs for the `difficultyDistribution` (easy, medium, hard).
      * **Assignment List:** A table or card-based view of assignments with columns for `Name`, `Due Date`, `Students Assigned`, and **Actions** (including a "View Details" button).

#### D. Assignment Details

  * **Purpose:** Preview and send out a specific assignment.
  * **Design:** A details page for a single assignment.
  * **Components:**
      * **Summary:** Displays the assignment `name`, `description`, `dueDate`, `totalMarks`, and the `difficultyDistribution`.
      * **Student List:** A list of all students assigned to this assignment.
      * **Action Buttons:**
          * **Preview Assignment:** A button that generates and displays a PDF preview for a selected student.
          * **Send Emails:** A button that, upon confirmation, triggers the backend process to send the personalized assignments. A loading indicator will be shown while the emails are being sent.

### General UI/UX Considerations

  * **Tailwind CSS:** The entire UI will be built using Tailwind's utility-first approach, ensuring a responsive, mobile-first design. This includes using flexbox and grid layouts, along with responsive prefixes (`sm:`, `md:`, `lg:`) to adapt layouts for different screen sizes.
  * **State Management:** React's `useState` and `useEffect` will manage component state, form data, and API call lifecycles.
  * **User Feedback:** The application will provide clear user feedback. This includes loading spinners during API calls, green toast notifications for success, and red error messages for failures.

-----

This comprehensive plan provides a solid foundation for developing your Intelligent Assignment Distribution System.

Do you have any specific areas you'd like to delve into more deeply, such as a particular API endpoint's implementation or a specific UI component's design?