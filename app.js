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

// Ward name,
// Old code,
// New code,
// Population - 2015,
// Children aged 0-15 - 2015,
// Working-age (16-64) - 2015,
// Older people aged 65+ - 2015,
// % All Children aged 0-15 - 2015,
// % All Working-age (16-64) - 2015,
// % All Older people aged 65+ - 2015,
// Mean Age - 2013,
// Median Age - 2013,
// Area - Square Kilometres,
// Population density (persons per sq km) - 2013,
// % BAME - 2011,
// % Not Born in UK - 2011,
// % English is First Language of no one in household - 2011,
// General Fertility Rate - 2013,
// Male life expectancy -2009-13,
// Female life expectancy -2009-13,
// % children in reception year who are obese - 2011/12 to 2013/14,
// % children in year 6 who are obese- 2011/12 to 2013/14,
// "Rate of All Ambulance Incidents per 1,000 population - 2014",
// Rates of ambulance call outs for alcohol related illness - 2014,
// Number Killed or Seriously Injured on the roads - 2014,I
// n employment (16-64) - 2011,Employment rate (16-64) - 2011,
// Number of jobs in area - 2013,
// Employment per head of resident WA population - 2013,
// Rate of new registrations of migrant workers - 2011/12,
// Median House Price (£) - 2014,
// Number of properties sold - 2014,
// Median Household income estimate (2012/13),
// Number of Household spaces - 2011,% detached houses - 2011,
// % semi-detached houses - 2011,
// % terraced houses - 2011,
// "% Flat, maisonette or apartment - 2011",
// % Households Owned - 2011,
// % Households Social Rented - 2011,
// % Households Private Rented - 2011,
// % dwellings in council tax bands A or B - 2015,
// "% dwellings in council tax bands C, D or E - 2015",
// "% dwellings in council tax bands F, G or H - 2015",
// Claimant rate of key out-of-work benefits (working age client group) (2014),
// Claimant Rate of Housing Benefit (2015),
// Claimant Rate of Employment Support Allowance - 2014,
// Rate of JobSeekers Allowance (JSA) Claimants - 2015,
// % dependent children (0-18) in out-of-work households - 2014,
// % of households with no adults in employment with dependent children - 2011,
// % of lone parents not in employment - 2011,
// (ID2010) - Rank of average score (within London) - 2010,
// (ID2010) % of LSOAs in worst 50% nationally - 2010,
// Average GCSE capped point scores - 2014,
// Unauthorised Absence in All Schools (%) - 2013,
// % with no qualifications - 2011,
// % with Level 4 qualifications and above - 2011,
// A-Level Average Point Score Per Student - 2013/14,
// A-Level Average Point Score Per Entry; 2013/14,
// Crime rate - 2014/15,
// Violence against the person rate - 2014/15,
// "Deliberate Fires per 1,000 population - 2014",
// % area that is open space - 2014,
// Cars per household - 2011,
// Average Public Transport Accessibility score - 2014,
// % travel by bicycle to work - 2011,
// Turnout at Mayoral election - 2012,


d3.queue()
.defer(d3.json, './uk_topo_ward.json')
// .defer(d3.json, './london_ward_lat_lng.json')
  .defer(d3.csv, './London-Data-Table-1.csv', function(row){
    // console.log(row);
    return {
      newCode: row['New code'],
      wardName: row['Ward name'],
      population:  parseFloat(row['Population - 2015'].replace(/,/g, '')),
      area: row['Area - Square Kilometres'],
      openSpace: parseFloat(row['% area that is open space - 2014']),
      density:  parseFloat(row['Population density (persons per sq km) - 2013'].replace(/,/g, '')),
      availableArea: (row['Area - Square Kilometres'] * (100 - row['% area that is open space - 2014']))/ 100,
      trueDensity:  Math.round(parseFloat(row['Population - 2015'].replace(/,/g, '')) / ((row['Area - Square Kilometres'] * (100 - row['% area that is open space - 2014']))/ 100), 2),
    };
  })
  .await(function(error, mapData, wardData){
    if(error) throw error;

    // console.log(mapData);

    var geoData = topojson.feature(mapData, mapData.objects.wards).features;

    wardData.forEach(row => {
      var countries = geoData.filter(d => d.id === row.newCode);
      countries.forEach(country => country.properties = row);
    });
    var width = 800;
    var height = 600;

    var projection = d3.geoMercator()
      .center([0.3848, 51.5074])
      .scale(45000)
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
      // .style('fill', 'transparent')
    .on('mousemove', showToolTip)
    .on('touchStart', showToolTip)
    .on('mouseout', hideToolTip)
    .on('touchEnd', hideToolTip);

      var select = d3.select('select');

      select
        .on('change', d => setColor(d3.event.target.value));

      setColor(select.property('value'));


      function setColor(val) {
        var colorRanges = {
          population: ['pink', 'mediumseagreen'],
          density: ['pink', 'mediumseagreen'],
          openSpace: ['pink', 'mediumseagreen'],
          trueDensity: ['pink', 'mediumseagreen']
        };

        console.log(d3.max(wardData, d =>  d[val]));

        var scale = d3.scaleLinear()
          .domain([d3.min(wardData, d => d[val]), d3.max(wardData, d => d[val])])
          .range(colorRanges[val]);

      d3.selectAll('.country')
        .transition()
        .duration(750)
        .ease(d3.easeBackIn)
        .attr('fill', d => {
          var data = d.properties[val];
          return data ? scale(data) : '#ccc';
        });
    }
  });

var tooltip = d3.select('body')
  .append('div')
  .classed('tooltip', true);

function showToolTip(d) {
  //  console.log(d);
  var properties = d.properties;
  tooltip
    .style('opacity', 1)
    .style('left', d3.event.x - (tooltip.node().offsetWidth /2) + 'px')
    .style('top', d3.event.y + 25 + 'px')
    .html(`
        <p>${properties.wardName}</p>
        <p>Population: ${properties.population}</p>
        <p>Area: ${properties.area} km2</p>
        <p>Open Space: ${properties.openSpace}%</p>
        <p>density: ${properties.density}</p>
        <p>openSpace: ${properties.openSpace}</p>
        <p>availableArea: ${properties.availableArea} km2</p>
        <p>trueDensity: ${properties.trueDensity} per/km2</p>
      `);  
}
  
function hideToolTip() {
  tooltip
    .style('opacity', 0);
}
