// ── State ──────────────────────────────────────────────────
let tasks = JSON.parse(localStorage.getItem('stm-tasks') || '[]');

const saveTasks = () => {
  localStorage.setItem('stm-tasks', JSON.stringify(tasks));
};

// ── Helper: Check overdue ──────────────────────────────────
const isOverdue = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
};

// ── Helper: Format date ────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');   // ES6 destructuring
  return `${d}/${m}/${y}`;               // ES6 template literal
};

// ── Render Tasks ───────────────────────────────────────────
const renderTasks = () => {
  const filterSubject = document.getElementById('filter-subject').value;
  const sortOrder     = document.getElementById('sort-order').value;
  const list          = document.getElementById('task-list');

  // Part e: Filter by subject
  let filtered = filterSubject
    ? tasks.filter(t => t.subject === filterSubject)
    : [...tasks];

  // Part e: Sort by due date — ES6 destructuring in parameters
  filtered.sort(({ dueDate: a }, { dueDate: b }) => {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    return sortOrder === 'asc'
      ? new Date(a) - new Date(b)
      : new Date(b) - new Date(a);
  });

  // Empty state
  if (filtered.length === 0) {
    list.innerHTML = `<li style="color:#aaa;text-align:center;padding:2rem;">No tasks found.</li>`;
    return;
  }

  // DOM manipulation: build task items
  list.innerHTML = filtered.map(({ id, name, subject, dueDate }) => `
    <li class="task-item">
      <div>
        <p class="task-name">${name}</p>
        <span class="task-subject">${subject}</span>
        <span class="task-date ${isOverdue(dueDate) ? 'overdue' : ''}">
          ${isOverdue(dueDate) ? '⚠ Overdue · ' : ''}${formatDate(dueDate)}
        </span>
      </div>
      <button class="delete-btn" onclick="deleteTask('${id}')">✕</button>
    </li>
  `).join('');
};

// ── Part c: Handle form submit ─────────────────────────────
document.getElementById('task-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const name    = document.getElementById('task-name').value.trim();
  const subject = document.getElementById('subject').value;
  const dueDate = document.getElementById('due-date').value;

  if (!name || !subject || !dueDate) {
    alert('Please fill in all fields.');
    return;
  }

  // Store task in array
  const newTask = {
    id: crypto.randomUUID(),
    name,
    subject,
    dueDate
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();
  e.target.reset();
});

// ── Delete ─────────────────────────────────────────────────
const deleteTask = (id) => {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
};

// ── Part d: Fetch API ──────────────────────────────────────
const fetchApiTasks = async () => {
  const btn     = document.getElementById('fetch-btn');
  const status  = document.getElementById('api-status');
  const section = document.getElementById('api-tasks-section');
  const apiList = document.getElementById('api-task-list');

  btn.disabled   = true;
  btn.textContent = 'Fetching…';
  status.textContent = 'Connecting to API…';

  try {
    // Fetch API call
    const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=6');
    const data     = await response.json();

    // Display fetched data on webpage
    apiList.innerHTML = data.map(({ id, title, completed }) => `
      <div class="api-task-item">
        <strong>#${id}</strong> — ${title}
        <span style="float:right;color:${completed ? 'green' : 'tomato'}">
          ${completed ? '✓ Done' : '○ Pending'}
        </span>
      </div>
    `).join('');

    section.classList.add('visible');
    status.textContent = `✓ ${data.length} tasks fetched.`;

  } catch (err) {
    status.textContent = '✗ Fetch failed. Check your connection.';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Fetch Tasks from API';
  }
};

// ── Init ───────────────────────────────────────────────────
renderTasks();