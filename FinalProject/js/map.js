// Global variables
let map;
let lat = 0;
let lon = 0;
let zl = 3;
let path = '';
let path2 = "data/DataMerge_2017.csv"
let markers = L.featureGroup();
let highpollution_markers = L.featureGroup();
let lowpollution_markers = L.featureGroup();
let layer_control;


// put this in your global variables
let geojsonPath = 'data/PollutionLevel.json';
let geojson_data;
let geojson_layer;

let brew = new classyBrew();
let fieldtomap=`pollution_level`;

let legend = L.control({position: 'bottomright'});
let info_panel = L.control();


// initialize
$( document ).ready(function() {
	createMap(lat,lon,zl);
	//getGeoJSON();
	//readCSV(path2);
});

//make pollution choropleth map
function pollutionMap() {
	if (geojson_layer) {geojson_layer.clearLayers();}
	lowpollution_markers.clearLayers()
	highpollution_markers.clearLayers()
	getGeoJSON();
}

//make death rate map
function deathRate() {
	if(geojson_layer) {geojson_layer.clearLayers();}
	lowpollution_markers.clearLayers()
	highpollution_markers.clearLayers()
	readCSV(path2);
}

//both maps
function bothMaps() {
	if(geojson_layer) {geojson_layer.clearLayers();}
	lowpollution_markers.clearLayers()
	highpollution_markers.clearLayers()
	getGeoJSON();
	readCSV(path2);
}

// create the map
function createMap(lat,lon,zl){
	map = L.map('map').setView([lat,lon], zl);

	L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
	{
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'dark-v10',
		tileSize: 512,
		zoomOffset: -1,
		accessToken: 'pk.eyJ1IjoibmF0Z3JhY2UiLCJhIjoiY2tvOTFhOGhyMWNkdjJvcW54c2dqbWdtNSJ9.nqW3nHZCwe2PUcfo4Pr5kw'
	}).addTo(map);

}
// function to read csv data
function readCSV(path){
	Papa.parse(path, {
		header: true,
		download: true,
		complete: function(data) {
			console.log(data);
			
			// map the data
			mapCSV(data);

		}
	});
}



function mapCSV(data){
if(markers){markers.clearLayers();}
    let circleOptionsHigh = {
        radius: 5,
        weight: 1,
        color: 'white',
        fillColor: '#FF6962',
        fillOpacity: 1,
        //radius: item['Outdoor.air.pollution..IHME..2019.']*100
    }

    let circleOptionsLow = {
        radius: 5,
        weight: 1,
        color: 'white',
        fillColor: '#5EA777',
        fillOpacity: 1,
        //radius: item['Outdoor.air.pollution..IHME..2019.']*100
    }

	data.data.forEach(function(item,index){
		if(item['Outdoor.air.pollution..IHME..2019.'] > 6.00){
			//circleOptions.radius = item['Outdoor.air.pollution..IHME..2019.'] * 100
			//circleOptions.fillColor = 'red'
			let highpollution_marker = L.circleMarker([item.latitude,item.longitude], circleOptionsHigh).bindPopup(`${item.country}<br> Percentage of Deaths due to Pollution: ${item['Outdoor.air.pollution..IHME..2019.']}`).on('mouseover',function(){
				this.openPopup()
		})
	
		highpollution_markers.addLayer(highpollution_marker)
	
		//add entry to sidebar
		//$('.sidebar').append(`<img src="${item.thumbnail_url}" onmouseover="panToImage(${index})">`)
	}
	
	else{
		//circleOptions.radius = item['Outdoor.air.pollution..IHME..2019.'] * 100
		//circleOptions.fillColor = 'green'
		let lowpollution_marker = L.circleMarker([item.latitude,item.longitude], circleOptionsLow).bindPopup(`${item.country}<br> Percentage of Deaths due to Pollution: ${item['Outdoor.air.pollution..IHME..2019.']}`).on('mouseover',function(){
			this.openPopup()
	})
	
	lowpollution_markers.addLayer(lowpollution_marker)
	
	}
	
	highpollution_markers.addTo(map);
	lowpollution_markers.addTo(map);


	})
	
	let addLayers = {
		"High Death Rates": highpollution_markers,
		"Low Death Rates": lowpollution_markers,
		//"Pollution Level": geojson_layer
	}
	
	if(!layer_control){
		layer_control =L.control.layers(null,addLayers).addTo(map);
	}
	
	map.fitBounds(lowpollution_markers.getBounds());

	let povertyMarker = {
        color: '#4A2C74',
        fillColor: '#4A2C74',
    }

	// Highest Poverty Level Marker
	var marker = L.marker([22.5937, 78.9629], povertyMarker).addTo(map);
	var popup1 = marker.bindPopup('<b>India</b><br />Country with the Highest Poverty Rate (2011): 21.2');
	
	// Lowest Poverty Level Marker
	var marker = L.marker([58.1304, -106.3468], povertyMarker).addTo(map);
	var popup = marker.bindPopup('<b>Canada</b><br />Country with the Lowest Poverty Rate (2013): 0.5');

	popup.openPopup();	

}

// function to get the geojson data
function getGeoJSON(){

	$.getJSON(geojsonPath,function(data){
		console.log(data)

		// put the data in a global variable
		geojson_data = data;

		// call the map function
		mapGeoJSON(fieldtomap,5, 'Purples',`quantiles`) // add a field to be used
	})
}

