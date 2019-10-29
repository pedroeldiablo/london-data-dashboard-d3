// "transform":
// {"scale":[0.3556874528312616,0.34023701074684576],"translate":[503568.19958180457,155850.79750088477]},
// "objects":
// {"London_Ward":
// {"type":"GeometryCollection",
// "geometries":[
// {"arcs":[[0,1]],
// "type":"Polygon",
// "properties":{
//     "NAME":"Chessington South",
//     "GSS_CODE":"E05000405",
//     "DISTRICT":"Kingston upon Thames",
//     "LAGSSCODE":"E09000021",
//     "HECTARES":755.173,"NONLD_AREA":0
// }},
// {"arcs":[[2,3,4,5,6]],"type":"Polygon","properties":{"NAME":"Tolworth and Hook Rise","GSS_CODE":"E05000414","DISTRICT":"Kingston upon Thames","LAGSSCODE":"E09000021","HECTARES":259.464,"NONLD_AREA":0}},
// {"arcs":[[7,8,9,10,11]],"type":"Polygon","properties":{"NAME":"Berrylands","GSS_CODE":"E05000401","DISTRICT":"Kingston upon Thames","LAGSSCODE":"E09000021","HECTARES":145.39,"NONLD_AREA":0}},{"arcs":[[-6,12,-11,13,14,15]],"type":"Polygon"


d3.queue()
.defer(d3.json, './uk_topo_ward.json')
// .defer(d3.json, './london_ward_lat_lng.json')
  // .defer(d3.json, './LONDON_WARD.json')
  .defer(d3.csv, './London-Data-Table-1.csv', function(row){
    return {
      country: row.country,
      countryCode: row.countryCode,
      population: +row.population,
      medianAge: +row.medianAge,
      fertilityRate: +row.fertilityRate,
      populationDensity: +row.population / +row.landArea
    };
  })
  .await(function(error, mapData, wardData){
    if(error) throw error;

    console.log(mapData);

    var geoData = topojson.feature(mapData, mapData.objects.wards).features;

    wardData.forEach(row => {
      var countries = geoData.filter(d => d.id === row.countryCode);
      countries.forEach(country => country.properties = row);
    });
    var width = 600;
    var height = 600;

    var projection = d3.geoMercator()
      .center([0.2248, 51.5074])
      .scale(50000)
      .translate([width, height/2]);

    var path = d3.geoPath()
      .projection(projection);

    d3.select('svg')
      .attr('width', width)
      .attr('height', height)
      .selectAll('.country')
      .data(geoData)
      .enter()
      .append('path')
      .classed('country', true)
      .attr('d', path)
      .style('fill', 'transparent');
    // .on('mousemove', showToolTip)
    // .on('touchStart', showToolTip)
    // .on('mouseout', hideToolTip)
    // .on('touchEnd', hideToolTip);

    //   var select = d3.select('select');

    //   select
    //     .on('change', d => setColor(d3.event.target.value));

    //   setColor(select.property('value'));


    //   function setColor(val) {
    //     var colorRanges = {
    //       population: ['white', 'purple'],
    //       populationDensity: ['white', 'orange'],
    //       medianAge: ['deeppink', 'darkseagreen'],
    //       fertilityRate: ['pink', 'mediumseagreen']
    //     };

    //     var scale = d3.scaleLinear()
    //       .domain([0, d3.max(populationData, d => d[val])])
    //       .range(colorRanges[val]);

  //     d3.selectAll('.country')
  //       .transition()
  //       .duration(750)
  //       .ease(d3.easeBackIn)
  //       .attr('fill', d => {
  //         var data = d.properties[val];
  //         return data ? scale(data) : '#ccc';
  //       });
  //   }
  });

// var tooltip = d3.select('body')
//   .append('div')
//   .classed('tooltip', true);

// function showToolTip(d) {
//   var properties = d.properties;
//   tooltip
//     .style('opacity', 1)
//     .style('left', d3.event.x - (tooltip.node().offsetWidth /2) + 'px')
//     .style('top', d3.event.y + 25 + 'px')
//     .html(`
//         <p>${properties.country}</p>
//         <p>Population: ${properties.population.toLocaleString()}</p>
//         <p>Population Density: ${properties.populationDensity.toFixed(2)} per km2</p>
//         <p>Median Age: ${properties.medianAge}</p>
//         <p>Fertility Rate: ${properties.fertilityRate}%</p>
//       `);  
// }
  
// function hideToolTip() {
//   tooltip
//     .style('opacity', 0);
// }
