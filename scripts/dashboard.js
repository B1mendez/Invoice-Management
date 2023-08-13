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

    localStorage.setItem("clients", JSON.stringify(clients));
    currentEditingRow = null;
    originalName = null;
    updateOverviewCards();   
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
    let editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = function() {
        editClient(clientData, row);
    };
    row.insertCell(4).appendChild(editBtn); 

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
    document.querySelector('#client-popup form').reset();
    updateOverviewCards();
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
    
    let editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = function() {
        editClient(clientData, row);
    };
    row.insertCell(4).appendChild(editBtn); 
    
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
    updateOverviewCards();
}

function deleteClient(clientData, row) {
    let tbody = document.getElementById('client-table-body');
    tbody.removeChild(row);

    clients = clients.filter(c => c.name !== clientData.name);
    updateOverviewCards()
    localStorage.setItem("clients", JSON.stringify(clients));
}

function updateOverviewCards() {
    let totalClients = clients.length;
    let unpaidClients = clients.filter(client => client.status === 'Unpaid').length;
    // // If you have a mechanism to determine monthly revenue and estimates, calculate them here
    // let monthlyRevenue = /* calculation */;
    // let estimatesMade = /* calculation */;
    
    document.getElementById('total-client').textContent = totalClients;
    document.getElementById('unpaid-client').textContent = unpaidClients;
}


window.addEventListener("DOMContentLoaded", function() {
    init();
    displayClients();
    updateOverviewCards();
});

let clients = JSON.parse(localStorage.getItem("clients")) || [];
let originalName = null;
let currentEditingRow = null;