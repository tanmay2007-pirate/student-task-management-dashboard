# 🎓 StudyFlow - Student Task & Assignment Manager

A modern, responsive, and feature-packed **Student Task & Assignment Management System** built with vanilla **HTML5, CSS3, and modern JavaScript (ES6+)**.

Designed specifically for students to organize coursework, track homework and lab reports, meet assignment deadlines, and focus on study sessions with an integrated Pomodoro timer.

---

## 🌟 Key Features

### 1. Student Profile & Academic Context
* **Personalized Dashboard:** Displays Student Name, Roll/Student ID Number, Degree Program, and Semester.
* **Instant Profile Editing:** Click the student badge in the sidebar to update your credentials anytime.
* **Automatic Avatar Initial Generation:** Computes custom student avatar badge from your full name.

### 2. Comprehensive Task Management (CRUD)
* **Create, Read, Update, Delete (CRUD):** Seamless modal workflow to add or modify tasks.
* **Student-Centric Metadata:**
  * **Subject / Course Tagging:** (e.g. *Computer Science, Mathematics, Physics, Web Development*) with automatic pastel color coding.
  * **Academic Categories:** Assignment, Exam Preparation, Lab Work / Report, Project / Term Paper, Reading, Daily Homework.
  * **Priority Levels:** 🔥 Urgent, High, Medium, Low with color-coded warning chips.
  * **Due Date Tracking:** Smart relative badges (*Due Today, Due Tomorrow, Due in X days, Overdue by X days*).
  * **Estimated Study Time:** Log estimated hours required for each task.
  * **Notes & Guidelines:** Store professor instructions, links, or textbook pages.

### 3. Multiple Academic Views
* **📊 Dashboard & List View:** Full-featured task table with quick statistics, progress bar, real-time search, multi-factor filtering, and sorting.
* **📋 Kanban Workflow Board:** 3 visual columns (*To Do*, *In Progress*, *Completed*) featuring HTML5 native Drag-and-Drop and quick shift buttons.
* **⏱️ Pomodoro Study Timer:** Integrated focus timer with 25-minute Study, 5-minute Short Break, and 15-minute Long Break intervals, featuring an animated circular SVG ring and offline Web Audio chime sound.

### 4. Search, Filter & Sorting System
* **Live Search:** Instant filtering by task title, course name, or notes text.
* **Dropdown Filters:** Filter by Subject, Priority Level, or Status (*including an Overdue filter*).
* **Sorting Options:** Sort by Due Date (Earliest / Latest), Priority (Urgent → Low), Title (A-Z), and Date Added.
* **Subject Quick Access:** Dynamic sidebar list displaying active assignment count per subject.

### 5. Academic Progress Tracking
* **Progress Bar:** Real-time completion rate indicator (0% - 100%) with motivational study feedback.
* **Stat Counters:** Instant overview of Total Tasks, In Progress, Completed, and Overdue deadlines.

### 6. Data Persistence & Backup / Restore
* **LocalStorage Integration:** All tasks, profile info, and study stats are automatically saved in the browser.
* **Pre-Loaded Sample Data:** Automatically loads realistic sample tasks on first run so the project is immediately functional and interactive.
* **Backup to JSON:** Download your tasks and student profile as a `.json` backup file.
* **Restore from JSON:** Upload any backup `.json` file to restore your tasks across devices.
* **Dark / Light Mode:** Built-in modern theme switcher with full CSS custom property variables.

---

## 💻 JavaScript Concepts Demonstrated

This project is structured as an exemplary JavaScript mini-project for college evaluations, showcasing:

1. **Object-Oriented Architecture (ES6 Classes):**
   * Encapsulated `TaskManagerApp` class with modular separation of state, controllers, and view rendering.
2. **Local Storage Management:**
   * JSON serialization/deserialization with robust error handling (`Storage` helper).
3. **DOM Manipulation & Event Delegation:**
   * Dynamic template generation using ES6 template literals.
   * Efficient click, input, and submit listeners with bubbling and delegation.
4. **HTML5 Drag and Drop API:**
   * Custom `dragstart`, `dragover`, `dragleave`, and `drop` event listeners powering the Kanban board.
5. **Array Higher-Order Functions:**
   * Extensive use of `.filter()`, `.map()`, `.sort()`, `.reduce()`, and `.findIndex()`.
6. **Web Audio API Synthesizer:**
   * Synthesized harmonic chime upon task completion or timer finish — requires zero external audio files and works 100% offline.
7. **Form Validation & Accessibility:**
   * Custom validation states and keyboard accessibility (e.g. `Escape` key handlers).
8. **Asynchronous Timers (`setInterval` / `clearInterval`):**
   * Accurate countdown timer math with circular SVG stroke offset animations.

---

## 📁 File Structure

```
SIP project/
│
├── index.html        # Semantic HTML5 layout with sidebar, modals, views & controls
├── style.css         # Modern responsive CSS3 with CSS variables & Dark Mode
├── app.js            # Clean, modular, well-commented ES6+ JavaScript application logic
└── README.md         # Documentation & project guide
```

---

## 🚀 How to Run the Project

No web server, Node.js, or external installation is required!

1. Open the project folder: `c:\vs code files\SIP project`
2. Double click **`index.html`** or right-click and choose **"Open with Chrome / Edge / Firefox"**.
3. That's it! The task manager is completely functional offline.

---

## 💡 Keyboard Shortcuts & Pro-Tips
* Press **Escape** (`Esc`) at any time to close any open modal dialog.
* Click the **Student Profile card** in the top-left sidebar to edit your name, roll number, and degree.
* Use the **Pomodoro Timer** tab and select an assignment from the dropdown to automatically track study time against that specific task.
* Click the **Backup** button in the sidebar before clearing browser cookies to keep your coursework safe.

