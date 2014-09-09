Name:		crow
Version:	0140909giteaf502d
Release:	1%{?dist}
Summary: Crow is a monitoring toolkit for HTCondor
Group:	 System Environment/Daemons
License: MIT
URL:	   https://github.com/DHTC-Tools/crow	
Source0:	%{name}.20140909giteaf502d.tar.gz
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
mkdir -p %{buildroot}%{_defaultdocdir}/%{name}-%{version}
mv crow %{buildroot}%{_bindir}
mv qcrow %{buildroot}%{_bindir}
mv README.md LICENSE %{buildroot}%{_defaultdocdir}/%{name}-%{version}

%clean
rm -rf %{buildroot}


%files
%defattr(-,root,root,-)
%{_bindir}/crow
%{_bindir}/qcrow
%{_defaultdocdir}/%{name}-%{version}/README.md
%{_defaultdocdir}/%{name}-%{version}/LICENSE



%changelog
* Tue Sep 09 2014 Lincoln Bryant <lincolnb@hep.uchicago.edu>
- Really weird first build
