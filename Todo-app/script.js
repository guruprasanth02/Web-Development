const list = document.getElementById("taskList");
const themeToggle = document.getElementById("themeToggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

render();

// Add Task
function addTask() {
    const text = taskText.value.trim();
    if (!text) return;

    tasks.push({
        text,
        date: taskDate.value,
        priority: priority.value,
        completed: false
    });

    save();
    render();
    taskText.value = "";
}

// Render
function render() {
    list.innerHTML = "";

    tasks
        .filter(task => {
            if (currentFilter === "active") return !task.completed;
            if (currentFilter === "completed") return task.completed;
            return true;
        })
        .forEach((task, i) => {
            const li = document.createElement("li");
            if (task.completed) li.classList.add("completed");

            li.innerHTML = `
                <div class="task-top" onclick="toggleTask(${i})">
                    <strong>${task.text}</strong>
                    <span>${task.priority}</span>
                </div>
                <div class="meta">
                    ${task.date || "No due date"}
                    <span class="actions">
                        <button onclick="editTask(${i})">✏️</button>
                        <button onclick="deleteTask(${i})">🗑</button>
                    </span>
                </div>
            `;
            list.appendChild(li);
        });
}

// Actions
function toggleTask(i) {
    tasks[i].completed = !tasks[i].completed;
    save(); render();
}

function deleteTask(i) {
    tasks.splice(i, 1);
    save(); render();
}

function editTask(i) {
    const newText = prompt("Edit task", tasks[i].text);
    if (newText) tasks[i].text = newText;
    save(); render();
}

function filterTasks(type) {
    currentFilter = type;
    render();
}

function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Dark Mode
themeToggle.onclick = () => {
    document.body.classList.toggle("dark");
};
