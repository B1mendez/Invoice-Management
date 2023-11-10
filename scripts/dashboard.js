function init() {
    let add = document.getElementById("add-client");
    add.addEventListener("click", function () {
        showForm(false);
    });

    let close = document.getElementById("close-button");
    close.addEventListener("click", function () {
        hideForm();
    });
    document.querySelector('#client-popup form').addEventListener('submit', handleFormSubmission);
}

function showForm(editMode = false) {
    let deleteBtn = document.getElementById("delete-button");
    deleteBtn.style.display = editMode ? "block" : "none";

    // Display the form
    document.getElementById("client-popup").style.display = "block";
}

function hideForm() {
    document.getElementById("client-popup").style.display = "none";
    document.querySelector('#client-popup form').reset();

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
    currentEditingRow.cells[2].textContent = `$ ${amount}.00`;
    currentEditingRow.cells[3].textContent = status;
    currentEditingRow.cells[3].classList.remove('paid-status', 'unpaid-status');


    if (status.toLowerCase() === 'paid') {
        currentEditingRow.cells[3].classList.add('paid-status');
    } else if (status.toLowerCase() === 'due') {
        currentEditingRow.cells[3].classList.add('unpaid-status');
    }

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
    updateBreakDownBar();
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
    row.insertCell(2).textContent = `$ ${amount}.00`;
    let statusCell = row.insertCell(3);
    statusCell.textContent = status;

    if (status.toLowerCase() === 'paid') {
        statusCell.classList.add('paid-status');
    } else if (status.toLowerCase() === 'due') {
        statusCell.classList.add('unpaid-status');
    }    
    
    let editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = function () {
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
    updateBreakDownBar();
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
        editClient(clientData, row);
    };
    row.insertCell(4).appendChild(editBtn);
}

function editClient(clientData, row) {
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
        deleteClient(clientData, row);
    };
    showForm(true);
    updateOverviewCards();
}

function deleteClient(clientData, row) {
    let confirmation = window.confirm("Are you sure you want to delete this client?");
    if (confirmation) {
        let tbody = document.getElementById('client-table-body');
        tbody.removeChild(row);

        clients = clients.filter(c => c.name !== clientData.name);

        updateOverviewCards();
        updateBreakDownBar();
        localStorage.setItem("clients", JSON.stringify(clients));

        hideForm();
        document.querySelector('#client-popup form').reset();
    }
}

function calculateMonthlyRevenue() {
    let totalPaidAmount = clients
        .filter(client => client.status === 'Paid')
        .reduce((total, client) => total + parseFloat(client.amount), 0);

    return totalPaidAmount;
}

function calculateTotalRevenue() {
    let totalAmount = clients
        .reduce((total, client) => total + parseFloat(client.amount), 0);
    return totalAmount;
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

function updateBreakDownBar() {
    let totalRevenue = calculateTotalRevenue();
    let monthlyRevenue = calculateMonthlyRevenue();
    let percentage = (monthlyRevenue / totalRevenue) * 100;

    let number = document.getElementById('number');
    number.innerHTML = `${percentage.toFixed(0)}%`;

    let newOffset = 435 - (435 * percentage / 100);
    updateKeyframes(newOffset);
}

function updateKeyframes(newOffset) {
    let styleSheet = document.styleSheets[0];
    let keyframes =
        `@keyframes anim {
            100% {
                stroke-dashoffset: ${newOffset};
            }
        }`;

    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
}

window.addEventListener("DOMContentLoaded", function () {
    init();
    displayClients();
    updateOverviewCards();
    updateBreakDownBar();
});

let clients = JSON.parse(localStorage.getItem("clients")) || [];
let originalName = null;
let currentEditingRow = null;