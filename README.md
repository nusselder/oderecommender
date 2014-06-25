# ODE-II / WP5 / Recommender

**Initial setup with rest interface, without actual recommendation, for testing.**

Basic recommender system for venues in Amsterdam, with a time constraint.
Setup for use within the [ODE II](http://www.amsterdamopendata.nl/web/guest/about-the-programme) (Dutch) project.

Using [node.js](http://nodejs.org/) server and [Redis](http://redis.io/) database.

See [http://ode.politicalmashup.nl/rec/](http://ode.politicalmashup.nl/rec/) for API.


## Setup node/redis

To install software and start server on port 8004, use `./install.sh`.
Then add some dummy data with `./test_dummy.sh`.

Tested on CentOS 6.5 and Linux Mint 15 Olivia. It probably requires some default built-tools etc.

