
// Closure
(function() {
  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
})();


// add elements in which to place the chart
function heatmap(){
  var gridSize = 50
    , margin = { top: 100, right: 0, bottom: 100, left: 130 , legend: gridSize}
    , width =1500 - margin.left - margin.right
    , height = 1500 - margin.top - margin.bottom
    , colors = ['#990000','#ff9900']
    , colorDomain = [-2,2]
    , colorScale = d3.scale.linear().domain(colorDomain).range(colors)
    , title = 'Reuseable Heatmap';

  function chart(selection){
    // the chart function builds the heatmap.
    // note: selection is passed in from the .call(myHeatmap), which is the same as myHeatmap(d3.select('.stuff')) -- ??
    selection.each(function(data){
        console.log(data)
        console.log(height)
        var columns = Object.keys(data[0]).length -1
          , rows = data.length;

        var rowLabelSet = new Set();
        data.forEach(function(d){
            rowLabelSet.add(d.row_name)
        })

        var svg = selection.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var rowLabels = svg.selectAll(".rowLabel")
            .data(Array.from(rowLabelSet))
            .enter().append("text")
            .classed('rowLabel',true)
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")");
            //.attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

        var colLabels = svg.selectAll(".colLabel")
            .data(d3.range(columns))
            .enter().append("text")
            .text(function(d) { return 'c'+d; })
            .attr("x", function(d, i) { return i * gridSize; })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)");
            //.attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

        var rowElement = svg.append('g')
            .classed('row',true);

        var myRows = rowElement.selectAll('g')
            .data(data).enter()
            .append('g')
            .classed('test_rows',true);


        // add rectangles WITH a data binding

        var gTest = svg.append('g')
            .classed('gTest',true);

        // notice that we bind the data here and use a transform to adjust the y-value for each g. 
            // note: each g represents one row.
        var testGs = gTest.selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr("transform", function(d,i) { return "translate(0," + (i * gridSize) + ")";});

        // create a selection that is ready to bind with data
            // note: d3.entries() breaks the object into an array of row elements each representing an item in that column.
        var dataBoundElements = testGs.selectAll("rect")
            .data(function(d,i) { 
              return d3.entries(d).filter(function(e) { return e.key != "row_name";});
            });

        // create the rectangles.
        var rectElements = dataBoundElements
            .enter().append("rect")
            .attr({
              x: function(d,i) { return i * gridSize;}
            , y: 0
            , width: gridSize
            , height: gridSize
            , class:"cell"
            })
            .style('fill',colors[0])
            .transition().duration(3000)
            .style('fill',function(d) {
              return colorScale( +d.value )} );

        // create text in the elements
        var textElements = dataBoundElements
            .enter().append('text')
            .attr({
              x: function(d,i) { return i * gridSize + 10;}
            , y: 0.5 * gridSize
            , class:"cellText"
            })
            .text(function(d){return Math.round10(+d.value,-1)});

        /*
        // add rectangles WITHOUT a data binding 
        data.forEach(function(d,i){
            for (col in d3.range(columns)){
                rowElement.append('rect')
                    .attr("x", function(d) { return (+col) * gridSize; })
                    .attr("y", function(d) { return (+i) * gridSize; })
                    .attr("rx", 4)
                    .attr("ry", 4)
                    .attr("class", "cell")
                    .attr("width", gridSize)
                    .attr("height", gridSize)
                    .style("fill", colors[0])
                    .transition().duration(3000)
                      .style('fill',function(d) { 
                        return colorScale( Math.round10(+d[i]['c'+col],-1) )} );

               rowElement.append('text')
                    .attr("x", function(d) { return ((+col) * gridSize) + 10; })
                    .attr("y", function(d) { return ((+i) * gridSize) + (0.5*gridSize); })
                    .attr("class", "cellText")
                    .text(Math.round10(+d['c'+col],-1))
                    .style('text-anchor','right')
                    .style("fill", 'white');

            }
         })

        */ 

         // create legend
         var legendData = d3.range(colorDomain[0],colorDomain[1], (colorDomain[1]-colorDomain[0]) / columns );

         var legend = svg.append('g')
            .classed('legend',true)
            .attr("transform", function(d,i) { return "translate(0," + ( height - margin.bottom - margin.top + margin.legend) + ")";});

         console.log((colorDomain[1]-colorDomain[0]) / columns)
         legend.selectAll('.legendRect')
            .data(legendData)
            .enter().append('rect')
            .attr({
              x: function(d,i){ return gridSize * i }
            , y: 0
            , height: gridSize
            , width: gridSize
            })
            .classed('cell',true)
            .classed('legendRect',true)
            .style('fill', function(d){
              return colorScale( +d )} );

        legendData.push(colorDomain[1]);
        console.log(legendData)
        console.log(colorDomain[1])

        legend.selectAll('.legendText')
            .data(legendData)
            .enter().append('text')
            .attr({
              x: function(d,i) { return (i * gridSize)-5;}
            , y: gridSize+10
            , class:"legendText"
            })
            .text(function(d){return Math.round10(+d,-1)});

        // Add title
        svg.append('g')
            .classed('title_container',true)
            .append('text')
            .classed('title',true)
            .attr({
                x: 0
              , y: (margin.top/2)-(gridSize*2)
            })
            .text(title)

    })
  }

  chart.margin = function(m) {
    if (!arguments.length) { return margin; }
    margin = m;
    return chart;
  };

  chart.width = function(w) {
    if (!arguments.length) { return width; }
    width = w;
    return chart;
  };

  chart.height = function(h) {
    if (!arguments.length) { return height; }
    height = h;
    return chart;
  };

  chart.gridSize = function(m) {
    if (!arguments.length) { return gridSize; }
    gridSize = m;
    return chart;
  };

  chart.colors = function(c) {
    if (!arguments.length) { return colors; }
    colors = c;
    colorScale = d3.scale.linear().domain(colorDomain).range(colors);
    return chart;
  };

  chart.colorDomain = function(d) {
    if (!arguments.length) { return colorDomain; }
    colorDomain = d;
    colorScale = d3.scale.linear().domain(colorDomain).range(colors);
    return chart;
  };

  chart.title = function(t) {
    if (!arguments.length) { return title; }
    title = t;
    return chart;
  };

  return chart
}
