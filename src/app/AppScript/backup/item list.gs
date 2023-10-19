function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSheet();

   
  var data = sheet.getDataRange().getValues();
  var headers = data.shift();
  var result = data.map(function(row) {
    var obj = {};
    headers.forEach(function(header, index) {
      obj[header] = row[index];
    });
    return obj;
  });
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    var sheet = SpreadsheetApp.getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    if(data?.updateRow){ // update the mrp value
      var updateRow = data?.updateRow;
      if (updateRow > 0 && updateRow <= sheet.getLastRow()) {
        sheet.getRange(updateRow, 5).setValue(data.mrp);
    } else {
        return ContentService.createTextOutput("Invalid row number");
    }
    
    return ContentService.createTextOutput("Data saved");
    }


    sheet.appendRow([data.item_name, data.loc, data.part_no,data?.unit,data.mrp,data.gst]);
    return ContentService.createTextOutput("Data saved");
}