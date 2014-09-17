Name:		crow
Version:	20140917gitHEAD
Release:	1%{?dist}
Summary: Crow is a monitoring toolkit for HTCondor
Group:	 System Environment/Daemons
License: MIT
URL:	   https://github.com/DHTC-Tools/crow	
Source0:	%{name}.%{version}.tar.gz
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
# this is all very weird and probably very wrong
rm -rf %{buildroot}
mkdir -p %{buildroot}%{_bindir}
mkdir -p %{buildroot}%{_sysconfdir}
mkdir -p %{buildroot}%{_sysconfdir}/sysconfig
mkdir -p %{buildroot}%{_sysconfdir}/init.d
mkdir -p %{buildroot}%{_defaultdocdir}/%{name}-%{version}
cp -p crow %{buildroot}%{_bindir}
cp -p qcrow %{buildroot}%{_bindir}
cp -p README.md LICENSE %{buildroot}%{_defaultdocdir}/%{name}-%{version}
cp -p etc/sysconfig %{buildroot}%{_sysconfdir}/sysconfig/crow
cp -p etc/crow.ini %{buildroot}%{_sysconfdir}/crow.ini.example
cp -p etc/initcrow %{buildroot}%{_sysconfdir}/init.d/crow

%clean
rm -rf %{buildroot}


%files
%defattr(-,root,root,-)
%{_bindir}/crow
%{_bindir}/qcrow
%{_defaultdocdir}/%{name}-%{version}/README.md
%{_defaultdocdir}/%{name}-%{version}/LICENSE
%{_sysconfdir}/sysconfig/crow
%{_sysconfdir}/crow.ini.example
%{_sysconfdir}/init.d/crow



%changelog
* Tue Sep 09 2014 Lincoln Bryant <lincolnb@hep.uchicago.edu>
- Really weird first build
