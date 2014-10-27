#!/bin/sh
#
# No longer used.
#

version=${1-HEAD}
tarball=crow.$(date +%Y%m%d)git${version}.tar.gz
dir=$(dirname "$0")
cd $dir/..
git archive --format tar --prefix=crow/ ${version} . |
gzip -9 > $tarball
