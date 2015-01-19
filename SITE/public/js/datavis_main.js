/* Your code starts here */

var app = app || {};

app.main = (function() {
	
	var init = function() {

		// app starts running here

		/*----- 'GLOBAL' VARS -----*/
		// Layout
		var column = {
			width: window.innerWidth/10,
			height: window.innerHeight/10
		};
		var gutter = {
			width: window.innerWidth * 0.03,
			height: window.innerHeight * 0.03
		};

		var cat, left, right;

		cat = '0';
		left = 'BXv3itKA8e';
		right = 'fhLtOv7Mcb';

		// Connecting to socket.io
		var socket = io("http://attention.market:80");
		socket.on('showing', function(data){
			// console.log(data);
			// left = data.left;
			// right = data.right;
			// cat = data.cat;
			// console.log('connected');
		});		

		var allCategories;
		var categoriesColors = [
			{	r: 80,		g: 200,		b: 245	},
			{	r: 240,		g: 105,		b: 35	},
			{	r: 200,		g: 120,		b: 220	},
			{	r: 240,		g: 75,		b: 160	},
			{	r: 255,		g: 180,		b: 20	},
			{	r: 0,		g: 210,		b: 125	},
			{	r: 255,		g: 80,		b: 120	}
		];
		var neutralColor = {r: 170, g: 170, b: 170};

		// var allCompanies;
		var social_counts = ['twitter_counts', 'fb_counts', 'google_counts', 'linkedin_counts', 'pinterest_counts'];
		var social_logos = ['social_network_twitter.png', 'social_network_facebook.png', 'social_network_google.png', 'social_network_linkedin.png', 'social_network_pinterest.png'];

		loadAndStart(false);

		function loadAndStart(update){

			// // Load all data
			// d3.json("dummy_data/getcontents.json", function(error, json) {
			d3.json('http://attention.market/api/getcontents', function(error, json) {
				if (error) return console.warn(error);

				/* FAKE ---------------------------------------*/
				cat = parseInt(cat) + 1;
				var filteredData = _.filter(json, function(obj){
					return obj.cat_id == cat;
				});
				left = filteredData[0].objectId;
				right = filteredData[1].objectId;
				/* FAKE ---------------------------------------*/

				// Filling out our 'globals' — lists of categories and companies
				allCategories = getAllCategories(json);
				// allCompanies = getAllCompanies(json);

				processTopChart(json, drawTopChart);
				processMainChart(json, drawMainChart, update);
				processTop5(json , drawTop5);
				processTopByCategory(json, drawTopByCategory);
				processSocialEngagement(json, drawSocialEngagement);

			});			
		}

		$('body').bind('click', function(){
			loadAndStart(true);
		});

		/*---------- DATA PROCESSING ----------*/

		function processTopChart(data, callback){

			// Filter current category
			var filteredData = _.filter(data, function(obj){
				return obj.cat_id == cat;
			});
			// console.log(filteredData);

			var newData = mergeCompanies(filteredData);
			// console.log(newData);

			var currentContenders = _.filter(newData, function(element, index, list){
				return element.highlight == true;
			});
			// console.log(currentContenders);

			callback(currentContenders);
		}

		// CHART: Main (current category)
		function processMainChart(data, callback, update){

			// Filter current category
			var filteredData = _.filter(data, function(obj){
				return obj.cat_id == cat;
			});
			// console.log(filteredData);

			var newData = mergeCompanies(filteredData);
			// console.log(newData);

			// Sorting descending
			var sortedData = _.sortBy(newData, function(obj){
				return obj.face_val + obj.social_val;
			});
			sortedData.reverse();

			// Some more data processing before drawing the chart
			// Adding a last element to each val_history array,
			// with the current timestamp (so all lines extend till the current time)
			var fullTimeline = _.each(sortedData, function(element, index, list){
				var d = new Date();
				currentTimestamp = d.getTime();
				var newHistory = {
					face_val: element.val_history[element.val_history.length - 1].face_val,
					social_val: element.val_history[element.val_history.length - 1].social_val,
					ts: currentTimestamp
				}
				element.val_history.push(newHistory);
			});			

			callback(fullTimeline, update);
		}
		
		// CHART: Top 5 Publishers
		function processTop5(data, callback){

			var newData = mergeCompanies(data);
			// var newData = data;

			var sortedData = _.sortBy(newData, function(obj){
				return obj.face_val + obj.social_val;
			});
			sortedData.reverse();
			// console.log(sortedData);

			sortedData = sortedData.slice(0, 5);

			callback(sortedData);
		}

		// CHART: Top Publisher by Category
		function processTopByCategory(data, callback){

			var newData = [];

			// Loop through each category
			_.each(allCategories, function(element, index, list){

				// Filter the data by category
				var filteredData = _.filter(data, function(value, key, list){
					return value.category == element.title;
				});
				// console.log(filteredData);

				// Merge by company
				var mergedData = mergeCompanies(filteredData);

				// Sort
				var sortedData = _.sortBy(mergedData, function(obj){
					return obj.face_val + obj.social_val;
				});

				// Ascending order, so the top one is the last
				var topCompany = sortedData[sortedData.length - 1];

				newData.push(topCompany);
			});
			// console.log(newData);

			callback(newData);
		}

		// CHART: Social Engagement by Category
		function processSocialEngagement(data, callback){

			var newData = [];

			_.each(social_counts, function(social_count_title, index, list){
				
				// console.log('Starting processing of ' + social_count_title);
				
				var totalBySocialNetwork = [];

				_.each(allCategories, function(category_obj, index, list){

					// console.log('\t' + category.title);

					var filteredData = _.filter(data, function(value, key, list){
						return value.category == category_obj.title;
					});
					// console.log(filteredData);

					var totalByCategory = 0;
					_.each(filteredData, function(value, key, list){
						totalByCategory += value[social_count_title];
					});

					// console.log('\t\t' + social_count_title + ': ' + totalByCategory);

					var newObj = {
						category: category_obj.title,
						counts: totalByCategory
					}
					
					// console.log(newObj);
					totalBySocialNetwork.push(newObj);

				});

				var newSocialNetwork = {
					social_count_title: social_count_title,
					values: totalBySocialNetwork
				}

				// console.log(newSocialNetwork);
				newData.push(newSocialNetwork);

			});

			// console.log(newData);
			callback(newData);
		}		

		/*--- AUXILIAR DATA PROCESSING ---*/
		// These functions are not linked to any specific chart

		function getAllCategories(data){
			
			var groupedData = _.groupBy(data, function(obj){
				return obj.category;
			});

			var newData = [];

			_.each(groupedData, function(value, key, list){
				var newObj = {
					cat_id: value[0].cat_id,
					title: key
				};
				newData.push(newObj);
			});
			// console.log(newData);

			newData = _.sortBy(newData, function(element, index, list){
				return element.cat_id;
			});
			// console.log(newData);

			return newData;
		}

		// function getAllCompanies(data){
			
		// 	var groupedData = _.groupBy(data, function(obj){
		// 		return obj.company;
		// 	});

		// 	var newData = [];

		// 	_.each(groupedData, function(value, key, list){
		// 		newData.push(key);
		// 	});
		// 	// console.log(newData);

		// 	return newData;
		// }

		// This function is utilized by the data processing of all charts
		// Given a list of contents, combine them into companies, returning objects with:
		// category, company, face_val, social_val, val_history, highlight
		function mergeCompanies(data){

			// Combine contents from the same company
			var groupedData = _.groupBy(data, function(obj){
				return obj.company;
			});
			// console.log(data);

			var newData = [];

			// Check if there's any company with more than one content/occurrence
			_.each(groupedData, function(value, key, list){

				var combinedHistory = [];	// Combine all history arrays into one
				var highlight = false;		// One of the current contenders?
				// var combinedFace_val = 0;
				// var combinedSocial_val = 0;

				for(var i = 0; i < value.length; i++){

					// console.log(value[i].company);
					
					combinedHistory = combinedHistory.concat(value[i].val_history);
					// combinedFace_val += value[i].face_val;
					// combinedSocial_val += value[i].social_val;

					if(value[i].objectId == left || value[i].objectId == right){
						highlight = true;
					}
				}

				// Sort the combined history based on the timestamp
				combinedHistory = _.sortBy(combinedHistory, function(obj){
					return obj.ts;
				});
				// console.log(combinedHistory);

				// Parsing the values into floats
				_.each(combinedHistory, function(element, index, list){
					element.face_val = parseFloat(element.face_val);
					element.social_val = parseFloat(element.social_val);
				});
				// console.log(combinedHistory);

				// Getting the cumulative data
				var cumulativeHistory = [];
				cumulativeHistory.push(combinedHistory[0]);

				for(var i = 1; i < combinedHistory.length; i++){
					var newHistory = {
						face_val: cumulativeHistory[i-1].face_val + combinedHistory[i].face_val,
						social_val: cumulativeHistory[i-1].social_val + combinedHistory[i].social_val,
						ts: combinedHistory[i].ts
					};
					cumulativeHistory.push(newHistory);
				}
				// console.log(cumulativeHistory);

				// New object, with the information needed for the chart only
				var newObj = {
					category: value[0].category,
					company: value[0].company,
					face_val: cumulativeHistory[cumulativeHistory.length - 1].face_val,
					social_val: cumulativeHistory[cumulativeHistory.length - 1].social_val,
					// face_val: combinedFace_val,
					// social_val: combinedSocial_val,
					val_history: cumulativeHistory,
					highlight: highlight
				};

				newData.push(newObj);
			});

			return newData;
		}


		/*--------------- DRAW ----------------*/

		function drawTopChart(dataset){

			// console.log(dataset);

			/*----- LAYOUT -----*/
			var svgSize = getCSS('topChart');

			// Visualization attributes
			var margin = {top: 0, right: 0, bottom: 0, left: 0};
			var width  = svgSize.width - margin.left - margin.right;
			var height = svgSize.height - margin.top - margin.bottom;
			var textOffset = gutter.width/2;
			var barHeight = gutter.height;

			// Each chart
			var chartWidth = (3 * column.width + 2 * gutter.width);

			var xScale = d3.scale.linear()
						   .domain([0, d3.max(dataset, function(d, i){
															return d.social_val + d.face_val;
														})])
						   .range([0, chartWidth]);

			// Canvas
			var svg = d3.select('body')
						.append('svg')
						.attr('id', 'topChart')
						.attr('width', width + margin.left + margin.right)
					    .attr('height', height + margin.top + margin.bottom);


			// Each group is composed by text and bar
		  	var groups = svg.selectAll('g')
					  		.data(dataset)
					  		.enter()
					  		.append('g')
							.attr('transform', function(d, i){
								var xOffset = (i % 2 == 0) ? (0) : (4 * (column.width + gutter.width));
								return 'translate(' + xOffset + ', 0)';
							});			

			// Social value
			groups.append('rect')
					.attr('x', function(d, i){
						if(i == 0){
							return chartWidth - xScale(d.social_val);
						}else{
							return 0;
						}
					})
					.attr('y', 1.5*barHeight)				
					.attr('height', barHeight)
					.attr('width', function(d, i){
						return xScale(d.social_val);
					})
					.attr('fill', parseRgba(categoriesColors[parseInt(cat) - 1], 1));

			groups.append('text')
					.attr('x', function(d, i){
						if(i == 0){
							return chartWidth - textOffset/4;
						}else{
							return textOffset/4;
						}
					})
					.attr('y', 2.25*barHeight)
					.attr('text-anchor', function(d, i){
						return (i == 0) ? ('end') : ('start');
					})				
					.text(function(d, i){
						if(d.social_val > 0){
							return 'SOCIAL: ' + numToCurrency(d.social_val);	
						}
					})
					.attr('class', 'heading3');						

			// Face value
			groups.append('rect')
					.attr('x', function(d, i){
						if(i == 0){
							return chartWidth - xScale(d.social_val + d.face_val);
						}else{
							return xScale(d.social_val);
						}
					})
					.attr('y', 1.5*barHeight)				
					.attr('height', barHeight)
					.attr('width', function(d, i){
						return xScale(d.face_val);
					})
					.attr('fill', parseRgba(categoriesColors[parseInt(cat) - 1], 0.5));

			groups.append('text')
					.attr('x', function(d, i){
						if(i == 0){
							return chartWidth - xScale(d.social_val) - textOffset/4;
						}else{
							return xScale(d.social_val) + textOffset/4;
						}
					})
					.attr('y', 2.25*barHeight)
					.attr('text-anchor', function(d, i){
						return (i == 0) ? ('end') : ('start');
					})				
					.text(function(d, i){
						if(d.face_val > 0){
							return 'FACE: ' + numToCurrency(d.face_val);
						}
					})
					.attr('class', 'heading3');					

			// Companies
			groups.append('text')
					.attr('x', function(d, i){
						return (i == 0) ? (chartWidth - textOffset) : (textOffset);
					})
					.attr('y', 20)
					.attr('text-anchor', function(d, i){
						return (i == 0) ? ('end') : ('start');
					})
					.text(function(d, i){
						return d.company + ' | ' + numToCurrency(d.face_val + d.social_val);
					})
					.attr('class', 'heading2');	
		}

		function drawMainChart(dataset, update){

			// console.log(dataset);

			/*----- DATA -----*/
			// Combining all val_histories into one, to get the full time extent
			var fullTimeRange = [];
			for(var i = 0; i < dataset.length; i++){
				fullTimeRange = fullTimeRange.concat(dataset[i].val_history);
			}
			// console.log(fullTimeRange);
			fullTimeRange = _.sortBy(fullTimeRange, function(obj){
				return obj.ts;
			});
			// console.log(fullTimeRange);


			/*----- LAYOUT -----*/
			var svgSize = getCSS('mainChart');

			// Visualization attributes
			var margin = {top: 60, right: column.width + gutter.width, bottom: gutter.height, left: gutter.width};
			var width  = svgSize.width - margin.left - margin.right;
			var height = svgSize.height - margin.top - margin.bottom;

			var xScale = d3.time.scale()
							.domain(d3.extent(fullTimeRange, function(d, i) {
								// console.log(d.ts);
								// console.log(i);
								return d.ts;
							}))
							.range([0, width]);

			var yScale = d3.scale.linear()
						   .domain([0, d3.max(dataset, function(d, i){
															return d.social_val + d.face_val;
														})])
						   .range([height, 0]);

			var line = d3.svg.line()
						    .x(function(d, i) { return xScale(d.ts); })
						    .y(function(d) { return yScale(d.social_val + d.face_val); });

			// X Scale
			var xAxis = d3.svg.axis()
							    .scale(xScale)
							    .orient("bottom");

			// Y Scale
			var yAxis = d3.svg.axis()
							    .scale(yScale)
							    .orient("left");

			var svg, chart, company, labels;

			// Create
			if(!update){

				// Canvas
				svg = d3.select('body')
							.append('svg')
							.attr('id', 'mainChart')
							.attr('width', width + margin.left + margin.right)
						    .attr('height', height + margin.top + margin.bottom);

				// Title
				svg.append('text')
			  		.attr('x', 0)
			  		.attr('y', 20)
					.text(dataset[0].category)
			  		.attr('class', 'heading2')
			  		.attr('id', 'title')
					.style('opacity', 0)
					.transition()
					.duration(750)
					.style('opacity', 1);


				// Chart
			    chart = svg.append('g')
							.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
							.attr('id', 'chart');
				  
				  // X axys
				  chart.append("g")
				      .attr("class", "x axis")
				      .attr("transform", "translate(0," + height + ")")
				      .call(xAxis);

				  // Y axys
				  chart.append("g")
					    .attr("class", "y axis")
					    .call(yAxis)
					    .append("text")
					    .attr("transform", "rotate(-90)")
					    .attr("y", 6)
					    .attr("dy", ".71em")
					    .style("text-anchor", "end")
					    .text("Valuation ($)");

			  	// Lines
				company = chart.selectAll(".line")
					      		.data(dataset)
							    .enter()
								.append("path")
								.attr("class", "line")
								.attr('stroke', parseRgba(categoriesColors[parseInt(cat) - 1], 1))
								.attr('stroke-width', function(d, i){
										var stroke = 1;
										if(d.highlight){
											stroke = 4;
										}
										return stroke;
								})
								.attr('d', function(d, i){
									// Shrinking lines to 0
									var emptyHistory = [];
									_.each(d.val_history, function(element, index, list){
										var emptyObj = {
											ts: element.ts,
											social_val: 0,
											face_val: 0
										}
										emptyHistory.push(emptyObj);
									});
									return line(emptyHistory);
								})
								.transition()
								.duration(750)
								.attr("d", function(d) { return line(d.val_history); });

				// Labels
			    labels = svg.append('g')
				    		.attr('transform', 'translate(' + ((4.5 * gutter.width) + (5 * column.width)) + ',' + margin.top + ')')
				    		.attr('id', 'labels');			

				labels.selectAll('text')
						.data(dataset)
						.enter()
						.append('text')
						.attr('x', 0)
						.attr('y', function(d, i){
							return i * 16;
						})
						.text(function(d, i){
							return numToCurrency(d.face_val + d.social_val) + ' | ' + capText(d.company);
						})
						.attr('class', function(d, i){
							if(d.highlight){
								return 'heading3';
							}else{
								return 'heading4';
							}
						})
						.style('opacity', 0)
						.transition()
						.duration(750)
						.style('opacity', 1);

			// Update
			}else{
			
				console.log('Updating chart...');
				// console.log(dataset);

			    // Select the section we want to apply our changes to
			    svg = d3.select("#mainChart")
			             .transition();

			    // Transitioning the scales
		        svg.select(".x.axis") // change the x axis
		            .duration(750)
		            .call(xAxis);

		        svg.select(".y.axis") // change the y axis
		            .duration(750)
		            .call(yAxis);

		        // Shrinking lines and removing them
		        chart = svg.select('#chart');	

				company = chart.selectAll('.line')
								.duration(1000)
								.attr('d', function(d, i){
									var emptyHistory = [];
									_.each(d.val_history, function(element, index, list){
										var emptyObj = {
											ts: element.ts,
											social_val: 0,
											face_val: 0
										}
										emptyHistory.push(emptyObj);
									});
									return line(emptyHistory);
								})
								.each('end', function(d, i){
									if (i == company.length - 1) {
										// Remove the whole chart
										d3.select('#mainChart').remove();
										drawMainChart(dataset, false);
									};
								});

				// Fading out labels and title
				labels = svg.select('#labels');

				labels.selectAll('text')
						.duration(750)
						.style('opacity', 0.0);

				title = svg.select('#title')
							.duration(750)
							.style('opacity', 0.0);						
			}

		}

		function drawTop5(dataset){

			// Canvas properties
			var svgSize = getCSS('top5');			

			// Visualization attributes
			var margin = {top: 45, right: 0, bottom: 0, left: 0};
			var width  = svgSize.width - margin.left - margin.right;
			var height = svgSize.height - margin.top - margin.bottom;

			var yScale = d3.scale.ordinal()
							.domain(d3.range(dataset.length))
							.rangeBands([0, height]);

			var xScale = d3.scale.linear()
						   .domain([0, d3.max(dataset, function(d, i){
															return d.social_val + d.face_val;
														})])
						   .range([0, width]);			

			// Canvas
			var svg = d3.select('body')
						.append('svg')
						.attr('id', 'top5')	
						.attr('width', width + margin.left + margin.right)
					    .attr('height', height + margin.top + margin.bottom);

			// Title
			svg.append('text')
			  		.attr('x', 0)
			  		.attr('y', 20)
					.text('Top 5')
			  		.attr('class', 'heading2');

			// Legend
			var legend = svg.append('g')
						    .attr('transform', 'translate(0, 40)');

			legend.append('circle')
			  		.attr('cx', 6)
			  		.attr('cy', -5)
					.attr('r', 6)
			  		.attr('fill', parseRgba(neutralColor, 1));

			legend.append('text')
			  		.attr('x', 14)
			  		.attr('y', 0)
					.text('SOCIAL')
			  		.attr('class', 'heading4');

			legend.append('circle')
			  		.attr('cx', 65)
			  		.attr('cy', -5)
					.attr('r', 6)
			  		.attr('fill', parseRgba(neutralColor, 0.3));			  		

			legend.append('text')
			  		.attr('x', 72)
			  		.attr('y', 0)
					.text('FACE')
			  		.attr('class', 'heading4');			  					  		

			// Chart
		    var chart = svg.append('g')
						    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

			// Each group is composed by text and bar
		  	var groups = chart.selectAll('g')
					  		.data(dataset)
					  		.enter()
					  		.append('g')
							.attr('transform', function(d, i){
								return 'translate(0, ' + yScale(i) + ')';
							});			

			// Social value
			groups.append('rect')
					.attr('x', 0)
					.attr('y', 13)
			  		.attr('width', function(d, i){
			  			return xScale(d.social_val);
			  		})
					.attr('height', 13)
					.attr('fill', parseRgba(neutralColor, 1));							

			// Face value
			groups.append('rect')
					.attr('x', function(d, i){
			  			return xScale(d.social_val);
			  		})
					.attr('y', 13)
			  		.attr('width', function(d, i){
			  			return xScale(d.face_val);
			  		})
					.attr('height', 13)
					.attr('fill', parseRgba(neutralColor, 0.3));

			// Publisher
		  	groups.append('text')
			  		.attr('x', 0)
			  		.attr('y', 10)
					.text(function(d, i){
						return capText(d.company);
					})
			  		.attr('class', 'heading3');

			// Value
		  	groups.append('text')
			  		.attr('x', 2)
			  		.attr('y', 23)
					.text(function(d, i){
						return numToCurrency(d.social_val + d.face_val);
					})
			  		.attr('class', 'heading4');			  		
		}

		// Draws the top publishers by category
		function drawTopByCategory(dataset){
			
			// Canvas properties
			var svgSize = getCSS('topByCategory');

			// Visualization attributes
			var margin = {top: 70, right: 0, bottom: 0, left: 0};
			var width  = svgSize.width - margin.left - margin.right;
			var height = svgSize.height - margin.top - margin.bottom;

			var yScale = d3.scale.ordinal()
							.domain(d3.range(dataset.length))
							.rangeBands([0, height]);

			var xScale = d3.scale.linear()
						   .domain([0, d3.max(dataset, function(d, i){
															return d.social_val + d.face_val;
														})])
						   .range([0, width]);			

			// Canvas
			var svg = d3.select('body')
						.append('svg')
						.attr('id', 'topByCategory')	
						.attr('width', width + margin.left + margin.right)
					    .attr('height', height + margin.top + margin.bottom);

			// Title
			svg.append('text')
			  		.attr('x', 0)
			  		.attr('y', 20)
					.text('Top by')
			  		.attr('class', 'heading2')
			  		.append('tspan')
			  		.attr('x', 0)
			  		.attr('y', 40)			  		
			  		.text('Category');

			// Legend
			var legend = svg.append('g')
						    .attr('transform', 'translate(0, 60)');

			legend.append('circle')
			  		.attr('cx', 6)
			  		.attr('cy', -5)
					.attr('r', 6)
			  		.attr('fill', parseRgba(neutralColor, 1));

			legend.append('text')
			  		.attr('x', 14)
			  		.attr('y', 0)
					.text('SOCIAL')
			  		.attr('class', 'heading4');

			legend.append('circle')
			  		.attr('cx', 65)
			  		.attr('cy', -5)
					.attr('r', 6)
			  		.attr('fill', parseRgba(neutralColor, 0.3));			  		

			legend.append('text')
			  		.attr('x', 72)
			  		.attr('y', 0)
					.text('FACE')
			  		.attr('class', 'heading4');			  					  		

			// Chart
		    var chart = svg.append('g')
						    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

			// Each group is composed by text and bar
		  	var groups = chart.selectAll('g')
					  		.data(dataset)
					  		.enter()
					  		.append('g')
							.attr('transform', function(d, i){
								return 'translate(0, ' + yScale(i) + ')';
							});			

			// Social value
			groups.append('rect')
					.attr('x', 0)
					.attr('y', 26)
			  		.attr('width', function(d, i){
			  			return xScale(d.social_val);
			  		})
					.attr('height', 13)
					.attr('fill', function(d, i){
						return parseRgba(categoriesColors[i], 1);
					});

			// Face value
			groups.append('rect')
					.attr('x', function(d, i){
			  			return xScale(d.social_val);
			  		})
					.attr('y', 26)
			  		.attr('width', function(d, i){
			  			return xScale(d.face_val);
			  		})
					.attr('height', 13)
					.attr('fill', function(d, i){
						return parseRgba(categoriesColors[i], 0.5);
					});

			// Category
		  	groups.append('text')
			  		.attr('x', 0)
			  		.attr('y', 10)
					.text(function(d, i){
						return d.category;
					})
			  		.attr('class', 'heading4');

			// Publisher
		  	groups.append('text')
			  		.attr('x', 0)
			  		.attr('y', 23)
					.text(function(d, i){
						return capText(d.company);
					})
			  		.attr('class', 'heading3');

			// Value
		  	groups.append('text')
			  		.attr('x', 2)
			  		.attr('y', 36)
					.text(function(d, i){
						return numToCurrency(d.social_val + d.face_val);
					})
			  		.attr('class', 'heading4');
		}

		function drawSocialEngagement(dataset){

			// console.log(dataset);

			// Canvas attributes
			var svgSize = getCSS('socialEngagement');

			// Visualization attributes
			var margin = {top: 35, right: 0, bottom: 0, left: 0};
			var width  = svgSize.width - margin.left - margin.right;
			var height = svgSize.height - margin.top - margin.bottom;
			var textOffset = 8;
			var barHeight = 10;
			var imgSize = 28;

			// Each chart
			var chartMargin = {top: 30, right: 0, bottom: 0, left: 0};
			var chartWidth  = column.width - chartMargin.left - chartMargin.right;
			var chartHeight = height - chartMargin.top - chartMargin.bottom;							

			var yScale = d3.scale.ordinal()
							.domain(d3.range(dataset[0].values.length))
							.rangeBands([0, chartHeight]);

			var xScale = d3.scale.linear()
						   .domain([0, d3.max(dataset, function(d, i){
						   		// console.log(d);
								var maxByCategory = d3.max(d.values, function(e, j){
									// console.log('category: ' + e.category + ', counts: ' + e.counts);
									return e.counts;
								});

								// console.log(maxByCategory);
								return maxByCategory;

							})])
						   .range([0, chartWidth]);			

			// Canvas
			var svg = d3.select('body')
						.append('svg')					
						.attr('id', 'socialEngagement')	
						.attr('width', width + margin.left + margin.right)
					    .attr('height', height + margin.top + margin.bottom);				 

			// Title
			svg.append('text')
			  		.attr('x', 0)
			  		.attr('y', 20)
					.text('Social Engagement by Category')
			  		.attr('class', 'heading2');

		    var allCharts = svg.append('g')
						    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

			var labels = allCharts.selectAll('text')
								.data(dataset[1].values)
								.enter()
								.append('text')
								.attr('x', column.width)
								.attr('y', function(d, i){
									return chartMargin.top + textOffset + yScale(i);
								})
								.attr('text-anchor', 'end')
								.text(function(d, i){
									return d.category;
								})
								.attr('class', 'heading3');			  		

			// Charts
			_.each(dataset, function(element, index, list){

			    var chart = allCharts.append('g')
							   		 .attr('transform', 'translate(' + (chartMargin.left + (width/6) * (index + 1)) + ',' + chartMargin.top + ')');

				// Logo
				chart.append('svg:image')
						   .attr('x', - textOffset/2 - imgSize)
						   .attr('y', - barHeight/2 - imgSize)
						   .attr('width', imgSize)
						   .attr('height', imgSize)
						   .attr('xlink:href', 'img/' + social_logos[index]);

				// Bars
				chart.selectAll('rect')
						.data(element.values)
						.enter()
						.append('rect')
						.attr('x', 0)
						.attr('y', function(d, i){
							return yScale(i);
						})
						.attr('width', function(d, i){
							return xScale(d.counts)
						})
						.attr('height', barHeight)
						.attr('fill', function(d, i){
							return parseRgba(categoriesColors[i], 1);
						});

				// Values
				chart.selectAll('text')
						.data(element.values)
						.enter()
						.append('text')
						.attr('x', -textOffset/2)
						.attr('y', function(d, i){
							return  textOffset + yScale(i);
						})
						.text(function(d, i){
							return d.counts;
						})
						.attr('text-anchor', 'end')
						.attr('class', 'heading4');						
			});

		}


		/*-------- AUXILIAR (DRAW) FUNCTIONS ---------*/

		function getCSS(id){
			
			// Creating a fake element and apending it to the body,
			// to read its css properties
			var protoElement = $('<svg id='+ id + '></svg>');
			$('body').append(protoElement);
			// Canvas attributes
			var svgSize = {
				width: $(protoElement).width(),
				height: $(protoElement).height()
			}
			$(protoElement).remove();			

			return svgSize;
		}

		function numToCurrency(num){
			num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
			num = '$' + num;
			return num;
		}

		function parseRgba(color, a){
			var myRgbColor = 'rgba(' + color.r + ', ' + color.g + ', ' + color.b + ', ' + a +')';
			return myRgbColor;
		}

		function capText(txt){
			if(txt.length > 20){
				txt = txt.slice(0, 20);
				txt += '...'
			}
			return txt;
		}

	};

	return {
		init: init
	};
})();

app.main.init();