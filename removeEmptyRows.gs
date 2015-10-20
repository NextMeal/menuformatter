/*
deleteEmptyRows() will remove empty rows from all sheets in a spreadsheet. 
It will stop looking for empty rows on a sheet when a cell says "MENU-END".

The menu app backend parser running at navy.herokuapp.com stops parsing when it reaches an empty row. This script helps prevent an empty row in the middle of the menu from breaking the parse. 

Created by Anson Liu 16OCT15
*/

function deleteEmptyRows(){ 
   var ss = SpreadsheetApp.getActiveSpreadsheet();
  //loop through all sheets
  for (sheetIndex = 0; sheetIndex < ss.getSheets().length; sheetIndex++) {
    var sheet = ss.getSheets()[sheetIndex];
    var data = sheet.getDataRange().getValues();
    //Logger.log(sheet  + " " + sheetIndex);
    //Logger.log(data);
    
    var emptyRowRealIndices = [];
    
    for(row=0;row<data.length;++row){
      var empty = true;
      for (column=0;column<data[row].length;++column) {
        //Logger.log("checking sheet" + sheetIndex + " cell at "+row+","+ column + data[row][column] + " length:"+data[row][column].length);
        if (data[row][column].length === undefined || data[row][column].length > 0) {
          empty = false;
          //Logger.log("found filled cell at "+row+","+column);
          //break out of this sheet if encountered MENU-END
          if (data[row][column] == "MENU-END") {
            Logger.log("found MENU-END, stopping parse of sheet " + sheetIndex);
            row = data.length;
            break;
          }
         
        }
      }
      //We do not delete the row immediately because that will change the indices of the actual spreadsheet and make keeping track of indices harder. Add to array and remove in descending order. 
      if (empty == true) {
        //Logger.log("Empty real world row " + (row + 1) + " on sheet " + sheetIndex);
        emptyRowRealIndices.push(row+1);
      }
    }
    
    Logger.log("Delete sheet " + sheetIndex + " indices [" + emptyRowRealIndices + "]");
    
    for(deleteIndex = emptyRowRealIndices.length - 1; deleteIndex >= 0; deleteIndex--) {
      sheet.deleteRow(emptyRowRealIndices[deleteIndex]);
    }
  }
}