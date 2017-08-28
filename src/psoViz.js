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
    radius: 3,
    number: 50,
    color: '#ce2525',
    colorBest: "#1b9e77"
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
  
  // Update global best: gbest
  var gbest = getgbest(data); 
  
  console.log(data);
  console.log(gbest);
    
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
  while (it < 10) {
    
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
  // Do function Loop
  // else STOP
  
  // Function loop (data, cfg)
  function psoVizLoop(data, cfg) {
    
    for (var index = 0; index < cfg.number; ++index) {
        
        // Update velocity
        
        // Clamp velocity
        
        // Update Position var x = []; (x = pbest.x + velocity.x)
        
        // Evaluate new pbest
        
        // reinitialize color everyone same color cfg.color
        
        // Update pbestNew if Eval < pbestOldEval 
        
        // Update gbest -> getgbest

        //console.log(data[index].pbest.x);
        //console.log(data[index].pbest.y);
        
        data[index].pbest.x = randomize(scaleX.domain()[0], scaleX.domain()[1]);
        data[index].pbest.y = randomize(scaleY.domain()[0], scaleY.domain()[1]);
        
    }
  }

/*    particle.selectAll("circle")
      .transition()
      .duration(function(d) { return 2000 * randomize(1, 2)}) // d.vx * d.vy 
      .on("start", function repeat() {
        d3.active(this)
          .attr('cx', function(d) { return cxNew *  randomize(0, 2); }) // d.cxNew
          .attr('cy', function(d) { return cyNew *  randomize(0, 2); }) // d.cyNew
          .transition()
            .on("start", repeat);
      });*/ // Random moves


  ////////////////////////////////////////////////////////
  // Legend and Buttons //////////////////////////////////
  ////////////////////////////////////////////////////////
}









