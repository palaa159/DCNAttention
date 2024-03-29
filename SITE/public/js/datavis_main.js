/* Your code starts here */

var app = app || {};

app.main = (function() {
	
	var init = function() {

		// app starts running here

		/*----- 'GLOBAL' VARS -----*/
		
		// Design
		var transitionDuration = 750;

		var isMobile = (window.innerWidth < window.innerHeight) ? (true) : (false);
		// alert(isMobile);

		var column, gutter;

		if(!isMobile){
			column = {
				width: window.innerWidth/10,
				height: window.innerHeight/10
			};
			gutter = {
				width: window.innerWidth * 0.03,
				height: window.innerHeight * 0.03
			};
		}else{
			var svgSize = getCSS('socialEngagement-container');
			gutter = {
				width: 40,
				height: 40
			};				
			column = {
				width: svgSize.width,
				height: svgSize.height
			};
		}
		// console.log(column);

		var categoriesColors = [
			{	h: 195,		s: 85,		l: 65	},
			{	h: 20,		s: 85,		l: 60	},
			{	h: 285,		s: 45,		l: 65	},
			{	h: 330,		s: 70,		l: 65	},
			{	h: 40,		s: 90,		l: 50	},
			{	h: 155,		s: 70,		l: 60	},
			{	h: 350,		s: 80,		l: 65	}
		];
		var neutralColor = {h: 170, s: 0, l: 70};
		var currentColors;

		// Data
		var cat, left, right, leftCompany, rightCompany;

		// Connecting to socket.io
		var socket = io("http://attention.market:80");
		socket.on('showing', function(data){

			if(data.cat !=  cat && data.left != left && data.right != right){

				console.log(data);
				left = data.left;
				right = data.right;
				cat = data.cat;
				console.log('connected');

				// update
				loadAndStart(true);
			}
		});		

		var allCategories;
		// var allCompanies;

		var social_counts = ['twitter_counts', 'fb_counts', 'google_counts', 'linkedin_counts', 'pinterest_counts'];
		var social_logos = ['social_network_twitter.png', 'social_network_facebook.png', 'social_network_google.png', 'social_network_linkedin.png', 'social_network_pinterest.png'];

		loadAndStart(false);

		function loadAndStart(update){

			currentColors = [];

			// // Load all data
			// d3.json("dummy_data/getcontents.json", function(error, json) {
			d3.json('http://attention.market/api/getcontents', function(error, json) {
				if (error) return console.warn(error);

				if(!update){
					cat = Math.ceil(Math.random()*7);
					// console.log(cat);
					var filteredData = _.filter(json, function(obj){
						return obj.cat_id == cat;
					});				
					left = filteredData[0].objectId;
					right = filteredData[1].objectId;
				}

				// Filling out our 'globals' — lists of categories and companies
				allCategories = getAllCategories(json);
				// allCompanies = getAllCompanies(json);

				processTop5(json , drawTop5, update);
				processTopByCategory(json, drawTopByCategory, update);
				processSocialEngagement(json, drawSocialEngagement, update);				

				// Filter current category
				var filteredData = _.filter(json, function(obj){
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

				currentColors = getCurrentColors(sortedData);

				console.log('left: ' + leftCompany);
				console.log('right: ' + rightCompany);

				processTopChart(sortedData, drawTopChart, update);
				processMainChart(sortedData, drawMainChart, update);
			});			
		}

		$('body').bind('click', function(){
			loadAndStart(true);
		});

		/*---------- DATA PROCESSING ----------*/

		function processTopChart(data, callback, update){
			// console.log(data);

			// console.log(currentColors);
			callback(data, update);
		}

		// CHART: Main (current category)
		function processMainChart(data, callback, update){

			// Some more data processing before drawing the chart
			// Adding a last element to each val_history array,
			// with the current timestamp (so all lines extend till the current time)
			var fullTimeline = _.each(data, function(element, index, list){
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
		function processTop5(data, callback, update){

			var newData = mergeCompanies(data);
			// var newData = data;

			var sortedData = _.sortBy(newData, function(obj){
				return obj.face_val + obj.social_val;
			});
			sortedData.reverse();
			// console.log(sortedData);

			sortedData = sortedData.slice(0, 5);

			callback(sortedData, update);
		}

		// CHART: Top Publisher by Category
		function processTopByCategory(data, callback, update){

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

			callback(newData, update);
		}

		// CHART: Social Engagement by Category
		function processSocialEngagement(data, callback, update){

			// console.log(data);

			var newData = [];

			_.each(social_counts, function(social_count_title, index, list){
				
				// console.log('Starting processing of ' + social_count_title);
				
				var totalBySocialNetwork = [];

				_.each(allCategories, function(category_obj, index, list){

					// console.log('\t' + category_obj.title);

					var filteredData = _.filter(data, function(value, key, list){
						return value.category == category_obj.title;
					});
					// console.log(filteredData);

					var totalByCategory = 0;
					_.each(filteredData, function(value, key, list){
						// console.log(value);
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

			callback(newData, update);
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

					if(value[i].objectId == left){
						highlight = true;
						leftCompany = value[i].company;
					}else if(value[i].objectId == right){
						highlight = true;
						rightCompany = value[i].company;						
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

		function drawTopChart(dataset, update){

			// console.log(dataset);
			var currentIndexes = [];
			var currentContenders = _.filter(dataset, function(element, index, list){
				if(element.highlight){
					currentIndexes.push(index);
				}
				return element.highlight == true;
			});
			// console.log(currentContenders);
			// console.log(currentIndexes);

			dataset = currentContenders;

			var theseColors = [];
			_.each(currentIndexes, function(element){
				theseColors.push(currentColors[element]);
			});
			// console.log(theseColors);

			console.log(dataset);
			if(dataset[0].company != leftCompany){
				console.log('reversing');
				dataset.reverse();
				theseColors.reverse();
				console.log(dataset);
			}

			/*----- LAYOUT -----*/
			var svgSize = getCSS('topChart-container');

			// Visualization attributes		
			var margin = {top: 0, right: 0, bottom: 0, left: 0};
			var width  = svgSize.width - margin.left - margin.right;
			var height = svgSize.height - margin.top - margin.bottom;
			var barHeight = height/2;	
			var textOffset = gutter.width/4;
			// console.log(svgSize);

			// Each chart
			var chartWidth = (isMobile) ? (column.width/2) : (3 * column.width + 2 * gutter.width);

			var xScale = d3.scale.linear()
						   .domain([0, d3.max(dataset, function(d, i){
								return d.social_val + d.face_val;
							})])
						   .range([0, chartWidth]);

			if(!update){

				// Canvas
				var svg = d3.select('#topChart-container')
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
									var xOffset;
									if(!isMobile){
										xOffset = (i == 0) ? (0) : (4 * (column.width + gutter.width));
									}else{
										xOffset = (i == 0) ? (0) : (chartWidth);
									}
									return 'translate(' + xOffset + ', 0)';
								});			

				// Social value bar
				groups.append('rect')
						.attr('x', 0)
						.attr('y', barHeight)
						.attr('height', barHeight)
						// .attr('fill', parseHsla(categoriesColors[parseInt(cat) - 1], 1))
						.attr('fill', function(d, i){
							return parseHsla(theseColors[i], 1);
						})
						.attr('transform', function(d, i){
							var offset = (i == 0) ? (chartWidth) : (0);
							var flip = (i == 0) ? (-1) : (1);						
							return 'translate(' + offset + ', 0) scale(' + flip + ', 1)';
						})
						.attr('width', 0)
						.transition()
						.duration(transitionDuration)
						.attr('width', function(d, i){
							return xScale(d.social_val);
						});

				// Social value text
				groups.append('text')
						.attr('x', function(d, i){
							if(i == 0){
								return chartWidth - textOffset;
							}else{
								return textOffset;
							}
						})
						.attr('y', 1.35*barHeight)
						.attr('text-anchor', function(d, i){
							return (i == 0) ? ('end') : ('start');
						})
						.attr('class', function(d, i){
							return (isMobile) ? ('heading5') : ('heading4');	
						})
						.text(function(d, i){

							// Only writes value if there's enough space
							if(checkFitting(xScale, d.social_val)){
								return 'Social Value';
							}
						})
						.style('opacity', 0)
						.transition()
						.duration(transitionDuration)
						.style('opacity', 1);						
						
				groups.append('text')
						.attr('x', function(d, i){
							if(i == 0){
								return chartWidth - textOffset;
							}else{
								return textOffset;
							}
						})
						.attr('y', 1.85 * barHeight)
						.attr('text-anchor', function(d, i){
							return (i == 0) ? ('end') : ('start');
						})						
						.attr('class', function(d, i){
							return (isMobile) ? ('heading4') : ('heading3');	
						})						
						.text(function(d, i){
							// Only writes value if there's enough space
							if(checkFitting(xScale, d.social_val)){
								return d.social_val.formatMoney(2);
							}
						})
						.style('opacity', 0)
						.transition()
						.duration(transitionDuration)
						.style('opacity', 1);

				// Face value bar
				groups.append('rect')
						.attr('x', function(d, i){
								return xScale(d.social_val);
						})
						.attr('y', barHeight)				
						.attr('height', barHeight)
						.attr('fill', function(d, i){
							return parseHsla(theseColors[i], 0.5);
						})
						.attr('transform', function(d, i){
							var offset = (i == 0) ? (chartWidth) : (0);
							var flip = (i == 0) ? (-1) : (1);						
							return 'translate(' + offset + ', 0) scale(' + flip + ', 1)';
						})
						.attr('width', 0)
						.transition()
						.duration(transitionDuration)
						.attr('width', function(d, i){
							return xScale(d.face_val);
						});;

				groups.append('text')
						.attr('x', function(d, i){
							if(i == 0){
								return chartWidth - xScale(d.social_val) - textOffset;
								return chartWidth - textOffset;
							}else{
								return xScale(d.social_val) + textOffset;
								return textOffset;
							}
						})
						.attr('y', 1.45*barHeight)
						.attr('text-anchor', function(d, i){
							return (i == 0) ? ('end') : ('start');
						})
						.attr('class', function(d, i){
							return (isMobile) ? ('heading5') : ('heading4');	
						})
						.text(function(d, i){

							// Only writes value if there's enough space
							if(checkFitting(xScale, d.face_val)){
								return 'Face Value';
							}
						})
						.style('opacity', 0)
						.transition()
						.duration(transitionDuration)
						.style('opacity', 1);						
						
				groups.append('text')
						.attr('x', function(d, i){
							if(i == 0){
								return chartWidth - xScale(d.social_val) - textOffset;
								return chartWidth - textOffset;
							}else{
								return xScale(d.social_val) + textOffset;
								return textOffset;
							}
						})
						.attr('y', 1.80 * barHeight)
						.attr('text-anchor', function(d, i){
							return (i == 0) ? ('end') : ('start');
						})						
						.attr('class', function(d, i){
							return (isMobile) ? ('heading4') : ('heading3');	
						})						
						.text(function(d, i){
							// Only writes value if there's enough space
							if(checkFitting(xScale, d.face_val)){
								return d.face_val.formatMoney(2);
							}
						})
						.style('opacity', 0)
						.transition()
						.duration(transitionDuration)
						.style('opacity', 1);

				// Companies
				groups.append('text')
						.attr('x', function(d, i){
							return (i == 0) ? (chartWidth - textOffset) : (textOffset);
						})
						.attr('y', 0.8*barHeight)
						.attr('text-anchor', function(d, i){
							return (i == 0) ? ('end') : ('start');
						})
						.text(function(d, i){
							return capText(d.company) + ' | ' + (d.face_val + d.social_val).formatMoney(2);
						})
						.attr('class', function(d, i){
							return (isMobile) ? ('heading4') : ('heading2');
						})
						.style('opacity', 0)
						.transition()
						.duration(transitionDuration)
						.style('opacity', 1);

				// Middle line
				svg.append('rect')
					.attr('x', svgSize.width/2)
					.attr('y', 0)
					.attr('width', 1)
					.attr('height', svgSize.height + 10);

			// Update
			}else{
				// console.log('Updating chart...');
				// console.log(dataset);

			    // Select the section we want to apply our changes to
			    var svg = d3.select("#topChart")
				             .transition();

				var groups = svg.selectAll('g');
				var bars = groups.selectAll('rect')
									.duration(transitionDuration)
									.attr('width', 0)
									.each('end', function(d, i){
										// console.log(i);
										if (i == groups.length - 1) {
											// Remove the whole chart
											d3.select('#topChart').remove();
											drawTopChart(dataset, false);
										};
									});

				var labels = groups.selectAll('text')
									.duration(transitionDuration)
									.style('opacity', 0);
			}

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
			var svgSize = getCSS('mainChart-container');

			// Visualization attributes
			var margin;

			if(!isMobile){
				margin = {
					top: 1.5 * getFontSize('heading2'),
					right: column.width * 1.5 + gutter.width,
					bottom: gutter.height,
					left: gutter.width
				};
			}else{
				margin = {
					top: 1.5 * getFontSize('heading2'),
					right: gutter.width * 2,
					bottom: svgSize.height/2,
					left: gutter.width * 2
				};
			} 
			var width  = svgSize.width - margin.left - margin.right;
			var height = svgSize.height - margin.top - margin.bottom;
			var barHeight = 1.25 * getFontSize('heading3');

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
								.ticks(5)
							    .scale(xScale)
							    .orient("bottom");

			// Y Scale
			var yAxis = d3.svg.axis()
							    .scale(yScale)
							    .orient("left")
							    .ticks(5);

			// Create
			if(!update){

				if(isMobile){
					var realHeight = svgSize.height/2 + (2 * gutter.height) + (dataset.length * barHeight);
					$('#mainChart-container').height(realHeight);
				}

				// Canvas
				var svg = d3.select('#mainChart-container')
							.append('svg')
							.attr('id', 'mainChart');
							// .attr('width', width + margin.left + margin.right);
						 //    .attr('height', height + margin.top + margin.bottom);

				// Title
				svg.append('text')
			  		.attr('x', 0)
			  		.attr('y', getFontSize('heading2'))
					.text(dataset[0].category)
			  		.attr('class', 'heading2')
			  		.attr('id', 'title')
					.style('opacity', 0)
					.transition()
					.duration(transitionDuration)
					.style('opacity', 1);


				// Chart
			    var chart = svg.append('g')
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
					    .attr("y", getFontSize('heading3'))
					    .attr('x', - (margin.top + getFontSize('heading2')))
					    // .attr("dy", ".71em")
					    // .style("text-anchor", "end")
					    .text("Valuation $")
				    	.append('tspan')
				    	.style("text-anchor", "end")
				    	.attr("y", getFontSize('heading3') * 1.75)
				    	// .attr('x', -20)
				    	.text('(Face + Social)');

			var longTicks = svg.select('.y.axis')
								.selectAll('line')
					 			.attr('x1', width);
					
			      // .attr('transform', function(d, i) {
			      // 	return 'translate(0,' + i * 30 + ')';
			      // })
			      // .each(function(d) {
			      // 	d3.select(this).call(axis.scale(y[d]).orient('right'));
			      // });						    

			  	// Lines
				var company = chart.selectAll(".line")
						      		.data(dataset)
								    .enter()
									.append("path")
									.attr("class", "line")
									// .attr('stroke', parseHsla(categoriesColors[parseInt(cat) - 1], 1))
									.attr('stroke', function(d, i){
										// console.log(currentColors);
										return parseHsla(currentColors[i], 1);
									})
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
									.duration(transitionDuration)
									.attr("d", function(d) { return line(d.val_history); });

				// Labels
			    var labels = svg.append('g')
					    		.attr('transform', function(){
					    			if(isMobile){
					    				return 'translate(' + margin.left + ' ,' + (margin.bottom + 2*gutter.height) + ')';
					    			}else{
										// return 'translate(' + ((4.75 * gutter.width) + (5 * column.width)) + ',' + margin.top + ')';
										return 'translate(' + (width + 2*gutter.width) + ',' + margin.top + ')';
					    			}
					    		})
					    		.attr('id', 'labels');

				labels.selectAll('circle')
						.data(dataset)
						.enter()
						.append('circle')
						.attr('cx', -barHeight*0.8)
						.attr('cy', function(d, i){
							return ((i * barHeight) - barHeight*0.2);
						})
						.attr('r', barHeight*0.4)
						.attr('fill', function(d, i){
							return parseHsla(currentColors[i], 1);
						})
						.style('opacity', 0)
						.transition()
						.duration(transitionDuration)
						.style('opacity', 1);


				labels.selectAll('text')
						.data(dataset)
						.enter()
						.append('text')
						.attr('x', 0)
						.attr('y', function(d, i){
							return i * barHeight;
						})
						.text(function(d, i){
							return (d.face_val + d.social_val).formatMoney(2) + ' | ' + capText(d.company);
						})
						.attr('class', function(d, i){
							if(d.highlight){
								return 'heading3';
							}else{
								return 'heading4';
							}
						})
						.attr('fill', function(d, i){
							if(d.highlight){
								// console.log(parseHsla(currentColors[i], 1));
								return parseHsla(currentColors[i], 1);
							}else{
								return 'heading4';
							}							
						})
						.style('opacity', 0)
						.transition()
						.duration(transitionDuration)
						.style('opacity', 1);

			// Update
			}else{
			
				// console.log('Updating chart...');
				// console.log(dataset);

			    // Select the section we want to apply our changes to
			    var svg = d3.select("#mainChart")
				             .transition();

			    // Transitioning the scales
		        svg.select(".x.axis") // change the x axis
		            .duration(transitionDuration)
		            .call(xAxis);

		        svg.select(".y.axis") // change the y axis
		            .duration(transitionDuration)
		            .call(yAxis);

		        // Shrinking lines and removing them
		        var chart = svg.select('#chart');	

				var company = chart.selectAll('.line')
									.duration(transitionDuration)
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
				var labels = svg.select('#labels');

				labels.selectAll('text')
						.duration(transitionDuration)
						.style('opacity', 0.0);

				labels.selectAll('circle')
						.duration(transitionDuration)
						.style('opacity', 0.0);

				var title = svg.select('#title')
								.duration(transitionDuration)
								.style('opacity', 0.0);						
			}

		}

		function drawTop5(dataset, update){

			// Canvas properties
			var svgSize = getCSS('top5-container');			

			// Visualization attributes
			var margin = {top: 2 * getFontSize('heading2'), right: 0, bottom: 0, left: 0};
			var width  = svgSize.width - margin.left - margin.right;
			var height = svgSize.height - margin.top - margin.bottom;
			var barHeight = getFontSize('heading3');

			var yScale = d3.scale.ordinal()
							.domain(d3.range(dataset.length))
							.rangeBands([0, height]);

			var xScale = d3.scale.linear()
						   .domain([0, d3.max(dataset, function(d, i){
															return d.social_val + d.face_val;
														})])
						   .range([0, width]);

			if(!update){

				// Canvas
				var svg = d3.select('#top5-container')
							.append('svg')
							.attr('id', 'top5')	
							.attr('width', width + margin.left + margin.right)
						    .attr('height', height + margin.top + margin.bottom);

				// Title
				svg.append('text')
				  		.attr('x', 0)
				  		.attr('y', margin.top/2)
						.text('Top 5 Overall')
				  		.attr('class', 'heading2');

				 drawLegend(svg, margin.top*0.9);

				// Chart
			    var chart = svg.append('g')
							    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
							    .attr('id', 'chart');

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
						.attr('y', 1.2*barHeight)
						.attr('height', barHeight)
						.attr('fill', parseHsla(neutralColor, 1))
				  		.attr('width', 0)
				  		.transition(transitionDuration)
				  		.attr('width', function(d, i){
				  			return xScale(d.social_val);
				  		})						

				// Face value
				groups.append('rect')
						.attr('x', function(d, i){
				  			return xScale(d.social_val);
				  		})
						.attr('y', 1.2*barHeight)
						.attr('height', barHeight)
						.attr('fill', parseHsla(neutralColor, 0.3))
				  		.attr('width', 0)
				  		.transition(transitionDuration)
				  		.attr('width', function(d, i){
				  			return xScale(d.face_val);
				  		})

				// Publisher
			  	groups.append('text')
				  		.attr('x', 0)
				  		.attr('y', barHeight)
						.text(function(d, i){
							return capText(d.company);
						})
				  		.attr('class', 'heading3')
				  		.style('opacity', 0)
				  		.transition(transitionDuration)
				  		.style('opacity', 1);;

				// Value
			  	groups.append('text')
				  		.attr('x', 2)
				  		.attr('y', 2*barHeight)
						.text(function(d, i){
							return (d.social_val + d.face_val).formatMoney(2);
						})
				  		.attr('class', 'heading4')
				  		.style('opacity', 0)
				  		.transition(transitionDuration)
				  		.style('opacity', 1);

			// Update
			}else{
				// console.log('Updating chart...');
				// console.log(dataset);

			    // Select the section we want to apply our changes to
			    var svg = d3.select("#top5")
				             .transition();

		        var chart = svg.select('#chart');

		        var groups = chart.selectAll('g');

				// Shrinking the bars and removing them
				groups.selectAll('rect')
						.duration(transitionDuration)
						.attr('width', 0)

				// Fading texts
				groups.selectAll('text')
						.duration(transitionDuration)
						.style('opacity', 0)
						.each('end', function(d, i){
							if (i == groups.length - 1) {
								// Remove the whole chart
								d3.select('#top5').remove();
								drawTop5(dataset, false);
							};
						});		
			}	
		}

		// Draws the top publishers by category
		function drawTopByCategory(dataset, update){

			// console.log(update);
			
			// Canvas properties
			var svgSize = getCSS('topByCategory-container');

			// Visualization attributes
			var margin = {top: (isMobile) ? (2 * getFontSize('heading2')) : (3 * getFontSize('heading2')), right: 0, bottom: 0, left: 0};
			var width  = svgSize.width - margin.left - margin.right;
			var height = svgSize.height - margin.top - margin.bottom;
			var barHeight = getFontSize('heading3');

			var yScale = d3.scale.ordinal()
							.domain(d3.range(dataset.length))
							.rangeBands([0, height]);

			var xScale = d3.scale.linear()
						   .domain([0, d3.max(dataset, function(d, i){
								return d.social_val + d.face_val;
							})])
						   .range([0, width]);

			if(!update){

				// Canvas
				var svg = d3.select('#topByCategory-container')
							.append('svg')
							.attr('id', 'topByCategory')	
							.attr('width', width + margin.left + margin.right)
						    .attr('height', height + margin.top + margin.bottom);

				// Title and legend
				var title, legend;

				if(!isMobile){
					title = svg.append('text')
						  		.attr('x', 0)
						  		.attr('y', margin.top*0.3)
								.text('Top by')
						  		.attr('class', 'heading2')
						  		.append('tspan')
						  		.attr('x', 0)
						  		.attr('y', margin.top*0.6)			  		
						  		.text('Category');					
				}else{
					title = svg.append('text')
						  		.attr('x', 0)
						  		.attr('y', margin.top/2)
								.text('Top by Category')
						  		.attr('class', 'heading2');					
				}

				drawLegend(svg, margin.top*0.9);			  					  		

				// Chart
			    var chart = svg.append('g')
							    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
							    .attr('id', 'chart');

				// Each group is composed by text and bars
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
						.attr('y', 2.2*barHeight)
				  		.attr('width', function(d, i){
				  			return xScale(d.social_val);
				  		})
						.attr('height', barHeight)
						.attr('fill', function(d, i){
							return parseHsla(categoriesColors[i], 1);
						})
						.attr('class', 'social');

				// Face value
				groups.append('rect')
						.attr('x', function(d, i){
				  			return xScale(d.social_val);
				  		})
						.attr('y', 2.2*barHeight)
				  		.attr('width', function(d, i){
				  			return xScale(d.face_val);
				  		})
						.attr('height', barHeight)
						.attr('fill', function(d, i){
							return parseHsla(categoriesColors[i], 0.5);
						})
						.attr('class', 'face');

				// Category
			  	groups.append('text')
				  		.attr('x', 0)
				  		.attr('y', barHeight)
						.text(function(d, i){
							return d.category;
						})
				  		.attr('class', 'heading5');

				// Publisher
			  	groups.append('text')
				  		.attr('x', 0)
				  		.attr('y', 2*barHeight)
						.text(function(d, i){
							return capText(d.company);
						})
				  		.attr('class', 'heading3');

				// Value
			  	groups.append('text')
				  		.attr('x', 2)
				  		.attr('y', 3*barHeight)
						.text(function(d, i){
							return (d.social_val + d.face_val).formatMoney(2);
						})
				  		.attr('class', 'heading4 values');

			// Update
			}else{
				// console.log('Updating chart...');
				// console.log(dataset);

				// Fake update
				// _.each(dataset, function(element, index, list){
				// 	element.face_val = Math.random()*100;
				// 	element.social_val = Math.random()*100;
				// });
				// dataset = _.shuffle(dataset);

			    var svg = d3.select("#topByCategory");

				// Chart
			    var chart = svg.select('#chart');
			    // console.log(chart);

			  	var groups = chart.selectAll('g');

				var socialBars = groups.select('.social')
								  		.data(dataset)
										.transition()
										.duration(transitionDuration)
								  		.attr('width', function(d, i){
								  			return xScale(d.social_val);
								  		});

				var faceBars = groups.select('.face')
								  		.data(dataset)
										.transition()
										.duration(transitionDuration)
										.attr('x', function(d, i){
								  			return xScale(d.social_val);
								  		})
								  		.attr('width', function(d, i){
								  			return xScale(d.face_val);
								  		});

			  	var publishers = groups.select('.heading3')
							  		.data(dataset)
									.text(function(d, i){
										return capText(d.company);
									});
				// console.log('publishers');

				var values = groups.select('.heading4.values')
							  		.data(dataset)
									.text(function(d, i){
										return (d.social_val + d.face_val).formatMoney(2);
									});
			}
		}

		function drawSocialEngagement(dataset, update){

			// console.log(dataset);

				// Fake update
				// _.each(dataset, function(element, index, list){
				// 	_.each(element.values, function(e, i, l){
				// 		e.counts = Math.random()*500;
				// 	});
				// });			

			// Canvas attributes
			var svgSize = getCSS('socialEngagement-container');

			// Visualization attributes
			var margin = {
				top: (isMobile) ? (2.5 * getFontSize('heading2')) : (1.5 * getFontSize('heading2')),
				right: 0, bottom: 0, left: 0
			};
			var width  = svgSize.width - margin.left - margin.right;
			var height = svgSize.height - margin.top - margin.bottom;
			var barHeight = getFontSize('heading3');
			var textOffset = barHeight/2;			
			var imgSize = 28;

			// Each chart
			var chartMargin = {top: 30, right: 0, bottom: (isMobile) ? (30) : (0), left: (isMobile) ? (svgSize.width/2) : (0)};
			var chartWidth  = column.width - chartMargin.left - chartMargin.right;
			var chartHeight = (isMobile) ? ((height - margin.top - margin.bottom)/4  - chartMargin.top - chartMargin.bottom) : (height - chartMargin.top - chartMargin.bottom);

			var yScale = d3.scale.ordinal()
							.domain(d3.range(dataset[0].values.length))
							.rangeBands([0, chartHeight]);

			if(!update){

				// Canvas
				var svg = d3.select('#socialEngagement-container')
							.append('svg')					
							.attr('id', 'socialEngagement')	
							.attr('width', width + margin.left + margin.right)
						    .attr('height', height + margin.top + margin.bottom);				 

				// Title
				svg.append('text')
				  		.attr('x', 0)
				  		.attr('y', getFontSize('heading2'))
						.text('Social Engagement Counts')
				  		.attr('class', 'heading2');

			    var allCharts = svg.append('g')
								    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
								    .attr('id', 'allCharts');		  		

				// Charts
				_.each(dataset, function(element, index, list){

					var xScale = d3.scale.linear()
								   .domain([0, d3.max(element.values, function(d, i){
								   		return d.counts;
									})])
								   .range([0, chartWidth]);

				    var chart = allCharts.append('g')
								   		 .attr('transform', function(){
								   		 	if(isMobile){
								   		 		return 'translate(' + chartMargin.left + ', ' + (index*(chartHeight + chartMargin.top + chartMargin.bottom)) + ')';
								   		 	}else{
								   		 		return 'translate(' + (chartMargin.left + (width/6) * (index + 1)) + ',' + chartMargin.top + ')';
								   		 	}
								   		 })
								   		 .attr('id', 'chart');

					if(isMobile || (!isMobile && index == 0)){
						var labels = chart.selectAll('.heading3.labels')
											.data(dataset[1].values)
											.enter()
											.append('text')
											.attr('x', -6*textOffset)
											// .attr('y', 0)
											.attr('y', function(d, i){
												return textOffset + getFontSize('heading4')/3 + yScale(i);
											})
											.attr('text-anchor', 'end')
											.text(function(d, i){
												return d.category;
											})
											// .attr('class', function(){
											// 	return (isMobile) ? ('heading4 labels') : ('heading3 labels');
											// });
											.attr('class', 'heading4')
											.style('font-weight', 'bold');
					}								   		 

					// Logo
					chart.append('svs:image')
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
								return parseHsla(categoriesColors[i], 1);
							});

					// Values
					chart.selectAll('.heading4.values')
							.data(element.values)
							.enter()
							.append('text')
							.attr('x', -textOffset/2)
							.attr('y', function(d, i){
								return  textOffset + getFontSize('heading4')/3 + yScale(i);
							})
							.text(function(d, i){
								return d.counts;
							})
							.attr('text-anchor', 'end')
							.attr('class', 'heading4 values');						
				});				

			// Update
			}else{
				// console.log('Updating chart...');
				// console.log(dataset);

			    var svg = d3.select("#socialEngagement");

				// Chart
			    var chart = svg.select('#allCharts');
			    // console.log(chart);

			  	var groups = chart.selectAll('g')
  				  					.attr('n', function(d, i){
				  						return i;
				  					})
			  						.data(dataset);

			  	var bars = groups.selectAll('rect')
		  						.data(function(d, i){
		  							// console.log(d.values);
		  							return d.values;
		  						})
								.transition()
								.duration(transitionDuration)
						  		.attr('width', function(e, j){

						  			var i = $(this).parent().attr('n');
						  			// console.log(dataset[i]);

						  			var max = d3.max(dataset[i].values, function(f, h){
						  								// console.log(f);
												   		return f.counts;
													});
						  			// console.log(max);

								  	var xScale = d3.scale.linear()
												   .domain([0, max])
												   .range([0, chartWidth]);	

						  			return xScale(e.counts);
						  		});

				// Values
				var texts = groups.selectAll('.heading4.values')
			  						.data(function(d, i){
			  							return d.values;
			  						})
									.text(function(d, i){
										return Math.round(d.counts);
									});

			}	



		}


		/*-------- AUXILIAR (DRAW) FUNCTIONS ---------*/

		function getCSS(id){			
			// Creating a fake element and apending it to the body,
			// to read its css properties
			var protoElement = $('<div id='+ id + ' class="container"></div>');
			$('body').append(protoElement);
			var verticalPadding = $(protoElement).css('padding-top');
			verticalPadding = verticalPadding.substring(0, verticalPadding.indexOf('p'));
			verticalPadding = 2*parseInt(verticalPadding);
			// console.log(verticalPadding);

			// Canvas attributes
			var svgSize = {
				width: $(protoElement).width(),
				height: $(protoElement).height() - verticalPadding
			}
			$(protoElement).remove();			

			return svgSize;
		}

		function getFontSize(thisClass){
			var protoElement = $('<text class=' + thisClass + '></div>');
			$('body').append(protoElement);
			var fontSize = $(protoElement).css('font-size');
			fontSize = fontSize.substring(0, fontSize.indexOf('p'));
			fontSize = parseInt(fontSize);
			// console.log(fontSize);
			$(protoElement).remove();

			return fontSize;
		}

		function numToCurrency(num){
			num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
			num = '$' + num;
			return num;
		}

		Number.prototype.formatMoney = function(c, d, t){
		var n = this, 
		    c = isNaN(c = Math.abs(c)) ? 2 : c, 
		    d = d == undefined ? "." : d, 
		    t = t == undefined ? "," : t, 
		    s = n < 0 ? "-" : "", 
		    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
		    j = (j = i.length) > 3 ? j % 3 : 0;
		   return '$' + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
		 };

		function parseHsla(color, a){
			var myHslaColor = 'hsla(' + color.h + ', ' + color.s + '%, ' + color.l + '%, ' + a +')';
			return myHslaColor;
		}

		function getCurrentColors(data){
			var newColors = [];
			_.each(data, function(element, index, list){
				var baseColor = categoriesColors[parseInt(cat) - 1];
				var offset = 10;
				var newColor = {
					h: baseColor.h + (index*offset),
					s: baseColor.s,
					l: baseColor.l
				};
				newColors.push(newColor);
			});
			// console.log(newColors);
			return newColors;
		}

		function capText(txt, max){
			var max = 16;
			if(txt.length > max){
				txt = txt.slice(0, max);
				txt += '...'
			}
			return txt;
		}

		function checkFitting(scale, val){
			if(isMobile){
				if(scale(val) > gutter.width * 3.5){
					return true;
				}
			}else if(scale(val) > gutter.width * 2){
				return true;	
			}
		}

		function drawLegend(svg, marginTop){

			// Legend
			var legend = svg.append('g')
						    .attr('transform', 'translate(0, ' + marginTop + ')');

			var radius = getFontSize('heading4')/2;

			legend.append('circle')
			  		.attr('cx', radius)
			  		.attr('cy', -radius)
					.attr('r', radius)
			  		.attr('fill', parseHsla(neutralColor, 1));

			legend.append('text')
			  		.attr('x', 2.5*radius)
			  		.attr('y', 0)
					.text('Social Value')
			  		.attr('class', 'heading4');

			legend.append('circle')
			  		.attr('cx', 16*radius)
			  		.attr('cy', -radius)
					.attr('r', radius)
			  		.attr('fill', parseHsla(neutralColor, 0.6));			  		

			legend.append('text')
			  		.attr('x', 17.5*radius)
			  		.attr('y', 0)
					.text('Face Value')
			  		.attr('class', 'heading4');		
		}

	};

	return {
		init: init
	};
})();

app.main.init();