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


Packaging & Installation
========================

You can build crow as an RPM:

	$ git clone https://github.com/DHTC-Tools/crow
	$ cd crow
	$ rpmbuild -ba package/crow.spec
	$ yum localinstall ~/rpmbuild/RPMS/noarch/crow*rpm

This will create an RPM based on the current clone at ~/rpmbuild/RPMS.

Collector
---------

The collector (bin/crow) should run out of the box.  It sets up an init
script at /etc/init.d/crow-collector.  If installing on a schedd
server, you may wish to run:

	$ sysconfig --add /etc/init.d/crow-collector
	$ sysconfig crow-collector on

Middleware
----------
The middleware works best with the Python module `parsedatetime'
installed; we recommend installing with pip (since it's not in
EPEL).

	$ pip install parsedatetime

Middleware also requires CherryPy to be installed.  It runs standalone,
listening on port 8081 by default.  You can configure this in
server/crow-server.conf.  We run it from the git directory directly;
it doesn't have a real installation location at present.

	$ server/crow-server


HTML
----
The HTML is how the visualization is served.  This is not presently
very highly configurable.  For insulation from cross-site scripting
protections in the browser, AJAX queries from the HTML always go to
the server the HTML was loaded from, to the path: `/service/mongo-crow/'.
In apache you can configure this path as a proxy to the Middleware
server's location.  For example, if the middleware runs on
www.example.org:8081, you could write:

	ProxyPass /service/mongo-crow  http://www.example.org:8081/


Misc
----
Both the collector and the middleware require access to a MongoDB
server.  You can configure the server params at /etc/crow.ini.  The
collector also needs to be configured at /etc/sysconfig/crow before
starting the service:

	$ service start crow-collector
