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

      myHeatmap.height(myHeatmap.gridSize()*(1.5 * data.length))
      var container = d3.select("body").selectAll('#'+dataFileName);

      container.data([data])
          .enter()
          .append("div")
          .attr('id',dataFileName)
          .call(myHeatmap);

    })

  })
}())
