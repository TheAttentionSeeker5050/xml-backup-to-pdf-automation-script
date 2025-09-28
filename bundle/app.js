let parsedMessages = [];

// File input handler
document.getElementById("xmlFile").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const xmlString = e.target.result;
    parsedMessages = processXML(xmlString); // store messages globally
    alert(`Parsed ${parsedMessages.length} messages!`);
  };
  reader.readAsText(file);
});

// Generate PDF button
document.getElementById("generateBtn").addEventListener("click", () => {
  if (!parsedMessages.length) {
    alert("Please upload an XML file first.");
    return;
  }

  const filterInput = document.getElementById("filterInput").value.trim();
  const filters = filterInput ? filterInput.split(",").map(f => f.trim().toLowerCase()) : [];

  let messagesToExport = parsedMessages;

  if (filters.length > 0) {
    messagesToExport = parsedMessages.filter(msg => {
      return filters.some(f =>
        (msg.address || "").toLowerCase().includes(f) ||
        (msg.contactName || "").toLowerCase().includes(f)
      );
    });
  }

  generatePDF(messagesToExport, filters.length > 0);
});

// Parse XML into array of messages
function processXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  const smsNodes = xmlDoc.getElementsByTagName("sms");
  const messages = [];

  for (let sms of smsNodes) {
    messages.push({
      address: sms.getAttribute("address"),
      body: sms.getAttribute("body"),
      date: new Date(Number(sms.getAttribute("date"))).toLocaleString(),
      type: sms.getAttribute("type") === "1" ? "Received" : "Sent",
      contactName: sms.getAttribute("contact_name") || "Unknown"
    });
  }

  return messages;
}

// Generate PDF
function generatePDF(messages, filtered = false) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;           // left/right/top/bottom margins
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 7;

  // Title
  doc.setFontSize(14);
  const title = filtered ? "Filtered SMS Backup" : "SMS Backup";
  doc.text(title, margin, margin);

  let y = margin + 10; // start below title

  for (let msg of messages) {
    const text = `${msg.date} - ${msg.type} - ${msg.contactName} (${msg.address}): ${msg.body || "[No Content]"}`;
    const splitText = doc.splitTextToSize(text, maxWidth);

    // Check if adding this block would exceed bottom margin
    if (y + splitText.length * lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    doc.text(splitText, margin, y, { align: "left" });
    y += splitText.length * lineHeight;
  }

  const filename = filtered ? "filtered_sms_backup.pdf" : "sms_backup.pdf";
  doc.save(filename);
}