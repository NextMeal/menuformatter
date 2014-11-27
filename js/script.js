$(document).ready(function () {
	$("#jsError").css('display', 'none');
	//$("#forkBanner").fadeOut(5000);
	
    $('#roundedBox').fadeIn(500);
	
	// gray, red, blue, gold, green, purple, orange
    var colorArray = ['#1C1C1C', '#8E0000', '#000039', '#8F6B00', '#004700', '#470047', '#B84A00', ''];

    $('body').css('background-color', colorArray[Math.floor(Math.random() * (colorArray.length - 0 + 1) + 0)]);
	
	setTimeout(function(){ajaxMenu(null, 60000);}, 0);
});

var retryTimeout;
var progressTimeout;
var toggleUpdateProgressBar = false;
var toggleProgessBar = [null, true]; //flip flops [0] is for danger. [1] is for warning
var countdownTimeout;

function ajaxMenu(type, refreshInterval) {
	//clear timeouts
    clearTimeout(retryTimeout);
    clearTimeout(progressTimeout);

    switch (type) {
		case 1: //normal refresh
			toggleUpdateProgressBar = false;
			$("#titleDate").stop().fadeOut(100, function() {if(!toggleUpdateProgressBar){$("#titleRefreshProgress").css('display', 'block');}});
            break;
			
        case 2: //error retry
			//update loading progressbar
			$("#loadingProgressBody").html("Retrying");
			$("#loadingProgressBody").toggleClass( 'progress-bar-danger', toggleProgessBar[0]);
			$("#loadingProgressBody").toggleClass( 'progress-bar-warning', toggleProgessBar[1]);
			
            //disable and update retryButton
            $("#retryButton").attr("disabled", "disabled");
            $("#retryButton").html('Retrying');
            break;

    }

    $.ajax({
        url: "https://navy.herokuapp.com/menu?status=webFetch&appVersion=1.0",
		//on ajax request success
        success: function(data, textStatus) {
			//hide error section if shown
			$("#errorDiv").css('display', 'none');
			//fade out loading bar
            $('#loadingProgress').stop().fadeOut(100); //need to stop the fadeIn() if ajax completes quick
			
			//show title row and menu list row if not already shown
			$("#tableTop").fadeIn(100);
			$("#menuList").fadeIn(100);
						
			//set text and fade in title row
			var dateObj = new Date();
            $('#titleDate').html('<span id="updateSymbol">&#x231A;</span> ' + getFullWeekdayFromIndex(dateObj.getDay()) + ' ' + formatDate(dateObj) + '&nbsp;');
            //progressTimeout = setTimeout(function(){increment($('#refreshProgressBar'), 50, 5/3, 1000);},30000);
			$("#titleRefreshProgress").css('display', 'none');
			toggleUpdateProgressBar = true; //signal to not show update progress bar since update > animation speed
			$('#titleRefresh').css('display', 'inline');
			$("#titleDate").stop().fadeIn(500).delay(refreshInterval * 0.8).fadeTo(refreshInterval * 0.2, 0.75); //fade in updated date so it fades in on each update
            
			//parse and show menu list
            $('#menuList').html(createMenuCode(getNextThreeMeals(getNextTwoDayMenus(data))));

			retryTimeout = setTimeout(function(){ajaxMenu(1, refreshInterval);},refreshInterval);
        },
		//on ajax request error
        error: function(date, textStatus, errorThrown) {
			//hide title row and menu list row if already shown
			$("#tableTop").css('display', 'none');
			$("#menuList").css('display', 'none');
			
			//show error elements if not already shown
			$('#loadingProgress').fadeIn(100); //need to stop the fadeIn() if ajax completes quick
            $('#errorDiv').fadeIn(100);
			
			//set error body message
            $('#errorBody').html('<div><p id="errorTitle">Menu backend is unreachable!</p><p>We\'ll be right back.</p>Browser provided following message<blockquote><p>' + textStatus + ' - ' + errorThrown + '</p></blockquote></div>');
            
			//set loading progress bar
			toggleUpdateProgressBar = true; //signal to not show update progress bar since update > animation speed
			$("#loadingProgressBody").html('Retrying in <span id="retryCountdown">60</span>s');
			//clear previous countdown timeouts and start countdown from 60
			clearTimeout(countdownTimeout);
			countdown($('#retryCountdown'), 60, 1000);
			$("#loadingProgressBody").toggleClass( 'progress-bar-danger', toggleProgessBar[0]);
			$("#loadingProgressBody").toggleClass( 'progress-bar-warning', toggleProgessBar[1]);
			
			//reenable retry button
            $("#retryButton").removeAttr("disabled");
            $("#retryButton").html('Retry Now');
			
			//get set timeout to retry
			retryTimeout = setTimeout(function(){ajaxMenu(2, refreshInterval);}, refreshInterval);
        }
    });
}

