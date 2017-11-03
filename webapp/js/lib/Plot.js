


//#####################################################################################################
//
//................................. Plot Class ........................................................

class Plot{


  constructor(divContId){
    let _this = this;    
    console.log(_this);
    this.data;
    this.labels;
    this.xlabel; 
    this.ylabel;
    this.xscale;
    this.yscale;
    this.margin = {top: 20,right: 20,bottom: 50, left: 50}; 
    
    this.divContId = divContId;

    this.content = d3.select("#"+divContId);
    
    var nplots = this.content
      .selectAll(".plot-panel").size();
    
    if (nplots > 0){
      var colSize = "col-lg-6";
      this.content
        .selectAll(".plot-panel")
        .each(function(d,i){
          d3.select(this).classed(colSize,true);
        });
    }else{
      var colSize = "col-lg-12";
    }
       

    this.plotPanel = this.content
      .append("div")
        .attr("class","plot-panel " + colSize)
      .append("div")
        .attr("class","panel panel-default hidden");
    
    this.plotHeader = this.plotPanel
      .append("div")
        .attr("class","panel-heading");

    this.plot = this.plotPanel
      .append("div")
        .attr("class","panel-body");
    
    this.plotFooter = this.plotPanel
      .append("div")
        .attr("class","panel-footer");

    this.footerBtns = this.plotFooter
      .append("div")
        .attr("class","form-inline axes-btns");

    //............. X Axis Buttons ...............
    this.xAxisForm = this.footerBtns
      .append("div")
        .attr("class","form-group form-group-sm");
    
    this.xAxisForm
      .append("label")
        .attr("for","x-axis-btns")
        .text("X-axis");

    this.xAxisBtns = this.xAxisForm
      .append("div")
        .attr("class","btn-group btn-group-sm ")
        .attr("id","x-axis-btns")
        .attr("data-toggle","buttons");

    this.xAxisBtns
      .append("label")
        .attr("class","btn btn-sm btn-default")
      .html("<input type='radio' name='xaxis' value='linear'/> Linear");
    
    this.xAxisBtns
      .append("label")
        .attr("class","btn btn-sm btn-default")
      .html("<input type='radio' name='xaxis' value='log'/> Log");
    //--------------------------------------------
      
    //............. Y Axis Buttons ...............
    this.yAxisForm = this.footerBtns
      .append("div")
        .attr("class","form-group form-group-sm");
    
    this.yAxisForm
      .append("label")
        .attr("for","y-axis-btns")
        .text("Y-axis");

    this.yAxisBtns = this.yAxisForm
      .append("div")
        .attr("class","btn-group btn-group-sm")
        .attr("id","y-axis-btns")
        .attr("data-toggle","buttons");

    this.yAxisBtns
      .append("label")
        .attr("class","btn btn-sm btn-default")
      .html("<input type='radio' name='yaxis' value='linear'/> Linear");
    
    this.yAxisBtns
      .append("label")
        .attr("class","btn btn-sm btn-default")
      .html("<input type='radio' name='yaxis' value='log'/> Log");
    //--------------------------------------------

  /* 
    //......... Add Data Button ..................
    this.addDataBtn = this.footerBtns
      .append("form")
      .attr("class","form-group form-group-sm")
      .style("float","right");
       
    this.addDataBtn
      .append("label")
      .attr("for","add-data-file")
      .text("Add data");

    this.addDataBtn
      .append("input")
      .attr("type","file")
      .attr("name","add-data-file")
      .attr("id","add-data-file");
     
    this.addDataBtn
      .append("button")
      .attr("class","btn btn-xs btn-default")
      .attr("type","button")
      .attr("id","add-data-btn")
      .text("Submit"); 
  */
  
  }

  
  //............. Set Plot Title ...........
  setTitle(title){
    this.plotHeader
      .text(title); 
  }
  //---------------------------------------
  
  //........... Set Margin ................
  setMargin(margin){
    this.margin.top    = margin.top;
    this.margin.right  = margin.right;
    this.margin.bottom = margin.bottom;
    this.margin.left   = margin.left;
  }
  //---------------------------------------

  //............ Set Plot X/Y Scale ..................
  setPlotScale(xscale,yscale){
    this.xscale = xscale.toLowerCase();
    this.yscale = yscale.toLowerCase();
    
    // X Axis Scale
    this.xAxisBtns.selectAll("input").each(function(d,i){
      var btn = d3.select(this);
      if (btn.attr("value") == xscale) d3.select(this.parentNode).classed("active",true); 
    });

    // Y Axis Scale
    this.yAxisBtns.selectAll("input").each(function(d,i){
      var btn = d3.select(this);
      if (btn.attr("value") == yscale) d3.select(this.parentNode).classed("active",true); 
    });

  }
  //--------------------------------------------------

 
 
