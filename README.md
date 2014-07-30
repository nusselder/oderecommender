# ODE-II / WP5 / Recommender

**Initial setup with rest interface, without actual recommendation, for testing.**

Basic recommender system for venues in Amsterdam, with a time constraint.
Setup for use within the [ODE II](http://www.amsterdamopendata.nl/web/guest/about-the-programme) (Dutch) project.

Using [node.js](http://nodejs.org/) server and [Redis](http://redis.io/) database.

See [http://ode.politicalmashup.nl/rec/](http://ode.politicalmashup.nl/rec/) for API.


## Setup node/redis

To install software and start server on port 8005, use `./install.sh`.
To test the server response, use `./test_response.sh`.

To add a small set of dummy data (88K), use:

    gunzip -c data_sample.csv.gz > data_sample.csv
    ./post_data_sample.sh

To add a large set of dummy data (32MB), use:

    wget --no-check-certificate "https://www.dropbox.com/s/8or7yiua66c8r56/AmsterdamCardSimulatedData.csv?dl=1" -O data_sample.csv
    ./post_data_sample.sh

Tested on CentOS 6.5 and Linux Mint 15 Olivia. It probably requires some default built-tools etc.

