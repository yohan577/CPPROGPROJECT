// js/main.js - Final Integrated HRMS Logic (JavaScript)

// --- 1. DATA INITIALIZATION AND PERSISTENCE ---

const initData = () => {
    // Initialize data with some defaults if localStorage is empty
    const storedEmployees = JSON.parse(localStorage.getItem('employees')) || [
        { id: 1, firstName: "John Lorenzo", lastName: "Austria", email: "john@corp.com", department: "IT", position: "Developer", hireDate: "2023-01-15", status: "Active", salary: 60000 },
        { id: 2, firstName: "Angelo", lastName: "Coronel", email: "coronel@corp.com", department: "Finance", position: "Accountant", hireDate: "2024-05-20", status: "Active", salary: 50000 },
        { id: 3, firstName: "Justine", lastName: "Dumo", email: "Dumo@corp.com", department: "Human Resources", position: "HR Specialist", hireDate: "2021-09-01", status: "Inactive", salary: 45000 },
        { id: 4, firstName: "Jerwin", lastName: "Valenzuela", email: "Valenzuela@corp.com", department: "IT", position: "Developer", hireDate: "2022-01-15", status: "Active", salary: 60000 },
         { id: 5, firstName: "Sonny", lastName: "Lipio", email: "lipio@corp.com", department: "Finance", position: "Accountant", hireDate: "2024-06-20", status: "Active", salary: 50000 },
        { id: 6, firstName: "Marites", lastName: "Gimenez", email: "Gimenez@corp.com", department: "Finance", position: "Accountant", hireDate: "2024-07-20", status: "Active", salary: 50000 }
    ];

    const storedDepartments = JSON.parse(localStorage.getItem('departments')) || [
        { id: 1, name: "Human Resources" },
        { id: 2, name: "Finance" },
        { id: 3, name: "IT" }
    ];

    const users = [
        { username: "admin", password: "1234", role: "HR Manager" }
    ];
    
    if (!localStorage.getItem('employees')) {
        localStorage.setItem('employees', JSON.stringify(storedEmployees));
        localStorage.setItem('departments', JSON.stringify(storedDepartments));
    }

    return { employees: storedEmployees, departments: storedDepartments, users: users };
};

let { employees, departments, users } = initData();
let nextEmployeeId = employees.reduce((max, e) => Math.max(max, e.id), 0) + 1;

const persistData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};


// --- 2. GLOBAL ELEMENTS AND MODAL HANDLERS ---

const employeeModal = document.getElementById('employeeModal');
const employeeForm = document.getElementById('employeeForm');

const deptModal = document.getElementById('departmentModal');
const deptForm = document.getElementById('departmentForm');


// --- 3. AUTHENTICATION LOGIC ---

const checkAuth = () => {
    if (!sessionStorage.getItem('isAuthenticated') && window.location.pathname.indexOf('index.html') === -1) {
        window.location.href = 'index.html';
    }
};

const handleLogin = (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        sessionStorage.setItem('isAuthenticated', 'true');
        window.location.href = 'dashboard.html';
    } else {
        document.getElementById('loginError').textContent = 'Invalid username or password.';
    }
};

const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    window.location.href = 'index.html';
};


// --- 4. EMPLOYEE MANAGEMENT (CRUD) ---

const closeEmployeeModal = () => {
    if (employeeModal) employeeModal.style.display = 'none';
};

const renderEmployeesTable = (data = employees) => {
    const tableBody = document.getElementById('employeesTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    data.forEach(emp => {
        // Currency Integration: Use PHP (Philippine Peso) format
        const salaryFormatted = emp.salary.toLocaleString('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }); 

        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.firstName} ${emp.lastName}</td>
            <td>${emp.department}</td>
            <td>${emp.position}</td>
            <td>${emp.hireDate}</td>
            <td class="status-${emp.status.toLowerCase()}">${emp.status}</td>
            <td>${salaryFormatted}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${emp.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${emp.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
    });

    document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => openEmployeeModal(e.currentTarget.dataset.id)));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => deleteEmployee(e.currentTarget.dataset.id)));
};