  //...................... Replace Y values with null ........................  
  removeSmallValues(limit){
    this.data.forEach(function(d,id){        
      d.forEach(function(dp,idp){                
        if (dp[1] <= limit){                         
          dp[1] = null;
          dp[0] = null;
        }
      })
    });
  }
  //-------------------------------------------------------------------------------
 
 
  
  
  
  plotData(){
    this.plotPanel.classed("hidden",false);                 // Remove class hidden
    updatePlotSize(this); 
    
    //..................... Get Color Scheme ........................................
    var ndata = this.data.length;           // Get how many data sets there are
    if (ndata < 10){                        // If 10 or less data sets
       this.color  = d3.schemeCategory10;     // Get the color scheme with 10 colors
    }else{                                  // If there are more than 10 data sets
      this.color  = d3.schemeCategory20;     // Get the color scheme with 20 colors
    } 
    //-------------------------------------------------------------------------------
    var color = this.color;
     
    //........................ Line Function ........................................
    this.line = d3.line()                              // Set the D3 line
      .defined(function(d,i) {return d[1] != null})   // Plot all but null values
      .x(function(d,i) {return xbounds(d[0])})       // Return X data scaled to width of plot 
      .y(function(d,i) {return ybounds(d[1])});      // Return Y data scaled to width of plot
    //------------------------------------------------------------------------------- 
  
    //........................ Get Values ...........................................
    this.yextremes = getYextremes(this);                //  Get the Y extreme values: min and max
    this.xextremes = getXextremes(this);                //  Get the X extreme values: min and max
    
    var height = plotHeight(this);                       // Get the height of the plot element
    var width  = plotWidth(this);                        // Get the width of the plot element
    
    this.xbounds = getXscale(this);
    this.xbounds.range([0,width])                         // Set range to width of plot element to scale data points
      .domain(this.xextremes)                             // Set the min and max X values
      .nice();
    var xbounds = this.xbounds;

    this.ybounds = getYscale(this);
    this.ybounds.range([height,0])                        // Set the range inverted to make SVG Y axis from bottom instead of top 
      .domain(this.yextremes)                             // Set the min and max Y values
      .nice()
    var ybounds = this.ybounds;
    //------------------------------------------------------------------------------- 
  
    //................. Create SVG Tag .......................
    this.svg = this.plot            // Select the plot element
      .append("svg")                            // Append a svg tag
        .attr("width",  width + this.margin.left + this.margin.right)             // Set the width of the svg tag
        .attr("height", height+ this.margin.top  + this.margin.bottom)            // Set the height of the svg tag
        .attr("class","d3-plot")                                        // Set class
      .append("g")                                                      // Append a group
        .attr("transform","translate("+this.margin.left+","+ this.margin.top+")")  // Position group by the top and left margins

     this.svg.append("g")
      .attr("class","d3-tooltip");
      
    //--------------------------------------------------------
    
    var labels = this.labels; 
    //.............. Create Group for Each Data Set .......... 
    var series_enter = this.svg.append("g")          // Append a new group
      .attr("class","all-data")                 // Make new group have a class of all-data
      .selectAll("g")                           // Select all groups to create, inside the all-data class
        .data(this.data)                      // Join data to groups 
        .enter()                                // Get each new node 
      .append("g")                              // Append a group for each data set
        .attr("class","data")                   // Make new group have class of data
        .attr("id", function(d,i){return labels[i]} )
        .attr("fill","none")                    // Set group fill of none
        .style("cursor","pointer");
    //--------------------------------------------------------

    //............ Plot Data Set as Paths ....................
    series_enter.append("path")                 // Append a path tag to the data class
      .attr("class","line")                     // Make new path tag have class of line
      .attr("d",this.line)                           // Set the path using the line variable
      .attr("stroke",function(d,i){return color[i];})   // Set the colors of each line
      .attr("stroke-width",3);          // Set line width 
    //--------------------------------------------------------

  
    //............ Plot Data Set as Circles ..................
    series_enter.selectAll("circle")                // Select all circles to create inside the data class
      .data(function(d,i) {return d})               // Join the data to the circles
      .enter()                                      // Get each new node
      .filter(function(d,i){return d[1] != null})   // Filter out the Y values of null
      .append("circle")                             // Append a new circle tag for each data point
        .attr("class","dot")                        // Make new circle tag have class of dot
        .attr("fill", function(d,i){                // Set the fill color to match that of the line color
          return d3.select(this.parentNode.firstChild).style("stroke");   // Get color from correspond line 
        })
        .attr("cx",this.line.x())                        // Set the X locations of the circles
        .attr("cy",this.line.y())                        // Set the Y locations of the circles
        .attr("r", 5)                     // Set the radius for each circle
    //--------------------------------------------------------

    
    //................. Setup the X Axis .....................
    this.xaxis = this.svg.append("g")                      // Create a new groupd under main svg group
      .attr("class","x-axis");                        // Make new group have class of x-axis
    
    // X Tick Marks     
    this.xaxis.append("g")                                // Append a new group under x-axis class
      .attr("class","x-tick")                         // Set class to x-tick
      .attr("transform","translate(0,"+height+")")    // Put X axis on the bottom of the plot
      .style("font-size","10px")
      .call(d3.axisBottom(this.xbounds));                 // Make tick marks
   
    
    // X Label
    this.xaxis.append("text")                             // Append a text tag to the x-axis class
      .attr("class","x-label")                        // Make text tag have class of x-label
      .attr("text-anchor","middle")                   // Set text to be centered
      .attr("alignment-baseline","middle")
      .style("font-size","12px")
      .attr("x",width/2)                              // X location of X label
      .attr("y", height+this.margin.bottom/2+10)           // Y location of X label
      .text(this.xlabel);                                  // Set the text of the label
    //--------------------------------------------------------



    //................. Setup the Y Axis .....................
    this.yaxis = this.svg.append("g")          // Create a new group under main svg group
      .attr("class","y-axis");            // Set class of new group to y-axis

    // Y Tick marks
    this.yaxis.append("g")                    // Append a new group to y-axis class
      .attr("class","y-tick")             // Set class to y-tick
      .style("font-size","10px")
      .call(d3.axisLeft(this.ybounds));       // Set tick marks

    // Y Label
    this.yaxis.append("text")                 // Append a new text tag to y-axis class
      .attr("class","y-label")            // Set class to y-label
      .attr("transform","rotate(-90)")    // Rotate the text
      .attr("text-anchor","middle")       // Set to center text
      .style("font-size","12px")
      .attr("x",0-height/2)               // Set X location
      .attr("y",0-this.margin.left/2-10)       // Set Y location
      .text(this.ylabel);                      // Set the text of the label
    //--------------------------------------------------------
  
    var plot = this; 
    $(window).resize(function(){
      plotResize(plot);
    });
 
 
  this.xAxisBtns.on("change",function(){console.log("Hello")});
  /* 
    //............................. X Axis Scale ....................................
    this..onchange = function(){
      x_scale = $("#"+xaxis_btn + " [class*=active] input").val();
      x_bounds = get_xscale();
      plot_resize(true);
    }
    //-------------------------------------------------------------------------------

    //............................. Y Axis Scale ....................................
    var yaxis_btn_id = document.getElementById(yaxis_btn);
    yaxis_btn_id.onchange = function(){
      y_scale = $("#"+yaxis_btn + " [class*=active] input").val();
      y_bounds = get_yscale();
      plot_resize(true);
    }
    //-------------------------------------------------------------------------------
  */
  }
  