function countdown(element, number, period) {
	element.html(number);
	if (number > 0)
		countdownTimeout = setTimeout(function(){countdown(element, number - 1, period);}, period);
}

function increment(progressBar, percent, inc, period) {
    progressBar.css('width', '' + percent + '%');
    if (percent < 101)
        progressTimeout = setTimeout(function(){increment($('#refreshProgressBar'), percent + inc, inc,  period);}, period);
}

function formatDate(dateObj) {
    var output = dateObj.getHours() + ':';
    if (dateObj.getMinutes() < 10) {
        output += '0' + dateObj.getMinutes();
    } else {
        output += dateObj.getMinutes();
    }
	/*
    if (dateObj.getSeconds() < 10) {
        output += ':0' + dateObj.getSeconds();
    } else {
        output += ':' + dateObj.getSeconds();
    }
	*/
    return output;
}

function getFullWeekdayFromIndex(index) {
    var dateArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dateArray[index];
}

function createMenuCode(ntm) {
    var code = '<div id="mealTitle">' + mealIndexToTitle(nearestMealIndex) + '</div><span class="mealTitleDivider"></span><table class="table" id="menuTable">';

    code += '';

    for (var i = 0; i < ntm[0].length; i++) {
        if (ntm[0][i].title !== '') {
            code += '<tr><td id="mealTableRow">' + ntm[0][i].title + '</td></tr>';
        }
    }
    code += '</table>';
    return code;
}

function mealIndexToTitle(index) {
    switch (index) {
        case 0:
            return 'Breakfast';
        case 1:
            return 'Lunch';
        case 2:
            return 'Dinner';
        default:
            return 'Unknown';
    }
}

var nearestMealIndex;

function getNextThreeMeals(twoDays) {
    var mealAbbrArr = ['B', 'L', 'D'];

    var dateObj = new Date();

    var hour = dateObj.getHours();
    var minute = dateObj.getMinutes();

    var dayIndex = 0;
    var mealIndex = 0;

    if (hour > 7 || hour == 7 && minute > 30) mealIndex++;

    if (hour > 13 || hour == 13 && minute > 30) mealIndex++;

    if (hour > 19 || hour == 19 && minute > 30) {
        dayIndex++;
        mealIndex = 0;
    }



    nearestMealIndex = mealIndex;

    var nextThreeMeals = [];
    //console.log(twoDays);
    for (var i = 0; i < 3; i++) {
        //console.log(dayIndex + '|' + mealIndex);
        //console.log(twoDays[dayIndex][mealAbbrArr[mealIndex]]);
        nextThreeMeals.push(twoDays[dayIndex][mealAbbrArr[mealIndex]]);
        if (mealIndex == 2) {
            dayIndex++;
            mealIndex = 0;
        } else {
            mealIndex++;
        }
    }

    return nextThreeMeals;
}

function getNextTwoDayMenus(data) {
    var dateArray = ['U', 'M', 'T', 'W', 'R', 'F', 'S'];

    var weekMenu = JSON.parse(data);
    var dateObj = new Date();
    var weekdayIndex = dateObj.getDay();
    var dateAbbr = dateArray[weekdayIndex];

    var twoDayMenus = [];

    for (var i = 0; i < 2; i++) {
        dateAbbr = dateArray[weekdayIndex];
        //console.log(dateAbbr);
        twoDayMenus.push(weekMenu[dateAbbr]);


        if (weekdayIndex == 6) {
            weekdayIndex = 0;
        } else {
            weekdayIndex++;
        }
    }
    return twoDayMenus;
}
