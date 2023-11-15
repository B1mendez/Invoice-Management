import { filterClientsByStatus, filterClientsByName, calculateMonthlyRevenue, calculateTotalRevenue, updateKeyframes } from './utilities.js';
import { getClients, addClient, updateClient, deleteClient } from './clientService.js';

function init() {
    let add = document.getElementById("add-client");
    add.addEventListener("click", function () {
        showForm(false);
    });

    let close = document.getElementById("close-button");
    close.addEventListener("click", function () {
        hideForm();
    });

    let searchInput = document.getElementById('search-box').querySelector('input');
    searchInput.addEventListener('keyup', function() {
        let searchTerm = searchInput.value.trim();
        let filteredClients = filterClientsByName(getClients(), searchTerm);
        displayClients(filteredClients);
    });

    document.getElementById('allClients').addEventListener('click', function() {
        document.getElementById('allClients').classList.add('activeFilterBtn'); 
        document.getElementById('paidClients').classList.remove('activeFilterBtn'); 
        document.getElementById('dueClients').classList.remove('activeFilterBtn'); 
        displayClients(); 
    });
    
    document.getElementById('paidClients').addEventListener('click', function() {
        document.getElementById('allClients').classList.remove('activeFilterBtn'); 
        document.getElementById('paidClients').classList.add('activeFilterBtn'); 
        document.getElementById('dueClients').classList.remove('activeFilterBtn'); 

        let paidClients = filterClientsByStatus(getClients(), 'Paid');
        displayClients(paidClients);
    });
    
    document.getElementById('dueClients').addEventListener('click', function() {
        document.getElementById('allClients').classList.remove('activeFilterBtn'); 
        document.getElementById('paidClients').classList.remove('activeFilterBtn'); 
        document.getElementById('dueClients').classList.add('activeFilterBtn'); 
        let dueClients = filterClientsByStatus(getClients(), 'Due');
        displayClients(dueClients);
    });

    document.querySelector('#client-popup form').addEventListener('submit', handleFormSubmission);
}

export function showForm(editMode = false) {
    let deleteBtn = document.getElementById("delete-button");
    deleteBtn.style.display = editMode ? "block" : "none";

    document.getElementById("client-popup").style.display = "block";
}

function hideForm() {
    document.getElementById("client-popup").style.display = "none";
    document.querySelector('#client-popup form').reset();
}

function handleFormSubmission(e) {
    e.preventDefault();

    let name = document.getElementById('name').value;
    let address = document.getElementById('address').value;
    let city = document.getElementById('city').value;
    let amount = document.getElementById('amount').value;
    let status = document.getElementById('status').value;

    let clientData = {
        name: name,
        address: address,
        city: city,
        amount: amount,
        status: status
    };

    if (currentEditingRow) {
        updateClient(clientData, originalName);
        updateClientRow(clientData);
        currentEditingRow = null;
        originalName = null;
    } else {
        addClient(clientData);
        addClientRow(clientData);
    }

    updateOverviewCards();
    updateBreakDownBar();
    document.querySelector('#client-popup form').reset();
    document.getElementById("client-popup").style.display = "none";
}

function displayClients(filteredClients = getClients()) {
    let tbody = document.getElementById('client-table-body');
    tbody.innerHTML = '';

    filteredClients.forEach(client => {
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
    row.insertCell(2).textContent = `$ ${clientData.amount}.00`;

    let statusCell = row.insertCell(3);
    statusCell.textContent = clientData.status;

    if (clientData.status.toLowerCase() === 'paid') {
        statusCell.classList.add('paid-status');
    } else if (clientData.status.toLowerCase() === 'due') {
        statusCell.classList.add('unpaid-status');
    }

    let editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = function () {
        let latestClientData = getClients().find(client => client.name === clientData.name);
        editClientRow(latestClientData, row);
    };
    row.insertCell(4).appendChild(editBtn);
}

function updateClientRow(updatedClient) {
    currentEditingRow.cells[0].textContent = updatedClient.name;
    currentEditingRow.cells[1].textContent = updatedClient.address;
    currentEditingRow.cells[2].textContent = `$ ${updatedClient.amount}.00`;
    currentEditingRow.cells[3].textContent = updatedClient.status;
    currentEditingRow.cells[3].classList.remove('paid-status', 'unpaid-status');

    if (updatedClient.status.toLowerCase() === 'paid') {
        currentEditingRow.cells[3].classList.add('paid-status');
    } else if (updatedClient.status.toLowerCase() === 'due') {
        currentEditingRow.cells[3].classList.add('unpaid-status');
    }
}

function editClientRow(clientData, row) {
    document.getElementById('name').value = clientData.name;
    document.getElementById('address').value = clientData.address;
    document.getElementById('city').value = clientData.city;
    document.getElementById('amount').value = clientData.amount;
    document.getElementById('status').value = clientData.status;

    currentEditingRow = row;
    originalName = clientData.name;
    
    let deleteBtn = document.getElementById("delete-button");
    document.getElementById("delete-button").style.display = "block";
    deleteBtn.onclick = function () {
        deleteClientRow(clientData, currentEditingRow);
    };
    showForm(true);
    updateOverviewCards();
}

function deleteClientRow(clientData, row) {
    let confirmation = window.confirm("Are you sure you want to delete this client?");
    if (confirmation) {
        let tbody = document.getElementById('client-table-body');
        tbody.removeChild(row);

        deleteClient(clientData);
        updateOverviewCards();
        updateBreakDownBar();
        hideForm();
        document.querySelector('#client-popup form').reset();
    }
}

function updateOverviewCards() {
    let clients = getClients();
    let totalClients = clients.length;
    let unpaidClients = clients.filter(client => client.status === 'Due').length;
    let monthlyRevenue = calculateMonthlyRevenue(clients);
    //let estimatesMade = /* calculation */;

    document.getElementById('monthly-revenue').textContent = monthlyRevenue;
    document.getElementById('total-client').textContent = totalClients;
    document.getElementById('unpaid-client').textContent = unpaidClients;
}

function updateBreakDownBar() {
    let clients = getClients();
    let totalRevenue = calculateTotalRevenue(clients);
    let monthlyRevenue = calculateMonthlyRevenue(clients);
    let percentage = (monthlyRevenue / totalRevenue) * 100;

    let number = document.getElementById('number');
    number.innerHTML = `${percentage.toFixed(0)}%`;

    let newOffset = 435 - (435 * percentage / 100);
    updateKeyframes(newOffset);
}

window.addEventListener("DOMContentLoaded", function () {
    init();
    displayClients();
    updateOverviewCards();
    updateBreakDownBar();
});

let originalName = null;
let currentEditingRow = null;
