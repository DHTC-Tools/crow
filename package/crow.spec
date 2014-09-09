Name:		crow
Version:  20140909git8e27bd0
Release:	1%{?dist}
Summary: Crow is a monitoring toolkit for HTCondor
Group:	 System Environment/Daemons
License: MIT
URL:	   https://github.com/DHTC-Tools/crow	
Source0:	%{name}.20140909git8e27bd0.tar.gz
BuildRoot:	%(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)
BuildArch: noarch
Requires: pymongo condor
%if 0%{?rhel} > 5
Requires: python-pymongo condor
%endif

%description
Crow is a monitoring toolkit for HTCondor

%prep
%setup -q -n %{name}

%build

%install
ls -lha
mkdir -p %{buildroot}%{_bindir}
mv crow %{buildroot}%{_bindir}
mv qcrow %{buildroot}%{_bindir}
mv etc/init.d/crow %{buildroot}%{_initddir}
mv etc/sysconfig/crow %{_sysconfdir}/sysconfig/crow

%clean
rm -rf %{buildroot}


%files
%defattr(-,root,root,-)
%doc README.md LICENSE
%{_bindir}/crow
%{_bindir}/qcrow
%{_initddir}/crow
%{_sysconfdir}/sysconfig/crow


%changelog
* Tue Sep 09 2014 Lincoln Bryant <lincolnb@hep.uchicago.edu>
- First official build with init script et cetera.
