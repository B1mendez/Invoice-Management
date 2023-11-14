function getClient(clientName) {
  let allClients = JSON.parse(localStorage.getItem("clients")) || [];
  return allClients.find((client) => client.name === clientName) || null;
}

async function generateInvoice(client, additionalServices = [], additionServicesRate = []) {
  const { PDFDocument, StandardFonts } = PDFLib;
  const existingPdfBytes = await fetch("./assets/Invoice.pdf").then((res) => res.arrayBuffer());
  let pdfDoc = await PDFDocument.load(existingPdfBytes);

  const customFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
  const priceFont = await pdfDoc.embedFont(StandardFonts.Courier);
  const firstPage = pdfDoc.getPages()[0];

  drawDate(firstPage, customFont);
  drawName(firstPage, customFont, client);
  drawAddress(firstPage, customFont, client);
  drawServiceDetails(firstPage, priceFont, customFont, client, additionalServices, additionServicesRate);

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

function drawDate(page, font) {
  let dateTemplate = getLastDayOfMonth();
  drawText(page, font, dateTemplate, 179.28, 589.56, 12, 2);
}

function drawName(page, font, client) {
  let name = client.name.toUpperCase();
  drawText(page, font, name, 179.28, 563.56, 12, 2);
}

function drawAddress(page, font, client) {
  let address = client.address.toUpperCase();
  let city = client.city.toUpperCase();
  drawText(page, font, address, 179.28, 536.32, 12, 2);
  drawText(page, font, city, 179.28, 515.32, 12, 2); 
}

function drawServiceDetails(page, priceFont, customFont, client, additionalServices) {
  const serviceDetailsConfig = [
      { service: 'service', yPos: 418.5 },
      { service: 'trim', yPos: 384.66 },
      { service: 'cleanUp', yPos: 351.96 },
      { service: 'irrigation', yPos: 318.26 },
      { service: 'plants', yPos: 285.56 },
      { service: 'other', yPos: 252.86 }
  ];

  let totalPrice = 0;

  for (let config of serviceDetailsConfig) {
      let detail = additionalServices.find(s => s.service === config.service);
      
      if (detail && detail.value) {
          drawText(page, priceFont, `${detail.rate}`, 290, config.yPos, 12, 0); 
          drawText(page, priceFont, `$ ${detail.value}.00`, 380, config.yPos, 12, 0);
          drawText(page, priceFont, `$ ${detail.rate * detail.value}.00`, 485, config.yPos, 12, 0); 

          totalPrice += parseFloat(detail.value * detail.rate);
      }
  }

  drawText(page, customFont, `$ ${totalPrice.toFixed(2)}`, 475, 217.86, 14, 0);
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
  populateClientsDropdown();
  document.getElementById("invoice-popup").style.display = "block";
}

function closeInvoiceForm() {
  document.getElementById("clientSelect").innerHTML = "";
  document.getElementById("invoice-popup").style.display = "none";
}

function handleSubmit(event) {
  event.preventDefault();

  let trimValue = parseFloat(document.getElementById("trim").value) || 0;
  let cleanUpValue = parseFloat(document.getElementById("cleanUp").value) || 0;
  let irrigationValue = parseFloat(document.getElementById("irrigation").value) || 0;
  let plantValue = parseFloat(document.getElementById("plant").value) || 0;
  let otherValue = parseFloat(document.getElementById("other").value) || 0;

  let rateService = parseFloat(document.getElementById("rateService").value) || 1;
  let rateTrim = parseFloat(document.getElementById("rateTrim").value) || 1;
  let rateCleanUp = parseFloat(document.getElementById("rateCleanUp").value) || 1;
  let rateIrrigation = parseFloat(document.getElementById("rateIrrigation").value) || 1;
  let ratePlant = parseFloat(document.getElementById("ratePlants").value) || 1;
  let rateOther = parseFloat(document.getElementById("rateOther").value) || 1;

  let clientName = document.getElementById("clientSelect").value;
    let client = getClient(clientName);

    if (client) {
        let servicesList = [
            { service: 'service', value: client.amount, rate: rateService },
            { service: 'trim', value: trimValue, rate: rateTrim },
            { service: 'cleanUp', value: cleanUpValue, rate: rateCleanUp},
            { service: 'irrigation', value: irrigationValue, rate: rateIrrigation },
            { service: 'plants', value: plantValue, rate: ratePlant},
            { service: 'other', value: otherValue, rate: rateOther},
        ];
        
        generateInvoice(client, servicesList);
    }

    document.querySelector('#invoice-popup form').reset();
    closeInvoiceForm();
}

window.addEventListener("DOMContentLoaded", function () {
  let addInvoiceButton = document.getElementById("add-invoice");
  addInvoiceButton.addEventListener("click", showInvoiceForm);

  let closeButton = document.getElementById("invoice-close-button");
  closeButton.addEventListener("click", closeInvoiceForm);

  let invoiceForm = document.querySelector("#invoice-popup form");
  invoiceForm.addEventListener("submit", handleSubmit);
});