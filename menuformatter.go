package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"strings"
	"net/http"
	"time"
	"math"
	"os"
	"log"
	"strconv"
	"flag"
)

type Day struct {
	breakfast *FoodNode
	lunch     *FoodNode
	dinner    *FoodNode
}

type FoodNode struct {
	next  *FoodNode
	title string
}

//https://www.mail-archive.com/google-docs-data-apis@googlegroups.com/msg00565.html
//var spreadsheetIds = []string{"685460203", "1565036888", "1997009880", "586035798", "1931583348", "1449430959"}
var spreadsheetIds = []string{"1", "2", "3", "4", "5", "6"} 

var dayNames = []string{"U", "M", "T", "W", "R", "F", "S"}

var mealLabels = []string{"BREAKFAST", "LUNCH", "DINNER"}

var dateLabels = []string{"-14", "-15"}

var jsonString = "{\"array\":[]}"

var foregroundCounter = 0

var backgroundCounter = 0

var unknownCounter = 0

var startTime = time.Now()

var broadcast = flag.String("broadcast", "", "broadcast message")

func (f *FoodNode) MakeArray() []string {
	var count = 0
	var pointer = f
	for pointer != nil {
		count++
		pointer = pointer.next
	}

	//fmt.Println(count)

	var returnArray = make([]string, count)

	pointer = f
	for i := 0; i < count; {
		returnArray[i] = pointer.title
		i++
		pointer = pointer.next
	}

	return returnArray
}

//return a json formatted string for a day struct
func (d Day) JSONString() string {
	//breakfast
	breakfast := string(`"B"` + ":" + "[")

	breakfastArray := d.breakfast.MakeArray()

	for i := range breakfastArray {
		foodItem := string("{" + `"title"` + ":" + `"` + breakfastArray[i] + `"` + "}")
		if i < len(breakfastArray)-1 {
			foodItem += ","
		}
		breakfast += foodItem
	}

	breakfast += "]"

	//lunch
	lunch := string(`"L"` + ":" + "[")

	lunchArray := d.lunch.MakeArray()

	for i := range lunchArray {
		foodItem := string("{" + `"title"` + ":" + `"` + lunchArray[i] + `"` + "}")
		if i < len(lunchArray)-1 {
			foodItem += ","
		}
		lunch += foodItem
	}

	lunch += "]"

	//dinner
	dinner := string(`"D"` + ":" + "[")

	dinnerArray := d.dinner.MakeArray()

	for i := range dinnerArray {
		foodItem := string("{" + `"title"` + ":" + `"` + dinnerArray[i] + `"` + "}")
		if i < len(dinnerArray)-1 {
			foodItem += ","
		}
		dinner += foodItem
	}

	dinner += "]"

	return breakfast + "," + lunch + "," + dinner
}

