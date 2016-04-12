# MARS

Monash Audience Response System


## Setup
* Run `npm install`

## Development Environment
From repository root:
* `gulp watch`
* `nodemon`

## Monash Production Environment
* Ensure MongoDB is running with `service mongod start`
* Run the MARS service `service mars start`


### Dev Notes:
* Please use $log and log rather than console
* We are using John Papa's [Angular 1 Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md)
* Requirements: NodeJS v4+, MongoDB v3.2+
