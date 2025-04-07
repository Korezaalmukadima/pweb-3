// Mendefinisikan variabel global
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const taskCounter = document.getElementById('task-counter');
const filterTasks = document.getElementById('filter-tasks');
const searchInput = document.getElementById('search-input');
const clearCompleted = document.getElementById('clear-completed');
const editTaskInput = document.getElementById('edit-task-input');
const saveEditButton = document.getElementById('save-edit-button');

// Init Modal
const editTaskModal = new bootstrap.Modal(document.getElementById('editTaskModal'));

// Load tasks from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromLocalStorage();
    renderTasks();
    
    // Add event listeners
    taskForm.addEventListener('submit', addTask);
    filterTasks.addEventListener('change', filterTaskList);
    searchInput.addEventListener('input', searchTasks);
    clearCompleted.addEventListener('click', clearCompletedTasks);
    saveEditButton.addEventListener('click', saveEditTask);
});

// Fungsi untuk memuat tugas dari localStorage
function loadTasksFromLocalStorage() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

// Fungsi untuk menyimpan tugas ke localStorage
function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Fungsi untuk menambahkan tugas baru
function addTask(e) {
    e.preventDefault();
    
    const taskText = taskInput.value.trim();
    if (taskText === '') return;
    
    const newTask = {
        id: Date.now().toString(),
        text: taskText,
        completed: false,
        createdAt: new Date()
    };
    
    tasks.unshift(newTask); // Tambahkan ke awal array agar tampil di atas
    saveTasksToLocalStorage();
    taskInput.value = '';
    renderTasks();
    
    // Focus kembali ke input setelah menambahkan tugas
    taskInput.focus();
}

// Fungsi untuk menampilkan tugas-tugas
function renderTasks() {
    taskList.innerHTML = '';
    
    // Filter dan pencarian
    let filteredTasks = filterTasksByStatus(tasks);
    filteredTasks = filterTasksBySearch(filteredTasks);
    
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'list-group-item text-center text-muted';
        emptyMessage.textContent = 'Tidak ada tugas yang ditampilkan';
        taskList.appendChild(emptyMessage);
    } else {
        filteredTasks.forEach(task => {
            const taskItem = createTaskElement(task);
            taskList.appendChild(taskItem);
        });
    }
    
    // Update counter
    updateTaskCounter();
}

// Fungsi untuk membuat elemen tugas
function createTaskElement(task) {
    const taskItem = document.createElement('li');
    taskItem.className = `list-group-item task-item ${task.completed ? 'completed' : ''} task-item-new`;
    taskItem.dataset.id = task.id;
    
    // Checkbox untuk status selesai
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'form-check-input';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
    
    // Teks tugas
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;
    
    // Container untuk tombol aksi
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';
    
    // Tombol edit
    const editButton = document.createElement('button');
    editButton.className = 'btn btn-outline-primary btn-sm btn-task btn-edit';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.addEventListener('click', () => openEditModal(task));
    
    // Tombol hapus
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm btn-task btn-delete';
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.addEventListener('click', () => deleteTask(task.id));
    
    // Menambahkan semua elemen ke taskItem
    actionButtons.appendChild(editButton);
    actionButtons.appendChild(deleteButton);
    
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(actionButtons);
    
    return taskItem;
}

// Fungsi untuk mengganti status selesai/belum tugas
function toggleTaskComplete(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasksToLocalStorage();
    renderTasks();
}

// Fungsi untuk menghapus tugas
function deleteTask(taskId) {
    // Animasi hapus
    const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
    taskElement.style.opacity = '0';
    taskElement.style.height = '0';
    taskElement.style.transition = 'opacity 0.3s ease, height 0.3s ease';
    
    setTimeout(() => {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasksToLocalStorage();
        renderTasks();
    }, 300);
}

// Fungsi untuk membuka modal edit
function openEditModal(task) {
    editingTaskId = task.id;
    editTaskInput.value = task.text;
    editTaskModal.show();
    
    // Focus input setelah modal muncul
    setTimeout(() => {
        editTaskInput.focus();
        editTaskInput.select();
    }, 300);
}

// Fungsi untuk menyimpan hasil edit
function saveEditTask() {
    const newText = editTaskInput.value.trim();
    if (newText === '') return;
    
    tasks = tasks.map(task => {
        if (task.id === editingTaskId) {
            return { ...task, text: newText };
        }
        return task;
    });
    
    saveTasksToLocalStorage();
    editTaskModal.hide();
    renderTasks();
}

// Fungsi untuk filter tugas berdasarkan status
function filterTasksByStatus(taskArray) {
    switch (currentFilter) {
        case 'completed':
            return taskArray.filter(task => task.completed);
        case 'incomplete':
            return taskArray.filter(task => !task.completed);
        default:
            return taskArray;
    }
}

// Fungsi untuk filter tugas berdasarkan pencarian
function filterTasksBySearch(taskArray) {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm === '') return taskArray;
    
    return taskArray.filter(task => 
        task.text.toLowerCase().includes(searchTerm)
    );
}

// Fungsi untuk filter di dropdown
function filterTaskList() {
    currentFilter = filterTasks.value;
    renderTasks();
}

// Fungsi untuk pencarian
function searchTasks() {
    renderTasks();
}

// Fungsi untuk menghapus tugas yang sudah selesai
function clearCompletedTasks() {
    // Konfirmasi sebelum menghapus
    if (tasks.some(task => task.completed)) {
        if (confirm('Apakah Anda yakin ingin menghapus semua tugas yang sudah selesai?')) {
            tasks = tasks.filter(task => !task.completed);
            saveTasksToLocalStorage();
            renderTasks();
        }
    } else {
        alert('Tidak ada tugas yang sudah selesai.');
    }
}

// Fungsi untuk memperbarui counter tugas
function updateTaskCounter() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    
    taskCounter.textContent = `Total tugas: ${totalTasks} (${completedTasks} selesai, ${totalTasks - completedTasks} belum selesai)`;
}