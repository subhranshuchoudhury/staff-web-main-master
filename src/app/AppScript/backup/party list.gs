function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSheet();

  var data = sheet.getDataRange().getValues();
  var headers = data.shift();
  var result = data.map(function (row) {
    var obj = {};
    headers.forEach(function (header, index) {
      obj[header] = row[index];
    });
    return obj;
  });
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([data.party_name]);
  return ContentService.createTextOutput("Data saved");
}
