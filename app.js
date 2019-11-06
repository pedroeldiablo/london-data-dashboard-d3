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
// Number Killed or Seriously Injured on the roads - 2014,
// In employment (16-64) - 2011,
// Employment rate (16-64) - 2011,
// Number of jobs in area - 2013,
// Employment per head of resident WA population - 2013,
// Rate of new registrations of migrant workers - 2011/12,
// Median House Price (£) - 2014,
// Number of properties sold - 2014,
// Median Household income estimate (2012/13),
// Number of Household spaces - 2011,
// % detached houses - 2011,
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


// NLC,
// TLC,
// Station Name,
// Region,
// Local Authority,
// Constituency,
// OS Grid Easting,
// OS Grid Northing,
// Station Facility Owner,
// Station Group,
// PTE Urban Area Station,
// London Travelcard Area,
// SRS Code,
// SRS Description,
// NR Route,
// CRP Line Designation,
// Entries & Exits_Full,
// Entries & Exits_Reduced,
// Entries & Exits_Season,
// 1718 Entries & Exits,
// 1617 Entries & Exits,
// 1718 Interchanges,
// 1718 Entries & Exits - GB rank,
// 1617 Entries & Exits - GB rank,
// Large station change flag,
// Small station change flag,
// % Change,
// Explanation of large change 1718,
// Source for explanation of large change 1718

// nlc,
// Station,
// Borough,
// Note,
// WeekdayEntry,
// SaturdayEntry,
// SundayEntry,
// WeekdayExit,
// SaturdayExit,
// SundayExit,
// Entry + Exit Million

var geoData;
var linesGeoTopoData;
var linesGeoData;


