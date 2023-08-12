function init() {
    let el = document.getElementById("add-client");
    el.addEventListener("click", function () {
        showForm();
    });
    document.querySelector('#client-popup form').addEventListener('submit', handleFormSubmission);
}

function showForm() {
    document.getElementById("client-popup").style.display = "block";
}

function handleFormSubmission(e) {
    e.preventDefault();
    
    if (currentEditingRow) {
        updateClient();
    } else {
        addClient();
    }
    
    document.getElementById("client-popup").style.display = "none";
}

function updateClient() {
    let name = document.getElementById('name').value;
    let description = document.getElementById('description').value;
    let amount = document.getElementById('amount').value;
    let status = document.getElementById('status').value;
    
    // Update the displayed table
    currentEditingRow.cells[0].textContent = name;
    currentEditingRow.cells[1].textContent = description;
    currentEditingRow.cells[2].textContent = amount;
    currentEditingRow.cells[3].textContent = status;

    // Update the clients array
    let updatedClient = {
        name: name,
        description: description,
        amount: amount,
        status: status
    };

    let index = clients.findIndex(client => client.name === originalName); 
    if (index !== -1) {
        clients[index] = updatedClient;
    }

    // Save the updated clients array to local storage
    localStorage.setItem("clients", JSON.stringify(clients));

    // Reset the edit mode
    currentEditingRow = null;
    originalName = null;
}

function addClient() {
    let name = document.getElementById('name').value;
    let description = document.getElementById('description').value;
    let amount = document.getElementById('amount').value;
    let status = document.getElementById('status').value;

    let tbody = document.getElementById('client-table-body');
    let row = tbody.insertRow();

    row.insertCell(0).textContent = name;
    row.insertCell(1).textContent = description;
    row.insertCell(2).textContent = amount;
    row.insertCell(3).textContent = status;    
    // You can also add actions like delete or edit in the last cell if required.
    let deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = function() {
        tbody.removeChild(row);
    };
    row.insertCell(4).appendChild(deleteBtn);

    let clientData = {
        name: name,
        description: description,
        amount: amount,
        status: status
    };

    clients.push(clientData);
    localStorage.setItem("clients", JSON.stringify(clients));
}

function displayClients() {
    let clients = JSON.parse(localStorage.getItem("clients")) || [];
    clients.forEach(client => {
        let clientData = {
            name: client.name,
            description: client.description,
            amount: client.amount,
            status: client.status
        };
        addClientRow(clientData);
    });
}

function addClientRow(clientData) {
    let tbody = document.getElementById('client-table-body');
    let row = tbody.insertRow();

    row.insertCell(0).textContent = clientData.name;
    row.insertCell(1).textContent = clientData.description;
    row.insertCell(2).textContent = clientData.amount;
    row.insertCell(3).textContent = clientData.status;
    
    // Actions, such as delete
    let editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = function() {
        editClient(clientData, row);
    };
    row.insertCell(4).appendChild(editBtn); 
    
    // Delete button
    let deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = function() {
        deleteClient(clientData, row);
    };
    row.insertCell(4).appendChild(deleteBtn);
}

function editClient(clientData, row) {
    // Populate the form with the current data
    document.getElementById('name').value = clientData.name;
    document.getElementById('description').value = clientData.description;
    document.getElementById('amount').value = clientData.amount;
    document.getElementById('status').value = clientData.status;
    
    currentEditingRow = row; // Store the current row being edited
    originalName = clientData.name;
    
    showForm();
}

function deleteClient(clientData, row) {
    let tbody = document.getElementById('client-table-body');
    tbody.removeChild(row);

    // Also remove this client from the clients array and update local storage
    clients = clients.filter(c => c.name !== clientData.name); // Assuming names are unique
    localStorage.setItem("clients", JSON.stringify(clients));
}

window.addEventListener("DOMContentLoaded", function() {
    init();
    displayClients();
});

let clients = JSON.parse(localStorage.getItem("clients")) || [];
let originalName = null;
let currentEditingRow = null;