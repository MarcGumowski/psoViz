///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Particle Swarm Optimization Visualization
//
// Author : Marc Gumowski
//
// Description : Function allowing to visualize a simple implementation of the  particle 
//               swarm optimization algorithm (PSO).
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function psoViz(id, expr, options) {

  ////////////////////////////////////////////////////////
  // Initial options /////////////////////////////////////
  ////////////////////////////////////////////////////////
  
  var cfg = {
    width: Math.min(760, window.innerWidth - 10),
    height: Math.min(640, window.innerHeight - 20),
    grid: { xMin: -2, xMax: 2, yMin: -2, yMax: 2 },
    // Vizualization parameters
    radius: 3,
    color: 'ff6600',
    colorBest: "#1b9e77",
    // Algorithm parameters
    iteration: 100,
    number: 50,
    w: 0.72984,
    c1: 2.05 * 0.72984,
    c2: 2.05 * 0.72984,
    animationSpeed: 1
  };
  
  //Put all of the options into a variable called cfg
	if('undefined' !== typeof options){
	  for(var p in options){
		if('undefined' !== typeof options[p]){ cfg[p] = options[p]; }
	  }
	}
	
	function randomize(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  Array.prototype.getMin = function(attrib) {
    return this.reduce(function(prev, curr){ 
        return prev[attrib] < curr[attrib] ? prev : curr; 
    });
  };
  
  function getgbest(data) {
    best = data.getMin('pbestEval');
    best.color = cfg.colorBest;
    return best;
  }	

  ////////////////////////////////////////////////////////
  // SVG /////////////////////////////////////////////////
  ////////////////////////////////////////////////////////
	
	// Svg
	var svg = d3.select(id).append("svg")
	    .attr('id', 'psoVizSVG')
			.attr("width",  cfg.width)
			.attr("height", cfg.height);
	
	// Tooltip		
	var tip = d3.select(id).append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
  
  // Create a table to display the results
  d3.select("#psoVizResults").append("table");
  var tipBestX = d3.select("#psoVizResults").selectAll("table").append("tr"),
      tipBestY = d3.select("#psoVizResults").selectAll("table").append("tr"),
      tipBestF = d3.select("#psoVizResults").selectAll("table").append("tr"),
      tipBestIt = d3.select("#psoVizResults").selectAll("table").append("tr");
                
  ////////////////////////////////////////////////////////
  // Scale ///////////////////////////////////////////////
  ////////////////////////////////////////////////////////   
  	
	var scaleX = d3.scaleLinear()
	  .domain([cfg.grid.xMin, cfg.grid.xMax])
	  .range([0, cfg.width]);
	  
	var scaleY = d3.scaleLinear()
	  .domain([cfg.grid.yMin, cfg.grid.yMax])
	  .range([0, cfg.height]);  
	  
	  
  ////////////////////////////////////////////////////////
  // Contour /////////////////////////////////////////////
  ////////////////////////////////////////////////////////
  
  // Create a grid of value
 var n = 240, m = Math.round(240 * cfg.height / cfg.width), values = new Array(n * m);
  for (var j = 0.5, k = 0; j < m; ++j) {
    for (var i = 0.5; i < n; ++i, ++k) {
      values[k] = expr(cfg.grid.xMin + (cfg.grid.xMax - cfg.grid.xMin) * i / n, 
                       cfg.grid.yMax - (cfg.grid.yMax - cfg.grid.yMin) * j / m);
    }
  }
  

  // Plot
  var thresholds = d3.range(1, 21)
      .map(function(p) { return Math.pow(2, p); });
  
  var contours = d3.contours()
      .size([n, m])
      .thresholds(thresholds);
  
  var color = d3.scaleLog()
      .domain(d3.extent(thresholds))
      .interpolate(function() { return d3.interpolateYlGnBu; });
  
  svg.append("g").selectAll("path")
    .data(contours(values))
    .enter().append("path")
      .attr("d", d3.geoPath(d3.geoIdentity().scale(cfg.width / n)))
      .attr("fill", function(d) { return color(d.value); })
      .style("stroke", "#fff")
      .style("stroke-width", 0.5);
      
  ////////////////////////////////////////////////////////
  // Particles ///////////////////////////////////////////
  ////////////////////////////////////////////////////////
  
  // Initialize data with best known position pbest and velocity
  var data = new Array(1 * cfg.number);
  for (var l = 0; l < cfg.number; ++l) {
    data[l] = {
      "value": cfg.radius, 
      "color": cfg.color,
      "position": {
        "x": randomize(scaleX.domain()[0], scaleX.domain()[1]),
        "y": randomize(scaleY.domain()[0], scaleY.domain()[1])
      },
      "velocity": {
        "x": 0,
        "y": 0
      },      
      "pbest": {
        "x": [], 
        "y": []
      },
      "pbestEval": []
    }; 
  }
  
  // Set pbest as initial position
  data.forEach(function(d) { 
    d.pbest.x = d.position.x;
    d.pbest.y = d.position.y;
  });
  
  // Evaluate pbest
  var pbestEval = [];
  data.forEach(function(d) { d.pbestEval = expr(d.pbest.x, d.pbest.y); });
  
  // Update global best: gbest
  var gbest = getgbest(data); 
    
  // Create particle and initialize position with appropriate scale
  var particles = svg.append('g')
      .style("filter", "url(#gooey)");
      
  var particle = particles.selectAll('.particle')
      .data(data)
      .enter().append("g")
      .append('circle')
      .attr('class', 'particle')
      .attr('id', function(d,i) { return "particle" + i;})
      .attr('r', function(d) { return d.value; })
      .attr('cx', function(d) { return scaleX(d.position.x); })
      .attr('cy', function(d) { return cfg.height - scaleY(d.position.y); })
      .on("click", function(d) { console.log(d); })
      .style('fill', function(d) { return d.color; })
      .on('mouseover', function(d) {
        
        d3.select(this).transition("mouse")
          .duration(50)
          .attr('r', 4 * cfg.radius);
          
        tip.transition("mouse")        
          .duration(0)      
          .style('opacity', 1);
        tip.html('<b><font size = "3">x = </font></b>' + scaleX.invert(d3.select(this).attr("cx")) + ', ' + 
                 '<b><font size = "3">y = </font></b>' + scaleY.invert(cfg.height - d3.select(this).attr("cy")) + ', ' + 
                 '<b><font size = "3">f(x,y) = </font></b>' + expr(scaleX.invert(d3.select(this).attr("cx")), 
                 scaleY.invert(cfg.height - d3.select(this).attr("cy"))));
      })
      .on('mousemove', function(d) {

        tip.html('<b><font size = "3">x = </font></b>' + scaleX.invert(d3.select(this).attr("cx")) + ', ' + 
                 '<b><font size = "3">y = </font></b>' + scaleY.invert(cfg.height - d3.select(this).attr("cy")) + ', ' + 
                 '<b><font size = "3">f(x,y) = </font></b>' + expr(scaleX.invert(d3.select(this).attr("cx")), 
                 scaleY.invert(cfg.height - d3.select(this).attr("cy"))));
      })
      .on('mouseout', function(d) {
        
        d3.select(this).transition("mouse")
          .duration(500)
          .attr('r', cfg.radius);
          
       tip.transition("mouse")        
          .duration(500)
          .style('opacity', 0);          
      });
      
  // Add best position text in the results table
  tipBestX.text('x = ' + gbest.pbest.x);
  tipBestY.text('y = ' + gbest.pbest.y);
  tipBestF.text('f(x,y) = ' + gbest.pbestEval);
  tipBestIt.text('Iteration: ' + 0);
  
  ////////////////////////////////////////////////////////
  // Simulation //////////////////////////////////////////
  ////////////////////////////////////////////////////////
    
  // Button to start simulation  
  d3.select('#start')
    .on('click', function(d) {
      psoVizAlgo();
    });
  
  function psoVizAlgo() { 
    // Criteria: max iteration
    for (var it = 0; it < cfg.iteration; ++it) {

      // Loop
      psoVizLoop(data, cfg);
      // Update viz
      // Duration time for each particle to change is based on the euclidean distance of the particles' velocity. 
      particle = particle
            .transition("simulation")
            .duration(function(d) { return distance(d.velocity.x, d.velocity.y) / cfg.animationSpeed; })
            .attr('cx', function(d) { return scaleX(d.pbest.x); })
            .attr('cy', function(d) { return cfg.height - scaleY(d.pbest.y); })
            .style('fill', function(d) { return d.color; });
      
      // Update results table      
      tipBestX = tipBestX.transition("simulation")
        .duration(distance(gbest.velocity.x, gbest.velocity.y) / cfg.animationSpeed)
        .text('x = ' + gbest.pbest.x);  
      tipBestY = tipBestY.transition("simulation")
        .duration(distance(gbest.velocity.x, gbest.velocity.y) / cfg.animationSpeed)
        .text('y = ' + gbest.pbest.y);         
      tipBestF = tipBestF.transition("simulation")
        .duration(distance(gbest.velocity.x, gbest.velocity.y) / cfg.animationSpeed)
        .text('f(x,y) = ' + gbest.pbestEval);
      tipBestIt = tipBestIt.transition("simulation")
        .duration(distance(gbest.velocity.x, gbest.velocity.y) / cfg.animationSpeed)
        .text('Iteration: ' + (it + 1));        
    }
  }
  
  
  // Function loop (Code can be improved with vector algebra ?)
  function psoVizLoop(data, cfg) {
        
        // Update velocity 
        data.forEach(function(d) {
          d.velocity.x = cfg.w * d.velocity.x + cfg.c1 * Math.random() * (d.pbest.x - d.position.x) + 
                       cfg.c2 * Math.random() * (gbest.position.x - d.position.x);
          d.velocity.y = cfg.w * d.velocity.y + cfg.c1 * Math.random() * (d.pbest.y - d.position.y) + 
                       cfg.c2 * Math.random() * (gbest.position.y - d.position.y);
        });
        
        // Clamp velocity
        data.forEach(function(d) {
          
          var violation = d.velocity.x < cfg.grid.xMin ? 1 : 0;
          d.velocity.x = (1 - violation) * d.velocity.x + violation * cfg.grid.xMin;
          violation = d.velocity.y < cfg.grid.yMin ? 1 : 0;
          d.velocity.y = (1 - violation) * d.velocity.y + violation * cfg.grid.yMin;
          
          violation = d.velocity.x > cfg.grid.xMax ? 1 : 0;
          d.velocity.x = (1 - violation) * d.velocity.x + violation * cfg.grid.xMax;
          violation = d.velocity.y < cfg.grid.yMin ? 1 : 0;
          d.velocity.y = (1 - violation) * d.velocity.y + violation * cfg.grid.yMax;
          
        });
        
        // Update Position 
        data.forEach(function(d) {
          d.position.x = d.position.x + d.velocity.x;
          d.position.y = d.position.y + d.velocity.y;
        });
        
        // Update pbest
        data.forEach(function(d) {
          d.pbest.x = expr(d.position.x, d.position.y) < d.pbestEval ? d.position.x : d.pbest.x;
          d.pbest.y = expr(d.position.x, d.position.y) < d.pbestEval ? d.position.y : d.pbest.y;
        });
        
        // Update pbestEval
        data.forEach(function(d) { 
          d.pbestEval = expr(d.pbest.x, d.pbest.y);
        });
        
        // Reinitialize color
        data.forEach(function(d) {
          d.color = cfg.color;
        });
        
        // Update gbest -> getgbest
        gbest = getgbest(data);
        console.log(gbest.pbestEval);
  }
  
  function distance(x, y) {
    
    return Math.sqrt(Math.pow(scaleX(x),2) + Math.pow(scaleY(y), 2));
    
    
  }


  ////////////////////////////////////////////////////////
  // Legend and Buttons //////////////////////////////////
  ////////////////////////////////////////////////////////
  
  //SVG filter for the gooey effect
  //Code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
  var defs = particles.append('defs');
  var filter = defs.append('filter').attr('id','gooey');
  filter.append('feGaussianBlur')
  	.attr('in','SourceGraphic')
  	.attr('stdDeviation','1.5')
  	.attr('result','blur');
  filter.append('feColorMatrix')
  	.attr('in','blur')
  	.attr('mode','matrix')
  	.attr('values','1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7')
  	.attr('result','gooey');
  filter.append('feComposite')
  	.attr('in','SourceGraphic')
  	.attr('in2','goo')
  	.attr('operator','atop');	  
  
}
