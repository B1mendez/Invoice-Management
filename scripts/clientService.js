let clients = JSON.parse(localStorage.getItem("clients")) || [];

export function getClients() {
    return clients;
}

export function addClient(clientData) {
    clients.push(clientData);
    localStorage.setItem("clients", JSON.stringify(clients)); 
}

export function updateClient(updatedClientData, originalName) {
    clients = clients.map(client =>
        client.name === originalName ? updatedClientData : client
    );
    localStorage.setItem("clients", JSON.stringify(clients));
}

export function deleteClient(clientData){
    clients = clients.filter(c => c.name !== clientData.name);
    localStorage.setItem("clients", JSON.stringify(clients));
}


