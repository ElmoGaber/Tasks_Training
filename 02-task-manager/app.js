// Task Manager - Add and manage tasks with dark mode
document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const newTaskInput = document.getElementById('new-task');
    const addBtn = document.getElementById('add-btn');
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.getElementById('themeIcon');
    
    // Load tasks from localStorage if available
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Set initial theme
    function setInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.classList.toggle('dark', savedTheme === 'dark');
        } else {
            // Use system preference
            const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
            document.body.classList.toggle('dark', prefersDarkScheme.matches);
        }
        updateThemeIcon();
    }
    
    // Update theme icon based on current theme
    function updateThemeIcon() {
        if (document.body.classList.contains('dark')) {
            themeIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.285 21.285a1.975 1.975 0 0 1-2.828 0l-8.408-8.398-8.398 8.408a1.975 1.975 0 0 1-2.828-2.828l8.576-8.575 8.576 8.575a1.975 1.975 0 0 1 0 2.828zM5.216 5.216a4.001 4.001 0 0 0 0 5.657l5.35 5.35a4.001 4.001 0 0 0 5.657 0l5.351-5.35a4.001 4.001 0 0 0-5.657-5.657l-5.35 5.351zm10.688-2.227a3.997 3.997 0 0 1 0 5.655l-5.351 5.35a3.997 3.997 0 0 1-5.657 0l-5.351-5.35a3.997 3.997 0 0 1 5.657 0z"/></svg>';
        } else {
            themeIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.285 21.285a1.975 1.975 0 0 1-2.828 0l-8.408-8.398-8.398 8.408a1.975 1.975 0 0 1-2.828-2.828l8.576-8.575 8.576 8.575a1.975 1.975 0 0 1 0 2.828zM5.216 5.216a4.001 4.001 0 0 0 0 5.657l5.35 5.35a4.001 4.001 0 0 0 5.657 0l5.351-5.35a4.001 4.001 0 0 0-5.657-5.657l-5.35 5.351zm10.688-2.227a3.997 3.997 0 0 1 0 5.655l-5.351 5.35a3.997 3.997 0 0 1-5.657 0l-5.351-5.35a3.997 3.997 0 0 1 5.657 0z"/></svg>';
        }
    }
    
    // Toggle theme
    function toggleTheme() {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
        updateThemeIcon();
    }
    
    // Event listener for theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Also listen for system theme changes
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            document.body.classList.toggle('dark', e.matches);
            updateThemeIcon();
        }
    });
    
    // Render tasks from localStorage
    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            
            if (task.completed) {
                li.classList.add('completed');
            }
            
            li.innerHTML = `
                <span class="task-text">${task.text}</span>
                <div class="actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
            
            // Toggle completed
            li.querySelector('.task-text').addEventListener('click', () => {
                task.completed = !task.completed;
                saveAndRender();
            });
            
            // Delete task
            li.querySelector('.delete-btn').addEventListener('click', () => {
                tasks.splice(index, 1);
                saveAndRender();
            });
            
            taskList.appendChild(li);
        });
    }
    
    // Save tasks to localStorage and re-render
    function saveAndRender() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }
    
    // Add new task
    addBtn.addEventListener('click', () => {
        const taskText = newTaskInput.value.trim();
        if (taskText === '') return;
        
        tasks.push({ text: taskText, completed: false });
        newTaskInput.value = '';
        saveAndRender();
    });
    
    // Initialize
    setInitialTheme();
    renderTasks();
});