func updateMenu() {
	defer func() {
        if r := recover(); r != nil {
            fmt.Println("Error occured when updating menu:", r)
        }
    }()

	seconds := time.Now().Unix() / 60 / 60 / 24
	days := math.Floor(float64(seconds))
	weekNumber := math.Mod((days + 4 ) / 7 + 1, 6) + 3
	//fmt.Println(days);

	/*
	// read local file
	b, err := ioutil.ReadFile("week1.json")
	*/

	//must minus one because index of week n menu is actually n -1 since array starts at 0 instead of 1
	resp, err := http.Get("https://spreadsheets.google.com/feeds/list/117RRZoomI9peIgAEQmvMPjo6dPvAEcbP7qyoLprwEJc/" + spreadsheetIds[int64(weekNumber) % 6] + "/public/values?hl=en_US&alt=json")
	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()
	b, err := ioutil.ReadAll(resp.Body)

	var f interface{}
	err = json.Unmarshal(b, &f)
	if err != nil {
		panic(err)
	}

	m := f.(map[string]interface{})

	feed := m["feed"].(map[string]interface{})

	entries := feed["entry"].([]interface{})

	week := make([]Day, 7)

	dayIndex := -1

	for v := range entries {

		//fmt.Println(v)

		entry := (entries[v].(map[string]interface{}))

		title := (entry["title"]).(map[string]interface{})

		//check if the line is a date label like 14-MAY-14
		isDateLabel := false
		for i := range dateLabels {
			if strings.HasSuffix(title["$t"].(string), dateLabels[i]) {
				isDateLabel = true
			}
		}

		if isDateLabel == true {
			dayIndex++
		} else { //if it is not a date label, click, check the gsx$ key values

			breakfast := (entry["gsx$breakfast"]).(map[string]interface{})["$t"].(string)
			lunch := (entry["gsx$lunch"]).(map[string]interface{})["$t"].(string)
			dinner := (entry["gsx$dinner"]).(map[string]interface{})["$t"].(string)

			//check is gsx$ key value is the meal label like "BREAKFAST", etc
			isMealLabel := false
			for i := range mealLabels {
				if strings.HasSuffix(breakfast, mealLabels[i]) {
					isMealLabel = true
				}
				if strings.HasSuffix(lunch, mealLabels[i]) {
					isMealLabel = true
				}
				if strings.HasSuffix(dinner, mealLabels[i]) {
					isMealLabel = true
				}
			}
			if isMealLabel == true { //ignore meal labels
				continue
			}

			//add food item to linked list
			if dayIndex > -1 && dayIndex < 7 {

				//breakfast
				if week[dayIndex].breakfast == nil {
					week[dayIndex].breakfast = &FoodNode{nil, breakfast}
				} else {
					var pointer = week[dayIndex].breakfast
					for pointer.next != nil {
						pointer = pointer.next
					}
					pointer.next = &FoodNode{nil, breakfast}
				}

				//lunch
				if week[dayIndex].lunch == nil {
					week[dayIndex].lunch = &FoodNode{nil, lunch}
				} else {
					var pointer = week[dayIndex].lunch
					for pointer.next != nil {
						pointer = pointer.next
					}
					pointer.next = &FoodNode{nil, lunch}
				}

				//dinner
				if week[dayIndex].dinner == nil {
					week[dayIndex].dinner = &FoodNode{nil, dinner}
				} else {
					var pointer = week[dayIndex].dinner
					for pointer.next != nil {
						pointer = pointer.next
					}
					pointer.next = &FoodNode{nil, dinner}
				}
			}
		}
	}


	//create json formatted string for week menu
	jsonString = "{"

	for i := range dayNames {
		jsonString += `"` + dayNames[i] + `"` + ":" + "{"

		jsonString += week[i].JSONString()

		jsonString += "}"

		if i < len(dayNames)-1 {
			jsonString += ","
		}
	}

	jsonString += "}"

	//fmt.Println(time.Now().Format("2006-01-02 15:04:05 -0700") + " menu updated.")
}

func broadcastHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, *broadcast)
	//fmt.Println("Broadcast requested")
}

func menuHandler(w http.ResponseWriter, r *http.Request) {
    if strings.Contains(r.URL.Path[1:], "favicon") {
		fmt.Fprintf(w, "")
		return
	} else {
		fmt.Fprintf(w, jsonString)
		//fmt.Println(time.Now().Format("2006-01-02 15:04:05 -0700") , " loaded path " , r.URL.Path[1:] , "\nCounter: " , counter)
	}
    
    r.ParseForm()
	
	appStatus := r.Form["status"]
	
	if appStatus != nil && len(appStatus) > 0 && appStatus[0] != "" {
	    for _, s := range appStatus {
	        if s == "backgroundFetch" {
	            backgroundCounter++
	            break;
	        } else if s == "foreground" {
	            foregroundCounter++
	            break;
	        }
	    }  
	} else { //no status parameter or empty status parameter
	    unknownCounter++
	}
}

func aboutHandler(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "https://github.com/ansonl/menuformatter", http.StatusFound)
	fmt.Println("About requested")
}

func uptimeHandler(w http.ResponseWriter, r *http.Request) {
	diff := time.Since(startTime)

	fmt.Fprintf(w, "" + "Uptime:\t" + diff.String() + "\nMenus served [foreground]:\t" + strconv.Itoa(foregroundCounter)+ "\nMenus served [background]:\t" + strconv.Itoa(backgroundCounter)+ "\nMenus served [unknown]:\t" + strconv.Itoa(unknownCounter) + "\n")
	fmt.Println("Uptime requested")
}

func server() {
	http.HandleFunc("/broadcast/", broadcastHandler)
	http.HandleFunc("/menu", menuHandler)
	http.HandleFunc("/", menuHandler)
	http.HandleFunc("/about", menuHandler)
	http.HandleFunc("/uptime", uptimeHandler)
	
	//http.ListenAndServe(":8080", nil)
    
    err := http.ListenAndServe(":"+os.Getenv("PORT"), nil) 
    fmt.Println("Listening on " + os.Getenv("PORT"))
    if err != nil {
      log.Fatal(err)
    }    
}

func main() {

	flag.Parse();

	go server()

	go updateMenu()
	t := time.NewTicker(30 * time.Second)

	for now := range t.C {
		now = now
		go updateMenu()

		//fmt.Println("Counter ", counter)
	}
	
	fmt.Println("server end")

}