  //................. Set the Legend .......................
  setLegend(){
    var labels = this.labels;
    var nleg = labels.length-1;                              // Get how many legend entrys there are minus 1 for indexing
    var height = plotHeight(this);
    var width = plotWidth(this);
    var color = this.color;
     
    var legend = this.svg.append("g")                                    // Append a new group under main svg group     
      .attr("class","legend")                                       // Set class to legend
      .selectAll("g")                                               // Select all groups to create under legend class      
        .data(labels)                                               // Join data to legend class
        .enter()                                                    // Get each new node 
      .append("g")                                                  // Append a group for each label
        .attr("class","legend-entry")                               // Set class to legend-entry
        .attr("id",function(d,i){return labels[nleg-i]})            // Set id 
        .style("cursor","pointer");
    
    
    // Legend Text
    legend.append("text")                                         // Append a text tag to legend-entry class
      .attr("class","legend-text")
      .attr("font-size","12px")
      .attr("x",30)                                               // Set X location of each legend label
      .attr("y", function(d,i){return 16*-i})                     // Set Y location of each legend label
      .attr("alignment-baseline","central")                       // Set alignment
      .text(function(d,i){return labels[nleg-i]});                // Set the text of each label, do nleg-i to put PGA at top of legend
     
    // Legend Line Indicator
    legend.append("line")                                         // Append a svg line tag
      .attr("class","legend-line")                                // Set class to legend-line
      .attr("x2",24)                                              // Set width of line 
      .attr("y1", function(d,i){return 16*-i})                    // Set Y location of starting point
      .attr("y2", function(d,i){return 16*-i})                    // Set Y location of ending point
      .attr("stroke-width",3)                             // Set stroke width of line
      .attr("stroke",function(d,i){return color[nleg-i]})         // Set color of line
      .attr("fill","none");                                       // Set fill to none
      
    // Legend Circle on the Line
    legend.append("circle")                                       // Append a svg circle tag
      .attr("class","legend-circle")                              // Set class to legend-circle
      .attr("cx",12)                                              // Set X location to center of line
      .attr("cy",function(d,i){return 16*-i})                     // Set Y location
      .attr("r",5)                                      // Set radius
      .attr("fill",function(d,i){return color[nleg-i]} );         // Set fill color to match
    
    // Set translation 
    var translate = legendLocation(this,height,width);
    legend.attr("transform",translate)    // Position legend to bottom-left
  } 
  //--------------------------------------------------------
 
  
}

