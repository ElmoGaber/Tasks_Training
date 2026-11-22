# Dev Projects Collection

Four self-contained web projects, each with `index.html`, `style.css`, and `app.js`. Open any `index.html` file in a modern browser to use.

## Projects

### 1. Dev Portfolio (`01-dev-portfolio/`)
A developer portfolio with:
- About section with hero image
- Projects grid showcasing other apps
- Contact information
- Smooth scrolling navigation
- Active link highlighting on scroll
- **Dark mode** with system preference toggle and localStorage persistence

### 2. Task Manager (`02-task-manager/`)
A task management web application with:
- Add, edit, delete, and complete tasks
- `localStorage` persistence for tasks
- **Dark mode** with theme toggle
- CSS-styled task list with hover effects

### 3. Weather App (`03-weather-app/`)
A weather forecast application with:
- Search for weather by city name
- Mock data for 5 major cities: Cairo, London, New York, Dubai, Paris
- Displays temperature, description, humidity, and wind
- **Dark mode** with full theming including toggle icon
- Error handling for unavailable city data

### 4. Shop Cart (`04-shop-cart/`)
An e-commerce shopping cart with:
- Add products to cart with individual buttons
- Cart summary with itemized list and totals
- Checkout functionality
- `localStorage` persistence for cart items
- **Dark mode** with full theming

## Features Across All Projects

- **Dark Mode**: All 4 projects include full dark mode support with:
  - `body.dark` CSS rules for color scheme switching
  - Theme toggle SVG icons that rotate on toggle
  - `localStorage` persistence of user theme preference
  - System preference fallback (`(prefers-color-scheme: dark)`)
- **Responsive Design**: Mobile-friendly layouts using CSS Grid and flexible units
- **localStorage Persistence**: Task manager and shop cart persist data across sessions
- **Self-Contained**: Each project opens directly from `index.html` with no external dependencies

## Project Structure

```
dev-projects/
├── 01-dev-portfolio/     # Developer portfolio
├── 02-task-manager/      # Task management app
├── 03-weather-app/       # Weather forecast app
├── 04-shop-cart/         # Shopping cart
├── README.md             # This file
└── (each folder contains)
    ├── index.html
    ├── style.css
    └── app.js
```

## Usage

Open any project directly:
```bash
open dev-projects/01-dev-portfolio/index.html
# or on Windows
start dev-projects/01-dev-portfolio/index.html
```

No build steps, no dependencies, no external APIs required (weather app uses mock data).

## Technologies Used

- HTML5 semantic structure
- CSS3 with CSS variables for theming
- Vanilla JavaScript (ES6+)
- CSS Grid and Flexbox for layouts
- localStorage API for persistence
- `prefers-color-scheme` media query for system theme support