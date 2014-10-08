var uri = URI(window.location.href);
var query = uri.query(true);

var params = {
	width: [$(window).width() - 50, parseInt], //800,
	height: [$(window).height() - 50, parseInt], //600,
	hours: [48, parseInt],
	minbin: [10, parseInt],
	pool: ['osg', String],
	project: ['all', String],
	user: ['all', String],
	groupby: ['ProjectName', String],
	rel: ['default', String],
	start: ['default', String],
	end: ['default', String],
};

var groupings = {
	'project': 'ProjectName',
	'user': 'Owner',
};

for (var key in params) {
	if (key in query) {
		params[key] = params[key][1](query[key]);
	}
	else {
		params[key] = params[key][0];
	}
}

function load() {
	$('#crowgraph').css({width: params.width, height: params.height});

	/* Start with one bin per hour */
	bins = params.hours;
	millis = 3600 * 1000;

	/* Bin width is chartwidth/bins.  If this is too small, then make fewer bins */
	while (params.width / bins < params.minbin) {
		bins /= 2;
		millis *= 2;
	}

	yLabels = {
		running: 'Jobs Running',
		started: 'Jobs Started',
		finished: 'Jobs Completed',
		queued: 'Jobs Enqueued',
	}

	var options = {
			chart: {
				renderTo: 'crowgraph',
				zoomType: 'xy',
				type: 'column',
				//margin: [ 60, 30, 45, 70 ],
				width: params.width,
				height: params.height
			},
			plotOptions: {
				column: {
					stacking: 'normal',
					pointPadding: 0.0,
					groupPadding: 0,
					pointInterval: millis,	/* how many millis per data point/bin */
				}
			},
			title: { text: '' },
			xAxis: { type: 'datetime', tickWidth: 0, gridLineWidth: 1, /* title: { text: 'Date' } */ },
			yAxis: { title: { text: yLabels[params.rel] } },
			legend: { align: 'left', verticalAlign: 'top', y: 10, floating: true, borderWidth: 0 },
			//exporting: {	   buttons: { contextButton: {	text: 'Export' } }, sourceHeight:1050, sourceWidth: 1485	},
			credits: { enabled: false },
			tooltip: { formatter: function() {
				return ('<b>' + this.series.name + '</b><br/>' +
					Highcharts.dateFormat('%a %d %b %Y, %H:%M', this.x) + ' UTC<br/>' +
					'Jobs: ' + this.y)
			} }
	}; 

	var failtimer = setTimeout(function () {
		$('#flying img').attr('src', 'standing.png').addClass('failed');
		$('#moon').css('background-color', '#c00');
		$('span.status').html('has failed. probably.');
	}, 45000);

	// why? $.ajaxSetup({async: false});
	$.ajax({
		type: "POST",
		url: "/service/mongo-crow/starts",
		data: JSON.stringify({
			"project": params.project,
			"user": params.user,
			"task": "all",
			"hours": params.hours,
			"pool": params.pool,
			"groupby": groupings[params.groupby],
			"bins": bins,
			"width": params.width,
			"rel": params.rel,
			"start": params.start,
			"end": params.end,
		}),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function(data) {
			clearTimeout(failtimer);
			$('#crowgraph').show();
			options.series = data.plot;
			chart = new Highcharts.Chart(options); 
			$('#flying').remove();
		},
		failure: function(errMsg) {
			alert(errMsg);
			$('#crowgraph').show();
		}
	});
}

$(document).ready(function() {
	$('#crowgraph').hide();

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

	load();
});
