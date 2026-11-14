# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A dependency-free todo app: plain HTML, CSS and vanilla JavaScript. There is no build step, package manager, linter or test suite. To run it, open `index.html` directly in a browser (or serve the folder with any static server).

## Architecture

- `index.html` defines the static shell (form, filter buttons, empty `<ul id="todo-list">`, `<p id="counter">`). `app.js` is loaded at the end of `<body>`, so it assumes the DOM already exists.
- `app.js` is a single script with one module-level state: `todos` (array of `{ id, text, done }`) and `currentFilter` (`"all" | "active" | "done"`).
- Data flow: every action (`addTodo`, `toggleTodo`, `deleteTodo`) updates `todos`, calls `saveTodos()` (localStorage key `"todos"`, failures silently ignored), then calls `render()`. `render()` rebuilds the whole list with `innerHTML = ""` plus DOM creation and updates the counter. Do not mutate the DOM outside `render()`.
- Filter buttons are wired through `data-filter` attributes in the HTML, which must match the values `render()` checks (`"active"`, `"done"`, otherwise all).
- `style.css` styles elements by tag and by class. The `.filter[data-filter="done"]` rule gives the Done button its own blue colour, overriding the green `.filter.active` style.
