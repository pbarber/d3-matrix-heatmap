function matrix_heatmap(error, json) {

  if (error) {
    console.log(error)
  }

  var colLabel = json["col_label"];
  var rowLabel = json["row_label"];
  var col_order = json["col_order"];
  var row_order = json["row_order"];
  var data = json["data"];
  var colours = json["colours"];
  var colour_domain = json["colour_domain"];

  var col_number = colLabel.length
  var row_number = rowLabel.length

  frame = d3.select('#chart').attr('class', 'frame')
  fh = frame.style("height").replace("px", "");
  fw = frame.style("width").replace("px", "");

  var cellHeight = ($(window).height() - margin.top - margin.bottom)/(row_number+3)
  var cellWidth = (fw - margin.right - margin.left)/col_number

  var cellSize = Math.min(cellHeight, cellWidth);

  var width = cellSize*col_number
  var height = cellSize*row_number

  var colorScale = d3.scale.linear()
      .domain(colour_domain)
      .range(colours);

  var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .append("g")
        .call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom))
      ;
  var rowSortOrder=false;
  var colSortOrder=false;
  var rowLabels = svg.append("g")
      .selectAll(".rowLabelg")
      .data(rowLabel)
      .enter()
      .append("text")
      .text(function (d) { return d; })
      .attr("x", 0)
      .attr("y", function (d, i) { return row_order.indexOf(i+1) * cellSize; })
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + cellSize / 1.5 + ")")
      .attr("class", function (d,i) { return "rowLabel mono r"+i;} )
      .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
      .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
      .on("click", function(d,i) {
         rowSortOrder=!rowSortOrder;
         sortbylabel("r",i,rowSortOrder);
         $("#order").parents(".dropdown").find('.btn').html('Order by row value <span class="caret"></span>');
         $("#order").parents(".dropdown").find('.btn').val('Order by row value');
      })
      ;

  var colLabels = svg.append("g")
      .selectAll(".colLabelg")
      .data(colLabel)
      .enter()
      .append("text")
      .text(function (d) { return d; })
      .attr("x", 0)
      .attr("y", function (d, i) { return col_order.indexOf(i+1) * cellSize; })
      .style("text-anchor", "left")
      .attr("transform", "translate("+cellSize/2 + ",-6) rotate (-90)")
      .attr("class",  function (d,i) { return "colLabel mono c"+i;} )
      .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
      .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);})
      .on("click", function(d,i) {
         colSortOrder=!colSortOrder;
         sortbylabel("c",i,colSortOrder);
         $("#order").parents(".dropdown").find('.btn').html('Order by column value <span class="caret"></span>');
         $("#order").parents(".dropdown").find('.btn').val('Order by column value');
      })
      ;

  var defs = svg.append("defs");
  var diagonalHatch = defs.append("pattern")
                         .attr("id", "diagonalHatch")
                         .attr("patternUnits", "userSpaceOnUse")
                         .attr("width", 4)
                         .attr("height", 4)
                      .append('path')
                         .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
                         .attr('stroke', 'grey')
                         .attr('stroke-width', 1);

  var heatMap = svg.append("g").attr("class","g3")
        .selectAll(".cellg")
        .data(data,function(d){return d.row+":"+d.col;})
        .enter()
        .append("rect")
        .attr("x", function(d) { return col_order.indexOf(d.col) * cellSize; })
        .attr("y", function(d) { return row_order.indexOf(d.row) * cellSize; })
        .attr("class", function(d){return "cell cell-border cr"+(d.row-1)+" cc"+(d.col-1);})
        .attr("width", cellSize)
        .attr("height", cellSize)
        .style("fill", function(d) {
               if (d.value !== "") {
                   return colorScale(d.value);
               } else {
                   return "url(#diagonalHatch)";
               }
        })
        .on("mousedown", function(d) {
               var rowtext=d3.select(".r"+(d.row-1));
               var paneltext="["+rowLabel[d.row-1]+", "+colLabel[d.col-1]+"]: "+d.value
               $("#panel").text(paneltext);
               if (d.img) {
                   $("#panel-img").attr("src", d.img);
               } else {
                   $("#panel-img").attr("src", "");
               }
        })
        .on("mouseover", function(d){
               //highlight text
               d3.select(this).classed("cell-hover",true);
               d3.selectAll(".rowLabel").classed("text-highlight",function(r,ri){ return ri==(d.row-1);});
               d3.selectAll(".colLabel").classed("text-highlight",function(c,ci){ return ci==(d.col-1);});

               //Update the tooltip position and value
               d3.select("#tooltip")
                 .style("left", (d3.event.pageX+10) + "px")
                 .style("top", (d3.event.pageY-10) + "px")
                 .select("#value")
                 .text("["+rowLabel[d.row-1]+", "+colLabel[d.col-1]+"]: "+d.value);
               //Show the tooltip
               d3.select("#tooltip").classed("hidden", false);
        })
        .on("mouseout", function(){
               d3.select(this).classed("cell-hover",false);
               d3.selectAll(".rowLabel").classed("text-highlight",false);
               d3.selectAll(".colLabel").classed("text-highlight",false);
               d3.select("#tooltip").classed("hidden", true);
        })
        ;

  var legend = svg.selectAll(".legend")
      .data(colour_domain)
      .enter().append("g")
      .attr("class", "legend");

  var linearGradient = defs.append("linearGradient")
      .attr("id", "legend-colours")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

  linearGradient.selectAll("stop")
      .data( colorScale.range() )
      .enter().append("stop")
      .attr("offset", function(d,i) { return i/(colorScale.range().length-1); })
      .attr("stop-color", function(d) { return d; });

  var legendxScale = d3.scale.linear()
      .range([0, width])
      .domain([colour_domain[0], colour_domain[colour_domain.length-1]]);

  var legendxAxis = d3.svg.axis()
      .orient("bottom")
      .tickSize([0, 0])
      .scale(legendxScale);

  legend.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + (height+(cellSize*3.2)) + ")")
      .call(legendxAxis);

  legend.append("rect")
      .attr("y", height+(cellSize*2))
      .attr("width", width)
      .attr("height", cellSize)
      .style("fill", "url(#legend-colours)");

  function zoom() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }

  // Change ordering of cells

  function sortbylabel(rORc,i,sortOrder){
       var t = svg.transition().duration(3000);
       var log2r=[];
       var sorted; // sorted is zero-based index
       d3.selectAll(".c"+rORc+i)
         .filter(function(ce){
            log2r.push(ce.value);
          })
       ;
       if(rORc=="r"){ // sort log2ratio of a gene
         sorted=d3.range(col_number).sort(function(a,b){ if(sortOrder){ return log2r[b]-log2r[a];}else{ return log2r[a]-log2r[b];}});
         t.selectAll(".cell")
           .attr("x", function(d) { return sorted.indexOf(d.col-1) * cellSize; })
           ;
         t.selectAll(".colLabel")
          .attr("y", function (d, i) { return sorted.indexOf(i) * cellSize; })
         ;
       }else{ // sort log2ratio of a contrast
         sorted=d3.range(row_number).sort(function(a,b){if(sortOrder){ return log2r[b]-log2r[a];}else{ return log2r[a]-log2r[b];}});
         t.selectAll(".cell")
           .attr("y", function(d) { return sorted.indexOf(d.row-1) * cellSize; })
           ;
         t.selectAll(".rowLabel")
          .attr("y", function (d, i) { return sorted.indexOf(i) * cellSize; })
         ;
       }
  }

  $("#order").on("click", "li a", function(){
    $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
    $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
    order($(this).text());
  });

  function order(value){
   if(value=="Order by row and column order"){
    var t = svg.transition().duration(3000);
    t.selectAll(".cell")
      .attr("x", function(d) { return col_order.indexOf(d.col) * cellSize; })
      .attr("y", function(d) { return row_order.indexOf(d.row) * cellSize; })
      ;

    t.selectAll(".rowLabel")
      .attr("y", function (d, i) { return row_order.indexOf(i+1) * cellSize; })
      ;

    t.selectAll(".colLabel")
      .attr("y", function (d, i) { return col_order.indexOf(i+1) * cellSize; })
      ;

   }else if (value=="Order by row and column labels"){
    var t = svg.transition().duration(3000);
    t.selectAll(".cell")
      .attr("x", function(d) { return (d.col - 1) * cellSize; })
      .attr("y", function(d) { return (d.row - 1) * cellSize; })
      ;

    t.selectAll(".rowLabel")
      .attr("y", function (d, i) { return i * cellSize; })
      ;

    t.selectAll(".colLabel")
      .attr("y", function (d, i) { return i * cellSize; })
      ;

   }else if (value=="Order by row label"){
    var t = svg.transition().duration(3000);
    t.selectAll(".cell")
      .attr("y", function(d) { return (d.row - 1) * cellSize; })
      ;

    t.selectAll(".rowLabel")
      .attr("y", function (d, i) { return i * cellSize; })
      ;
   }else if (value=="Order by column label"){
    var t = svg.transition().duration(3000);
    t.selectAll(".cell")
      .attr("x", function(d) { return (d.col - 1) * cellSize; })
      ;
    t.selectAll(".colLabel")
      .attr("y", function (d, i) { return i * cellSize; })
      ;
   }
  }
  //
  var sa=d3.select(".g3")
      .on("mousedown", function() {
          if( !d3.event.altKey) {
             d3.selectAll(".cell-selected").classed("cell-selected",false);
             d3.selectAll(".rowLabel").classed("text-selected",false);
             d3.selectAll(".colLabel").classed("text-selected",false);
          }
         var p = d3.mouse(this);
         sa.append("rect")
         .attr({
             rx      : 0,
             ry      : 0,
             class   : "selection",
             x       : p[0],
             y       : p[1],
             width   : 1,
             height  : 1
         })
      })
      .on("mousemove", function() {
         var s = sa.select("rect.selection");

         if(!s.empty()) {
             var p = d3.mouse(this),
                 d = {
                     x       : parseInt(s.attr("x"), 10),
                     y       : parseInt(s.attr("y"), 10),
                     width   : parseInt(s.attr("width"), 10),
                     height  : parseInt(s.attr("height"), 10)
                 },
                 move = {
                     x : p[0] - d.x,
                     y : p[1] - d.y
                 }
             ;

             if(move.x < 1 || (move.x*2<d.width)) {
                 d.x = p[0];
                 d.width -= move.x;
             } else {
                 d.width = move.x;
             }

             if(move.y < 1 || (move.y*2<d.height)) {
                 d.y = p[1];
                 d.height -= move.y;
             } else {
                 d.height = move.y;
             }
             s.attr(d);

                 // deselect all temporary selected state objects
             d3.selectAll('.cell-selection.cell-selected').classed("cell-selected", false);
             d3.selectAll(".text-selection.text-selected").classed("text-selected",false);

             d3.selectAll('.cell').filter(function(cell_d, i) {
                 if(
                     !d3.select(this).classed("cell-selected") &&
                         // inner circle inside selection frame
                     (this.x.baseVal.value)+cellSize >= d.x && (this.x.baseVal.value)<=d.x+d.width &&
                     (this.y.baseVal.value)+cellSize >= d.y && (this.y.baseVal.value)<=d.y+d.height
                 ) {

                     d3.select(this)
                     .classed("cell-selection", true)
                     .classed("cell-selected", true);

                     d3.select(".r"+(cell_d.row-1))
                     .classed("text-selection",true)
                     .classed("text-selected",true);

                     d3.select(".c"+(cell_d.col-1))
                     .classed("text-selection",true)
                     .classed("text-selected",true);
                 }
             });
         }
      })
      .on("mouseup", function() {
            // remove selection frame
         sa.selectAll("rect.selection").remove();

             // remove temporary selection marker class
         d3.selectAll('.cell-selection').classed("cell-selection", false);
         d3.selectAll(".text-selection").classed("text-selection",false);
      })
      .on("mouseout", function() {
         if(d3.event.relatedTarget.tagName=='html') {
                 // remove selection frame
             sa.selectAll("rect.selection").remove();
                 // remove temporary selection marker class
             d3.selectAll('.cell-selection').classed("cell-selection", false);
             d3.selectAll(".rowLabel").classed("text-selected",false);
             d3.selectAll(".colLabel").classed("text-selected",false);
         }
      })
      ;
};
