var uri = URI(window.location.href);
var query = uri.query(true);

var params = {
	width: [$(window).width() - 50, parseInt], //800,
	height: [$(window).height() - 50, parseInt], //600,
	hours: [48, parseInt],
	minbin: [10, parseInt],
	//maxbin: [40, parseInt],
	pool: ['osg', String],
	project: ['all', String],
	user: ['all', String],
	groupby: ['ProjectName', String],
	rel: ['default', String],
	start: ['default', String],
	end: ['default', String],
	nocontrol: ['false', bool],
	current: ['false', bool],
	binwidth: [0, parseInt],
	tzoff: [0, parseInt],
};

var groupings = {
	'project': 'ProjectName',
	'user': 'Owner',
};

// calculate base URL from current page
var baseURL = window.location.href;
var off = baseURL.indexOf('?');
if (off > -1)
	baseURL = baseURL.substr(0, off);

var controlparams = {
	pool: ['osg', 'atlas', 'duke', 'uchicago'], // 'cms', 'umich'],
	groupby: ['user', 'project'],
	rel: ['running', 'submitted', 'started', 'finished'],
	//width: null,
	//height: null,
	start: null,
	//end: null,
	hours: [1, 2, 4, 8, 16, 24, 48, 72, 168, 720, 8760],
	//minbin: null,
};

function bool(v) {
	if (v == 'true')
		return true;
	if (v == 'on')
		return true;
	if (v == 'yes')
		return true;
	if (parseInt(v) == 1)
		return true;
	return false;
}

function initcontrols() {
	for (var key in controlparams) {
		var node = $('#' + key);
		if (controlparams[key] === parseInt(controlparams[key])) {
			node.val(controlparams[key]);
		}
		else if (controlparams[key] === String(controlparams[key])) {
			node.val(controlparams[key]);
		}
		else if (controlparams[key] === null) {
			node.val('');
		}
		else if ('length' in controlparams[key]) {
			for (var i in controlparams[key]) {
				var value = controlparams[key][i];
				var option = $('<option>')
					.attr('value', value)
					.text(value);
				node.append(option);
			}
			if (controlparams[key].indexOf(params[key]) > -1)
				node.val(params[key]);  /* select option if option is valid */
		}
		node.keyup(update);
		node.change(update);
	}
	$('#moreopts').change(update);
	$('#nocache').change(update);
	update();
}

function getvalue(key) {
	return $('#' + key).val();
}

var gotoURL = '';
function update() {
	var url = baseURL + '?';
	for (var key in controlparams) {
		var val = getvalue(key);
		if (val === null)
			1;
		else if (val == "")
			1;
		else
			url += '&' + key + '=' + encodeURI(getvalue(key));
	}

	if ($('#moreopts').prop('checked'))
		$('#controls .optional').show();
	else
		$('#controls .optional').hide();

	if ($('#nocache').prop('checked'))
		url += '&current=true';

	url = url.replace('?&', '?');
	gotoURL = url;
}

function reload () {
	window.location.href = gotoURL;
}

function toggleopts () {
}