function mapGeoJSON(field, num_classes, color,scheme){

	// clear layers in case it has been mapped already
	if (geojson_layer){
		geojson_layer.clearLayers()
	}
	
	// globalize the field to map
	fieldtomap = field;

	// create an empty array
	let values = [];

	// based on the provided field, enter each value into the array
	geojson_data.features.forEach(function(item,index){
		if(item.properties[field] != undefined){
			values.push(parseFloat(item.properties[field]))

		}
		
	})

	// set up the "brew" options
	brew.setSeries(values);
	brew.setNumClasses(num_classes);
	brew.setColorCode(color);
	brew.classify(scheme);

	// create the layer and add to map
	geojson_layer = L.geoJson(geojson_data, {
		style: getStyle, //call a function to style each feature
		onEachFeature: onEachFeature // actions on each feature
	}).addTo(map);

	map.fitBounds(geojson_layer.getBounds())

	createLegend();
	createInfoPanel();
	//createTable();
}

function getStyle(feature){
	return {
		stroke: true,
		color: 'white',
		weight: 1,
		fill: true,
		fillColor: brew.getColorInRange(feature.properties[fieldtomap]),
		fillOpacity: 0.8
	}
}

function createLegend(){
	legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend'),
		breaks = brew.getBreaks(),
		labels = [],
		from, to;
		
		for (var i = 0; i < breaks.length; i++) {
			from = breaks[i];
			to = breaks[i + 1];
			if(to) {
				labels.push(
					'<i style="background:' + brew.getColorInRange(to) + '"></i> ' +
					from.toFixed(2) + ' &ndash; ' + to.toFixed(2));
				}
			}
			
			div.innerHTML = labels.join('<br>');
			return div;
		};
		
		legend.addTo(map);
}

// Function that defines what will happen on user interactions with each feature
function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
}

// on mouse over, highlight the feature
function highlightFeature(e) {
	var layer = e.target;

	// style to use on mouse over
	layer.setStyle({
		weight: 2,
		color: '#666',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}

	info_panel.update(layer.feature.properties)
	createDashboard(layer.feature.properties)
}

function createDashboard(properties){

	// clear dashboard
	$('.dashboard').empty();

	console.log(properties)

	// chart title
	let title = 'Pollution Level in ' +properties['Country'];

	// data values
	let data = [

        properties['1990'],
		properties['1995'],
		properties['2000'],
		properties['2005'],
		properties['2010'],
		properties['2011'],
		properties['2012'],
		properties['2013'],
		properties['2014'],
		properties['2015'],
		properties['2016'],
       
        
    ];

	// data fields
	let fields = [

        '1990',
		'1995',
		'2000',
		'2005',
		'2010',
		'2011',
		'2012',
		'2013',
		'2014',
		'2015',
		'2016',
        
    ];

	// set chart options
	let options = {
		series: [{
		  name: "Pollution Level",
		  data: data
	  }],
		chart: {
		height: 350,
		type: 'line',
		zoom: {
		  enabled: false
		}
	  },
	  dataLabels: {
		enabled: false
	  },
	  stroke: {
		curve: 'straight'
	  },
	  title: {
		text: title,
		align: 'left'
	  },
	  grid: {
		row: {
		  colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
		  opacity: 0.5
		},
	  },
	  xaxis: {
		categories: fields,
	  }
	  };

	// create the chart
	  let chart = new ApexCharts(document.querySelector('.dashboard'), options);
	  chart.render();

}

/*
function createTable(){

	// empty array for our data
	let datafortable = [];

	// loop through the data and add the properties object to the array
	geojson_data.features.forEach(function(item){
		datafortable.push(item.properties)
	})

	// array to define the fields: each object is a column
	let fields = [
		{ name: "geounit", type: "text"},
		{ name: 'Year', type: 'number'},
		{ name: 'poverty_level', type: 'number'},
	]
 
	// create the table in our footer
	$(".footer").jsGrid({
		width: "100%",
		height: "400px",
		
		editing: true,
		sorting: true,
		paging: true,
		autoload: true,
 
		pageSize: 10,
		pageButtonCount: 5,
 
		data: datafortable,
		fields: fields,
		rowClick: function(args) { 
			console.log(args);
            zoomTo(args.item.geounit)
		},
	});
}
*/

// on mouse out, reset the style, otherwise, it will remain highlighted
function resetHighlight(e) {
	geojson_layer.resetStyle(e.target);

	info_panel.update(); //resets infopanel
	
}


// on mouse click on a feature, zoom in to it
function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

function createInfoPanel(){

	info_panel.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this.update();
		return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	info_panel.update = function (properties) {
		// if feature is highlighted
		if(properties){
			this._div.innerHTML = `<b>${properties.Country}</b><br> Pollution Level: ${properties[fieldtomap]}`;
		}
		// if feature is not highlighted
		else
		{
			this._div.innerHTML = 'Hover Over A Country';
		}
	};

	info_panel.addTo(map);
}

function zoomTo(geoid){

	let zoom2poly = geojson_layer.getLayers().filter(item => item.feature.properties.geounit === geoid)

	map.fitBounds(zoom2poly[0].getBounds())

}