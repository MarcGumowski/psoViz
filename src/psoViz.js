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
    margin: { top: 10, left: 5, right: 5, bottom: 10 },
    width: Math.min(640, window.innerWidth - 10),
    height: Math.min(480, window.innerHeight - 20),
    grid: { xMin: -2, xMax: 2, yMin: -2, yMax: 2 },
    // Vizualization parameters
    radius: 3,
    color: '#ce2525',
    colorBest: "#1b9e77",
    // Algorithm parameters
    iteration: 50,
    number: 50,
    w: 0.72984,
    c1: 2.05 * 0.72984,
    c2: 2.05 * 0.72984
  };
  
  //Put all of the options into a variable called cfg
	if('undefined' !== typeof options){
	  for(var p in options){
		if('undefined' !== typeof options[p]){ cfg[p] = options[p]; }
	  }
	}
	
	var scaleX = d3.scaleLinear()
	  .domain([cfg.grid.xMin, cfg.grid.xMax])
	  .range([0, cfg.width]);
	  
	var scaleY = d3.scaleLinear()
	  .domain([cfg.grid.yMin, cfg.grid.yMax])
	  .range([0, cfg.height]);  
	
	function randomize(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  Array.prototype.getMin = function(attrib) {
    return this.reduce(function(prev, curr){ 
        return prev[attrib] < curr[attrib] ? prev : curr; 
    });
  };
  
  function getgbest(data) {
    
    var best = [];
    best = data.getMin('pbestEval');
    best.color = cfg.colorBest;
    
    return best;
  }

  ////////////////////////////////////////////////////////
  // SVG /////////////////////////////////////////////////
  ////////////////////////////////////////////////////////
  
	d3.select(id).select("svg").remove();
	
	var svg = d3.select(id).append("svg")
	    .attr('id', 'psoVizSVG')
			.attr("width",  cfg.width)
			.attr("height", cfg.height);
	  
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
  data.forEach(function(d) { d.pbest = d.position; });
  
  // Evaluate pbest
  var pbestEval = [];
  data.forEach(function(d) { d.pbestEval = expr(d.pbest.x, d.pbest.y); });
  
  // Update global best: gbest
  var gbest = getgbest(data); 
    
  // Create particle and initialize position with appropriate scale
  var particle = svg.selectAll('.particle')
      .data(data)
      .enter().append("g")
      .append('circle')
      .attr('class', 'particle')
      .attr('id', function(d,i) { return "particle" + i;})
      .attr('r', function(d) { return d.value; })
      .attr('cx', function(d) { return scaleX(d.pbest.x); })
      .attr('cy', function(d) { return cfg.height - scaleY(d.pbest.y); })
      .on("click", function(d) { console.log(d); })
      .style('fill', function(d) { return d.color; });
  
  ////////////////////////////////////////////////////////
  // Simulation //////////////////////////////////////////
  ////////////////////////////////////////////////////////
    
  // While Criteria
  var it = 0;
  while (it < cfg.iteration) {
    
    // Loop
    psoVizLoop(data, cfg);
    // Update viz
    particle = particle
          .transition()
          .duration(1000)
          .attr('cx', function(d) { return scaleX(d.pbest.x); })
          .attr('cy', function(d) { return cfg.height - scaleY(d.pbest.y); })
          .style('fill', function(d) { return d.color; });
    ++it;
    
  }
  
  // Function loop (Code can be improved with vector algebra)
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
        
        // Update Position var x = []; (x = pbest.x + velocity.x)
        
        // Evaluate new pbest
        
        // reinitialize color everyone same color cfg.color transition
        
        // Update pbestNew if Eval < pbestOldEval 
        
        // Update gbest -> getgbest
        
  }
  
  console.log(data);
  console.log(gbest);

  ////////////////////////////////////////////////////////
  // Legend and Buttons //////////////////////////////////
  ////////////////////////////////////////////////////////
}









