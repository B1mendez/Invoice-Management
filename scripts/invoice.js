function getClient(clientName) {
  let allClients = JSON.parse(localStorage.getItem("clients")) || [];
  return allClients.find((client) => client.name === clientName) || null;
}

async function generateInvoice(client, additionalServices = []) {
  const { PDFDocument, StandardFonts } = PDFLib;
  const existingPdfBytes = await fetch("/assets/Invoice.pdf").then((res) => res.arrayBuffer());
  let pdfDoc = await PDFDocument.load(existingPdfBytes);

  const customFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
  const priceFont = await pdfDoc.embedFont(StandardFonts.Courier);
  const firstPage = pdfDoc.getPages()[0];

  drawDate(firstPage, customFont, client);
  drawName(firstPage, customFont, client);
  drawAddress(firstPage, customFont, client);
  drawServiceDetails(firstPage, priceFont, customFont, client, additionalServices);

  let pdfBytes = await pdfDoc.save();
  download(pdfBytes, `${client.name}-Invoice.pdf`, "application/pdf");
}

function drawText(page, font, text, xPos, yPos, size, spacing) {
  for (let i = 0; i < text.length; i++) {
    page.drawText(text[i], {
      x: xPos,
      y: yPos,
      size: size,
      font: font,
    });
    xPos += font.widthOfTextAtSize(text[i], size) + spacing;
  }
}

function drawDate(page, font, client) {
  let dateTemplate = getLastDayOfMonth();
  drawText(page, font, dateTemplate, 179.28, 589.56, 12, 2);
}

function drawName(page, font, client) {
  let name = client.name.toUpperCase();
  drawText(page, font, name, 179.28, 563.56, 12, 2);
}

function drawAddress(page, font, client) {
  let address = client.description.toUpperCase();
  drawText(page, font, address, 179.28, 536.32, 12, 2);
}

function drawServiceDetails(page, priceFont, customFont, client, additionalServices) {
  const serviceDetailsConfig = [
    { service: 'trim', yPos: 368.66 },
    { service: 'cleanUp', yPos: 335.96 },
    { service: 'irrigation', yPos: 302.26 },
    { service: 'plants', yPos: 268.56 },
    { service: 'other', yPos: 234.86 },
  ];
  let totalPrice = parseFloat(client.amount);
  for (let detail of serviceDetailsConfig) {
    let serviceValue = additionalServices[detail.service];
    if (serviceValue) {
      drawText(page, priceFont, `$ ${serviceValue}.00`, 480, detail.yPos, 12, 0);
      totalPrice += parseFloat(serviceValue);
    }
  }

  drawText(page, customFont, `$ ${totalPrice.toFixed(2)}`, 480, 200.86, 14, 0);
}

function getLastDayOfMonth() {
  const monthNames = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];
  const date = new Date();
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return `${monthNames[lastDay.getMonth()]} ${lastDay.getDate()}, ${lastDay.getFullYear()}`;
}

function populateClientsDropdown() {
  let clientSelect = document.getElementById("clientSelect");
  let allClients = JSON.parse(localStorage.getItem("clients")) || [];

  allClients.forEach((client) => {
    let option = document.createElement("option");
    option.value = client.name;
    option.text = client.name;
    clientSelect.appendChild(option);
  });
}

function generateSelectedClientInvoice() {
  let client = getClient(clientName);
  if (client) {
    generateInvoice(client);
  }
}

function showInvoiceForm() {
  document.getElementById("invoice-popup").style.display = "block";
}

function closeInvoiceForm() {
  document.getElementById("invoice-popup").style.display = "none";
}

function handleSubmit(event) {
  event.preventDefault();

  let trimValue = parseFloat(document.getElementById("trim").value) || 0;
  let cleanUpValue = parseFloat(document.getElementById("cleanUp").value) || 0;
  let irrigationValue = parseFloat(document.getElementById("irrigation").value) || 0;
  let plantValue = parseFloat(document.getElementById("plant").value) || 0;
  let otherValue = parseFloat(document.getElementById("other").value) || 0;

  let clientName = document.getElementById("clientSelect").value;
  let client = getClient(clientName);

  if (client) {
    generateInvoice(client, {
      trim: trimValue,
      cleanUp: cleanUpValue,
      irrigation: irrigationValue,
      plants: plantValue,
      other: otherValue,
    });
  }

  // Close the form after generating the invoice
  document.querySelector('#invoice-popup form').reset();
  closeInvoiceForm();
}

window.addEventListener("DOMContentLoaded", function () {
  // Attach event listener to show the form
  let addInvoiceButton = document.getElementById("add-invoice");
  addInvoiceButton.addEventListener("click", showInvoiceForm);

  // Attach event listener to close the form
  let closeButton = document.getElementById("invoice-close-button");
  closeButton.addEventListener("click", closeInvoiceForm);

  // Attach event listener to form submission
  let invoiceForm = document.querySelector("#invoice-popup form");
  invoiceForm.addEventListener("submit", handleSubmit);

  // Populate clients dropdown
  populateClientsDropdown();
});