USNA King Hall galley Google Spreadsheet menu parser for Next Meal
======

Getting the Next Meal app 
------
 - [Next Meal iOS app](https://itunes.apple.com/us/app/next-meal-app/id779302741?mt=8)
 - [Next Meal Android app](https://play.google.com/store/apps/details?id=com.pepinonline.nextmeal)
 - [Next Meal Pebble app](http://apps.getpebble.com/en_US/application/54ffb9650bde9a0d850000ac)
 - [Next Meal web app](http://nextmeal.github.io/menuformatter/)

Using the Next Meal API
------
[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/ansonl/menuformatter)

- Galley menu located [here](https://docs.google.com/a/usna.edu/spreadsheets/d/117RRZoomI9peIgAEQmvMPjo6dPvAEcbP7qyoLprwEJc/).
  - Feed
    - add /GIDHERE/public/values?hl=en_US&alt=json
    - [example](https://spreadsheets.google.com/feeds/list/117RRZoomI9peIgAEQmvMPjo6dPvAEcbP7qyoLprwEJc/1/public/values?hl=en_US&alt=json).


- Each week has a different spreadsheet GID.
  - Spreadsheet IDs increment by one from 1 - 6.

- Formats into a JSON dictionary of days of the week.
  - Each day is a dictionary of meals.
    - Each meal is an array of items.

Usage
------
  - `/menu`
	    - The current week's menu in JSON.
  - `/menu2`
	    - The next week's menu in JSON.
  - `/uptime`
	    - Program uptime and requests served.
  - `/broadcast`
	    - Any system messages for users to be notified about in plaintext.
	    - Broadcasts may be specified in `-broadcast` command argument .


- Listens on port specified in `$PORT` environment variable.

- Written in Go!
