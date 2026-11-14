// ===== 1. Grab the parts of the page we need =====
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const counter = document.getElementById("counter");
const filterButtons = document.querySelectorAll(".filter");

// ===== 2. The data: a list of todo objects =====
// Each todo looks like: { id: 123, text: "Buy milk", done: false }
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

    li.append(checkbox, text, deleteBtn);
    list.appendChild(li);
  });

  // Update the "X tasks left" text
  const left = todos.filter(function (t) { return !t.done; }).length;
  counter.textContent = left + (left === 1 ? " task left" : " tasks left");
}

// ===== 5. Actions: add, toggle, delete =====
function addTodo(text) {
  todos.push({ id: Date.now(), text: text, done: false });
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
  addTodo(text);
  input.value = "";
});

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    filterButtons.forEach(function (b) { b.classList.remove("active"); });
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    render();
  });
});

// ===== 7. Draw the list once when the page opens =====
render();
