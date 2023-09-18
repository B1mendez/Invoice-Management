function init() {
    let add = document.getElementById("add-client");
    add.addEventListener("click", function () {
        showForm();
    });

    let close = document.getElementById("close-button");
    close.addEventListener("click", function () {
        hideForm();
    });
    document.querySelector('#client-popup form').addEventListener('submit', handleFormSubmission);
}

function showForm() {
    document.getElementById("client-popup").style.display = "block";
}

function hideForm() {
    document.getElementById("client-popup").style.display = "none";
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
    let address = document.getElementById('address').value;
    let city = document.getElementById('city').value;
    let amount = document.getElementById('amount').value;
    let status = document.getElementById('status').value;
    
    // Update the displayed table
    currentEditingRow.cells[0].textContent = name;
    currentEditingRow.cells[1].textContent = address;
    currentEditingRow.cells[2].textContent = amount;
    currentEditingRow.cells[3].textContent = status;

    // Update the clients array
    let updatedClient = {
        name: name,
        address: address, 
        city: city,
        amount: amount,
        status: status
    };

    let index = clients.findIndex(client => client.name === originalName); 
    if (index !== -1) {
        clients[index] = updatedClient;
    }

    localStorage.setItem("clients", JSON.stringify(clients));
    document.querySelector('#client-popup form').reset();
    currentEditingRow = null;
    originalName = null;
    updateOverviewCards();   
}

function addClient() {
    let name = document.getElementById('name').value;
    let address = document.getElementById('address').value;
    let city = document.getElementById('city').value;
    let amount = document.getElementById('amount').value;
    let status = document.getElementById('status').value;

    let tbody = document.getElementById('client-table-body');
    let row = tbody.insertRow();

    row.insertCell(0).textContent = name;
    row.insertCell(1).textContent = address;
    row.insertCell(2).textContent = amount;
    row.insertCell(3).textContent = status;    
    // You can also add actions like delete or edit in the last cell if required.
    let editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = function() {
        editClient(clientData, row);
    };
    row.insertCell(4).appendChild(editBtn); 

    let clientData = {
        name: name,
        address: address, 
        city: city,
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
            address: client.address,
            city: client.city,
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
    row.insertCell(1).textContent = clientData.address;
    row.insertCell(2).textContent = clientData.amount;
    row.insertCell(3).textContent = clientData.status;
    
    let editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = function() {
        editClient(clientData, row);
    };
    row.insertCell(4).appendChild(editBtn); 
}

function editClient(clientData, row) {
    // Populate the form with the current data
    document.getElementById('name').value = clientData.name;
    document.getElementById('address').value = clientData.address;
    document.getElementById('city').value = clientData.city;
    document.getElementById('amount').value = clientData.amount;
    document.getElementById('status').value = clientData.status;
    
    currentEditingRow = row; 
    originalName = clientData.name;

    let deleteBtn = document.getElementById("delete-button");
    document.getElementById("delete-button").style.display = "block";
    deleteBtn.onclick = function() {
        deleteClient(clientData, row);
    };
    showForm();
    updateOverviewCards();
}

function deleteClient(clientData, row) {
    let confirmation = window.confirm("Are you sure you want to delete this client?");
    if (confirmation) {
        let tbody = document.getElementById('client-table-body');
        tbody.removeChild(row);

        clients = clients.filter(c => c.name !== clientData.name);
        
        updateOverviewCards();
        localStorage.setItem("clients", JSON.stringify(clients));

        hideForm(); 
        document.querySelector('#client-popup form').reset();
    }
}

function calculateMonthlyRevenue(){
    let totalPaidAmount = clients
        .filter(client => client.status === 'Paid')
        .reduce((total, client) => total + parseFloat(client.amount), 0);

    return totalPaidAmount;
}

function updateOverviewCards() {
    let totalClients = clients.length;
    let unpaidClients = clients.filter(client => client.status === 'Unpaid').length;
    let monthlyRevenue = calculateMonthlyRevenue();
    //let estimatesMade = /* calculation */;
    
    document.getElementById('monthly-revenue').textContent = monthlyRevenue;
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