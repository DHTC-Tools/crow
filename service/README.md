Services
========

Crow daemons can be run under D.J.Bernstein's supervise (daemontools).
This (or some similar task manager) is advisable in particular for
crow-server, which is critical to the overall service operation and
should not be permitted to exit permanently.

To run under sueprvise, you must first install daemontools from source
or your supplier's distribution packages.  Then:

* to manage crow-server:
	ln -s /path/to/crow/services/crow-server /services/crow-server

* to manage crow-collector:
	ln -s /path/to/crow/services/crow-collector /services/crow-collector
