function init() {
    let element = document.getElementById("add-client");
    element.addEventListener("click", function () {
      addClient();
    });

}

function addClient(){
    let date = document.getElementById('client-date').value;
    let name = document.getElementById('client-name').value;
    let description = document.getElementById('client-description').value;
    let amount = document.getElementById('client-amount').value;
    let status = document.getElementById('client-status').value;

    let tbody = document.getElementById('client-table-body');

    let row = tbody.insertRow();

    row.insertCell(0).textContent = date;
    row.insertCell(1).textContent = name;
    row.insertCell(2).textContent = description;
    row.insertCell(3).textContent = amount;
    row.insertCell(4).textContent = status;
    
    // You can also add actions like delete or edit in the last cell if required.
    let deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = function() {
        tbody.removeChild(row);
    };
    row.insertCell(5).appendChild(deleteBtn);
}

window.addEventListener("DOMContentLoaded", init);