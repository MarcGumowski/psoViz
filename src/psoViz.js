///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Particle Swarm Optimization Visualization
//
// Author : Marc Gumowski
//
// Description : Function allowing to visualize a simple implementation of the  particle 
//               swarm optimization algorithm (PSO), using a physical simulation of charged 
//               particles.
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function psoViz(id, expr, options) {

  ////////////////////////////////////////////////////////
  // Initial options /////////////////////////////////////
  ////////////////////////////////////////////////////////
  
  var cfg = {
    margin: { top: 10, left: 10, right: 10, bottom: 10 },
    width: Math.min(630, window.innerWidth - 10),
    height: Math.min(480, window.innerHeight - 20),
    grid: { xMin: -2, xMax: 2, yMin: -2, yMax: 2,  },
    radius: 3,
    number: 50,
    color: '#ce2525',
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
  var n = 240, m = 240, values = new Array(n * m);
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
      .attr("fill", function(d) { return color(d.value); });
      
  ////////////////////////////////////////////////////////
  // Particles ///////////////////////////////////////////
  ////////////////////////////////////////////////////////
  
  var data = new Array(cfg.number);
  for (var l = 0; l < cfg.number; ++l) {
    data[l] = {"value": cfg.radius, "color": cfg.color}; 
  }
  
  var particle = svg.selectAll('.particle')
      .data(data)
      .enter().append("g");
  
  // Create particle and initialize position   
  particle.append('circle')
    .attr('class', 'particle')
    .attr('id', function(d,i) { return "particle" + i;})
    .attr('r', function(d) { return d.value; })
    .attr('cx', function(d) { return randomize(scaleX.range()[0], scaleX.range()[1]); })
    .attr('cy', function(d) { return randomize(scaleY.range()[0], scaleY.range()[1]); })
    .on("click", function(d) { console.log(d); })
    .style('fill', function(d) { return d.color; });
    
  // Initialize best known position: pbest
  //var pbest = expr([]); // Then append it to particle (cx,cy, f(x,y))
  var pbest = new Array(cfg.number);
  d3.selectAll('.particle')._groups[0].forEach(function(d) {
    pbest.push(d.getAttribute('cx'), d.getAttribute('cy'));
  });
  console.log(pbest);
  
  // Initialize velocity
  var v = []; // Then append it to particle vx, vy
  
  // Update global best: gbest
  var gbest = []; // return x,y, f(x,y) //Particle ID
  
  ////////////////////////////////////////////////////////
  // Simulation //////////////////////////////////////////
  ////////////////////////////////////////////////////////
    
  // While Criteria
  
  // For each particle
   // For each dimension
   
    // Update position -> transition(). force(). x, y, vx, vy
  particle.selectAll('circle')
    .transition()
    .duration(1500) // vx * vy
    .attr('cx', cfg.width / 2)
    .attr('cy', cfg.height / 2);
 
  ////////////////////////////////////////////////////////
  // Legend and Buttons //////////////////////////////////
  ////////////////////////////////////////////////////////
}









