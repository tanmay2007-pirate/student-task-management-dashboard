/**
 * ============================================================================
 * STUDYFLOW - STUDENT TASK & ASSIGNMENT MANAGEMENT SYSTEM
 * Mini Project for JavaScript / Web Development
 * Clean, Modular, Object-Oriented ES6+ Architecture
 * ============================================================================
 */

'use strict';

// ============================================================================
// 1. STORAGE MODULE (Handles LocalStorage persistence & backup/restore)
// ============================================================================
const Storage = {
  KEYS: {
    TASKS: 'studyflow_tasks',
    PROFILE: 'studyflow_profile',
    THEME: 'studyflow_theme',
    POMO_STATS: 'studyflow_pomo_stats'
  },

  getTasks() {
    try {
      const data = localStorage.getItem(this.KEYS.TASKS);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading tasks from LocalStorage:', e);
      return null;
    }
  },

  saveTasks(tasks) {
    try {
      localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks to LocalStorage:', e);
    }
  },

  getProfile() {
    try {
      const data = localStorage.getItem(this.KEYS.PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveProfile(profile) {
    try {
      localStorage.setItem(this.KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving profile:', e);
    }
  },

  getTheme() {
    return localStorage.getItem(this.KEYS.THEME) || 'light';
  },

  saveTheme(theme) {
    localStorage.setItem(this.KEYS.THEME, theme);
  },

  getPomoStats() {
    try {
      const data = localStorage.getItem(this.KEYS.POMO_STATS);
      return data ? JSON.parse(data) : { sessions: 0, totalMinutes: 0 };
    } catch (e) {
      return { sessions: 0, totalMinutes: 0 };
    }
  },

  savePomoStats(stats) {
    try {
      localStorage.setItem(this.KEYS.POMO_STATS, JSON.stringify(stats));
    } catch (e) {
      console.error('Error saving pomodoro stats:', e);
    }
  }
};

// ============================================================================
// 2. DEFAULT INITIAL DATA (Preloaded on first run)
// ============================================================================
const DEFAULT_PROFILE = {
  name: 'Alex Johnson',
  id: 'CS-2024-89',
  course: 'B.Tech - Computer Science',
  semester: '3rd Semester'
};

const getSampleTasks = () => {
  const today = new Date();
  const formatOffset = (days) => {
    const d = new Date();
    d.setDate(today.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'task_1',
      title: 'Data Structures Assignment 3: Binary Search Trees',
      subject: 'Computer Science',
      category: 'Assignment',
      priority: 'High',
      status: 'in-progress',
      dueDate: formatOffset(2),
      estHours: 3.5,
      notes: 'Implement AVL rotation methods and submit PDF on Google Classroom.',
      createdAt: Date.now() - 86400000 * 2
    },
    {
      id: 'task_2',
      title: 'Physics Lab Report - Optics & Laser Diffraction',
      subject: 'Physics',
      category: 'Lab Work',
      priority: 'Urgent',
      status: 'todo',
      dueDate: formatOffset(0), // Due today!
      estHours: 2.0,
      notes: 'Graph calculation values from Tuesday experiment with error analysis.',
      createdAt: Date.now() - 86400000
    },
    {
      id: 'task_3',
      title: 'Calculus Midterm Revision: Integration Techniques',
      subject: 'Mathematics',
      category: 'Exam Prep',
      priority: 'Urgent',
      status: 'todo',
      dueDate: formatOffset(3),
      estHours: 4.0,
      notes: 'Practice substitution by parts, partial fractions, and trigonometric integrals.',
      createdAt: Date.now() - 86400000 * 3
    },
    {
      id: 'task_4',
      title: 'Mini-Project Proposal & Wireframes Submission',
      subject: 'Web Development',
      category: 'Project',
      priority: 'Medium',
      status: 'completed',
      dueDate: formatOffset(-1), // Completed yesterday
      estHours: 5.0,
      notes: 'Submitted project documentation to Dr. Sharma.',
      createdAt: Date.now() - 86400000 * 5
    },
    {
      id: 'task_5',
      title: 'Read Database Systems Chapter 4: Relational Algebra',
      subject: 'Database Systems',
      category: 'Reading',
      priority: 'Low',
      status: 'todo',
      dueDate: formatOffset(5),
      estHours: 1.5,
      notes: 'Review selection, projection, cartesian product, and theta join queries.',
      createdAt: Date.now()
    }
  ];
};

// ============================================================================
// 3. AUDIO HELPER (Web Audio API Synthesizer - 100% Offline Chime)
// ============================================================================
const SoundEffects = {
  playChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(523.25, now, 0.25);       // C5
      playTone(659.25, now + 0.15, 0.25); // E5
      playTone(783.99, now + 0.3, 0.4);   // G5
    } catch (e) {
      // Audio autoplay may be constrained; silently ignore
    }
  }
};

// ============================================================================
// 4. MAIN APPLICATION CONTROLLER
// ============================================================================
class TaskManagerApp {
  constructor() {
    // Application State
    this.tasks = Storage.getTasks() || getSampleTasks();
    this.profile = Storage.getProfile() || DEFAULT_PROFILE;
    this.pomoStats = Storage.getPomoStats();
    this.currentView = 'dashboard';
    this.selectedSubjectFilter = 'ALL';

    // Filters & Sorting state
    this.filters = {
      search: '',
      subject: 'ALL',
      priority: 'ALL',
      status: 'ALL',
      sortBy: 'dueDateAsc'
    };

    // Pomodoro Timer State
    this.pomodoro = {
      durationSeconds: 25 * 60,
      remainingSeconds: 25 * 60,
      isRunning: false,
      intervalId: null,
      mode: 'study', // study, short-break, long-break
      totalRadiusCircumference: 2 * Math.PI * 90 // 565.48px
    };

    // Cache DOM Elements
    this.dom = {
      // Theme
      themeToggleBtn: document.getElementById('themeToggleBtn'),
      themeLabel: document.getElementById('themeLabel'),

      // Navigation & Layout
      navItems: document.querySelectorAll('.nav-item'),
      views: {
        dashboard: document.getElementById('dashboardView'),
        kanban: document.getElementById('kanbanView'),
        pomodoro: document.getElementById('pomodoroView')
      },
      pageTitle: document.getElementById('pageTitle'),
      currentDateStr: document.getElementById('currentDateStr'),
      sidebar: document.getElementById('sidebar'),
      mobileMenuBtn: document.getElementById('mobileMenuBtn'),

      // Student Profile
      studentCardBtn: document.getElementById('studentCardBtn'),
      sidebarAvatar: document.getElementById('sidebarAvatar'),
      sidebarStudentName: document.getElementById('sidebarStudentName'),
      sidebarStudentCourse: document.getElementById('sidebarStudentCourse'),
      sidebarStudentId: document.getElementById('sidebarStudentId'),
      profileModalBackdrop: document.getElementById('profileModalBackdrop'),
      profileForm: document.getElementById('profileForm'),
      closeProfileModalBtn: document.getElementById('closeProfileModalBtn'),
      cancelProfileModalBtn: document.getElementById('cancelProfileModalBtn'),

      // Task List & Controls
      openAddTaskModalBtn: document.getElementById('openAddTaskModalBtn'),
      emptyStateAddBtn: document.getElementById('emptyStateAddBtn'),
      taskModalBackdrop: document.getElementById('taskModalBackdrop'),
      taskForm: document.getElementById('taskForm'),
      modalTitle: document.getElementById('modalTitle'),
      closeTaskModalBtn: document.getElementById('closeTaskModalBtn'),
      cancelTaskModalBtn: document.getElementById('cancelTaskModalBtn'),
      taskListContainer: document.getElementById('taskListContainer'),
      emptyState: document.getElementById('emptyState'),
      emptyStateDesc: document.getElementById('emptyStateDesc'),
      taskCountHeader: document.getElementById('taskCountHeader'),
      filterSummaryText: document.getElementById('filterSummaryText'),
      clearCompletedBtn: document.getElementById('clearCompletedBtn'),

      // Form Inputs
      taskIdInput: document.getElementById('taskId'),
      taskTitleInput: document.getElementById('taskTitle'),
      taskSubjectInput: document.getElementById('taskSubject'),
      taskCategoryInput: document.getElementById('taskCategory'),
      taskPriorityInput: document.getElementById('taskPriority'),
      taskStatusSelect: document.getElementById('taskStatusSelect'),
      taskDueDateInput: document.getElementById('taskDueDate'),
      taskEstHoursInput: document.getElementById('taskEstHours'),
      taskNotesInput: document.getElementById('taskNotes'),

      // Filters
      searchInput: document.getElementById('searchInput'),
      clearSearchBtn: document.getElementById('clearSearchBtn'),
      filterSubject: document.getElementById('filterSubject'),
      filterPriority: document.getElementById('filterPriority'),
      filterStatus: document.getElementById('filterStatus'),
      sortBy: document.getElementById('sortBy'),
      resetFiltersBtn: document.getElementById('resetFiltersBtn'),
      sidebarSubjectList: document.getElementById('sidebarSubjectList'),

      // Overview Stats & Progress
      statTotalCount: document.getElementById('statTotalCount'),
      statPendingCount: document.getElementById('statPendingCount'),
      statCompletedCount: document.getElementById('statCompletedCount'),
      statOverdueCount: document.getElementById('statOverdueCount'),
      completionRateText: document.getElementById('completionRateText'),
      completionProgressBar: document.getElementById('completionProgressBar'),
      progressMotivationalText: document.getElementById('progressMotivationalText'),

      // Kanban Columns
      dropzoneTodo: document.getElementById('dropzoneTodo'),
      dropzoneInProgress: document.getElementById('dropzoneInProgress'),
      dropzoneCompleted: document.getElementById('dropzoneCompleted'),
      countColTodo: document.getElementById('countColTodo'),
      countColInProgress: document.getElementById('countColInProgress'),
      countColCompleted: document.getElementById('countColCompleted'),

      // Pomodoro Timer
      timerDisplay: document.getElementById('timerDisplay'),
      timerStatusText: document.getElementById('timerStatusText'),
      timerToggleBtn: document.getElementById('timerToggleBtn'),
      timerToggleText: document.getElementById('timerToggleText'),
      timerResetBtn: document.getElementById('timerResetBtn'),
      timerModeBtns: document.querySelectorAll('.timer-mode-btn'),
      timerProgressRing: document.getElementById('timerProgressRing'),
      pomodoroTaskSelect: document.getElementById('pomodoroTaskSelect'),
      pomoSessionsCount: document.getElementById('pomoSessionsCount'),
      pomoTotalMinutes: document.getElementById('pomoTotalMinutes'),

      // Backup / Restore
      exportDataBtn: document.getElementById('exportDataBtn'),
      importFileInput: document.getElementById('importFileInput'),

      // Toast Notifications
      toastContainer: document.getElementById('toastContainer')
    };

    // Save initial state to storage if clean install
    Storage.saveTasks(this.tasks);
    Storage.saveProfile(this.profile);

    this.init();
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================
  init() {
    this.initTheme();
    this.initDateDisplay();
    this.renderProfile();
    this.renderSubjectOptions();
    this.renderPomodoroStats();
    this.updatePomodoroTaskDropdown();
    this.bindEvents();
    this.render();
  }

  initTheme() {
    const savedTheme = Storage.getTheme();
    document.body.setAttribute('data-theme', savedTheme);
    this.dom.themeLabel.textContent = savedTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }

  toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    Storage.saveTheme(newTheme);
    this.dom.themeLabel.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    this.showToast(`Switched to ${newTheme} mode`, 'info');
  }

  initDateDisplay() {
    const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
    const dateFormatted = new Date().toLocaleDateString('en-US', options);
    this.dom.currentDateStr.textContent = `Today is ${dateFormatted}`;
  }

  // ==========================================================================
  // EVENT BINDINGS
  // ==========================================================================
  bindEvents() {
    // Theme Switcher
    this.dom.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

    // Navigation Switcher
    this.dom.navItems.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = btn.getAttribute('data-view');
        this.switchView(targetView);
      });
    });

    // Mobile Hamburger
    this.dom.mobileMenuBtn.addEventListener('click', () => {
      this.dom.sidebar.classList.toggle('mobile-open');
    });

    // Close mobile menu on click outside
    document.addEventListener('click', (e) => {
      if (this.dom.sidebar.classList.contains('mobile-open') &&
          !this.dom.sidebar.contains(e.target) &&
          !this.dom.mobileMenuBtn.contains(e.target)) {
        this.dom.sidebar.classList.remove('mobile-open');
      }
    });

    // Task Modal open/close
    this.dom.openAddTaskModalBtn.addEventListener('click', () => this.openTaskModal());
    this.dom.emptyStateAddBtn.addEventListener('click', () => this.openTaskModal());
    this.dom.closeTaskModalBtn.addEventListener('click', () => this.closeTaskModal());
    this.dom.cancelTaskModalBtn.addEventListener('click', () => this.closeTaskModal());
    this.dom.taskModalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.dom.taskModalBackdrop) this.closeTaskModal();
    });

    // Student Profile Modal open/close
    this.dom.studentCardBtn.addEventListener('click', () => this.openProfileModal());
    this.dom.closeProfileModalBtn.addEventListener('click', () => this.closeProfileModal());
    this.dom.cancelProfileModalBtn.addEventListener('click', () => this.closeProfileModal());
    this.dom.profileModalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.dom.profileModalBackdrop) this.closeProfileModal();
    });

    // Form Submissions
    this.dom.taskForm.addEventListener('submit', (e) => this.handleTaskFormSubmit(e));
    this.dom.profileForm.addEventListener('submit', (e) => this.handleProfileFormSubmit(e));

    // Filters and Search
    this.dom.searchInput.addEventListener('input', (e) => {
      this.filters.search = e.target.value.trim().toLowerCase();
      this.dom.clearSearchBtn.style.display = this.filters.search ? 'block' : 'none';
      this.render();
    });

    this.dom.clearSearchBtn.addEventListener('click', () => {
      this.dom.searchInput.value = '';
      this.filters.search = '';
      this.dom.clearSearchBtn.style.display = 'none';
      this.render();
    });

    this.dom.filterSubject.addEventListener('change', (e) => {
      this.filters.subject = e.target.value;
      this.render();
    });

    this.dom.filterPriority.addEventListener('change', (e) => {
      this.filters.priority = e.target.value;
      this.render();
    });

    this.dom.filterStatus.addEventListener('change', (e) => {
      this.filters.status = e.target.value;
      this.render();
    });

    this.dom.sortBy.addEventListener('change', (e) => {
      this.filters.sortBy = e.target.value;
      this.render();
    });

    this.dom.resetFiltersBtn.addEventListener('click', () => this.resetFilters());
    this.dom.clearCompletedBtn.addEventListener('click', () => this.clearCompletedTasks());

    // Pomodoro Timer Controls
    this.dom.timerToggleBtn.addEventListener('click', () => this.toggleTimer());
    this.dom.timerResetBtn.addEventListener('click', () => this.resetTimer());

    this.dom.timerModeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const minutes = parseInt(btn.getAttribute('data-time'), 10);
        const mode = btn.getAttribute('data-mode');
        this.setTimerMode(minutes, mode, btn);
      });
    });

    // Backup & Restore
    this.dom.exportDataBtn.addEventListener('click', () => this.exportData());
    this.dom.importFileInput.addEventListener('change', (e) => this.importData(e));

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeTaskModal();
        this.closeProfileModal();
      }
    });

    // Setup Kanban Drag & Drop
    this.setupKanbanDragAndDrop();
  }

  // ==========================================================================
  // VIEW NAVIGATION
  // ==========================================================================
  switchView(viewName) {
    if (!this.dom.views[viewName]) return;

    this.currentView = viewName;

    // Update active nav button
    this.dom.navItems.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    // Hide all views & show active
    Object.keys(this.dom.views).forEach(key => {
      this.dom.views[key].classList.toggle('active-view', key === viewName);
    });

    // Update page header title
    const viewTitles = {
      dashboard: 'Dashboard & Tasks',
      kanban: 'Kanban Workflow Board',
      pomodoro: 'Pomodoro Study Timer'
    };
    this.dom.pageTitle.textContent = viewTitles[viewName] || 'Dashboard';

    // Close mobile menu if open
    this.dom.sidebar.classList.remove('mobile-open');

    // If Kanban or Pomodoro, make sure they are rendered
    if (viewName === 'kanban') {
      this.renderKanban();
    } else if (viewName === 'pomodoro') {
      this.updatePomodoroTaskDropdown();
    }
  }

  // ==========================================================================
  // STUDENT PROFILE MANAGEMENT
  // ==========================================================================
  renderProfile() {
    this.dom.sidebarStudentName.textContent = this.profile.name;
    this.dom.sidebarStudentCourse.textContent = this.profile.course;
    this.dom.sidebarStudentId.textContent = `ID: ${this.profile.id}`;

    // Get initials for avatar (e.g. "Alex Johnson" -> "AJ")
    const initials = this.profile.name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0].toUpperCase())
      .slice(0, 2)
      .join('');
    this.dom.sidebarAvatar.textContent = initials || 'ST';
  }

  openProfileModal() {
    document.getElementById('profileName').value = this.profile.name;
    document.getElementById('profileId').value = this.profile.id;
    document.getElementById('profileSemester').value = this.profile.semester || '';
    document.getElementById('profileCourse').value = this.profile.course;

    this.dom.profileModalBackdrop.classList.add('is-open');
  }

  closeProfileModal() {
    this.dom.profileModalBackdrop.classList.remove('is-open');
  }

  handleProfileFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('profileName').value.trim();
    const id = document.getElementById('profileId').value.trim();
    const semester = document.getElementById('profileSemester').value.trim();
    const course = document.getElementById('profileCourse').value.trim();

    if (!name || !id || !course) {
      this.showToast('Please fill in all required profile fields.', 'warning');
      return;
    }

    this.profile = { name, id, semester, course };
    Storage.saveProfile(this.profile);
    this.renderProfile();
    this.closeProfileModal();
    this.showToast('Student profile updated successfully!', 'success');
  }

  // ==========================================================================
  // TASK CRUD (Create, Read, Update, Delete)
  // ==========================================================================
  openTaskModal(task = null) {
    // Reset errors
    document.querySelectorAll('.form-group').forEach(fg => fg.classList.remove('has-error'));

    if (task) {
      // Edit mode
      this.dom.modalTitle.textContent = 'Edit Task';
      this.dom.taskIdInput.value = task.id;
      this.dom.taskTitleInput.value = task.title;
      this.dom.taskSubjectInput.value = task.subject;
      this.dom.taskCategoryInput.value = task.category || 'Assignment';
      this.dom.taskPriorityInput.value = task.priority || 'Medium';
      this.dom.taskStatusSelect.value = task.status || 'todo';
      this.dom.taskDueDateInput.value = task.dueDate;
      this.dom.taskEstHoursInput.value = task.estHours || '';
      this.dom.taskNotesInput.value = task.notes || '';
    } else {
      // Add mode
      this.dom.modalTitle.textContent = 'Add New Task';
      this.dom.taskForm.reset();
      this.dom.taskIdInput.value = '';
      this.dom.taskPriorityInput.value = 'Medium';
      this.dom.taskCategoryInput.value = 'Assignment';
      this.dom.taskStatusSelect.value = 'todo';

      // Set default due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.dom.taskDueDateInput.value = tomorrow.toISOString().split('T')[0];
    }

    this.dom.taskModalBackdrop.classList.add('is-open');
    this.dom.taskTitleInput.focus();
  }

  closeTaskModal() {
    this.dom.taskModalBackdrop.classList.remove('is-open');
  }

  handleTaskFormSubmit(e) {
    e.preventDefault();

    const taskId = this.dom.taskIdInput.value;
    const title = this.dom.taskTitleInput.value.trim();
    const subject = this.dom.taskSubjectInput.value.trim();
    const category = this.dom.taskCategoryInput.value;
    const priority = this.dom.taskPriorityInput.value;
    const status = this.dom.taskStatusSelect.value;
    const dueDate = this.dom.taskDueDateInput.value;
    const estHours = parseFloat(this.dom.taskEstHoursInput.value) || 0;
    const notes = this.dom.taskNotesInput.value.trim();

    // Validation
    let hasError = false;
    const validateField = (input, errorId) => {
      const parent = input.closest('.form-group');
      if (!input.value.trim()) {
        parent.classList.add('has-error');
        hasError = true;
      } else {
        parent.classList.remove('has-error');
      }
    };

    validateField(this.dom.taskTitleInput, 'taskTitleError');
    validateField(this.dom.taskSubjectInput, 'taskSubjectError');
    validateField(this.dom.taskDueDateInput, 'taskDueDateError');

    if (hasError) return;

    if (taskId) {
      // Update existing task
      const index = this.tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        this.tasks[index] = {
          ...this.tasks[index],
          title,
          subject,
          category,
          priority,
          status,
          dueDate,
          estHours,
          notes,
          updatedAt: Date.now()
        };
        this.showToast('Task updated successfully!', 'success');
      }
    } else {
      // Create new task
      const newTask = {
        id: 'task_' + Date.now() + Math.random().toString(36).substring(2, 6),
        title,
        subject,
        category,
        priority,
        status,
        dueDate,
        estHours,
        notes,
        createdAt: Date.now()
      };
      this.tasks.unshift(newTask);
      this.showToast('New task added!', 'success');
    }

    // Persist and re-render
    this.saveAndRefresh();
    this.closeTaskModal();
  }

  toggleTaskStatus(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === 'completed') {
      task.status = 'todo';
      this.showToast(`Marked "${task.title.substring(0, 24)}..." as active`, 'info');
    } else {
      task.status = 'completed';
      SoundEffects.playChime();
      this.showToast(`Great job! Completed: "${task.title.substring(0, 24)}..."`, 'success');
    }

    this.saveAndRefresh();
  }

  deleteTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    const confirmDelete = window.confirm(`Delete "${task.title}"?`);
    if (!confirmDelete) return;

    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.saveAndRefresh();
    this.showToast('Task deleted', 'warning');
  }

  clearCompletedTasks() {
    const completedCount = this.tasks.filter(t => t.status === 'completed').length;
    if (completedCount === 0) {
      this.showToast('No completed tasks to clear.', 'info');
      return;
    }

    if (window.confirm(`Are you sure you want to remove all ${completedCount} completed task(s)?`)) {
      this.tasks = this.tasks.filter(t => t.status !== 'completed');
      this.saveAndRefresh();
      this.showToast(`Removed ${completedCount} completed task(s)`, 'success');
    }
  }

  saveAndRefresh() {
    Storage.saveTasks(this.tasks);
    this.renderSubjectOptions();
    this.render();
    this.updatePomodoroTaskDropdown();
    if (this.currentView === 'kanban') {
      this.renderKanban();
    }
  }

  // ==========================================================================
  // FILTERS, SEARCH & SORTING
  // ==========================================================================
  resetFilters() {
    this.filters = {
      search: '',
      subject: 'ALL',
      priority: 'ALL',
      status: 'ALL',
      sortBy: 'dueDateAsc'
    };

    this.dom.searchInput.value = '';
    this.dom.clearSearchBtn.style.display = 'none';
    this.dom.filterSubject.value = 'ALL';
    this.dom.filterPriority.value = 'ALL';
    this.dom.filterStatus.value = 'ALL';
    this.dom.sortBy.value = 'dueDateAsc';

    this.render();
    this.showToast('Filters have been reset', 'info');
  }

  getFilteredTasks() {
    const todayStr = new Date().toISOString().split('T')[0];

    return this.tasks.filter(task => {
      // 1. Text Search Filter
      if (this.filters.search) {
        const query = this.filters.search;
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesSubject = task.subject.toLowerCase().includes(query);
        const matchesNotes = task.notes && task.notes.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSubject && !matchesNotes) return false;
      }

      // 2. Subject Filter
      if (this.filters.subject !== 'ALL' && task.subject !== this.filters.subject) {
        return false;
      }

      // 3. Priority Filter
      if (this.filters.priority !== 'ALL' && task.priority !== this.filters.priority) {
        return false;
      }

      // 4. Status Filter
      if (this.filters.status !== 'ALL') {
        if (this.filters.status === 'overdue') {
          const isOverdue = task.status !== 'completed' && task.dueDate < todayStr;
          if (!isOverdue) return false;
        } else if (task.status !== this.filters.status) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sorting Logic
      switch (this.filters.sortBy) {
        case 'dueDateAsc':
          return (a.dueDate || '').localeCompare(b.dueDate || '');
        case 'dueDateDesc':
          return (b.dueDate || '').localeCompare(a.dueDate || '');
        case 'priority': {
          const weight = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
          return (weight[b.priority] || 0) - (weight[a.priority] || 0);
        }
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return (b.createdAt || 0) - (a.createdAt || 0);
        default:
          return 0;
      }
    });
  }

  // ==========================================================================
  // COLOR AND DATE HELPERS
  // ==========================================================================
  getSubjectColor(subjectName) {
    // Deterministic palette generation for subjects
    const colors = [
      { bg: 'rgba(79, 70, 229, 0.12)', text: '#4f46e5', border: '#818cf8' }, // Indigo
      { bg: 'rgba(16, 185, 129, 0.12)', text: '#059669', border: '#34d399' }, // Emerald
      { bg: 'rgba(245, 158, 11, 0.12)', text: '#d97706', border: '#fbbf24' }, // Amber
      { bg: 'rgba(6, 182, 212, 0.12)', text: '#0891b2', border: '#22d3ee' },  // Cyan
      { bg: 'rgba(236, 72, 153, 0.12)', text: '#db2777', border: '#f472b6' }, // Pink
      { bg: 'rgba(139, 92, 246, 0.12)', text: '#7c3aed', border: '#a78bfa' }  // Purple
    ];

    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) {
      hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  formatDueBadge(dueDateStr, isCompleted) {
    if (isCompleted) {
      return `<span class="meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Completed</span>`;
    }

    if (!dueDateStr) return `<span class="meta-item">No due date</span>`;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dueDateStr.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));

    const options = { month: 'short', day: 'numeric' };
    const dateFormatted = dueDate.toLocaleDateString('en-US', options);

    if (diffDays < 0) {
      const overdueBy = Math.abs(diffDays);
      return `<span class="meta-item meta-overdue">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        Overdue by ${overdueBy} ${overdueBy === 1 ? 'day' : 'days'} (${dateFormatted})
      </span>`;
    } else if (diffDays === 0) {
      return `<span class="meta-item meta-due-today">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Due Today!
      </span>`;
    } else if (diffDays === 1) {
      return `<span class="meta-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Due Tomorrow (${dateFormatted})
      </span>`;
    } else {
      return `<span class="meta-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Due in ${diffDays} days (${dateFormatted})
      </span>`;
    }
  }

  // ==========================================================================
  // RENDERING: STATS & SUBJECTS
  // ==========================================================================
  renderStats() {
    const todayStr = new Date().toISOString().split('T')[0];
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.status === 'completed').length;
    const pending = total - completed;
    const overdue = this.tasks.filter(t => t.status !== 'completed' && t.dueDate < todayStr).length;

    this.dom.statTotalCount.textContent = total;
    this.dom.statPendingCount.textContent = pending;
    this.dom.statCompletedCount.textContent = completed;
    this.dom.statOverdueCount.textContent = overdue;

    // Academic Completion Rate
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    this.dom.completionRateText.textContent = `${rate}%`;
    this.dom.completionProgressBar.style.width = `${rate}%`;

    if (rate === 100 && total > 0) {
      this.dom.progressMotivationalText.textContent = '🎉 All assignments completed! Excellent job!';
    } else if (rate >= 75) {
      this.dom.progressMotivationalText.textContent = 'Great momentum! You are nearing completion of all goals.';
    } else if (rate >= 40) {
      this.dom.progressMotivationalText.textContent = 'Good progress. Stay focused on high-priority deadlines!';
    } else {
      this.dom.progressMotivationalText.textContent = 'Keep up the steady progress on your coursework!';
    }
  }

  renderSubjectOptions() {
    // Gather distinct subjects from tasks
    const subjectSet = new Set(this.tasks.map(t => t.subject.trim()).filter(Boolean));
    const subjects = Array.from(subjectSet).sort();

    // 1. Populate Subject Filter Dropdown
    const currentVal = this.dom.filterSubject.value;
    this.dom.filterSubject.innerHTML = '<option value="ALL">All Subjects</option>';
    subjects.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub;
      opt.textContent = sub;
      this.dom.filterSubject.appendChild(opt);
    });
    this.dom.filterSubject.value = subjects.includes(currentVal) ? currentVal : 'ALL';

    // 2. Populate Sidebar Subject Quick Links
    this.dom.sidebarSubjectList.innerHTML = '';
    subjects.forEach(sub => {
      const count = this.tasks.filter(t => t.subject === sub && t.status !== 'completed').length;
      const color = this.getSubjectColor(sub);

      const btn = document.createElement('button');
      btn.className = 'subject-item-btn';
      btn.innerHTML = `
        <span style="display:flex; align-items:center;">
          <span class="subject-dot" style="background-color: ${color.text}"></span>
          <span>${sub}</span>
        </span>
        <span class="subject-badge-count">${count}</span>
      `;
      btn.addEventListener('click', () => {
        this.filters.subject = sub;
        this.dom.filterSubject.value = sub;
        this.switchView('dashboard');
        this.render();
      });
      this.dom.sidebarSubjectList.appendChild(btn);
    });
  }

  // ==========================================================================
  // RENDERING: TASK LIST
  // ==========================================================================
  renderTaskList() {
    const filteredTasks = this.getFilteredTasks();

    this.dom.taskCountHeader.textContent = `All Tasks (${filteredTasks.length})`;

    // Filter indicator badge
    if (this.filters.subject !== 'ALL' || this.filters.priority !== 'ALL' || this.filters.status !== 'ALL' || this.filters.search) {
      this.dom.filterSummaryText.textContent = '• Filtered results active';
    } else {
      this.dom.filterSummaryText.textContent = '';
    }

    if (filteredTasks.length === 0) {
      this.dom.taskListContainer.innerHTML = '';
      this.dom.emptyState.style.display = 'block';

      if (this.tasks.length === 0) {
        this.dom.emptyStateDesc.textContent = 'Your task list is empty. Add your coursework to stay organized!';
      } else {
        this.dom.emptyStateDesc.textContent = 'No tasks matched your active search or filters.';
      }
      return;
    }

    this.dom.emptyState.style.display = 'none';
    this.dom.taskListContainer.innerHTML = '';

    filteredTasks.forEach(task => {
      const isCompleted = task.status === 'completed';
      const color = this.getSubjectColor(task.subject);
      const dueBadgeHtml = this.formatDueBadge(task.dueDate, isCompleted);

      const card = document.createElement('div');
      card.className = `task-card ${isCompleted ? 'is-completed' : ''}`;
      card.dataset.id = task.id;

      card.innerHTML = `
        <div class="task-checkbox-wrap">
          <input type="checkbox" class="custom-checkbox" ${isCompleted ? 'checked' : ''} aria-label="Toggle task status" title="Mark as ${isCompleted ? 'incomplete' : 'completed'}">
        </div>

        <div class="task-content">
          <div class="task-top-row">
            <span class="subject-badge" style="background-color: ${color.bg}; color: ${color.text}; border: 1px solid ${color.border};">
              ${this.escapeHtml(task.subject)}
            </span>
            ${task.category ? `<span class="category-badge">${this.escapeHtml(task.category)}</span>` : ''}
            <span class="priority-badge priority-${task.priority}">${task.priority} Priority</span>
          </div>

          <h3 class="task-title">${this.escapeHtml(task.title)}</h3>

          ${task.notes ? `<p class="task-notes">${this.escapeHtml(task.notes)}</p>` : ''}

          <div class="task-meta-row">
            ${dueBadgeHtml}
            ${task.estHours ? `
              <span class="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                ${task.estHours} hr(s)
              </span>
            ` : ''}
            <span class="meta-item">
              Status: <strong>${task.status === 'completed' ? 'Completed' : task.status === 'in-progress' ? 'In Progress' : 'To Do'}</strong>
            </span>
          </div>
        </div>

        <div class="task-actions">
          <button class="task-btn-action action-timer" title="Start Study Session on this task" data-action="timer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </button>
          <button class="task-btn-action action-edit" title="Edit Task" data-action="edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="task-btn-action action-delete" title="Delete Task" data-action="delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      `;

      // Event delegation inside card
      const checkbox = card.querySelector('.custom-checkbox');
      checkbox.addEventListener('change', () => this.toggleTaskStatus(task.id));

      const timerBtn = card.querySelector('[data-action="timer"]');
      timerBtn.addEventListener('click', () => {
        this.startTimerForTask(task.id);
      });

      const editBtn = card.querySelector('[data-action="edit"]');
      editBtn.addEventListener('click', () => this.openTaskModal(task));

      const deleteBtn = card.querySelector('[data-action="delete"]');
      deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

      this.dom.taskListContainer.appendChild(card);
    });
  }

  // ==========================================================================
  // RENDERING: KANBAN BOARD & DRAG-AND-DROP
  // ==========================================================================
  renderKanban() {
    const todoTasks = this.tasks.filter(t => t.status === 'todo');
    const inProgressTasks = this.tasks.filter(t => t.status === 'in-progress');
    const completedTasks = this.tasks.filter(t => t.status === 'completed');

    this.dom.countColTodo.textContent = todoTasks.length;
    this.dom.countColInProgress.textContent = inProgressTasks.length;
    this.dom.countColCompleted.textContent = completedTasks.length;

    this.dom.dropzoneTodo.innerHTML = '';
    this.dom.dropzoneInProgress.innerHTML = '';
    this.dom.dropzoneCompleted.innerHTML = '';

    const createKanbanCard = (task) => {
      const card = document.createElement('div');
      card.className = 'kanban-card';
      card.draggable = true;
      card.dataset.id = task.id;

      const color = this.getSubjectColor(task.subject);

      card.innerHTML = `
        <div class="kanban-card-top">
          <span class="subject-badge" style="background-color: ${color.bg}; color: ${color.text}; font-size: 0.68rem;">
            ${this.escapeHtml(task.subject)}
          </span>
          <span class="priority-badge priority-${task.priority}" style="font-size: 0.68rem;">${task.priority}</span>
        </div>
        <h4 class="kanban-card-title">${this.escapeHtml(task.title)}</h4>
        <div class="kanban-card-meta">
          <span>📅 ${task.dueDate || 'No date'}</span>
          <div class="kanban-nav-arrows">
            ${task.status !== 'todo' ? `<button class="kanban-nav-btn btn-kanban-prev" title="Move Left">←</button>` : ''}
            ${task.status !== 'completed' ? `<button class="kanban-nav-btn btn-kanban-next" title="Move Right">→</button>` : ''}
          </div>
        </div>
      `;

      // Quick move arrows for touch/easy use
      const prevBtn = card.querySelector('.btn-kanban-prev');
      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const newStatus = task.status === 'completed' ? 'in-progress' : 'todo';
          this.updateTaskStatus(task.id, newStatus);
        });
      }

      const nextBtn = card.querySelector('.btn-kanban-next');
      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const newStatus = task.status === 'todo' ? 'in-progress' : 'completed';
          this.updateTaskStatus(task.id, newStatus);
        });
      }

      card.addEventListener('dragstart', (e) => {
        card.classList.add('is-dragging');
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('is-dragging');
      });

      return card;
    };

    todoTasks.forEach(task => this.dom.dropzoneTodo.appendChild(createKanbanCard(task)));
    inProgressTasks.forEach(task => this.dom.dropzoneInProgress.appendChild(createKanbanCard(task)));
    completedTasks.forEach(task => this.dom.dropzoneCompleted.appendChild(createKanbanCard(task)));
  }

  setupKanbanDragAndDrop() {
    const dropzones = [this.dom.dropzoneTodo, this.dom.dropzoneInProgress, this.dom.dropzoneCompleted];

    dropzones.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain');
        const column = zone.closest('.kanban-column');
        const targetStatus = column.getAttribute('data-status');

        if (taskId && targetStatus) {
          this.updateTaskStatus(taskId, targetStatus);
        }
      });
    });
  }

  updateTaskStatus(taskId, newStatus) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    task.status = newStatus;
    if (newStatus === 'completed') {
      SoundEffects.playChime();
    }
    this.saveAndRefresh();
    this.showToast(`Moved to ${newStatus.replace('-', ' ')}`, 'info');
  }

  // ==========================================================================
  // POMODORO TIMER LOGIC
  // ==========================================================================
  updatePomodoroTaskDropdown() {
    const activeTasks = this.tasks.filter(t => t.status !== 'completed');
    const currentVal = this.dom.pomodoroTaskSelect.value;

    this.dom.pomodoroTaskSelect.innerHTML = '<option value="">General Study Session</option>';
    activeTasks.forEach(task => {
      const opt = document.createElement('option');
      opt.value = task.id;
      opt.textContent = `[${task.subject}] ${task.title}`;
      this.dom.pomodoroTaskSelect.appendChild(opt);
    });

    if (currentVal && activeTasks.some(t => t.id === currentVal)) {
      this.dom.pomodoroTaskSelect.value = currentVal;
    }
  }

  startTimerForTask(taskId) {
    this.switchView('pomodoro');
    this.dom.pomodoroTaskSelect.value = taskId;
    this.resetTimer();
    this.toggleTimer();
  }

  setTimerMode(minutes, mode, activeBtn) {
    if (this.pomodoro.isRunning) {
      this.pauseTimer();
    }

    this.pomodoro.mode = mode;
    this.pomodoro.durationSeconds = minutes * 60;
    this.pomodoro.remainingSeconds = minutes * 60;

    this.dom.timerModeBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');

    const statusMap = {
      study: 'Focus Session Ready',
      'short-break': 'Short Break Ready',
      'long-break': 'Long Break Ready'
    };
    this.dom.timerStatusText.textContent = statusMap[mode] || 'Ready';

    this.updateTimerDisplay();
  }

  toggleTimer() {
    if (this.pomodoro.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.pomodoro.isRunning = true;
    this.dom.timerToggleBtn.classList.add('is-running');
    this.dom.timerToggleText.textContent = 'Pause Session';
    this.dom.timerStatusText.textContent = this.pomodoro.mode === 'study' ? 'Focusing...' : 'Resting...';

    this.pomodoro.intervalId = setInterval(() => {
      this.pomodoro.remainingSeconds--;

      if (this.pomodoro.remainingSeconds <= 0) {
        this.onTimerComplete();
      } else {
        this.updateTimerDisplay();
      }
    }, 1000);
  }

  pauseTimer() {
    this.pomodoro.isRunning = false;
    clearInterval(this.pomodoro.intervalId);
    this.dom.timerToggleBtn.classList.remove('is-running');
    this.dom.timerToggleText.textContent = 'Resume Session';
    this.dom.timerStatusText.textContent = 'Session Paused';
  }

  resetTimer() {
    this.pauseTimer();
    this.pomodoro.remainingSeconds = this.pomodoro.durationSeconds;
    this.dom.timerToggleText.textContent = 'Start Session';
    this.dom.timerStatusText.textContent = 'Ready';
    this.updateTimerDisplay();
  }

  onTimerComplete() {
    this.pauseTimer();
    SoundEffects.playChime();

    if (this.pomodoro.mode === 'study') {
      const minutesSpent = Math.round(this.pomodoro.durationSeconds / 60);
      this.pomoStats.sessions++;
      this.pomoStats.totalMinutes += minutesSpent;
      Storage.savePomoStats(this.pomoStats);
      this.renderPomodoroStats();

      // Check if attached to task
      const selectedTaskId = this.dom.pomodoroTaskSelect.value;
      if (selectedTaskId) {
        const task = this.tasks.find(t => t.id === selectedTaskId);
        if (task && task.status === 'todo') {
          task.status = 'in-progress';
          this.saveAndRefresh();
        }
      }

      this.showToast('🎉 Study Session Finished! Time for a break.', 'success');
      // Auto recommend short break button
      const breakBtn = document.querySelector('.timer-mode-btn[data-mode="short-break"]');
      if (breakBtn) breakBtn.click();
    } else {
      this.showToast('☕ Break is over! Ready for the next study round?', 'info');
      const studyBtn = document.querySelector('.timer-mode-btn[data-mode="study"]');
      if (studyBtn) studyBtn.click();
    }
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.pomodoro.remainingSeconds / 60);
    const secs = this.pomodoro.remainingSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    this.dom.timerDisplay.textContent = formatted;

    // SVG Circular Ring Progress
    const progress = 1 - (this.pomodoro.remainingSeconds / this.pomodoro.durationSeconds);
    const offset = this.pomodoro.totalRadiusCircumference * (1 - progress);
    this.dom.timerProgressRing.style.strokeDashoffset = offset;
  }

  renderPomodoroStats() {
    this.dom.pomoSessionsCount.textContent = this.pomoStats.sessions;
    const hours = Math.floor(this.pomoStats.totalMinutes / 60);
    const mins = this.pomoStats.totalMinutes % 60;
    this.dom.pomoTotalMinutes.textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  // ==========================================================================
  // BACKUP & RESTORE (JSON EXPORT/IMPORT)
  // ==========================================================================
  exportData() {
    const exportObject = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      studentProfile: this.profile,
      tasks: this.tasks,
      pomodoroStats: this.pomoStats
    };

    const jsonString = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    const filename = `studyflow_backup_${this.profile.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    this.showToast('Backup JSON downloaded!', 'success');
  }

  importData(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
          throw new Error('Invalid file format. Missing tasks array.');
        }

        if (window.confirm(`Import ${parsed.tasks.length} tasks? This will replace your current data.`)) {
          this.tasks = parsed.tasks;
          if (parsed.studentProfile) this.profile = parsed.studentProfile;
          if (parsed.pomodoroStats) this.pomoStats = parsed.pomodoroStats;

          Storage.saveTasks(this.tasks);
          Storage.saveProfile(this.profile);
          Storage.savePomoStats(this.pomoStats);

          this.renderProfile();
          this.renderPomodoroStats();
          this.saveAndRefresh();

          this.showToast('Backup restored successfully!', 'success');
        }
      } catch (err) {
        this.showToast('Error importing file: ' + err.message, 'error');
      }
      // Reset input
      event.target.value = '';
    };

    reader.readAsText(file);
  }

  // ==========================================================================
  // TOAST NOTIFICATION SYSTEM
  // ==========================================================================
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    } else {
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.65rem;">
        ${iconSvg}
        <span>${this.escapeHtml(message)}</span>
      </div>
    `;

    this.dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // ==========================================================================
  // UTILITY HELPERS
  // ==========================================================================
  escapeHtml(string) {
    if (!string) return '';
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  render() {
    this.renderStats();
    this.renderTaskList();
  }
}

// ============================================================================
// BOOTSTRAP APPLICATION WHEN DOM IS READY
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  window.app = new TaskManagerApp();
});

