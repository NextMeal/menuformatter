package main

import (
	"encoding/json"
	"fmt"
	"strings"
	"net/http"
	"net/url"
	"time"
	"os"
	"log"
	"strconv"
	"github.com/garyburd/redigo/redis"
)

var deviceIdKey = "deviceId"
var deviceNameKey = "deviceName"
var seedCountKey = "seedCount"
var leachCountKey = "leachCount"
var goodRatioKey = "goodRatios"

func generateStatusResponse(status int, description string) string {
	//var statusString string
	var response []byte
	var err error
	//statusString = strconv.Itoa(status)
	if err != nil { fmt.Printf("Generating status response failed. %v", err.Error()) }
	response, err = json.Marshal(map[string]interface{}{"status" : status, "description" : description})
	if err != nil { fmt.Printf("Generating status response failed. %v", err) }
	return string(response);
}

func generateDataResponse(data interface{}) string {
	var response []byte
	var err error
	response, err = json.Marshal(map[string]interface{}{"status" : strconv.Itoa(0), "data" : data})
	if err != nil { fmt.Printf("Generating data response failed. %v", err) }
	return string(response);
}

func updateLeaderboardWithForm(form url.Values) error {
	deviceId := form[deviceIdKey]
	deviceName := form[deviceNameKey]

	if len(deviceId) > 0 && len(form[seedCountKey]) > 0 && len(form[leachCountKey]) > 0{
		var seedCount, leachCount int
		var goodRatio float64
		var err error
		if seedCount, err =  strconv.Atoi(form[seedCountKey][0]); err != nil { return err }
		if leachCount, err =  strconv.Atoi(form[leachCountKey][0]); err != nil { return err }

		//Compute good ratio
		if leachCount == 0 { leachCount = 1 }
		goodRatio = float64(seedCount) * float64(seedCount) / float64(leachCount);

		c := redisPool.Get()
		defer c.Close()
		
		if len(deviceName) == 0 {
			deviceName = []string{""}
		}

		if _, err = redis.String(c.Do("HMSET", strings.Join([]string{deviceIdKey, deviceId[0]}, ":"), deviceNameKey, deviceName[0], seedCountKey, seedCount, leachCountKey, leachCount)); err != nil { return err }
		if _, err = redis.Int(c.Do("ZADD", goodRatioKey, goodRatio, deviceId[0])); err != nil { return err }
	} else {
		//log.Println(generateStatusResponse(-1, "No leaderboard data. "))
	}

	return nil
}

func createLeaderboardResponse() string {
	c := redisPool.Get()
	defer c.Close()

	var goodRatioSortedSet []string
	var deviceNameArray []string
	var deviceScoreArray []float64
	var sortedNameAndScoreArray[]map[string]interface{}
	var output interface{}
	var outputArray []interface{}
	var err error

	if goodRatioSortedSet, err = redis.Strings(c.Do("ZREVRANGE", goodRatioKey, 0, -1)); err != nil { return generateStatusResponse(-1, err.Error()) }

	log.Println(goodRatioSortedSet)

	//Get device name from sorted device ID array
	c.Send("MULTI")
	for _, deviceId := range goodRatioSortedSet {
		log.Println(strings.Join([]string{deviceIdKey, deviceId}, ":"))
		c.Send("HGET", strings.Join([]string{deviceIdKey, deviceId}, ":"), deviceNameKey)
	}

	output, err = c.Do("EXEC")
	outputArray = output.([]interface{})
	deviceNameArray = make([]string, 0, len(goodRatioSortedSet))
	for _, outputString := range outputArray {
		deviceNameArray = append(deviceNameArray, string(outputString.([]uint8)))
	}

	//Get device score from sorted device ID array
	c.Send("MULTI")
	for _, deviceId := range goodRatioSortedSet {
		c.Send("ZSCORE", goodRatioKey, deviceId)
	}
	output, err = c.Do("EXEC")
	outputArray = output.([]interface{})
	deviceScoreArray = make([]float64, 0, len(goodRatioSortedSet))
	for _, outputString := range outputArray {
		var outputFloat float64
		if outputFloat, err = strconv.ParseFloat(string(outputString.([]uint8)), 32); err != nil { return generateStatusResponse(-1, err.Error())}
		deviceScoreArray = append(deviceScoreArray, outputFloat)
	}

	sortedNameAndScoreArray = make([]map[string]interface{}, 0, len(goodRatioSortedSet))
	for index, _ := range goodRatioSortedSet {
		log.Println(sortedNameAndScoreArray)
		deviceNameAndScoreMap := map[string]interface{}{"deviceName" : deviceNameArray[index], "deviceGoodRatio" : deviceScoreArray[index]}
		log.Println(deviceNameAndScoreMap)
		sortedNameAndScoreArray = append(sortedNameAndScoreArray, deviceNameAndScoreMap)
	}

	return generateDataResponse(sortedNameAndScoreArray)
}

func leaderboardHandler(w http.ResponseWriter, r *http.Request) {
    //bypass same origin policy
	w.Header().Set("Access-Control-Allow-Origin", "*")

	fmt.Fprintf(w, createLeaderboardResponse())
	fmt.Println("Leaderboard requested")
}

func createRedisPool() *redis.Pool {
	pool := redis.NewPool(func() (redis.Conn, error) {
		c, err := redis.DialURL(os.Getenv("REDIS_URL"))

		if err != nil {
			log.Println(err)
			return nil, err
		}

		return c, err
	}, maxIdleConnections)
	pool.TestOnBorrow = func(c redis.Conn, t time.Time) error {
        if time.Since(t) < time.Minute {
            return nil
        }
        _, err := c.Do("PING")
        return err
    }

	pool.MaxActive = maxConnections
	pool.IdleTimeout = time.Second * 10
	return pool
}