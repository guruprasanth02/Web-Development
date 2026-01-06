const list = document.getElementById("taskList");
const stats = document.getElementById("stats");
const empty = document.getElementById("empty");
const themeToggle = document.getElementById("themeToggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let filter = "all";
let dragIndex = null;

// Restore theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

render();

function addTask() {
  const text = taskText.value.trim();
  if (!text) return;

  tasks.push({
    id: Date.now(),
    text,
    category: taskCategory.value,
    priority: taskPriority.value,
    date: taskDate.value || "No Date",
    completed: false
  });

  save();
  taskText.value = "";
}

function render() {
  list.innerHTML = "";

  const filtered = tasks.filter(t =>
    filter === "all" ||
    (filter === "active" && !t.completed) ||
    (filter === "completed" && t.completed)
  );

  const groups = {};
  filtered.forEach(t => {
    groups[t.date] = groups[t.date] || [];
    groups[t.date].push(t);
  });

  Object.keys(groups).sort().forEach(date => {
    const group = document.createElement("div");
    group.className = "task-group";
    group.innerHTML = `<h4>${date}</h4>`;

    groups[date].forEach(task => {
      const div = document.createElement("div");
      div.className = "task";
      if (task.completed) div.classList.add("completed");

      div.draggable = true;
      div.ondragstart = () => dragIndex = tasks.indexOf(task);
      div.ondragover = e => e.preventDefault();
      div.ondrop = () => dropTask(tasks.indexOf(task));

      div.innerHTML = `
        <div class="task-top">
          <input value="${task.text}" 
                 onchange="editTask(${task.id}, this.value)">
          <span class="badge ${task.priority}">
            ${task.priority}
          </span>
        </div>
        <div class="meta">
          <span>${task.category}</span>
          <div class="actions">
            <button onclick="toggle(${task.id})">✔</button>
            <button onclick="remove(${task.id})">🗑</button>
          </div>
        </div>
      `;
      group.appendChild(div);
    });

    list.appendChild(group);
  });

  stats.textContent = `${tasks.length} tasks`;
  empty.style.display = tasks.length ? "none" : "block";
}

function dropTask(i) {
  const item = tasks[dragIndex];
  tasks.splice(dragIndex, 1);
  tasks.splice(i, 0, item);
  save();
}

function toggle(id) {
  tasks.find(t => t.id === id).completed ^= true;
  save();
}

function remove(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
}

function editTask(id, val) {
  tasks.find(t => t.id === id).text = val;
  save(false);
}

function setFilter(f) {
  filter = f;
  render();
}

function save(r = true) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  if (r) render();
}

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  localStorage.setItem("theme", dark ? "dark" : "light");
  themeToggle.textContent = dark ? "☀️" : "🌙";
};
