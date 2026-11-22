// Task Manager - Add and manage tasks
document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const newTaskInput = document.getElementById('new-task');
    const addBtn = document.getElementById('add-btn');
    
    // Load tasks from localStorage if available
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
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
    renderTasks();
});