const openEmployeeModal = (id = null) => {
    document.getElementById('employeeId').value = '';
    employeeForm.reset();
    document.getElementById('modalTitle').textContent = 'Add New Employee';

    if (id) {
        const employee = employees.find(emp => emp.id === parseInt(id));
        if (employee) {
            document.getElementById('modalTitle').textContent = 'Edit Employee';
            document.getElementById('employeeId').value = employee.id;
            document.getElementById('firstName').value = employee.firstName;
            document.getElementById('lastName').value = employee.lastName;
            document.getElementById('email').value = employee.email;
            document.getElementById('department').value = employee.department;
            document.getElementById('position').value = employee.position;
            document.getElementById('hireDate').value = employee.hireDate;
            document.getElementById('status').value = employee.status;
            document.getElementById('salary').value = employee.salary;
        }
    }
    if(employeeModal) employeeModal.style.display = 'block';
};

const saveEmployee = (e) => {
    e.preventDefault();
    const id = document.getElementById('employeeId').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const department = document.getElementById('department').value;
    const position = document.getElementById('position').value;
    const hireDate = document.getElementById('hireDate').value;
    const status = document.getElementById('status').value;
    const salary = parseFloat(document.getElementById('salary').value);

    if (!firstName || !lastName || !email || !department || !position || !hireDate || !status || isNaN(salary)) {
        alert("Please fill all required fields correctly.");
        return;
    }

    const newEmployeeData = { firstName, lastName, email, department, position, hireDate, status, salary };

    if (id) {
        const index = employees.findIndex(emp => emp.id === parseInt(id));
        if (index !== -1) {
            employees[index] = { ...employees[index], ...newEmployeeData, id: parseInt(id) };
        }
    } else {
        employees.push({ ...newEmployeeData, id: nextEmployeeId++ });
    }

    persistData('employees', employees);
    renderEmployeesTable();
    if (document.querySelector('.dashboard-grid')) renderDashboard(); 
    closeEmployeeModal();
};

const deleteEmployee = (id) => {
    if (confirm("Are you sure you want to delete this employee?")) {
        employees = employees.filter(emp => emp.id !== parseInt(id));
        persistData('employees', employees);
        renderEmployeesTable();
        if (document.querySelector('.dashboard-grid')) renderDashboard(); 
    }
};


// --- 5. DEPARTMENT MANAGEMENT (CRUD) ---

const populateDepartmentOptions = () => {
    const selects = document.querySelectorAll('#department, #departmentFilter');
    if (selects.length === 0) return;

    selects.forEach(select => {
        const currentSelectedValue = select.value;
        const initialOption = select.querySelector('option[value=""]');
        select.innerHTML = '';
        if (initialOption) select.appendChild(initialOption);
        
        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.name;
            option.textContent = dept.name;
            if (dept.name === currentSelectedValue) { option.selected = true; }
            select.appendChild(option);
        });
    });
};

const openDepartmentModalDept = (id = null) => { 
    document.getElementById('departmentId').value = '';
    if (deptForm) deptForm.reset(); 
    if (document.getElementById('deptModalTitle')) document.getElementById('deptModalTitle').textContent = 'Add New Department';

    if (id) {
        const dept = departments.find(d => d.id === parseInt(id));
        if (dept) {
            document.getElementById('deptModalTitle').textContent = 'Edit Department';
            document.getElementById('departmentId').value = dept.id;
            document.getElementById('departmentName').value = dept.name;
        }
    }
    if (deptModal) deptModal.style.display = 'block';
};

const closeDepartmentModal = () => {
    if (deptModal) deptModal.style.display = 'none';
};

const renderDepartmentsTable = () => {
    const tableBody = document.getElementById('departmentsTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    departments.forEach(dept => {
        const employeeCount = employees.filter(emp => emp.department === dept.name).length;

        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${dept.id}</td>
            <td>${dept.name}</td>
            <td>${employeeCount}</td>
            <td>
                <button class="action-btn edit-dept-btn" data-id="${dept.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-dept-btn" data-id="${dept.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
    });

    document.querySelectorAll('.edit-dept-btn').forEach(btn => btn.addEventListener('click', (e) => openDepartmentModalDept(e.currentTarget.dataset.id)));
    document.querySelectorAll('.delete-dept-btn').forEach(btn => btn.addEventListener('click', (e) => deleteDepartment(e.currentTarget.dataset.id)));
};

