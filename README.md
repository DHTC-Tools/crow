crow
====

Crow is a monitoring toolkit for HTCondor. It consists of three components:
* collector (`.../bin/`)
* middleware server (`.../server/`)
* html frontend (`.../html`)

Collector
---------
The collector, `crow`, runs on an HTCondor submit node (alongside a
schedd).  It runs two instances in parallel: a **history** collector and
a **queue** collector.  The history collector watches HTCondor's schedd
history files and periodically (30 seconds default, configurable) updates
a MongoDB collection (table) with each completed job.  The queue collector
watches the schedd's current job queue and updates MongoDB with queued,
but incomplete jobs.  The full ClassAd set for each job is stored.[1]

An init script starts up the collector's twin processes. A configuration
file, `crow.ini`, tells how and how often to select jobs, where to store
them, and can optionally define certain permutations on job metadata
tobe performed prior to table insertion.

HTML
----

Web front-ends aggregate, slice, analyze, and present data collected
by `crow` and stored into MongoDB. They may or may not provide
user-manipulable knobs.  There is presently only one front-end
with several GET query-param controls, but there could be several.
It's also reasonable to create terminal-mode analytics tools; this is
on our landscape.

The current `jobchart.html` uses the Highcharts JavaScript plotting
library to render interactive plots.  It retrieves data from MongoDB
via an HTTP middleware.

Middleware
----------

`crow-server` is a CherryPy application that brokers HTTP requests for
data to MongoDB queries, slices and dices, and returns the data as a JSON
object structure for consumption by Highcharts.  It takes control/query
parameters as JSON POST data.  There are dozens of combinations available
from crow-server.  Mostly these are reflected in the `jobchart.html` layer
as well, so that they are available to anyone GETting a jobchart view.


[1] Detail: historical jobs are complete records, and the
coll.jobs.[].latest object identifies the final ClassAd state.
Queued jobs' ClassAds update continuously, so each cycle updates the
latest record with the most recent ClassAd state.  At certain other
transitional points (job status changes), the ClassAd set is also stored
to coll.jobs.[].history.

