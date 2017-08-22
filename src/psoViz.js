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
  
  // Initialize data with best known position pbest and velocity
  var data = new Array(1 * cfg.number);
  for (var l = 0; l < cfg.number; ++l) {
    data[l] = {
      "value": cfg.radius, 
      "color": cfg.color,
      "pbest": {
        "x": randomize(scaleX.domain()[0], scaleX.domain()[1]), 
        "y": randomize(scaleY.domain()[0], scaleY.domain()[1])
      },
      "pbestEval": [],
      "velocity": {
        "x": 0,
        "y": 0
      }
    }; 
  }
  
  // Evaluate pbest
  var pbestEval = [];
  data.forEach(function(d) { d.pbestEval = expr(d.pbest.x, d.pbest.y); });
  
  console.log(data);
  
  // Update global best: gbest
  var gbest = []; // return x,y, f(x,y) //Particle ID, function that take the max eval of pbestEval and all infos.
  
  // Create particle and initialize position with appropriate scale
  var particle = svg.selectAll('.particle')
      .data(data)
      .enter().append("g");
    
  particle.append('circle')
    .attr('class', 'particle')
    .attr('id', function(d,i) { return "particle" + i;})
    .attr('r', function(d) { return d.value; })
    .attr('cx', function(d) { return scaleX(d.pbest.x); })
    .attr('cy', function(d) { return scaleY(d.pbest.y); })
    .on("click", function(d) { console.log(d); })
    .style('fill', function(d) { return d.color; });
  
  ////////////////////////////////////////////////////////
  // Simulation //////////////////////////////////////////
  ////////////////////////////////////////////////////////
    
  // While Criteria
  // Do function Loop
  // else STOP
  
  // Function loop 
  // For each particle
   // For each dimension
    // Update position
    // store in array

  var cxNew = cfg.width / 2,  
      cyNew = cfg.height / 2;

    particle.selectAll("circle")
      .transition()
      .duration(function(d) { return 2000 * randomize(1, 2)}) // d.vx * d.vy 
      .on("start", function repeat() {
        d3.active(this)
          .attr('cx', function(d) { return cxNew *  randomize(0, 2); }) // d.cxNew
          .attr('cy', function(d) { return cyNew *  randomize(0, 2); }) // d.cyNew
          .transition()
            .on("start", repeat);
      });

  ////////////////////////////////////////////////////////
  // Legend and Buttons //////////////////////////////////
  ////////////////////////////////////////////////////////
}









