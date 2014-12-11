Services
========

Crow daemons can be run under D.J.Bernstein's supervise (daemontools).
This (or some similar task manager) is advisable in particular for
crow-server, which is critical to the overall service operation and
should not be permitted to exit permanently.

To run under sueprvise, you must first install daemontools from source
or your supplier's distribution packages.  It is suggested to put the
crow materials under /var/lib/crow.  (An RPM built from the distributed
.spec file will do this.)  Then:

* to manage crow-server:
	ln -s /var/lib/crow/services/crow-server /services/crow-server

* to manage crow-collector:
	ln -s /var/lib/crow/services/crow-collector-queue /services/crow-collector-queue
	ln -s /var/lib/crow/services/crow-collector-history /services/crow-collector-history
