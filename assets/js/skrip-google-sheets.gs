/**
 * Skrip Google Apps Script — tempel di editor Apps Script spreadsheet Anda.
 * Deploy sebagai Web App (Anyone).
 *
 * Header yang diharapkan di Sheet (baris 1):
 * Stempel Waktu | Nama | Email | Telepon | Subjek | Pesan
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.nama || "",
      data.email || "",
      data.telepon || "",
      data.subjek || "",
      data.pesan || "",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "sukses" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "gagal", pesan: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    "Endpoint Data Indonesia aktif."
  );
}
