function getClient(clientName) {
  let allClients = JSON.parse(localStorage.getItem("clients")) || [];
  return allClients.find((client) => client.name === clientName) || null;
}

async function generateInvoice(client) {
  const { PDFDocument, rgb, StandardFonts } = PDFLib;
  const url = "/assets/Invoice.pdf";
  const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

  let pdfDoc = await PDFDocument.load(existingPdfBytes);
  let customFont = await pdfDoc.embedFont(StandardFonts.CourierBold);

  let pages = pdfDoc.getPages();
  let firstPage = pages[0];

  let fontSize = 12;
  let spacing = 2;
  let xPositionInfo = 179.28;
  let yPositionDate = 589.56;
  let yPositionName = 563.56;
  let yPositionAddress = 536.32;

  let xPositionPrice = 468;
  let xPositionRate = 403.2;

  let yPositionServicePrice = 439.2;
  let yPositionTrimPrice = 405.36;
  let yPositionCleanUpPrice = 372.24;
  let yPositionIrrigationPrice = 339.12;
  let yPositionPlantsPrice = 306;
  let yPositionOtherPrice = 272.88;

  // Date
  let date = new Date();
  let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  let monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",];
  let formattedDate = `${monthNames[lastDay.getMonth()]} ${lastDay.getDate()}, ${lastDay.getFullYear()}`;
  let xPosDate = xPositionInfo;
  for(let i = 0; i < formattedDate.length; i++){
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
  for(let i = 0; i < name.length; i++){
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
  for (let i = 0; i < addr.length; i++){
    firstPage.drawText(addr[i], {
        x: xPosAddr,
        y: yPositionAddress,
        size: fontSize,
        font: customFont,
        color: rgb(0, 0, 0),
      });
    xPosAddr += customFont.widthOfTextAtSize(addr[i], 12) + spacing;
  }

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
  let clientName = document.getElementById("clientSelect").value;
  let client = getClient(clientName);
  if (client) {
    generateInvoice(client);
  }
}

window.onload = populateClientsDropdown;
window.addEventListener("DOMContentLoaded", function () {
  let el = document.getElementById("add-invoice");
  el.addEventListener("click", generateSelectedClientInvoice);
});
