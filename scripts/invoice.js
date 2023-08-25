function getClient(clientName) {
  let allClients = JSON.parse(localStorage.getItem("clients")) || [];
  return allClients.find((client) => client.name === clientName) || null;
}

async function generateInvoice(client, additionalServices = []) {
  const { PDFDocument, rgb, StandardFonts } = PDFLib;
  const url = "/assets/Invoice.pdf";
  const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

  let pdfDoc = await PDFDocument.load(existingPdfBytes);
  let customFont = await pdfDoc.embedFont(StandardFonts.CourierBold);
  let priceFont = await pdfDoc.embedFont(StandardFonts.Courier);

  let pages = pdfDoc.getPages();
  let firstPage = pages[0];

  let fontSize = 12;
  let spacing = 2;

  //General Information positioning
  let xPositionInfo = 179.28;
  let yPositionDate = 589.56;
  let yPositionName = 563.56;
  let yPositionAddress = 536.32;

  //additionalServices positioning
  let xPositionPrice = 480;
  let xPositionRate = 403.2;

  let yPositionServicePrice = 402.5;
  let yPositionTrimPrice = 368.66;
  let yPositionCleanUpPrice = 335.96;
  let yPositionIrrigationPrice = 302.26;
  let yPositionPlantsPrice = 268.56;
  let yPositionOtherPrice = 234.86;
  let yPositionTotalPrice = 200.86;

  let totalPrice = parseFloat(client.amount);
  
  // Date template 
  let date = new Date();
  let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  let monthNames = [
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
  let formattedDate = `${
    monthNames[lastDay.getMonth()]
  } ${lastDay.getDate()}, ${lastDay.getFullYear()}`;
  let xPosDate = xPositionInfo;
  for (let i = 0; i < formattedDate.length; i++) {
    firstPage.drawText(formattedDate[i], {
      x: xPosDate,
      y: yPositionDate,
      size: fontSize,
      font: customFont,
      color: rgb(0, 0, 0),
    });
    xPosDate += customFont.widthOfTextAtSize(formattedDate[i], 12) + spacing;
  }

  // Client's name
  let name = client.name.toUpperCase();
  let xPosName = xPositionInfo;
  for (let i = 0; i < name.length; i++) {
    firstPage.drawText(name[i], {
      x: xPosName,
      y: yPositionName,
      size: fontSize,
      font: customFont,
      color: rgb(0, 0, 0),
    });
    xPosName += customFont.widthOfTextAtSize(name[i], 12) + spacing;
  }

  let addr = client.description.toUpperCase();
  let xPosAddr = xPositionInfo;
  for (let i = 0; i < addr.length; i++) {
    firstPage.drawText(addr[i], {
      x: xPosAddr,
      y: yPositionAddress,
      size: fontSize,
      font: customFont,
      color: rgb(0, 0, 0),
    });
    xPosAddr += customFont.widthOfTextAtSize(addr[i], 12) + spacing;
  }

  firstPage.drawText(`$ ${client.amount}.00`, {
    x: xPositionPrice,
    y: yPositionServicePrice,
    size: fontSize,
    font: priceFont,
    color: rgb(0, 0, 0),
  });

  let serviceDetails = [
    { service: 'trim', yPos: yPositionTrimPrice },
    { service: 'cleanUp', yPos: yPositionCleanUpPrice },
    { service: 'irrigation', yPos: yPositionIrrigationPrice },
    { service: 'plants', yPos: yPositionPlantsPrice },
    { service: 'other', yPos: yPositionOtherPrice },
  ];
  
  for (let detail of serviceDetails) {
    let serviceValue = additionalServices[detail.service];
    if (serviceValue) { // only draw if there's a value
      firstPage.drawText(`$ ${serviceValue}.00`, {
        x: xPositionPrice,
        y: detail.yPos,
        size: fontSize,
        font: priceFont,
        color: rgb(0, 0, 0),
      });
      totalPrice = totalPrice + parseFloat(serviceValue);
    }
  }

  firstPage.drawText(`$ ${totalPrice.toFixed(2)}`, {
    x: xPositionPrice,
    y: yPositionTotalPrice,
    size: fontSize+2,
    font: customFont,
    color: rgb(0, 0, 0),
  });
  
  
  let pdfBytes = await pdfDoc.save();

  download(pdfBytes, `${client.name}-Invoice.pdf`, "application/pdf");
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