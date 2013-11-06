// choropleth map dv stats app
// proofs: Here in the USA, we beat pregnant women as much as in any third-world country . . .
// todo: add scroll bar at top with statements of proofs and random country stats, add histogram chart, when click open video of country's 1 billion rising and animated stats in side Canvas.
//		 animate color fade-ins, cool looking "autotype" (with sound effect?) scrolling on top		

var data= [];
var video_toggled = 0;
var width = 1028,
    height = 720;	
var scaleIn = width+20;
var projection=d3.geo.mercator()
	.scale([scaleIn])
	.translate([0,20]);

var path = d3.geo.path()
	.projection(projection);
 
var color_beatPartner=d3.scale.quantize()
    .domain([6, 72])
    .range(d3.range(9).map(function(i) { return "c" + i; }));

// ! FIX THE ZOOM/PAN -- actually ... wait, do I even want this to be available?
/*var zoom = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .on("zoom", move);*/
	
var svg = d3.select("#container").append("svg")
    .attr("width", width)
    .attr("height", height)
	.style("z-index", 1)
	.style("position", "relative")
	.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var g = svg.append("g");

var countryid = svg.append("g")
			.attr("id", "countries")
			.selectAll("path");

var countryCircles = svg.append("g")
			.attr("id", "countries")
			.selectAll("path");			
			
/* !break out boundaries separately, like countries -- implement later
	var boundaries = svg.append("boundariesmap")
					.attr("id","boundaries")
					.selectAll("path");*/
			
			
