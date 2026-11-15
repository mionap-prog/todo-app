// ===== 1. Grab the parts of the page we need =====
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const dueInput = document.getElementById("due-input");
const list = document.getElementById("todo-list");
const counter = document.getElementById("counter");
const filterButtons = document.querySelectorAll(".filter");

// ===== 2. The data: a list of todo objects =====
// Each todo looks like: { id: 123, text: "Buy milk", done: false, due: "2026-11-20" }
// "due" is optional: a "YYYY-MM-DD" string, or "" / missing when there is no due date.
let todos = loadTodos();
let currentFilter = "all";

// ===== 3. Save & load (so todos survive a page refresh) =====
function saveTodos() {
  try {
    localStorage.setItem("todos", JSON.stringify(todos));
  } catch (e) {
    // If the browser blocks saving, the app still works, it just won't remember.
  }
}

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem("todos")) || [];
  } catch (e) {
    return [];
  }
}

// ===== 4. Draw the list on the screen =====
// Today's date as "YYYY-MM-DD" in the user's local time (so it compares correctly with <input type="date">)
function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

// A todo is overdue when it has a due date in the past and isn't finished
function isOverdue(todo) {
  return !todo.done && !!todo.due && todo.due < todayString();
}

function formatDue(due) {
  const parts = due.split("-");
  return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function render() {
  list.innerHTML = ""; // clear the old list

  // Pick which todos to show based on the filter
  const visible = todos.filter(function (todo) {
    if (currentFilter === "active") return !todo.done;
    if (currentFilter === "done") return todo.done;
    return true; // "all"
  });

  // Build one <li> for each todo
  visible.forEach(function (todo) {
    const li = document.createElement("li");
    if (todo.done) li.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", function () {
      toggleTodo(todo.id);
    });

    const text = document.createElement("span");
    text.textContent = todo.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✕";
    deleteBtn.className = "delete";
    deleteBtn.addEventListener("click", function () {
      deleteTodo(todo.id);
    });

    li.append(checkbox, text);

    if (todo.due) {
      const overdue = isOverdue(todo);
      if (overdue) li.classList.add("overdue");
      const due = document.createElement("small");
      due.className = "due";
      due.textContent = (overdue ? "⚠️ Overdue: " : "Due ") + formatDue(todo.due);
      li.appendChild(due);
    }

    li.appendChild(deleteBtn);
    list.appendChild(li);
  });

  // Update the "X tasks left" text
  const left = todos.filter(function (t) { return !t.done; }).length;
  counter.textContent = left + (left === 1 ? " task left" : " tasks left");
}

// ===== 5. Actions: add, toggle, delete =====
function addTodo(text, due) {
  todos.push({ id: Date.now(), text: text, done: false, due: due });
  saveTodos();
  render();
}

function toggleTodo(id) {
  todos = todos.map(function (todo) {
    return todo.id === id ? { ...todo, done: !todo.done } : todo;
  });
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter(function (todo) { return todo.id !== id; });
  saveTodos();
  render();
}

// ===== 6. Listen for what the user does =====
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading
  const text = input.value.trim();
  if (text === "") return; // ignore empty tasks
  addTodo(text, dueInput.value);
  input.value = "";
  dueInput.value = "";
});

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    filterButtons.forEach(function (b) { b.classList.remove("active"); });
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    render();
  });
});

// ===== 7. Dark mode toggle (theme lives on <html data-theme>, separate from the todo list) =====
const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

function loadTheme() {
  try {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  } catch (e) {
    return "light";
  }
}

themeToggle.addEventListener("click", function () {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem("theme", next);
  } catch (e) {
    // Theme just won't be remembered.
  }
});

applyTheme(loadTheme());

// ===== 8. Draw the list once when the page opens =====
render();
