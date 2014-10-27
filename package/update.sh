#!/bin/sh
#
# No longer used.
#

date=$(date +%Y%m%d)
set -x

# uninstall old pkg
rpm -e crow

# make new pkg
./package/maketar.sh HEAD || exit 1
mv crow.${date}gitHEAD.tar.gz ~/rpmbuild/SOURCES/ || exit 1
rpmbuild -ba package/crow.spec || exit 1

# install new pkg
rpm -ip ~/rpmbuild/RPMS/noarch/crow-${date}gitHEAD-1.el6.noarch.rpm

mv /etc/sysconfig/crow.rpmsave /etc/sysconfig/crow || exit 1
mv /etc/crow.ini.rpmsave /etc/crow.ini || exit 1