//----------------------------------- End: Plot Class -------------------------------------------------
//
//#####################################################################################################





//......................... Set Plot Panel Content Height .......................
function updatePlotSize(plot){
  var plotHeaderHeight = plot.plotHeader
    .node()
    .getBoundingClientRect()
    .height;
  
  var plotFooterHeight = plot.plotFooter
    .node()
    .getBoundingClientRect()
    .height;
  
  var pad = plotHeaderHeight + plotFooterHeight + "px";   // Get the total height of header and footer in px
  var nplots = plot.content
    .selectAll(".panel-body").size();
  
  if (nplots > 1){
    var plotHeight = "50%";
    plot.content
      .selectAll(".panel-body")
      .each(function(d,i){
        d3.select(this)
          .style("height", "calc("+plotHeight+" - "+pad+")");
      });
    plot.content
      .selectAll(".plot-panel")
      .each(function(d,i){
        d3.select(this)
          .style("height", plotHeight);
      });
  }else{
    var plotHeight = "100%";
  }
  
  plot.plot.style("height", "calc("+plotHeight+" - "+pad+")");      // Set the plot content height 
}
//-------------------------------------------------------------------------------
 




//........................ Get X Scale Function ..................................
function getXscale(plot){
  if (plot.xscale == "log"){
    var xbounds = d3.scaleLog();       
  }else if (plot.xscale == "linear"){
    var xbounds = d3.scaleLinear();
  }
  return xbounds;
}
//------------------------------------------------------------------------------- 



//........................ Get Y Scale Function ..................................
function getYscale(plot){
  if (plot.yscale == "log"){
    var ybounds = d3.scaleLog();      
  }else if (plot.yscale == "linear"){
    var ybounds = d3.scaleLinear();
  }
  return ybounds;
}
//------------------------------------------------------------------------------- 



//..................... Get X Min and Max Values Functions ......................
function getXextremes(plot){
  var x_max = d3.max(plot.data,function(ds,is){
    var tmp = d3.max(ds,function(dp,ip){
      return dp[0];
    });
    return tmp;
  });
  
  var x_min = d3.min(plot.data,function(ds,is){
    var tmp = d3.min(ds,function(dp,ip){
      return dp[0];
    });
    return tmp;
  });

  return [x_min,x_max];               // Return an array of the min and max values
}
//-------------------------------------------------------------------------------


//.................... Get Y Min and Max Values  Functions ......................
function getYextremes(plot){
  var y_max = d3.max(plot.data,function(ds,is){
    var tmp = d3.max(ds,function(dp,ip){
      return dp[1];
    });
    return tmp;
  });
  
  var y_min = d3.min(plot.data,function(ds,is){
    var tmp = d3.min(ds,function(dp,ip){
      return dp[1];
    });
    return tmp;
  });

  return [y_min,y_max];               // Return an array of the min and max values
}
//-------------------------------------------------------------------------------



//......................... Get Plot Height Function ............................
function plotHeight(plot){
  var height = plot.plot
      .node()
      .getBoundingClientRect()
      .height;
  height = height - plot.margin.top  - plot.margin.bottom;      // Subtract the top and bottom margins
  return height;                                                // Return plottable height
}
//-------------------------------------------------------------------------------