const saveDepartment = (e) => {
    e.preventDefault();
    const id = document.getElementById('departmentId').value;
    const newName = document.getElementById('departmentName').value.trim();

    if (!newName) {
        alert("Department name cannot be empty.");
        return;
    }
    
    if (departments.some(d => d.name.toLowerCase() === newName.toLowerCase() && String(d.id) !== id)) {
        alert("A department with this name already exists.");
        return;
    }

    if (id) {
        const index = departments.findIndex(dept => dept.id === parseInt(id));
        if (index !== -1) {
            const oldName = departments[index].name;
            departments[index].name = newName;
            
            employees.forEach(emp => {
                if (emp.department === oldName) {
                    emp.department = newName;
                }
            });
            persistData('employees', employees); 
        }
    } else {
        const nextDeptId = departments.reduce((max, d) => Math.max(max, d.id), 0) + 1;
        departments.push({ id: nextDeptId, name: newName });
    }

    persistData('departments', departments);
    renderDepartmentsTable();
    populateDepartmentOptions(); 
    if (document.querySelector('.dashboard-grid')) renderDashboard(); 
    closeDepartmentModal();
};

const deleteDepartment = (id) => {
    const deptToDelete = departments.find(d => d.id === parseInt(id));
    if (!deptToDelete) return;
    
    const associatedEmployees = employees.filter(emp => emp.department === deptToDelete.name).length;

    if (associatedEmployees > 0) {
        alert(`Cannot delete "${deptToDelete.name}". It has ${associatedEmployees} employees associated with it.`);
        return;
    }

    if (confirm(`Are you sure you want to delete the department: ${deptToDelete.name}?`)) {
        departments = departments.filter(dept => dept.id !== parseInt(id));
        persistData('departments', departments);
        renderDepartmentsTable();
        populateDepartmentOptions(); 
        if (document.querySelector('.dashboard-grid')) renderDashboard(); 
    }
};


// --- 6. DASHBOARD LOGIC (Enhanced) ---

const renderGreeting = () => {
    const greetingTextEl = document.getElementById("greetingText");
    const currentTimeEl = document.getElementById("currentTime");
    
    if (!greetingTextEl) return;

    const hour = new Date().getHours();
    let greeting = "Good evening";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";

    greetingTextEl.innerText = `${greeting}, Admin!`;

    // Only set the interval if the element exists
    if (currentTimeEl) {
        setInterval(() => {
            currentTimeEl.innerText = new Date().toLocaleString();
        }, 1000);
    }
};

const renderRecentEmployees = () => {
    const recentList = document.getElementById('recentEmployeesList');
    if (!recentList) return;

    // Sort by ID (assuming higher ID means more recently added) and take the last 5
    const recentHires = [...employees]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

    recentList.innerHTML = recentHires.map(emp => `
        <li>
            <span>${emp.firstName} ${emp.lastName}</span>
            <span class="status-${emp.status.toLowerCase()}">${emp.department}</span>
        </li>
    `).join('');
};

const renderKeyStatistics = () => {
    const activeEmployees = employees.filter(emp => emp.status === 'Active');
    const inactiveEmployees = employees.filter(emp => emp.status !== 'Active');
    
    const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
    const averageSalary = employees.length > 0 ? (totalSalary / employees.length) : 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newHires = employees.filter(emp => {
        const hireDate = new Date(emp.hireDate);
        return hireDate >= thirtyDaysAgo;
    });

    if (document.getElementById('activeCount')) document.getElementById('activeCount').textContent = activeEmployees.length;
    if (document.getElementById('inactiveCount')) document.getElementById('inactiveCount').textContent = inactiveEmployees.length;
    
    // Currency Integration: Display Average Salary in Philippine Peso format (₱)
    if (document.getElementById('averageSalary')) {
        document.getElementById('averageSalary').textContent = averageSalary.toLocaleString('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0
        });
    }

    if (document.getElementById('newHiresCount')) document.getElementById('newHiresCount').textContent = newHires.length;
    
    // Fallback counts (if using older dashboard card structure)
    if (document.getElementById('totalEmployees')) document.getElementById('totalEmployees').textContent = employees.length;
    if (document.getElementById('totalDepartments')) document.getElementById('totalDepartments').textContent = departments.length;
};

