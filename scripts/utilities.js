export function filterClientsByStatus(clients, status) {
    if (status === 'All') {
        return clients;
    }
    return clients.filter(client => client.status === status);
}

export function filterClientsByName(clients, searchTerm) {
    return clients.filter(client => client.name.toLowerCase().startsWith(searchTerm.toLowerCase()));
}

export function setActiveFilterButton(activeButtonId) {
    document.querySelectorAll('.filterBtn').forEach(btn => {
        btn.classList.remove('activeFilterBtn');
    });
    document.getElementById(activeButtonId).classList.add('activeFilterBtn');
}

export function calculateMonthlyRevenue(clients) {
    let totalPaidAmount = clients
        .filter(client => client.status === 'Paid')
        .reduce((total, client) => total + parseFloat(client.amount), 0);

    return totalPaidAmount;
}

export function calculateTotalRevenue(clients) {
    let totalAmount = clients
        .reduce((total, client) => total + parseFloat(client.amount), 0);
    return totalAmount;
}

export function updateKeyframes(newOffset) {
    let styleSheet = document.styleSheets[0];
    let keyframes =
        `@keyframes anim {
            100% {
                stroke-dashoffset: ${newOffset};
            }
        }`;

    styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
}