//......................... Get Plot Width Function .............................
function plotWidth(plot){
  var width = plot.plot
      .node()
      .getBoundingClientRect()
      .width;
  width = width - plot.margin.top  - plot.margin.bottom;      // Subtract the top and bottom margins
  return width;                                       // Return plottable width
}
//-------------------------------------------------------------------------------


//........................ Set Legend Location Function .........................
function legendLocation(plot,height,width){
  var legend_geom = plot.svg
    .select(".legend")   
    .node()
    .getBoundingClientRect();
  var legend_width  = legend_geom.width;
  var legend_height = legend_geom.height;
  
  if (plot.xscale == "linear" || plot.yscale == "linear"){
    var translate = "translate("+(width-legend_width)+","+legend_height+")";
  }else{
    var translate = "translate(10,"+(height*(1-0.05))+")";
  }
  return translate; 
} 
//-------------------------------------------------------------------------------



//........................ Plot Resize Function .................................
function plotResize(plot,do_transition){
  
  updatePlotSize(plot);

  var height = plotHeight(plot);                             // Get current plot height
  var width = plotWidth(plot);                               // Get current plot width
  
  plot.plot.select("svg")                                      // Select the plot
    .attr("width", width  + plot.margin.left + plot.margin.right)   // Update the svg width
    .attr("height",height + plot.margin.top  + plot.margin.bottom); // Update the svg height

  plot.xbounds                  // Reset the X range and domain
    .range([0,width])
    .domain(plot.xextremes)
    .nice();

  plot.ybounds
    .range([height,0])      // Reset the Y range and domain
    .domain(plot.yextremes)
    .nice()

  plot.svg
    .select(".x-tick")                                   // Select the x-tick class
    .attr("transform","translate(0,"+height+")")          // Update the X tick mark locations
    .call(d3.axisBottom(plot.xbounds));                       // Update the X tick makrs with the X bounds

  plot.svg
    .select(".x-label")                                  // Select the x-label class
    .attr("x",width/2.0)                                  // Update the X label X location                                
    .attr("y",height+plot.margin.bottom/2+10);                 // Update the X label Y location

  plot.svg
    .select(".y-tick")                                   // Select the y-tick class
    .call(d3.axisLeft(plot.ybounds));                         // Update the Y tick marks with Y bounds
  
  plot.svg
    .select(".y-label")                                  // Select the y-label class
    .attr("x",0-height/2)                                 // Update Y label X location
    .attr("y",0-plot.margin.left/2-10);                        // Update Y label Y location
  
  var translate = legendLocation(plot,height,width);
  var svg_legend = plot.svg.selectAll(".legend-entry");

  var svg_line = plot.svg.selectAll(".line");
  var svg_dot  = plot.svg.selectAll(".dot");
  
  if (do_transition){
    svg_line.transition()
      .duration(500)
      .attr("d",plot.line);
    
    svg_dot.transition()
      .duration(500)
      .attr("cx",plot.line.x())
      .attr("cy",plot.line.y());
    
    svg_legend.transition()
      .duration(500)
      .attr("transform",translate);
    
  }else{
    svg_line.attr("d",plot.line);
    svg_dot.attr("cx",plot.line.x())                                  // Update the X location of the circles
      .attr("cy",plot.line.y());                                 // Update the Y location of the circles
    svg_legend.attr("transform",translate);
  }

}
//-------------------------------------------------------------------------------



/*
$("#add-data-btn").ready(function(){
  $("#add-data-btn").on("click",function(){
    var Fdata = $("#add-data-file").val(); 
    Fdata = Fdata.split("\\").pop();
    var reader = new FileReader();
    console.log(reader.readAsText(Fdata));
  })
});
*/