// --- CHART RENDERING LOGIC ---
const renderCharts = () => {
    // 1. Employee Status Counts (Pie Chart Data)
    const activeCount = employees.filter(emp => emp.status === 'Active').length;
    const inactiveCount = employees.filter(emp => emp.status !== 'Active').length;
    
    // Render Status Chart
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx && typeof Chart !== 'undefined') {
        // Destroy existing chart instance to prevent duplicates/errors
        if (statusCtx.chart) statusCtx.chart.destroy();

        statusCtx.chart = new Chart(statusCtx, {
            type: 'pie',
            data: {
                labels: ['Active', 'Inactive/Leave'],
                datasets: [{
                    data: [activeCount, inactiveCount],
                    backgroundColor: [
                        '#28a745', // Green for Active
                        '#dc3545'  // Red for Inactive
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false,
                    }
                }
            }
        });
    }

    // 2. Employees per Department (Bar Chart Data)
    const departmentData = departments.map(dept => {
        const count = employees.filter(emp => emp.department === dept.name).length;
        return { name: dept.name, count: count };
    });

    // Render Department Chart
    const deptCtx = document.getElementById('departmentChart');
    if (deptCtx && typeof Chart !== 'undefined') {
        // Destroy existing chart instance to prevent duplicates/errors
        if (deptCtx.chart) deptCtx.chart.destroy();
        
        deptCtx.chart = new Chart(deptCtx, {
            type: 'bar',
            data: {
                labels: departmentData.map(d => d.name),
                datasets: [{
                    label: 'Employees',
                    data: departmentData.map(d => d.count),
                    backgroundColor: [
                        '#007bff', 
                        '#ffc107', 
                        '#17a2b8', 
                        '#6f42c1'
                    ],
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    }
                }
            }
        });
    }
};

const renderDashboard = () => {
    renderGreeting();
    renderKeyStatistics();
    renderRecentEmployees();
    renderCharts(); // Calls the graph rendering function
};


// --- 7. EVENT LISTENERS AND INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    const themeToggle = document.getElementById('themeToggle');

    // Function to apply the theme and update the button text
    const applyTheme = (isDark) => {
        const body = document.body;
        if (isDark) {
            body.classList.add('dark-mode');
            if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
            localStorage.setItem('theme', 'light');
        }
    };

    // Load theme preference on initialization
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const isDark = (savedTheme === 'dark') || (savedTheme === null && prefersDark);
        applyTheme(isDark);
    }

    const logoutBtn = document.getElementById('logoutBtn');
    // Also target the Quick Link logout button for convenience
    const logoutBtnQuick = document.getElementById('logoutBtnQuick'); 
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    if (logoutBtnQuick) {
        logoutBtnQuick.addEventListener('click', handleLogout);
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Dashboard Page Setup
    if (document.querySelector('.dashboard-grid')) {
        renderDashboard();
        
        // Theme Toggle Listener
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentIsDark = document.body.classList.contains('dark-mode');
                applyTheme(!currentIsDark); // Toggle the current theme
            });
        }
    }

    // Employee Management Page Setup
    if (document.getElementById('employeesTableBody')) {
        populateDepartmentOptions();
        renderEmployeesTable();

        const addEmployeeBtn = document.getElementById('addEmployeeBtn');
        if (addEmployeeBtn) addEmployeeBtn.addEventListener('click', () => openEmployeeModal());

        const closeModalBtn = document.querySelector('#employeeModal .close-btn');
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeEmployeeModal);
        
        window.addEventListener('click', (event) => {
            if (event.target === employeeModal) {
                closeEmployeeModal();
            }
        });

        if (employeeForm) employeeForm.addEventListener('submit', saveEmployee);

        const searchInput = document.getElementById('employeeSearch');
        const filterSelect = document.getElementById('departmentFilter');

        const applyFilters = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filterDept = filterSelect.value;
            const filteredEmployees = employees.filter(emp => {
                const matchesSearch = !searchTerm || 
                                    emp.firstName.toLowerCase().includes(searchTerm) || 
                                    emp.lastName.toLowerCase().includes(searchTerm) ||
                                    String(emp.id).includes(searchTerm);
                const matchesDepartment = !filterDept || emp.department === filterDept;
                return matchesSearch && matchesDepartment;
            });
            renderEmployeesTable(filteredEmployees);
        };

        if (searchInput) searchInput.addEventListener('input', applyFilters);
        if (filterSelect) filterSelect.addEventListener('change', applyFilters);
    }
    
    // Department Management Page Setup
    if (document.getElementById('departmentsTableBody')) {
        renderDepartmentsTable();

        const addDepartmentBtn = document.getElementById('addDepartmentBtn');
        if (addDepartmentBtn) addDepartmentBtn.addEventListener('click', () => openDepartmentModalDept()); 

        const closeDeptModalBtn = document.querySelector('#departmentModal .close-btn');
        if (closeDeptModalBtn) closeDeptModalBtn.addEventListener('click', closeDepartmentModal);
        
        window.addEventListener('click', (event) => {
            if (event.target === deptModal) {
                closeDepartmentModal();
            }
        });

        if (deptForm) deptForm.addEventListener('submit', saveDepartment); 
    }

});