d3.json("world-50m.json", function(error, world) {
	var countries = topojson.feature(world, world.objects.countries).features;
	var countryCirclesPreg = topojson.feature(world, world.objects.countries).features;
	
	//sorts through text file with ID #s to names to add the names value back to the country data in var countries -- prob a cleverer d3 way to do this
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
	//and here we do it again but this time adding in our data.
	d3.tsv("beatPregnant.tsv", function(error, data) {
		var datalength = data.length;
		jQuery.each(countries, function(i, val){			
			for(var j=0; j<datalength; j++){
				compare_toId=parseInt(val.id);
				compare_withId=parseInt(data[j].id);
				if(compare_withId === compare_toId){
					if(data[j].beatPartner) val.beatPartner = data[j].beatPartner;
					if(data[j].beatPregnant && data[j].beatPregnant > 0) val.beatPregnant = data[j].beatPregnant;
					if(data[j].beathaveChildren) val.beathaveChildren = data[j].beathaveChildren;
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
			/* !D3 native mouse events, figure out laterm use jQuery below			
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
				$(this).data("name", countries[i].name);
				//console.log("fill " + countries[i].beatPregnant);
				if(countries[i].beatPregnant)     $(this).data("beatPregnant", countries[i].beatPregnant); // uses jQuery to store the value for easy recall later			
				if(countries[i].beatPartner)      $(this).data("beatPartner", countries[i].beatPartner);
				if(countries[i].beathaveChildren) $(this).data("beathaveChildren", countries[i].beathaveChildren);
				if(countries[i].beatPartner) return currentclass+" "+color_beatPartner(countries[i].beatPartner);
				else{return currentclass;} 		
		})

	// A nice red circle popping effect for beatPregnant
		countryCircles=countryCircles.data(countryCirclesPreg)
		  .enter()			
		  .append("circle")
		  .style("opacity", function(d,i) {if(countries[i].beatPregnant) return 0.2; else return 0.0;})
          .attr("transform", function(d,i) {if(countries[i].beatPregnant){
											if(countries[i].name == "United States"){												
												return "translate(-280,-121)";
											}
											else if(countries[i].name == "Canada"){												
												return "translate(-310,-204)";
											}
											else return "translate("+path.centroid(d) + ")";
											}
				})		
		  //the below unpacks coords, but doesn't seem right . . .
		  /*.attr("cx", function(d,i) {if(countries[i].beatPregnant){
										if(typeof(countryCirclesPreg[i].geometry.coordinates[0][0][0][0])=="number"){
											console.log("x", countryCirclesPreg[i].geometry.coordinates[0][0][0][0])
											return countryCirclesPreg[i].geometry.coordinates[0][0][0][0];
										}
										else{
											console.log("x", countryCirclesPreg[i].geometry.coordinates[0][0][0])
											return countryCirclesPreg[i].geometry.coordinates[0][0][0];
										}
									}
				})
          .attr("cy", function(d,i) {if(countries[i].beatPregnant){										
										if(typeof(countryCirclesPreg[i].geometry.coordinates[0][0][0][1])=="number"){
											console.log("y", countryCirclesPreg[i].geometry.coordinates[0][0][0][1]);
											return countryCirclesPreg[i].geometry.coordinates[0][0][0][1];
										}
										else {
											console.log("y", countryCirclesPreg[i].geometry.coordinates[0][0][1]);
											return countryCirclesPreg[i].geometry.coordinates[0][0][1];
										}
									}
				}) */
		  .attr("class", function(d,i) {$(this).data("name", countries[i].name); 
									    if(countries[i].beatPregnant)     $(this).data("beatPregnant", countries[i].beatPregnant);
										if(countries[i].beatPartner)      $(this).data("beatPartner", countries[i].beatPartner);
										if(countries[i].beathaveChildren) $(this).data("beathaveChildren", countries[i].beathaveChildren);										
										return "circle";})
          .attr("r", 5)
          .style("fill", "red")
          .style("fill-opacity", 0.2)
          .style("stroke", "blue")
          .style("stroke-opacity", 0.2)
		  .transition()
          .duration(8000)
          .ease(Math.sqrt)
          .attr("r", function(d,i){return countries[i].beatPregnant*1.25;}) 
          .style("fill-opacity", function(d,i){return countries[i].beatPregnant*0.1;})
          .style("stroke-opacity", function(d,i){ return countries[i].beatPregnant*0.1;})
		  .style("opacity", function(d,i){ return countries[i].beatPregnant*0.1;});
			
	//draw boundaries
	g.append("path")
		.datum(topojson.feature(world, world.objects.countries, function(a, b) { return a !== b; }))
		.attr("class", "boundary")
		.attr("d", path);	
	
	
	//mouse event, jQuery style -- try to learn d3 lib mouse events later
	$('.country,.circle').hover(function(event){
		//hover over
		var titleText = $(this).data("name");
		var beatPregnantText = $(this).data("beatPregnant");
		var beatPartnerText=$(this).data("beatPartner");
		var canvasText;
		if(beatPartnerText !== undefined) canvasText = beatPartnerText + "% of women are beaten by partners in " + titleText; 
			else canvasText="Stats not yet collected.";
		if(beatPregnantText !== undefined) canvasText += ", " + beatPregnantText + "% while pregnant."
		
		/* deprecated in favor of Canvas overlay $(this)
			.data('tipText', titleText)
			.data('name', titleText);
		$('<p class="tooltip">'+titleText+'</br>'+'% of beaten women who were beaten while pregnant: '+beatPregnantText+'</p>')
			.appendTo('body')
			.attr('id', 'titleText')
			.css('top', (event.pageY - 10) + 'px')
			.css('left', (event.pageX + 20) + 'px')
			.css('z-index', 3)
			.fadeIn('slow');*/
			
		$('<canvas id="myCanvas"></canvas>') //animate text rather than tooltip
			.appendTo('#container')
			.css('top', '0')
			.css('left','0')
			.css('position', 'fixed')
			.css('z-index','2');
		var myCanvas=document.getElementById("myCanvas");
		myCanvas.width = 720;
		var myContext=myCanvas.getContext("2d");
		myContext.font="15pt Arial";
		myContext.fillText(canvasText, 0,40);
		$('#myCanvas').animate({'left':'+=300px'}, 6000, 'swing');
		},
		function(){
			$('#myCanvas').remove();
		});
		
		
	//on click, bring up video!
	
	$('.country, .tooltip, .circle').click(function(event){
		var countryId = $(this).data("name");
		if(video_toggled) {
			$('.videotest').remove();
		}
		else { video_toggled=1;}
		console.log("Clicked", countryId);
		// ! if server not found, have a DEFAULT, also needlessly repeating code, here, for styling -- fix.
		
		if(countryId === "Australia"){
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/6rOz3kBaQbU?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}
		
		else if(countryId === "Bangladesh"){
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/N1UIghYxjVY?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}
				
		else if(countryId === "Brazil"){
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/mn98TD_C-7g?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}
				
		else if(countryId == "Canada") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/TbEDbok7i9Q?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}
		
		else if(countryId == "Cambodia") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/kkxKeQgYyvM?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}

		else if(countryId == "Colombia") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/kkxKeQgYyvM?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}	
		
		else if(countryId == "Egypt") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/yRudHgoqRDQ?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}
				
		else if(countryId == "Ethiopia") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/6vHarsCl5m4?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}

		else if(countryId == "India") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/KYS3NinY4Cc?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}
				
		else if(countryId == "Japan") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/lnWRKjZDE5w?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}
				
		else if(countryId == "Namibia") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/EdA6oYkIYRI?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}
				
		else if(countryId == "New Zealand") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/_S35eJQrM68?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}
		
		else if(countryId == "Pakistan") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/ioL529z-mKk?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}		
		
		else if(countryId == "Philippines") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/sVxy9oEShPQ?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}
		
		
		else if(countryId == "Russia") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/gQnGXikFJRY?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}				
		
		else if(countryId == "Serbia") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/d_8hHE4lRd8?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}		
		
		else if(countryId == "South Africa") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/2p7zqfkWApc?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}
				
		else if(countryId == "Sudan") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/h2F2fAZj4Qc?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}
				
		else if(countryId == "Tanzania") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/V0z5BupMQ0U?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}
		
		else if(countryId == "Thailand") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/iXJI_ZDdanE?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}
				
		else if(countryId == "United States") {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/eVo2GvejQCM?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")			
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);}
			
		else {
			$("<iframe class='youtube-player' type='text/html' width='320' height='192' src='http://www.youtube.com/embed/gl2AO-7Vlzk?html5=1&autoplay=1&controls=0' allowfullscreen frameborder='0'></iframe>")				
			.appendTo("#container") // !this all should really be in a style sheet to avoid repetition, but was buggy in css, need to debug
				.attr('class', 'videotest') 
				.css('top', '0px')
				.css('right','0px')
				.css('position', 'fixed')
				.css('z-index', 2);
		}		
		
	});	
	//next closing the 2 tsv file reads -- we didn't close them earlier to make sure data is loaded before display
	});
	});
//now closing d3 world file read
});