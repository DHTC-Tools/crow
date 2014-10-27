#
# This spec file is now all you need.
#   $ rpmbuild -ba package/crow.spec
# The current checked-out revision will be built.
#

%global headrev %(git rev-parse HEAD)
%global short %(c=%{headrev}; echo ${c:0:6})
%global date %(date +%Y%m%d)

Name:		crow
Version:	0.%{date}.%{short}
Release:	1%{?dist}
Summary: Crow is a monitoring toolkit for HTCondor
Group:	 System Environment/Daemons
License: MIT
URL:	   https://github.com/DHTC-Tools/crow	
#Source0:	%{name}-%{short}.tar.gz
BuildRoot:	%(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)
BuildArch: noarch
Requires: pymongo condor
%if 0%{?rhel} > 5
Requires: python-pymongo condor
#Suggests: py-setproctitle
%endif

%description
Crow is a monitoring toolkit for HTCondor.

%prep
#%setup -q -n %{name}

%build

%install
# this is all very weird and probably very wrong
rm -rf %{buildroot}
mkdir -p %{buildroot}%{_bindir}
mkdir -p %{buildroot}%{_sysconfdir}
mkdir -p %{buildroot}%{_sysconfdir}/sysconfig
mkdir -p %{buildroot}%{_sysconfdir}/init.d
mkdir -p %{buildroot}%{_defaultdocdir}/%{name}-%{version}
mkdir -p %{buildroot}/var/lib/crow
(
	cd "$OLDPWD"
	cp -p bin/crow %{buildroot}%{_bindir}/
	cp -p bin/qcrow %{buildroot}%{_bindir}/
	cp -p README.md LICENSE %{buildroot}%{_defaultdocdir}/%{name}-%{version}
	cp -p etc/sysconfig %{buildroot}%{_sysconfdir}/sysconfig/crow
	cp -p etc/crow.ini.example %{buildroot}%{_sysconfdir}/crow.ini
	cp -p etc/crow.ini.example %{buildroot}%{_sysconfdir}/crow.ini.example
	cp -p etc/init.d/* %{buildroot}%{_sysconfdir}/init.d/
	cp -pr server html %{buildroot}/var/lib/crow
)

%clean
rm -rf %{buildroot}

%files
%defattr(-,root,root,-)
%{_bindir}/crow
%{_bindir}/qcrow
%{_defaultdocdir}/%{name}-%{version}/README.md
%{_defaultdocdir}/%{name}-%{version}/LICENSE
%config %{_sysconfdir}/sysconfig/crow
%config %{_sysconfdir}/crow.ini
%{_sysconfdir}/crow.ini.example
%{_sysconfdir}/init.d/crow-collector
%{_sysconfdir}/init.d/crow-server
/var/lib/crow/html/
/var/lib/crow/server/

# insanity
%changelog
%(git log --date=raw --no-merges --format="* %%cd %%an <%%ae>%%%%- %%s%%%%" | tr %% '\012' | awk '/^*/ {"date -d@"$2" '"'+%%a %%b %%d %%Y'"'" | getline d; $2 = d; $3 = "";} {print;}')
