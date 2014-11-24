$(document).ready(function () {
    $('#roundedBox').fadeIn(500);

    var colorArray = ['#FF7519', '#FF0000', '#CC0099', '#009900', '#000080', '#BB8800', '#333333', ''];

    $('body').css('background-color', colorArray[Math.floor(Math.random() * (colorArray.length - 0 + 1) + 0)]);

    setTimeout(ajaxMenu, 0);
});

var retryTimeout;
var progressTimeout;

function ajaxMenu(type) {
    clearTimeout(retryTimeout);
    clearTimeout(progressTimeout);

    switch (type) {
        case 1: //error retry
            $("#retryProgessBar").html("");
            $("#retryProgessBar").css("width", "50%");
            $("#retryButton").attr("disabled", "disabled");
            $("#retryButton").html('Retrying');
            break;

        case 2: //normal refresh
            $("#titleDate").fadeOut(100);
            $("#refreshProgressBar").css('width', '100%');
            break;
    }

    $.ajax({
        url: "http://navy.herokuapp.com/menu?status=webFetch&appVersion=1.0",
        success: function(data, textStatus) {
            $('#loadingProgress').stop().fadeOut(100); //need to stop the fadeIn() if ajax completes quick
            $('#titleRefresh').fadeIn(1000);
            var dateObj = new Date();
            $('#titleDate').html('Updated ' + getFullWeekdayFromIndex(dateObj.getDay()) + ' ' + formatDate(dateObj) + '&nbsp;&nbsp;');
            progressTimeout = setTimeout(function(){increment($('#refreshProgressBar'), 50, 5/3, 1000)}, 30000);
            console.log(textStatus);
            $('#menuList').html(createMenuCode(getNextThreeMeals(getNextTwoDayMenus(data))));
            $("#titleDate").stop().fadeIn(500);


            retryTimeout = setTimeout(function(){ajaxMenu(2)}, 60000);
        },
        error: function(date, textStatus, errorThrown) {
            $('#loadingProgress').stop().fadeOut(100);
            $('#errorDiv').fadeIn(1000);
            console.log(textStatus);
            $("#retryProgessBar").html("Retrying in 10 seconds");
            $('#errorBody').html('<div><p id="errorTitle">Menu backend is unreachable!</p> Browser provided following message<blockquote><p>' + textStatus + ' - ' + errorThrown + '</p></blockquote></div>');
            $("#retryProgessBar").css("width", "100%");
            $("#retryButton").removeAttr("disabled");
            $("#retryButton").html('Retry Now');
            retryTimeout = setTimeout(ajaxMenu(1), 10000);
        }
    });
}

function increment(progressBar, percent, inc, period) {
    progressBar.css('width', '' + percent + '%');
    if (percent < 101)
        progressTimeout = setTimeout(function(){increment($('#refreshProgressBar'), percent + inc, inc,  period)}, period);
}

function formatDate(dateObj) {
    var output = dateObj.getHours() + ':'
    if (dateObj.getMinutes() < 10) {
        output += '0' + dateObj.getMinutes();
    } else {
        output += dateObj.getMinutes();
    }
    if (dateObj.getSeconds() < 10) {
        output += ':0' + dateObj.getSeconds();
    } else {
        output += ':' + dateObj.getSeconds();
    }
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
        if (ntm[0][i]['title'] != '') {
            code += '<tr><td id="mealTableRow">' + ntm[0][i]['title'] + '</td></tr>'
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
    console.log(twoDays);
    for (var i = 0; i < 3; i++) {
        console.log(dayIndex + '|' + mealIndex);
        console.log(twoDays[dayIndex][mealAbbrArr[mealIndex]]);
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
        console.log(dateAbbr);
        twoDayMenus.push(weekMenu[dateAbbr]);


        if (weekdayIndex == 6) {
            weekdayIndex = 0;
        } else {
            weekdayIndex++;
        }
    }
    return twoDayMenus;
}