/*
var circle_size = 4;                              // Radius of any circles
var linewidth   = 3;                              // Line width for paths
var circle_size_select         = circle_size+2;   // Radius when line is selected
var circle_size_tooltip        = circle_size+2;   // Radius when hovering over a circle
var circle_size_tooltip_select = circle_size+4    // Radius when hovering and line is selected
var linewidth_size_select      = linewidth+2;     // Line width when selected

function plot_curves(plot_info){

  


  //.......................... Setup For Resizable Panels .........................
  var plot_height_check = panel_id.parentNode.clientHeight;         // Get height of panel
  if (plot_height_check > 500){                                     // If panel is greater than 500px, set col to 12
    $("#"+resize_id).removeClass(icon_full).addClass(icon_small);   // Set glyphicon to resize small 
    $("#"+plot_id).parent().parent()                                // Set col to 12
      .removeClass(plot_size_min)
      .addClass(plot_size_max);
  }else{                                                            // Else set panel col to 6
    $("#"+resize_id).removeClass(icon_small).addClass(icon_full);   // Set glyphicon to resize full
    $("#"+plot_id).parent().parent()                                // Set col to 6
      .removeClass(plot_size_max)
      .addClass(plot_size_min);
  }
  //-------------------------------------------------------------------------------
 


 
  














  



  //.................... Redraw Plot when Resize Button is Pressed ................ 
  resize_div_id.onclick = function(){
    panel_resize(resize_id);
    plot_resize(); 
  }
  //-------------------------------------------------------------------------------

  //.......................... Setup Plot Selection ...............................
  plot_selection(plot_id);
  //-------------------------------------------------------------------------------

  



  //............................... Tooltip ........................................
  d3.select("#"+plot_id + " svg")                                     // Get plot svg
    .select(".all-data")                                              // Select data group
    .selectAll(".dot")                                                // Select all circles
    .on("mouseover",function(d,i){                                    // If a the mouse pointer is over a circle, add tooltip about that circle
      if (x_scale == "log"){
        var xval   = d3.select(this).data()[0][0].toExponential(3);   // Get X value in log
      }else if (x_scale == "linear"){
        var xval   = d3.select(this).data()[0][0].toFixed(3);         // Get X value 
      }
      if (y_scale == "log"){
        var yval   = d3.select(this).data()[0][1].toExponential(3);   // Get Y value in log
      }else if (y_scale == "linear"){
        var yval   = d3.select(this).data()[0][1].toFixed(3);         // Get Y value
      }
      var value    = d3.select(this.parentNode).attr("id");           // Get the selected id of the data group
      var jdisplay = series_label_values.findIndex(function(d,i){     // Find index where id is 
        return d == value;
      });
      var display = series_label_displays[jdisplay];                  // Get display 
      var text = [                                                    // Set the tooltip text
        tooltip_text[0] + ": " + display,
        tooltip_text[1] + ": " + xval,
        tooltip_text[2] + ": " + yval]
      tooltip_mouseover(plot_id,this,text);                           // Make tooltip
    })
    .on("mouseout",function(d,i){                                     // When mouse pointer leaves circle, remove tooltip
      tooltip_mouseout(plot_id,this);                                 // Remove tooltip
    });
  //-------------------------------------------------------------------------------



}

//---------------------- End: D3 Plot Function -----------------------------------------------
//
//############################################################################################






//############################################################################################
//
//........................ Listen for a Line/Circle Selection ................................


function plot_selection(plot_id){
  
  var svg = d3.select("#"+plot_id + " svg");    // Select the svg of the plot id

  //.................. Highlight Line when Selected on Plot ..................
  svg.selectAll(".data")                                         // Select all data, lines and circles 
    .on("click",function(d,i){                                  // If a circle or line is clicked, increase stroke-widtd
      var selected_id = d3.select(this).attr("id");  // Get selected id
      make_selection(plot_id,selected_id);           // Update plot with new selection
    });
  //--------------------------------------------------------------------------

  //.............. Highlight Line when Legend Entry Selected .................
  svg.select(".legend")                                          // Select legend
    .selectAll(".legend-entry")                                 // Select all legend entrys
    .on("click",function(d,i){                                  // If a legend entry is clicked, highlight corresponding line
      var selected_id = d3.select(this).attr("id");  // Get selected id
      make_selection(plot_id,selected_id);           // Update with new selection
    });
  //--------------------------------------------------------------------------

}

//------------------- End: Listen for a Line/Circle Selection --------------------------------
//
//############################################################################################



//############################################################################################
//
//........................... Highlight a Selected Line ......................................


function make_selection(plot_id,selected_id){
  
  plot_selection_reset(plot_id);                            // Remove any current selection on plot
  var svg = d3.select("#"+plot_id + " svg");    // Select the svg of the plot id
  
  //............ Increase Line Width and Dot size of Selected Plot ..............
  var selected = svg.select(".all-data")        // Select the all data group
    .select("#"+selected_id);                   // Select the data group that was selected 

   selected.select(".line")                     // Select the line that was choosen
    .attr("stroke-width",linewidth_size_select);// Increase the line width by 2

    selected.selectAll(".dot")                  // Select all dot along the line
    .attr("r",circle_size_select);              // Increase the dot size by 2

    selected.raise();                           // Bring the line and dots to the front
  //-----------------------------------------------------------------------------
  
  //............. Increase Line Width and Circle Size on Legend .................
  var leg = svg.select(".legend")               // Select the legend
    .select("#"+selected_id);                   // Select the legend group that was selected

  leg.select(".legend-line")                    // Select the line in the legend
    .attr("stroke-width",linewidth_size_select);// Increase the line width by 2

  leg.select(".legend-circle")                  // Select the dot in the legend
    .attr("r",circle_size_select);              // Increase the dot size by 2
  
  leg.select(".legend-text")                    // Select the legend text
    .style("font-weight","bold");               // Make text bold
  //-----------------------------------------------------------------------------
}
//---------------------- End: Highlight a Selected Line --------------------------------------
//
//############################################################################################




//############################################################################################
//
//....................... Remove Highlight from Selected Line ................................

function plot_selection_reset(plot_id){

  var svg = d3.select("#"+plot_id+" svg");        // Select the plot svg
  
  //............. Resize All Lines and Dots in Plot ...............
  svg.selectAll(".line")                          // Select all lines
    .attr("stroke-width",linewidth);              // Make all line have same line width
 
  svg.selectAll(".dot")                           // Select all dots
    .attr("r",circle_size);                       // Make all dots have same line width
  //---------------------------------------------------------------

  //................ Resize Lines and Dots in the Legend ..........
  var leg = svg.select(".legend")                 // Select the legend
    .selectAll(".legend-entry");                  // Select all legend entrys
  
    leg.select(".legend-text")                    // Select the legend text
    .style("font-weight","initial");              // Make font weight default

    leg.select(".legend-line")                    // Select the legend line
    .attr("stroke-width",linewidth);              // Make all line in legend same line width

    leg.select(".legend-circle")                  // Select the legend circles
    .attr("r",circle_size);                       // Make all dots the same size 
  //---------------------------------------------------------------
}

//------------------ End: Remove Highlight from Selected Line --------------------------------
//
//############################################################################################







//############################################################################################
//
//............................ Add Tooltip ...................................................

function tooltip_mouseover(plot_id,circle_select,tooltip_text){

  var tooltip = d3.select("#"+plot_id +" svg")            // Select tooltip
    .select(".d3-tooltip");
  
  var svg = d3.select("#"+plot_id + " svg");              // Select plot svg
  

  //........................... Create the Tooltip Text ....................................
  tooltip.selectAll("text")                           // Select all text fields in tooltip
    .data(tooltip_text)                               // Join the text
    .enter()
    .append("text")                                   // Create a text field for each text in array
      .attr("class","tooltip-text")                   // Add a class to each text
      .style("visibility","hidden")                   // Make text hidden as it is not in right location yet
      .attr("font-size",11)                           // Set font size
      .attr("y",function(d,i){return i*16} )          // Set Y location of each text
      .attr("alignment-baseline","text-before-edge")  // Set to be aligned center
      .text(function(d,i){return d});                 // Set text

  var tooltip_geom   = tooltip.node()                 // Get dimensions of text box
    .getBoundingClientRect();

  var pad = 10;                                       // Padding
  var tooltip_width  = tooltip_geom.width  + 2*pad;   // Get tooltip width and add padding
  var tooltip_height = tooltip_geom.height + 2*pad;   // Get tooltip height and add padding
  //----------------------------------------------------------------------------------------


  //........ Find Where the Tooltip Should Be Placed Relative to the Circle .................
  var plot_geom = svg.select(".all-data")                       // Select the bounding box of the data
    .node()
    .getBoundingClientRect();
  var plot_width  = plot_geom.width;                            // Get the width of the actual plot where the data is
  var plot_height = plot_geom.height;                           // Get the height of the actual plot where the data is
  
  var cx = parseFloat(d3.select(circle_select).attr("cx"));     // Get X location of dot
  var cy = parseFloat(d3.select(circle_select).attr("cy"));     // Get Y location of dot

  var xper = cx/plot_width;               // Get the X location in percentage
  var yper = cy/plot_height;              // Get the Y location in percentage

  var dy  = 12;                           // Set the distance in Y between circle and tooltip
  if (xper < 0.30){                       // If the X location of the dot is < 10%, have box start to the right of the circle
    var xrect = cx;
    var xtext = cx+pad;
  }else if (xper > 0.70){                 // If the X location of the dot is > 70%, have box end to the left of the circle
    var xrect = cx-tooltip_width;
    var xtext = cx-tooltip_width+pad;
  }else{                                  // Center box location in X
    var xrect = cx-tooltip_width/2;
    var xtext = cx-tooltip_width/2+pad;
  }

  if (yper < 0.25){                       // If Y location of the dot is < 25% (from top), place box below circle
    var yrect = cy+dy;
    var ytext = cy+dy+pad;
  }else{                                  // Else put the box above the circle
    var yrect = cy-tooltip_height-dy;
    var ytext = cy-dy-tooltip_height+pad;
  }

  var rect_trans = "translate("+xrect+","+yrect+")";    // The translation for the tooltip box
  var text_trans = "translate("+xtext+","+ytext+")";    // The translation for the tooltip text
  //----------------------------------------------------------------------------------------

  //........................... Create the Tooltip Box .....................................
  tooltip.append("rect")                        // Create a rectangle
    .attr("class","tooltip-outline")            // Add a class to the rectangle
    .attr("height",tooltip_height)              // Set height
    .attr("width",tooltip_width)                // Set width
    .attr("transform",rect_trans)               // Translate the rectangle to correct position
    .attr("stroke","#999")                      // Set stroke color
    .style("padding","10px")
    .attr("fill","white");                      // Set fill color
  //----------------------------------------------------------------------------------------
  
  //......................... Translate Text to Correct Spot ...............................
  tooltip.selectAll(".tooltip-text")
    .style("visibility","initial")
    .attr("transform",text_trans)
    .raise();
  //---------------------------------------------------------------------------------------- 

 
  //......................... Increase Size of Circle on Hover ............................. 
  var rcircle = d3.select(circle_select).attr("r");     // Get circle size of current circle 
  if (rcircle == circle_size){                          // If circle size is default, increase by 2
    d3.select(circle_select).attr("r",circle_size_tooltip);
  }else{                                                // If circle is already selected, increase by 4
    d3.select(circle_select).attr("r",circle_size_tooltip_select);
  }
  //----------------------------------------------------------------------------------------

  tooltip.raise();      // Bring tooltip to the front 
}

//------------------------- End: Add Tooltip -------------------------------------------------
//
//############################################################################################





//############################################################################################
//
//............................ Remove Tooltip ................................................



function tooltip_mouseout(plot_id,circle_select){

  var tooltip = d3.select("#"+plot_id +" svg")        // Select the tooltip
    .select(".d3-tooltip");

  tooltip.selectAll("text").remove();                 // Remove all text
  tooltip.select("rect").remove();                    // Remove the rectangle

  //................. Resize Circle .....................................
  var rcircle = d3.select(circle_select).attr("r");   // Bring the circle back to original size
  if (rcircle == circle_size_tooltip_select){         // If line is highlighted, reduce by 2
    d3.select(circle_select).attr("r",circle_size_select);
  }else{                                            
    d3.select(circle_select).attr("r",circle_size);
  }
  //---------------------------------------------------------------------

  //................ Increase Circle Back If Line is Selected ...........
  var current_linewidth = d3.select(circle_select.parentNode)     // Get circle selection parent
    .select(".line")                                              // Get line
    .attr("stroke-width");                                        // Get stroke width

  if(current_linewidth == linewidth_size_select){                 // If line is highlighted, make sure dots are as well
    d3.select(circle_select).attr("r",circle_size_select);
  }  
  //---------------------------------------------------------------------

}

//------------------------- End: Remove Tooltip ----------------------------------------------
//
//############################################################################################






//############################################################################################
//
//........................... Resize Plot ....................................................
var plot_size_min = "col-lg-6";
var plot_size_max = "col-lg-12";
var icon_full = "glyphicon glyphicon-resize-full";
var icon_small = "glyphicon glyphicon-resize-small";

function panel_resize(resize_id){
  var plot_name = resize_id.split("-")[0];
  var panel_id  = plot_name+"-plot-panel";
  var plot_id   = plot_name+"-curves-plot";
 
  var isMin = $("#"+panel_id).parent().hasClass(plot_size_min);
  if (isMin){
    $("#"+panel_id).parent().removeClass(plot_size_min).addClass(plot_size_max);
    $("#"+panel_id).parent().css("height","100%");
    $("#"+resize_id).removeClass(icon_full).addClass(icon_small); 
  }else{
    $("#"+panel_id).parent().removeClass(plot_size_max).addClass(plot_size_min);
    $("#"+panel_id).parent().css("height","500px");
    $("#"+resize_id).removeClass(icon_small).addClass(icon_full); 
 }

}
//---------------------- End: Resize Plot  ---------------------------------------------------
//
//############################################################################################

*/
