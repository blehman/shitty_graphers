
(function() {
  // call the heatmap constructor
  var myHeatmap = heatmap();

  // the number of elements in this array determines the number of heatmaps created
  var dataPathArray = ['PD1_and_PD2_edm_agg.csv'
    ,'PD1_and_PD2_country_agg.csv'
                      ];

  // create a heatmap for each dataset
  dataPathArray.forEach(function(dataFileName){
    console.log(dataFileName)

    var data = d3.csv('./data/'+dataFileName,function(error, data){
      if (error) return console.warn(error);
      var colCount = Object.keys(data[0]).length -1
        , rowCount = data.length;

      myHeatmap.height( (myHeatmap.gridSize()*rowCount) +  myHeatmap.margin().top + myHeatmap.margin().bottom)
      myHeatmap.width( (myHeatmap.gridSize()*colCount) + myHeatmap.margin().right + myHeatmap.margin().left)
      //myHeatmap.colors(['#e5f5f9','#2ca25f'])
      myHeatmap.title( 'Heatmap: '+dataFileName )
      var container = d3.select("body").selectAll('#'+dataFileName);

      container.data([data])
          .enter()
          .append("div")
          .attr('id',dataFileName)
          .call(myHeatmap);

    })

  })
}())