d3.queue()
.defer(d3.json,'./eastLondon.json')
  .defer(d3.json, './uk_topo_ward.json')
  .defer(d3.json, './london_stations_topojson.json')
  .defer(d3.json, './station-centroids.json')
  .defer(d3.csv, './London-Data-Table-1.csv', function(row){
    var area = row['Area - Square Kilometres'];
    var population = parseFloat(row['Population - 2015'].replace(/,/g, ''));
    var openSpace = parseFloat(row['% area that is open space - 2014']);
    var density = parseFloat(row['Population density (persons per sq km) - 2013'].replace(/,/g, ''));
    var jobs = parseFloat(row['Number of jobs in area - 2013'].replace(/,/g, ''));
    var availableArea = (area * (100 - openSpace))/ 100;
    var trueDensity = Math.round(population/availableArea);
    var hiddenDensity = (trueDensity - density) * availableArea;
    var jobsDensity = jobs / availableArea;
    var workingAgePopulation = parseFloat(row['Working-age (16-64) - 2015'].replace(/,/g, ''));
    var publicTransport = row['Average Public Transport Accessibility score - 2014'];

    return {
      newCode: row['New code'],
      wardName: row['Ward name'],
      population: population,
      area: row['Area - Square Kilometres'],
      openSpace: openSpace,
      density: density,
      availableArea: availableArea,
      trueDensity: trueDensity,
      hiddenDensity: hiddenDensity,
      jobs: jobs,
      jobsDensity: jobsDensity,
      netEmployment: jobs - workingAgePopulation,
      workingAge: workingAgePopulation,
      publicTransport: publicTransport,
      transportPopulationRating: publicTransport * population,
      transportDensityRating: publicTransport * trueDensity,
      transportJobs: jobs / publicTransport,
      transportInvestmentImpact: publicTransport / (trueDensity * availableArea)
    };
  })
  .defer(d3.csv, './station-usage-2017-18-Travelcard.csv', function(row){
    var name = row['Station Name'];
    var entriesExits = parseFloat(row['1718 Entries & Exits'].replace(/,/g, '')) ? parseFloat(row['1718 Entries & Exits'].replace(/,/g, '')) : 0;
    var interChanges = parseFloat(row['1718 Interchanges'].replace(/,/g, '')) ? parseFloat(row['1718 Interchanges'].replace(/,/g, '')) : 0;
    var NLC = row['NLC'];
    var route = row['NR Route'];
    var srsCode = row['SRS Code'];
    var routeDescription = row['SRS Description'];
    var rank = +row['1718 Entries & Exits - GB rank'];
    
    return {
      name: name,
      entriesExits: entriesExits,
      interChanges: interChanges,
      allJournies: entriesExits +  interChanges,
      NLC: NLC,
      route: route,
      srsCode: srsCode,
      routeDescription: routeDescription,
      rank: rank
    };
  })
  .defer(d3.csv, './tube-station-usage-2017.csv', function(row){
    var name = row['Station'];
    var nlc = row['nlc'];
    var weekday = (+row['WeekdayEntry'] + +row['WeekdayExit']) * 252;
    var saturday = (+row['SaturdayEntry'] + +row['SaturdayExit'])  * 52;
    var sunday = (+row['SundayEntry'] + +row['SundayExit'])  * 58;
    var stationUsage =  weekday + saturday + sunday;

    return {
      name: name,
      entriesExits: stationUsage,
      NLC: nlc,
      weekday: weekday,
      saturday: saturday,
      sunday: sunday
    };
  })
  .await(function(error, eastLondon, mapData, stationsData, allStationsData, wardData, stationUsageData, tubeStationUsageData){
    if(error) throw error;

    // console.log(mapData);

    geoData = topojson.feature(mapData, mapData.objects.wards).features;

    // var geoData = topojson.feature(mapData, mapData.objects.wards).features;
    var stationsGeoData = topojson.feature(stationsData, stationsData.objects.london_stations).features;
    //  var allStationsGeoData = topojson.feature(stationsData, stationsData.objects.london_stations).features;
    var allStationsGeoData = allStationsData.features;


// console.log(eastLondon.features.properties);
//     var eastLondon = topojson.feature(eastLondon, eastLondon.geometry).features;
    // var eastLondon = eastLondon.features;


    // console.log('geoData', geoData);
    //  console.log('stationsGeoData', stationsGeoData);

    // console.log('allStationsGeoData', allStationsGeoData);
      


    wardData.forEach(row => {
      var countries = geoData.filter(d => d.id === row.newCode);
      countries.forEach(country => {
        // console.log('country before', country);
        country.properties = row;
        // console.log('country after', country);
      
      });
    });

    stationUsageData.forEach(row => {
      // console.log('row', row);
      
      var stations = allStationsGeoData.filter(d => {
        // console.log('data d', d);
        return d.properties.nlc_id === +row.NLC;
      }
        
      );
      // console.log('stations', stations);
      stations.forEach(station => {
        // console.log('station before', station);
        station.properties = row;
        // console.log('station after', station);
      });
    });

    tubeStationUsageData.forEach(row => {
      // console.log('row', row);
      
      var stations = allStationsGeoData.filter(d => {
        // console.log('data d', d);
        return d.properties.nlc_id === +row.NLC;
      }
        
      );
      // console.log('stations', stations);
      stations.forEach(station => {
        // console.log('station before', station);
        station.properties = row;
        // console.log('station after', station);
      });
    });

    allStationsGeoData.forEach(row => {
      
      var stations = stationUsageData.filter(d => 
        +d.NLC === row.properties.nlc_id
      );

      stations.forEach(station => {
        console.log('station before', station);
        station.properties = row;
        console.log('station after', station);
      });
    });

    var trainlines = [];
  
    stationsGeoData.forEach(station => {
      // console.log(station);
      var id = station.properties.id;
      var lines = station.properties.lines;
      var coordinates = station.geometry.coordinates;
      // console.log(lines, id);
      lines.forEach(line => {
        // console.log(line);
        var lineName = line.name; 
        if(trainlines[`${lineName}`]){
          trainlines[`${lineName}`].push({'geometry': {'coordinates': coordinates, type: 'Polygon'}, type: 'Feature'});

        } else {
          trainlines[`${lineName}`] = [];
          trainlines[`${lineName}`].push({'geometry': {'coordinates': coordinates, type: 'Polygon'}, type: 'Feature'});
        }
      });
    });

    // TODO filter routes or descriptions and link visually 

    // var trainRoute = [];

    // allStationsGeoData.forEach(station => {
    //   // console.log(station);
    //   var id = station.properties.ncl;
    //   var lines = station.properties.routeDescription;
    //   var coordinates = station.geometry.coordinates;
    //   // console.log(coordinates);
    //   // console.log(lines, id);
     
    //   if(trainRoute[`${lines}`]){
    //     // trainRoute[`${lines}`].push({'geometry': {'coordinates': coordinates, type: 'MultiPolygon'}, type: 'Feature'});
    //     trainRoute[`${lines}`][0]['geometry']['coordinates'].push(coordinates);


    //   } else {
    //     trainRoute[`${lines}`] = [];
    //     trainRoute[`${lines}`].push({'geometry': {'coordinates': [ coordinates ]}, type: 'Feature', id: lines });
    //   }
    // });

    var trainRoute = {};

    allStationsGeoData.forEach(station => {
      // console.log(station);
      var id = station.properties.ncl;
      var lines = station.properties.routeDescription;
      var coordinates = station.geometry.coordinates;
      // console.log(coordinates);
      // console.log(lines, id);
     
      if(trainRoute[`${lines}`]){
        console.log("what is this trainRoute", trainRoute);
         console.log("what is this type trainRoute",  Object.prototype.toString.call(trainRoute));

        console.log("what is this trainRoute[`${lines}`]", trainRoute[`${lines}`]);
         console.log("what is this type trainRoute[`${lines}`]",  Object.prototype.toString.call(trainRoute[`${lines}`]));
        // trainRoute[`${lines}`].push({'geometry': {'coordinates': coordinates, type: 'MultiPolygon'}, type: 'Feature'});
        trainRoute[`${lines}`][0]['geometry']['coordinates'][0].push(coordinates);


      } else {
        trainRoute[`${lines}`] = [];
        trainRoute[`${lines}`].push({'geometry': {'coordinates': [[coordinates ]]}, type: 'Feature', id: lines });
      }
    });


    console.log('trainRoute', trainRoute);
   
    var lineRoutes = Object.keys(trainRoute);

    console.log('lineRoutes', lineRoutes);

    lineRoutes.forEach(line => {
      if (line === 'undefined') {
        return console.log('unknownline');
      } else {
        console.log('current', trainRoute[line]);
        linesGeoData = trainRoute[line];

        // linesGeoTopoData = topojson.feature(linesGeoData, linesGeoData.geometry).features;
       
        // console.log('linesGeoData', linesGeoData);
        linesGeoTopoData = linesGeoData[0].geometry.coordinates;
        console.log(`linesGeoTopoData ${line}`, linesGeoTopoData);

        if(linesGeoTopoData.length > 20 ){

      var transformedGeoData = [];
      console.log('transformedGeoData', transformedGeoData);


        linesGeoTopoData.forEach(pair => {
          
          // console.log('pair', pair);

          var xcord = pair[0];
          var ycord = pair[1];
          console.log('xcord', xcord);
          console.log('ycord', ycord);
          xcord = xcord + (0.3848);
          ycord = ycord + (51.5074);
          // console.log('xcord', xcord);
          xcord = xcord * 90000;
          // console.log('xcord', xcord);
          ycord = ycord * 90000;
          xcord = xcord /360;
          ycord = ycord /360;
          var width = (1600 / 360);
          var height = (1200 / 360);
          //  var width = 1;
          // var height = 1;
          // pair = [xcord, ycord];
          // console.log('pair', pair);
          // console.log(`linesGeoTopoData ${line}`, linesGeoTopoData);
          if (transformedGeoData.length < 1) {
            pair = [`M${xcord }`, +ycord - height/2 ];
            // console.log('pair', pair);
            transformedGeoData.push(pair);
          } else {
            pair = [`L${xcord}`, +ycord - height/2];
            // console.log('pair', pair);
            transformedGeoData.push(pair);

          }
          

        });

        console.log('transformedGeoData', transformedGeoData );

        transformedGeoData =  transformedGeoData.join('');

        // transformedGeoData = transformedGeoData + 'Z';

        // console.log('transformedGeoData joined', transformedGeoData );

        return (
          d3.select('#map')
            .attr('width', width)
            .attr('height', height)
            .attr('transform', `translate(${width}, ${height}/2)`)
            .selectAll('.line')
            .data(linesGeoTopoData)
            .enter()
            .append('path')
            .classed('line', true)
            .classed( linesGeoData[0].id, true)
            .attr('stroke-width', '2')
            // .attr('d', function(d) {
            //   return line(d, xScale, yScale, lineWidth, lineWidthTickRatio);
            // })
            .attr('d', transformedGeoData)
            .attr('fill', 'green')
            .on('mousemove', showToolTip)
            .on('touchStart', showToolTip)
            .on('mouseout', hideToolTip)
            .on('touchEnd', hideToolTip)

        );
  
      }
      }
      
    });
    // console.log('stationsGeoData', stationsGeoData);
    // console.log('linesGeoData', linesGeoData);


    var width = 1600;
    var height = 1200;

    var projection = d3.geoMercator()
      .center([0.3848, 51.5074])
      .scale(90000)
      .translate([width, height/2]);

    var projection2 = d3.geoMercator()
      .center([0.3848, 51.5074])
      .scale(90000)
      .translate([width, height/2]);

    var path = d3.geoPath()
      .projection(projection);
    
    var path2 = d3.geoPath()
      .projection(projection2);

    // console.log('geoData', geoData);

    // d3.select('#map')
    //   .attr('width', width)
    //   .attr('height', height)
    //   .selectAll('.country')
    //   .data(geoData)
    //   .enter()
    //   .append('path')
    //   .classed('country', true)
    //   .attr('d', path)
    // .on('mousemove', showToolTip)
    // .on('touchStart', showToolTip)
    // .on('mouseout', hideToolTip)
    // .on('touchEnd', hideToolTip);

        d3.select('#map')
      .attr('width', width)
      .attr('height', height)
      .selectAll('.eastLondon')
      .data(eastLondon.features)
      .enter()
      .append('path')
      .classed('eastLondon', true)
      .attr('d', path)
    .on('mousemove', showToolTip)
    .on('touchStart', showToolTip)
    .on('mouseout', hideToolTip)
    .on('touchEnd', hideToolTip);

    d3.select('#map')
      .attr('width', width)
      .attr('height', height)
      .selectAll('.station')
      .data(allStationsGeoData)
      .enter()
      .append('path')
      .classed('station', true)
      .attr('d', path2)
      // .style('fill', 'lavenderblush')
      .attr('r', '50')
      .on('mousemove', showToolTip)
      .on('touchStart', showToolTip)
      .on('mouseout', hideToolTip)
      .on('touchEnd', hideToolTip);

    d3.select('#map')
      .attr('width', width)
      .attr('height', height)
      .selectAll('.tubestation')
      .data(stationsGeoData)
      .enter()
      .append('path')
      .classed('tubestation', true)
      .attr('d', path)
      // .style('fill', 'blue')
      .on('mousemove', showToolTip)
      .on('touchStart', showToolTip)
      .on('mouseout', hideToolTip)
      .on('touchEnd', hideToolTip);

    d3.selectAll('.tubestation')
      .transition()
      .duration(750)
      .ease(d3.easeBackIn)
      .attr('fill', d => {
        var color;
        var lineColors = {
          'Bakerloo': '#B36305', 	
          'Central': '#E32017',	
          'Circle': '#FFD300',
          'District': '#00782A',	
          'Hammersmith & City': '#F3A9BB',	
          'Jubilee': '#A0A5A9',	
          'Metropolitan': '#9B0056',	
          'Northern': '#000000',
          'Piccadilly': '#003688',	
          'Victoria': '#0098D4',	
          'Waterloo & City': '#95CDBA',
          'DLR': '#00A4A7',	
          'London Overground': '#EE7C0E',
          'Tramlink': '#84B817',	
          'Emirates Air Line': '#E21836',	
          'Crossrail': '#7156A5',
          'TfL Rail': '#0019a8',
          'East London': 'orange'
        };
        var tubeLines = d.properties.lines;
        tubeLines.forEach(line => {
        // console.log('line', line.name, lineColors[line.name]);
          return color = lineColors[line.name];
        });
        return color;
      });


    var select = d3.select('#wardDataSelect');

    select
      .on('change', d => setColor(d3.event.target.value));

    setColor(select.property('value'));


    function setColor(val) {
      var colorRanges = {
        population: ['pink', 'mediumseagreen'],
        density: ['pink', 'mediumseagreen'],
        openSpace: ['pink', 'mediumseagreen'],
        trueDensity: ['pink', 'mediumseagreen'],
        jobs: ['pink', 'mediumseagreen'],
        netEmployment: ['pink', 'mediumseagreen'],
        publicTransport: ['pink', 'mediumseagreen'], 
        transportPopulationRating: ['pink', 'mediumseagreen'], 
        transportDensityRating: ['pink', 'mediumseagreen'],
        transportJobs: ['pink', 'mediumseagreen'], 
        transportInvestmentImpact: ['pink', 'mediumseagreen'],
        jobsDensity: ['pink', 'mediumseagreen'],
        hiddenDensity: ['pink', 'mediumseagreen']
      };

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
 


    var select2 = d3.select('#trainDataSelect');

    select2
      .on('change', d => {
        console.log(d3.event.target.value);
        setColor2(d3.event.target.value);
      }
      );

    setColor2(select2.property('value'));


    function setColor2(val) {
      var colorRanges = {
        entriesExits: ['orange', 'purple'],
        interChanges: ['orange', 'purple'],
        allJournies: ['orange', 'purple'],
        rank: ['orange', 'purple']

      };

      var scale = d3.scaleLinear()
        .domain([d3.min(stationUsageData, d => d[val]), d3.max(stationUsageData, d => d[val])])
        .range(colorRanges[val]);
      
      d3.selectAll('.station')
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

// function showToolTip(d) {
//   console.log(d);
//   var properties = d.properties;
//   tooltip
//     .style('opacity', 1)
//     // .style('left', d3.event.x - (tooltip.node().offsetWidth /2) + 'px')
//     // .style('top', d3.event.y + 25 + 'px')

//     .html(`
//         <p>${properties.wardName}</p>
//         <p>Population: ${properties.population}</p>
//         <p>Area: ${properties.area} km2</p>
//         <p>Open Space: ${properties.openSpace}%</p>
//         <p>density: ${properties.density}</p>
//         <p>hiddenDensity: ${properties.hiddenDensity}</p>
//         <p>openSpace: ${properties.openSpace}</p>
//         <p>availableArea: ${properties.availableArea} km2</p>
//         <p>trueDensity: ${properties.trueDensity} per/km2</p>
//         <p>jobs: ${properties.jobs}</p>
//          <p>jobsDensity: ${properties.jobsDensity}</p>
//         <p>Working age: ${properties.workingAge}</p>
//         <p>Net Employment: ${properties.netEmployment}</p>
//         <p>publicTransport: ${properties.publicTransport}</p>
//         <p>transportJobs: ${properties.transportJobs}</p>
//         <p>transportInvestmentImpact: ${properties.transportInvestmentImpact}</p>
//       `);  
// }
  
// function hideToolTip() {
//   tooltip
//     .style('opacity', 0);
// }

function showToolTip(d) {
  console.log(d);
  var properties = d.properties;
  tooltip
    .style('opacity', 1)
    // .style('left', d3.event.x - (tooltip.node().offsetWidth /2) + 'px')
    // .style('top', d3.event.y + 25 + 'px')

    .html(`
    <p>Name: ${properties.name}</p>
    <p>entriesExits: ${properties.entriesExits}</p>
    <p>interChanges: ${properties.interChanges}</p>
    <p>allJournies: ${properties. allJournies}</p>
    <p>rank: ${properties.rank}</p>
    <p>NLC: ${properties.NLC}</p>
    <p>route: ${properties.route}</p>
    <p>srsCode: ${properties.srsCode}</p>
    <p>routeDescription: ${properties.routeDescription}</p>
      `);  
}
  
function hideToolTip() {
  tooltip
    .style('opacity', 0);
}
