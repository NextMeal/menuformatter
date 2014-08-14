<h2>Google Spreadsheet parser for USNA galley menu</h2>

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


- Listens on port specified in `$PORT` environment variable.

- Written in Go!
