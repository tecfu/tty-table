# Using tty-table as a terminal application:

## Installation

```
$ sudo apt-get install nodejs 
$ npm install tty-table -g
```

## Example Usage


### Inline

- Pipe some inline data to tty-table:

```
echo '[["name","price"],["aapl",92.50],["ibm",120.15]]' | tty-table --format=json
```

### Files

- Pipe a csv file to tty-table via the command line:

```
$ cat examples/data/data.csv | tty-table 
```

### Streams

- Pipe a stream JSON to tty-table via the command line:

```
$ node examples/data/streamer.js | tty-table --format==JSON
```

*CSV is the default input format.


## Example Stream Output

![Terminal Example](https://cloud.githubusercontent.com/assets/7478359/15691533/39f5fed4-273e-11e6-81a6-533bd8dbd1c4.gif "Terminal Example") 

