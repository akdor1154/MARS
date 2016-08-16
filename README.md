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

## Git Workflow Guidelines (WIP)
* Clone the repository using `git clone git@github.com:SLC3/MARS.git`
* Create a branch for the feature or bug fix you are about to work on using `git checkout -b dev-feature-1 master` (note: `-b` creates a new branch if none already exists)
* Make changes and add/commit regularly to the branch using `git add <filename>` and `git commit`. This can be done through your IDE or a Git GUI client if you prefer.
* Push your commits to the remote repository after each coding session using `git push -u origin dev-feature-1`. (note: you can just use `git push` after you've set the remote with `-u origin dev-feature-1` on your first push)
* Deploy your branch on pollme.xyz and notify the team when you're ready to integrate your feature. We'll discuss issues through the pull request on GitHub.

Note: If you are working on a long running feature branch (i.e. more than two weeks), run `git merge master` from your feature branch once a week to ensure that your branch and master don't diverge too far.

### Development Notes
* We are using John Papa's [Angular 1 Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md)
* Use $log (client side) and log (server side) rather than console.

## Requirements
* NodeJS v4+
* MongoDB v3.2+
* Python 2.x

Note: Windows users will need the options for C# and C++ installed with their Visual Studio instance
