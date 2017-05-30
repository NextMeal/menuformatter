//TODO: check format of tab names
function myFunction() {
  
 function sheetCount(){
  
  return SpreadsheetApp.getActive().getSheets().length;
   
}
  
  
  var months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May',
    'Jun', 'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec'
    ];
  
  function monthNameToNum(monthname,index) {
    
    for (var i = 0; i < months.length; i++) {
        if (months[i] === monthname) {
          var month = months.indexOf(monthname);
          return month ? month: 0;
       
        }
      
        else
        {
           //checking the Date of the spreasheet with the one on then ame
            checkDate(index);
          
        }
    }
    
}
  
  //read the date from the spreadsheet
  function checkDate(sheetIndex)
  {
     
  // The code below will get the values for the range C2:G8
 // in the active spreadsheet.  Note that this will be a javascript array.
 
   var ss = SpreadsheetApp.getActiveSpreadsheet();
  //loop through all sheets
  for (sheetIndex = 0; sheetIndex < ss.getSheets().length; sheetIndex++) {
    var sheet = ss.getSheets()[sheetIndex];
    var data = sheet.getDataRange().getValues();

    
    for(row=0;row<data.length;++row){
      for (column=0;column<data[row].length;++column) {
        //Logger.log("checking sheet" + sheetIndex + " cell at "+row+","+ column + data[row][column] + " length:"+data[row][column].length);
       
            var dateName = data[row][column];
              if(dateName instanceof Date) // returns true or false)
              {
                  //Logger.log("THIS IS A DATE "+ dateName);
                  //changeDate(sheetIndex,dateName);
         
                break;
              }
         
        }
     
      }
  }
  }
  
  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  //change the name of the tabs 
  function changeDate(sheetIndex,dateFromSpreadsheet)
  {
    var d = dateFromSpreadsheet;
    var monthNum = d.getMonth();
    var monthNam = monthNames[d.getMonth()];
    var day = d.getDate().toString();
   
    var dateString = monthNam + day;
    // Logger.log(dateString);
 
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    SpreadsheetApp.setActiveSheet(ss.getSheets()[sheetIndex]);
    SpreadsheetApp.getActiveSpreadsheet().renameActiveSheet(dateString);
    
    
  }
    
 
  function findIndex(date) {
    var date2 =  new Date(date);

    for (var i = 1; i < 7; i++)
    {
      if(i == 1)
       {
         var date1 = new Date("4/16/2017");
       }
      
      if(i == 2)
      {
        var date1 = new Date("4/23/2017");
      }
      
      if(i == 3)
      {
        var date1 = new Date("3/19/2017");
      }
      
      if(i == 4)
      {
        var date1 = new Date("3/26/2017");
      }
      
      
      if(i == 5)
      {
        var date1 = new Date("4/02/2017");
      }
      
      if(i == 6)
      {
        var date1 = new Date("4/09/2017");
      }
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
      var modDays = diffDays % 42;
      if( modDays == 0)
      {
        return i;
      }
   
   
    }   
   
 }
  
  //http://stackoverflow.com/questions/3224834/get-difference-between-2-dates-in-javascript
 function subtractDays(i,date) {
    
   //order correct for the spreadsheets
   
   if(i == 1)
   {
     var date1 = new Date("4/16/2017");
   }
   
   if(i == 2)
   {
     var date1 = new Date("4/23/2017");
   }
   
   if(i == 3)
   {
     var date1 = new Date("3/19/2017");
   }
   
   if(i == 4)
   {
     var date1 = new Date("3/26/2017");
   }
   
   
   if(i == 5)
   {
     var date1 = new Date("4/02/2017");
   }
   
   if(i == 6)
   {
     var date1 = new Date("4/09/2017");
   }
   
   var date2 =  new Date(date);
   
 
   var timeDiff = Math.abs(date2.getTime() - date1.getTime());
   var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
   var modDays = diffDays % 42;
   
   if( modDays == 0)
   {
     return true;
   }
   
   if(modDays !=0 )
   {
    return false; 
   }
   
 }
  

  
  function checkDateofSheet()
  {
    
    var out = new Array(8);
    for (var i = 1 ; i < 7; i++ ) 
    {
        var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
         
        out[i] = [sheets[i-1].getName()];
        var name = out[i].toString();
        
        try
        {
          var month = name.split(" ")[2];
          var monthNum = monthNameToNum(month,i);
          var date1 = name.split(" ")[3];
          var day = date1.split("-")[0];
        } catch (e if e instanceof TypeError)
        {
           //var ui = SpreadsheetApp.getUi();
          
          //ui.alert("check the format of the tab");
        }
      
        
        
    
          var dt = new Date();
     
        var year = dt.getYear();
        var d = new Date(parseInt(year),parseInt(monthNum),parseInt(day));
    
      
        
       // var ui = SpreadsheetApp.getUi();
     // ui.alert("currentIndex" + i + " currentDate " + d);
     
  
        //var ui = SpreadsheetApp.getUi();
      
      /*//sheet is in good order, does not need to move
      if(subtractDays(i,d) == true)
      {
        //prints the day and whether it's true or false to match the six weeks
        //ui.alert("good order " + i);
    
        
        
      }*/
      
      //means the order of the sheet is wrong -- needs to be moved
      
       if(subtractDays(i,d) ==  false)
      {
        //prints the day and whether it's true or false to match the six weeks
        
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        //check to see where the spreadsheet belongs
          var correctIndex = findIndex(d);
         // ui.alert("correctIndex" + correctIndex);
       // ui.alert("date is " + d + " wrong order " + i + "correctIndex " + correctIndex);
        
        //check if first sheet
        if(i == 1)
        {
           //set the active sheet to the first sheet to prepare for movement
           SpreadsheetApp.setActiveSheet(ss.getSheets()[0]);
          
          if(correctIndex == 1)
          {
             ss.moveActiveSheet(1);
          }
         
           if(correctIndex == 2)
          {
             ss.moveActiveSheet(2);
          }
          
            if(correctIndex == 3)
          {
             ss.moveActiveSheet(3);
          }
          
            if(correctIndex == 4)
          {
             ss.moveActiveSheet(4);
          }
          
            if(correctIndex == 5)
          {
             ss.moveActiveSheet(5);
          }
          
            if(correctIndex == 6)
          {
             ss.moveActiveSheet(6);
          }
          
        }
        
         //second sheet
        if(i == 2)
        {
           //set the active sheet to the first sheet to prepare for movement
          SpreadsheetApp.setActiveSheet(ss.getSheets()[1]);
       
           
          if(correctIndex == 1)
          {
             ss.moveActiveSheet(1);
          }
         
           if(correctIndex == 2)
          {
             ss.moveActiveSheet(2);
          }
          
            if(correctIndex == 3)
          {
             ss.moveActiveSheet(3);
          }
          
            if(correctIndex == 4)
          {
             ss.moveActiveSheet(4);
          }
          
            if(correctIndex == 5)
          {
             ss.moveActiveSheet(5);
          }
          
            if(correctIndex == 6)
          {
             ss.moveActiveSheet(6);
          }
          
        }
        
        //third sheet
        if(i == 3)
        {
           //set the active sheet to the first sheet to prepare for movement
          SpreadsheetApp.setActiveSheet(ss.getSheets()[2]);

          
          if(correctIndex == 1)
          {
             ss.moveActiveSheet(1);
          }
         
           if(correctIndex == 2)
          {
             ss.moveActiveSheet(2);
          }
          
            if(correctIndex == 3)
          {
             ss.moveActiveSheet(3);
          }
          
            if(correctIndex == 4)
          {
             ss.moveActiveSheet(4);
          }
          
            if(correctIndex == 5)
          {
             ss.moveActiveSheet(5);
          }
          
            if(correctIndex == 6)
          {
             ss.moveActiveSheet(6);
          }
          
        }
        
        //fourth sheet
        if(i == 4)
        {
           //set the active sheet to the first sheet to prepare for movement
          SpreadsheetApp.setActiveSheet(ss.getSheets()[3]);

          
          if(correctIndex == 1)
          {
             ss.moveActiveSheet(1);
          }
         
           if(correctIndex == 2)
          {
             ss.moveActiveSheet(2);
          }
          
            if(correctIndex == 3)
          {
             ss.moveActiveSheet(3);
          }
          
            if(correctIndex == 4)
          {
             ss.moveActiveSheet(4);
          }
          
            if(correctIndex == 5)
          {
             ss.moveActiveSheet(5);
          }
          
            if(correctIndex == 6)
          {
             ss.moveActiveSheet(6);
          }
          
        }
        
        //fifth sheet
        if(i == 5)
        {
           //set the active sheet to the first sheet to prepare for movement
          SpreadsheetApp.setActiveSheet(ss.getSheets()[4]);
       
          
          if(correctIndex == 1)
          {
             ss.moveActiveSheet(1);
          }
         
           if(correctIndex == 2)
          {
             ss.moveActiveSheet(2);
          }
          
            if(correctIndex == 3)
          {
             ss.moveActiveSheet(3);
          }
          
            if(correctIndex == 4)
          {
             ss.moveActiveSheet(4);
          }
          
            if(correctIndex == 5)
          {
             ss.moveActiveSheet(5);
          }
          
            if(correctIndex == 6)
          {
             ss.moveActiveSheet(6);
          }
          
        }
        
        //sixth sheet
        if(i == 6)
        {
           //set the active sheet to the first sheet to prepare for movement
          SpreadsheetApp.setActiveSheet(ss.getSheets()[5]);
        
          
          if(correctIndex == 1)
          {
             ss.moveActiveSheet(1);
          }
         
           if(correctIndex == 2)
          {
             ss.moveActiveSheet(2);
          }
          
            if(correctIndex == 3)
          {
             ss.moveActiveSheet(3);
          }
          
            if(correctIndex == 4)
          {
             ss.moveActiveSheet(4);
          }
          
            if(correctIndex == 5)
          {
             ss.moveActiveSheet(5);
          }
          
            if(correctIndex == 6) 
          {
             ss.moveActiveSheet(6);
          }
          
        }
        
        
        
        
      }
      
      
    }//end of SheetName function
   
    
    return out;
  }
  
  
//  Logger.log(checkDateofSheet());
//var ui = SpreadsheetApp.getUi();
 for (var i = 0 ; i < 3; i++ ) 
 
 {
   //ui.alert(i);
   Logger.log(checkDateofSheet());
  // checkDateofSheet();
   
 }
  
 
}