function load() {
	/* Set local timezone for data */
	var date = new Date();
	Highcharts.setOptions({
		global: {
			useUTC: false,
			timezoneOffset: date.getTimezoneOffset(),
		}
	});

	$('#crowgraph').css({width: params.width, height: params.height});

	if (params.binwidth == 0) {
		/* boundary is the multiple at which bin boundaries should be set.
		 * Normally this is computed by the server based on bin width. That's
		 * what boundary=0 implies.  */
		boundary = 0;

		/* Start with one bin per minute */
		basebins = params.hours * 60;
		basebinwidth = 60;

		/* Column width is chartwidth/bins.  Scale up by reasonable increments
		 * until column width > minbin.
		 * N.B. This MUST match with the values in the "sanitime" function
		 * in crow-server!  */
		increments = [1, 2, 5, 10, 15, 20, 30, 60, 2*60, 3*60, 4*60, 6*60, 12*60, 24*60, 7*24*60];
		for (var inc in increments) {
			inc = increments[inc];
			bins = basebins / inc;
			binwidth = basebinwidth * inc;
			if (params.width / bins >= params.minbin)
				break;
		}

		/* If we still haven't hit it, start going by whole weeks */
		var n = 0;
		while (params.width / bins < params.minbin) {
			n += 1;
			bins = basebins / (n * 10080);
			binwidth = basebinwidth * (n * 10080);
		}
	}
	else {
		/* If given, binwidth is in minutes. Convert to seconds. */
		binwidth = params.binwidth * 60;
		bins = params.hours * 60 * 60 / binwidth;

		/* boundary is the multiple at which bin boundaries should be set.
		 * Normally this is computed by the server based on bin width. If
		 * an explicit binwidth is set, we'll set boundary to the same. */
		boundary = binwidth;
	}

	/* temp - debug */
	console.log('inc = ' + inc);
	console.log('n = ' + n);
	console.log('hours = ' + params.hours);
	console.log('bins = ' + bins);
	console.log('binwidth = ' + binwidth);

	yLabels = {
		running: 'Jobs Running',
		started: 'Jobs Started',
		finished: 'Jobs Completed',
		submitted: 'Jobs Submitted',
	}

	function plotdata(targetID, data) {
		params.width = $(window).width() - 50;
		params.height = $(window).height() - 50;

		/* Hide the controls? */
		if (params['nocontrol'] == true) {
			$('#controls').hide();
		}
		else {
			$('#controls').show();
			params.height -= $('#controls').height();
		}

		var options = {
			chart: {
				renderTo: targetID,
				zoomType: 'xy',
				type: 'column',
				//margin: [ 60, 30, 45, 70 ],
				width: params.width,
				height: params.height,
			},
			plotOptions: {
				column: {
					stacking: 'normal',
					pointPadding: 0.0,
					groupPadding: 0,
					pointInterval: binwidth * 1000,	/* how many millis per data point/bin */
				}
			},
			title: { text: '' },
			xAxis: { type: 'datetime', tickWidth: 0, gridLineWidth: 1, title: { text: 'Date/Time (local to you)' } },
			yAxis: { title: { text: yLabels[params.rel] } },
			legend: { align: 'left', verticalAlign: 'top', y: 10, floating: true, borderWidth: 0 },
			disabled_exporting: {
				buttons: {
					contextButton: {
						text: 'Export'
					}
				},
				sourceHeight: 1050,
				sourceWidth: 1485,
			},
			credits: { enabled: false },
			tooltip: { formatter: function() {
				return ('<b>' + this.series.name + '</b><br/>' +
					Highcharts.dateFormat('%a %d %b %Y, %H:%M', this.x) + '<br/>' +
					'Jobs: ' + this.y)
			} }
		}; 

		options.series = data.plot;
		try {
			chart = new Highcharts.Chart(options); 
		} catch(e) {
			console.log(e);
		}
	}

	function dumplog(data) {
		if (! ('log' in data))
			return;
		for (var i in data.log)
			console.log('SERVER LOG: ' + data.log[i]);
	}

	var failtimer = setTimeout(function () {
		$('#flying img').attr('src', 'standing.png').addClass('failed');
		$('#moon').css('background-color', '#c00');
		$('span.status').html('has failed. probably.');
	}, 90000);

	// why? $.ajaxSetup({async: false});
	$.ajax({
		type: "POST",
		url: "/service/mongo-crowdev/starts",
		data: JSON.stringify({
			"project": params.project,
			"user": params.user,
			"task": "all",
			"hours": params.hours,
			"pool": params.pool,
			"groupby": groupings[params.groupby],
			//"bins": bins,
			"binwidth": binwidth,
			"boundary": boundary,
			"width": params.width,
			"rel": params.rel,
			"start": params.start,
			"end": params.end,
			"current": params.current,
			"tzoff": params.tzoff,
		}),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function(data) {
			clearTimeout(failtimer);
			$('#crowgraph').show();
			plotdata('crowgraph', data);
			$('#flying').remove();
			$(window).resize(function () {
				plotdata('crowgraph', data);
			});
			dumplog(data);
		},
		failure: function(errMsg) {
			alert(errMsg);
			$('#crowgraph').show();
		}
	});
}

$(document).ready(function () {
	for (var key in params) {
		if (key in query) {
			params[key] = params[key][1](query[key]);
		}
		else {
			params[key] = params[key][0];
		}
	}

	$('#controls .optional').hide();

	initcontrols();
	$('#flying').hide();
	load();
});

	// delay the crow animation by 2s in case response is quick
	setTimeout(function () {
		//$('#crowgraph').hide();
		$('#flying').show();

		// get title elements
		var name = $('.name');
		var status = $('span.status');

		// get ratio of name's width to font size
		name.css('font-size', '200%');
		var r = name.width() / 200.0;

		// compute ratio of status's width to that ratio
		var sz = status.width() / r;
		// and set the f-s to that value
		name.css('font-size', '' + sz + '%');

		// do it again for fine adjustments
		var r = name.width() / sz;
		var sz = status.width() / r;
		name.css('font-size', '' + sz + '%');

	}, 2000);
