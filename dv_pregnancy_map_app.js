// choropleth map dv stats app
//proofs: Here in the USA, we beat pregnant women as much or more as in any third-world country . . .

var data= [];
var width = 1028,
    height = 720;
		
var projection=d3.geo.mercator()
	.scale([width])
	.translate([0,0]);

var path = d3.geo.path()
	.projection(projection);
 
var color=d3.scale.quantize()
    .domain([0, 22])
    .range(d3.range(9).map(function(i) { return "c" + i; }));

// ! FIX THE ZOOM/PAN
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .on("zoom", move);
	
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
	.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    .call(zoom);

var g = svg.append("g");

var countryid = svg.append("g")
			.attr("id", "countries")
			.selectAll("path");

/* !break out boundaries separately, like countries -- implement later

	var boundaries = svg.append("boundariesmap")
					.attr("id","boundaries")
					.selectAll("path");*/
			
			
d3.json("world-50m.json", function(error, world) {
	var countries = topojson.feature(world, world.objects.countries).features;
	
	//sorts through text file with ID #s to names to add the names value back to the country data in var countries -- prob a cleverer way to do this
	d3.tsv("world-country-names.tsv", function(error, cnames) {
		var nameslength = cnames.length;
		jQuery.each(countries, function(i, val){			
			//console.log(val.id);			
			for(var j=0; j<nameslength; j++){
				compare_toId=parseInt(val.id);
				compare_withId=parseInt(cnames[j].id);
				if(compare_withId === compare_toId){
					val.name = cnames[j].name;
					return null;
				}
			}
		});
	//and here we do it again but this time adding in our data of %s.
	d3.tsv("beatPregnant.tsv", function(error, data) {
		var datalength = data.length;
		jQuery.each(countries, function(i, val){			
			for(var j=0; j<datalength; j++){
				compare_toId=parseInt(val.id);
				compare_withId=parseInt(data[j].id);
				if(compare_withId === compare_toId){
					val.beatPregnant = data[j].beatPregnant;
					//console.log("ID: "+val.id+" is "+data[j].beatPregnant);
					return null;
				}				
			}
		});
	
	//draws, assigns css classes + id to the countries
	
	countryid=countryid.data(countries)
		.enter()
		.append("path")
			.attr("class", "country")
			//.attr("beatPregnant", function(d,i) {if(countries[i].beatPregnant) return countries[i].beatPregnant;}) DEPRECATED less mess to use jQuery .data()
			.attr("id", function(d, i) {return countries[i].name;})
			/* !D3 native mouse events, figure out later
			
				.on("mouseover", function(d) {				
				div.transition()
					.duration(200)
					.style("opacity", .9);
				div.html(countries[i].name)
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
			})*/
		.attr("d", path)
		.attr('class', function(d, i){
		//.style("fill", function(d, i) {
			var currentclass=$(this).attr("class");
			if(countries[i].beatPregnant){
				//console.log("fill " + countries[i].beatPregnant);
				$(this).data("beatPregnant", countries[i].beatPregnant); // uses jQuery to store the value for easy recall later			
				return currentclass+" "+color(countries[i].beatPregnant);
			}
			//else{return currentclass+" "+"colordefault";} for some reason, this does not work -- !bug check
		})
		.style("fill", function(d, i) { //stop gap measure to make sure filled with a color
			if(!countries[i].beatPregnant)
				return "lightgray"
		});
		
	//draw boundaries
	g.append("path")
		.datum(topojson.feature(world, world.objects.countries, function(a, b) { return a !== b; }))
		.attr("class", "boundary")
		.attr("d", path);	

	//mouse event, jQuery style -- try to learn D3 lib mouse events later
	$('.country').hover(function(event){
		//hover over
		var titleText = $(this).attr("id");
		var beatPregnantText = $(this).data("beatPregnant");
		$(this)
			.data('tipText', titleText);			
		$('<p class="tooltip">'+titleText+'</br>'+'% of beaten women who were beaten while pregnant: '+beatPregnantText+'</p>')
			.appendTo('body')
			.css('top', (event.pageY - 10) + 'px')
			.css('left', (event.pageX + 20) + 'px')
			.fadeIn('slow');
		},
		function(){
			$('.tooltip').remove();
		});
	
	//next closing the 2 tsv file reads -- we didn't close them earlier to make sure data is loaded before display
	});
	});

/*	d3.tsv("beatPregnant.tsv", function(error, data) {

// A nice red circle popping effect
	g.append("circle")
          .attr("cx", xy(countries[data.id].geometry.coordinates)[0])
          .attr("cy", xy(countries[data.id].geometry.coordinates)[1])
          .attr("r", 1)
          .style("fill", "red")
          .style("fill-opacity", 0.5)
          .style("stroke", "red")
          .style("stroke-opacity", 0.5)
		  .transition()
          .duration(2000)
          .ease(Math.sqrt)
          .attr("r", c.properties.magnitude * data.)
          .style("fill-opacity", 1e-6)
          .style("stroke-opacity", 1e-6)
          .remove();*/
});
		  
  
	 /*ADD-ONS
	first a ZOOM-in function -- change "group" to an appropriate svg.append.*/
	
	function move() {
		var t = d3.event.translate,
			s = d3.event.scale;
		//t[0] = Math.min(width / 2 * (s - 1) + 230 * s, Math.max(width / 2 * (1 - s) - 230 * s, t[0]));
		//t[1] = Math.min(height / 2 * (s - 1) + 230 * s, Math.max(height / 2 * (1 - s) - 230 * s, t[1]));
		zoom.translate(t);
		g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
};