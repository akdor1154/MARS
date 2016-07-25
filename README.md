# MARS

Monash Audience Response System


## Setup
* Install Node.js and MongoDB (with npm)
* Run `npm install` to install all components needed
* Run `npm start` to start the web server

## Development Environment
From repository root:
* `gulp watch`
* `nodemon`

## Monash Production Environment
* Ensure MongoDB is running with `service mongod start`. If that command doesn't work, `mongod` can be started manually in the command line.
* Run the MARS service `service mars start`


### Dev Notes:
* Please use $log and log rather than console
* We are using John Papa's [Angular 1 Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md)
* Requirements: NodeJS v4+, MongoDB v3.2+
