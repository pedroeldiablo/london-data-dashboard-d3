d3.queue()
  .defer(d3.json, './tube_lines_ordered_branches.json') 
  .defer(d3.json, './uk_topo_ward.json')
  .defer(d3.json, './london_stations_topojson.json')
  .defer(d3.json, './station-centroids.json')
  .defer(d3.csv, './London-Data-Table-1.csv', function(row){
    var area = row['Area - Square Kilometres'];
    var population = parseFloat(row['Population - 2015'].replace(/,/g, ''));
    var openSpace = parseFloat(row['% area that is open space - 2014']);
    var openSpaceEach = ((parseFloat(row['% area that is open space - 2014']) * area * 10000) / population).toFixed(2);
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
      openSpaceEach: openSpaceEach,
      density: density,
      availableArea: (availableArea).toFixed(2),
      trueDensity: trueDensity,
      hiddenDensity: (hiddenDensity).toFixed(0),
      jobs: jobs,
      jobsDensity: (jobsDensity).toFixed(0),
      netEmployment: jobs - workingAgePopulation,
      workingAge: workingAgePopulation,
      publicTransport: publicTransport,
      transportPopulationImpact: publicTransport * population,
      transportDensityRating: (publicTransport * trueDensity).toFixed(0),
      transportJobs: (jobs * publicTransport).toFixed(0),
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
    // var tubeEntriesExits = 0;
    // var dlrEntriesExits = 0;
    
    return {
      name: name,
      railEntriesExits: entriesExits,
      entriesExits: entriesExits,
      // dlrEntriesExits: dlrEntriesExits,
      // tubeUsage: tubeEntriesExits,
      // tubeEntriesExits: 0,
      interChanges: interChanges,
      // allRailJourneys: entriesExits +  interChanges + tubeEntriesExits + dlrEntriesExits,
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
    var tubeEntriesExits =  weekday + saturday + sunday;
    // var entriesExits = 0;
    // var interChanges = 0;
    // var dlrEntriesExits = 0;

    return {
      // interChanges: interChanges,
      // entriesExits: entriesExits,
      // allRailJourneys: entriesExits +  interChanges + tubeEntriesExits + dlrEntriesExits,
      name: name,
      tubeUsage: tubeEntriesExits,
      tubeEntriesExits: tubeEntriesExits,
      NLC: nlc,
      weekday: weekday,
      saturday: saturday,
      sunday: sunday
    };
  })
  .defer(d3.csv, './dlr-usage-2015-2016.csv', function(row){
    var name = row['Station'];
    var stationUsage = row['BoardAlight'];

    return {
      name: name,
      dlr: name,
      dlrEntriesExits: stationUsage,
    };
  })
  .defer(d3.json, './london_rail_lines.json') 
  .await(function(error, tubeLinesOrderedBranches, mapData, stationsData, allStationsData, wardData, stationUsageData, tubeStationUsageData, dlrStationUsageData, railLinesOrderedBranches){
    if(error) throw error;

    // console.log("railLinesOrderedBranches", railLinesOrderedBranches);

    var geoData = topojson.feature(mapData, mapData.objects.wards).features;
    var stationsGeoData = topojson.feature(stationsData, stationsData.objects.london_stations).features;
    //  var allStationsGeoData = topojson.feature(stationsData, stationsData.objects.london_stations).features;
    var allStationsGeoData = allStationsData.features;
    var tubeLineRoutes = tubeLinesOrderedBranches.london_underground;
    var trainLineRoutes = railLinesOrderedBranches.london_rail;

    console.log('allStationsGeoData',allStationsGeoData);

    // console.log('tubeLineRoutes', tubeLineRoutes);

    stationsGeoData.forEach(station => {
      var stations = allStationsGeoData.find(d => {
        return d.properties.id === station.properties.id;
      }
        
      );
      if (stations){
        stations.properties = { ...stations.properties, ...station.properties};
      }else {
        console.log('station that didn\'t match', station);
      }
    })





    var orderedTubeLines = [];

    tubeLineRoutes.forEach(line => {
      var tubeLine = line.branches;
      tubeLine.forEach(branch => {
        var numberOfSubbranches = line.branches.length;
        var tubeLineSubBranch = line.branches.indexOf(branch);

        branch.forEach(station => {
          var matchingStation = allStationsGeoData.filter(d => d.properties.name === station );

          if(matchingStation.length < 1) {
            return console.log('Unmatched station', station);
          } else {

          station = {station};

          station.properties = { ...station, ...matchingStation[0].geometry.coordinates };
          var coordinates = matchingStation[0].geometry.coordinates;

          if(orderedTubeLines[`${line.line}-${numberOfSubbranches}-${tubeLineSubBranch}`]){
            orderedTubeLines[`${line.line}-${numberOfSubbranches}-${tubeLineSubBranch}`][0]['geometry']['coordinates'][0].push(coordinates);
          } else {
            orderedTubeLines[`${line.line}-${numberOfSubbranches}-${tubeLineSubBranch}`] = [];
            orderedTubeLines[`${line.line}-${numberOfSubbranches}-${tubeLineSubBranch}`].push({'geometry': {'coordinates': [[coordinates]], type: 'Polygon'}, type: 'Feature', id: `${line.line}-${numberOfSubbranches}-${tubeLineSubBranch}` });
          }
          matchingStation.forEach(station => {
            matchingStation[0].properties = { ...matchingStation[0].properties, stationOrder:{tubeLineSubBranch} };
            
          });
        }
        });  
      });
    });

  var orderedTrainLines = [];

trainLineRoutes.forEach(line => {

  // console.log(`trainLine ${line.terminus}`, line);

  var trainLine = line.branches;

  // console.log(`trainLine ${trainLine}`);
  trainLine.forEach(branch => {
    var numberOfSubbranches = line.branches.length;
    var trainLineSubBranch = line.branches.indexOf(branch);


    // console.log(`trainLine ${line.terminus}`);
    // console.log(`numberOfSubbranches ${numberOfSubbranches}`);
    // console.log(`trainLineSubBranch ${trainLineSubBranch}`);

    branch.forEach(station => {
      var matchingStation = allStationsGeoData.filter(d => d.properties.name === station );

      if(matchingStation.length < 1) {
        return console.log('Unmatched station', station);
      } else {

      station = {station};

      station.properties = { ...station, ...matchingStation[0].geometry.coordinates };
      var coordinates = matchingStation[0].geometry.coordinates;

      if(orderedTrainLines[`${line.terminus}-${numberOfSubbranches}-${trainLineSubBranch}`]){
        orderedTrainLines[`${line.terminus}-${numberOfSubbranches}-${trainLineSubBranch}`][0]['geometry']['coordinates'][0].push(coordinates);
      } else {
        orderedTrainLines[`${line.terminus}-${numberOfSubbranches}-${trainLineSubBranch}`] = [];
        orderedTrainLines[`${line.terminus}-${numberOfSubbranches}-${trainLineSubBranch}`].push({'geometry': {'coordinates': [[coordinates]], type: 'MultiLineString'}, type: 'Feature', id: `${line.terminus}-${numberOfSubbranches}-${trainLineSubBranch}` });
      }
      matchingStation.forEach(station => {
        matchingStation[0].properties = { ...matchingStation[0].properties, stationOrder:{trainLineSubBranch} };
        
      });
    }
    });  
  });
});


// console.log("orderedTrainLines", orderedTrainLines);













    wardData.forEach(row => {
      var countries = geoData.filter(d => d.id === row.newCode);
      countries.forEach(country => {
        country.properties = row;
      });
    });

    var STPKXS;

    stationUsageData.forEach(row => {
  
      var stations = allStationsGeoData.find(d => {
        return d.properties.name === row.name;
      }
        
      );

      if(stations){
        stations.properties = row;
      } else {
        if(row.name === "St.Pancras" || row.name === "King's Cross" ){
          STPKXS = allStationsGeoData.find(d => {
            return d.properties.name === "King's Cross St. Pancras"; 
          });
  
          for (let key in row) {
            STPKXS.properties[key] = (STPKXS.properties[key] ? +STPKXS.properties[key] : "") + +row[key];
          }
          STPKXS.properties.name = "King's Cross St. Pancras";
        }
      }
    });

    tubeStationUsageData.forEach(row => {
      var stations = allStationsGeoData.find(d => {
        return d.properties.name === row.name;
      }
        
      );
      
      if(stations){
        stations.properties = { ...stations.properties, ...row};

      }else {
        console.log('doesn\'t exist', row);
      }
     
    });

    dlrStationUsageData.forEach(row => {
      
      var stations = allStationsGeoData.find(d => {
        return d.properties.name === row.name;
      }
        
      );
      if(stations){
        
        stations.properties = { ...stations.properties, ...row} ;
      } else{
        console.log('this ain\'t there', row);
      };
    });

    allStationsGeoData.forEach(station => {
      station.properties.allRailJourneys = (station.properties.entriesExits ?  +station.properties.entriesExits : 0 ) 
      +  (station.properties.interChanges ? +station.properties.interChanges : 0) 
      + (station.properties.tubeEntriesExits ? +station.properties.tubeEntriesExits : 0 )
      + (station.properties.dlrEntriesExits ? +station.properties.dlrEntriesExits : 0 );
    });

    let stationOrder = [];

    allStationsGeoData.forEach(station => {
      var passengers = station.properties.allRailJourneys;
      stationOrder.push(passengers);
    
    });

    stationOrder.sort(function(a, b){return b - a});

    // console.log(stationOrder);

    allStationsGeoData.forEach(station => {
      var passengers = station.properties.allRailJourneys;
      station.properties.journeyRank = 1 + stationOrder.indexOf(passengers);
    })

    var meanUsage = (stationOrder.reduce(sumArray)) / stationOrder.length;
    var totalUsage = (stationOrder.reduce(sumArray));
    var medianUsage = stationOrder[(stationOrder.length /2)];

    // console.log(totalUsage);
    // console.log(meanUsage);
    // console.log(medianUsage);

    var rankedStationArray = [];

    stationOrder.forEach(station => {
      var rankedStation = allStationsGeoData.filter(d => d.properties.allRailJourneys === station);
      // console.log(rankedStation);
      rankedStationArray.push(`${rankedStation[0].properties.name} ${station}`);
    });

    // console.log(rankedStationArray);


    var combinedLondon =rankedStationArray.reduce(sumArray);

    function sumArray(total, num) {
      return total + num;
    } 

    // console.log('combinedLondon', combinedLondon);

    var tubeLines = [];

    stationsGeoData.forEach(station => {
      var id = station.properties.id;
      var lines = station.properties.lines;
      var coordinates = station.geometry.coordinates;

      lines.forEach(line => {
        var lineName = line.name; 
        if(tubeLines[`${lineName}`]){
          tubeLines[`${lineName}`][0]['geometry']['coordinates'][0].push(coordinates);

        } else {
          tubeLines[`${lineName}`] = [];
          tubeLines[`${lineName}`].push({'geometry': {'coordinates': [[coordinates]], type: 'circle'}, type: 'Feature', id: lineName });
        }
      });
    });

    // TODO filter routes or descriptions and link visually 

    var trainRoute = [];

    allStationsGeoData.forEach(station => {
      // console.log(station);
      var id = station.properties.ncl;
      var lines = station.properties.routeDescription;
      var coordinates = station.geometry.coordinates;
      // console.log(lines, id);
     
      if(trainRoute[`${lines}`]){
        // trainRoute[`${lines}`].push({'geometry': {'coordinates': coordinates, type: 'MultiPolygon'}, type: 'Feature'});
        trainRoute[`${lines}`][0]['geometry']['coordinates'][0].push(coordinates);


      } else {
        trainRoute[`${lines}`] = [];
        trainRoute[`${lines}`].push({'geometry': {'coordinates': [[coordinates]], type: 'Circle'}, type: 'Feature', id: lines });
      }

      
    });

    var width = 3200;
    var height = 2400;

    var projection = d3.geoMercator()
      .center([0.3848, 51.5074])
      .scale(180000)
      .translate([width, height/2]);

    var projection2 = d3.geoMercator()
      .center([0.3848, 51.5074])
      .scale(180000)
      .translate([width, height/2]);

    var path = d3.geoPath()
      .projection(projection);
    
    var path2 = d3.geoPath()
      .projection(projection2);

    d3.select('#map')
      .attr('width', width)
      .attr('height', height)
      .attr('opacity', 0.8)
      .selectAll('.country')
      .data(geoData)
      .enter()
      .append('path')
      .classed('country', true)
      .attr('d', path)
      .on('mousemove', showToolTip2)
      .on('touchStart', showToolTip2)
      .on('mouseout', hideToolTip2)
      .on('touchEnd', hideToolTip2);

    // var lineRoutes = Object.keys(trainRoute);
    // var tubeRoutes = Object.keys(tubeLines);
    var orderedTubeRoutes = Object.keys(orderedTubeLines); 
    var orderedTrainRoutes = Object.keys(orderedTrainLines); 

    function makeLine(linesGeoData) {
      var width = 3200;
      var height = 2400;

      var projection = d3.geoMercator()
        .center([0.3848, 51.5074])
        .scale(180000)
        .translate([width, height/2]);

      var path = d3.geoPath()
        .projection(projection);
        
      var id = linesGeoData[0].id.replace(/[/ !@#$%^&*()]/g, '');

      // console.log(id);

      // return (
      d3.select('#map')
        .attr('width', width)
        .attr('height', height)
        .selectAll(`.${id}`)
        .data(linesGeoData)
        .enter()
        .append('path')
        .classed('line', true)
        .classed(id, true)
        .attr('d', path)
        // .on('mousemove', showToolTip)
        // .on('touchStart', showToolTip)
        // .on('mouseout', hideToolTip)
        // .on('touchEnd', hideToolTip)
        .attr('opacity', d => {
          var tubeLines = d.id;
          var noBranches = tubeLines.split('-')[1];
          noBranches = parseFloat(noBranches);
          // console.log('noBranches', id, noBranches);
          // console.log('opacity', id, 1 / noBranches );
          return 1 / noBranches;

        })
        .attr('stroke', d => {
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
            'East London': 'orange',
            undefined: 'purple'
          };
          var tubeLines = d.id;
          // console.log('d.id', tubeLines);
          tubeLines = tubeLines.split('-')[0];
          tubeLines = tubeLines.split('_')[0];
          // console.log('Overground? ', tubeLines);
          return lineColors[tubeLines] ? color = lineColors[tubeLines] : color = 'green';
        
        });
    }

    function makeSingleLine(linesGeoData) {
      // console.log("linesGeoData", linesGeoData)
      var width = 3200;
      var height = 2400;

      var projection = d3.geoMercator()
        .center([0.3848, 51.5074])
        .scale(180000)
        .translate([width, height/2]);

      var path = d3.geoPath()
        .projection(projection);
        
      var id = linesGeoData[0].id.replace(/[/ !@#$%^&*()\.\']/g, '');

      // console.log(id);

      // return (
      d3.select('#map')
        .attr('width', width)
        .attr('height', height)
        .selectAll(`.${id}`)
        .data(linesGeoData)
        .enter()
        .append('path')
        .classed('line', true)
        .classed(id, true)
        .attr('d', path)
        // .on('mousemove', showToolTip)
        // .on('touchStart', showToolTip)
        // .on('mouseout', hideToolTip)
        // .on('touchEnd', hideToolTip)
        .attr('opacity', d => {
          var tubeLines = d.id;
          var noBranches = tubeLines.split('-')[1];
          noBranches = parseFloat(noBranches);
          // console.log('noBranches', id, noBranches);
          // console.log('opacity', id, 1 / noBranches );
          return 1 / noBranches;

        })
        .attr("stroke-dasharray", function(d) { return (d + 1) + ",5"; })
        .attr('stroke', d => {
          var color;
          var lineColors = {
            'Paddington': '#B36305', 	
            'Liverpool Street': '#E32017',	
            'Euston': '#FFD300',
            'Paddington': '#00782A',	
            'Hammersmith & City': '#F3A9BB',
            'Cannon Street': '#A0A5A9',		
            'London Bridge': '#A0A5A9',
            'Charing Cross': '#A0A5A9',		
            'Marylebone': '#9B0056',	
            'Moorgate': '#000000',
            'King\'s Cross St. Pancras' :'#003688',
            'Victoria': '#0098D4',	
            'Waterloo': '#95CDBA',
            'Fenchurch Street': '#00A4A7',	
            'London Overground': '#EE7C0E',
            'East Croydon': '#84B817',	
            'Emirates Air Line': '#E21836',	
            'Crossrail': '#7156A5',
            'TfL Rail': '#0019a8',
            'East London': 'orange',
            undefined: 'white'
          };
          var tubeLines = d.id;
          // console.log('d.id', tubeLines);
          tubeLines = tubeLines.split('-')[0];
          tubeLines = tubeLines.split('_')[0];
          // console.log('Overground? ', tubeLines);
          return lineColors[tubeLines] ? color = lineColors[tubeLines] : color = 'white';
        
        });
    }


    orderedTubeRoutes.forEach(line => {
      if (line === 'undefined' || orderedTubeLines[line][0].geometry.coordinates[0].length < 2) {
        return console.log('unknownline');
      } else {
        // console.log('current', trainRoute[line]);
        var linesGeoData = orderedTubeLines[line];
        // console.log('linesGeoData', linesGeoData);

        makeLine(linesGeoData);
      }
      
    });

    orderedTrainRoutes.forEach(line => {
      if (line === 'undefined' || orderedTrainLines[line][0].geometry.coordinates[0].length < 2) {
        return console.log('unknownline');
      } else {
        // console.log('current', orderedTrainLines[line]);
        var linesGeoData = orderedTrainLines[line];
        // console.log('linesGeoData', linesGeoData);

        makeSingleLine(linesGeoData);
      }
      
    });

    d3.select('#map')
    .attr('width', width)
    .attr('height', height)
    .selectAll('.station')
    .data(allStationsGeoData)
    .enter()
    .append('circle')
    .classed('station', true)
    // .attr('cx', path2[0])
    // .attr('cy', path2[1])
    .attr("cx", function (d) { return projection(d.geometry.coordinates)[0]; })
		.attr("cy", function (d) { return projection(d.geometry.coordinates)[1]; })
    // .attr('cx', path2)
    // .attr('cy', path2)
    .attr('whatX', typeof(path2))

    // .attr('whatY', path2.split(',')[1])
    .attr('r', '25')
    // .style('fill', 'lavenderblush')
    .on('mousemove', showToolTip)
    .on('touchStart', showToolTip)
    .on('mouseout', hideToolTip)
    .on('touchEnd', hideToolTip);



    
    // d3.select('#map')
    //   .attr('width', width)
    //   .attr('height', height)
    //   .selectAll('.tubestation')
    //   .data(stationsGeoData)
    //   .enter()
    //   .append('path')
    //   .classed('tubestation', true)
    //   .attr('d', path)
    //   // .style('fill', 'blue')
    //   .on('mousemove', showToolTip)
    //   .on('touchStart', showToolTip)
    //   .on('mouseout', hideToolTip)
    //   .on('touchEnd', hideToolTip);

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


    var selectWard = d3.select('#wardDataSelect');

    selectWard
      .on('change', d => setColor(d3.event.target.value));

    setColor(selectWard.property('value'));


    function setColor(val) {
      var colorRanges = {
        population: ['deeppink', 'white'],
        density: ['pink', 'mediumseagreen'],
        openSpace: ['orange', 'purple'],
        openSpaceEach: ['orange', 'purple'],
        trueDensity: ['pink', 'mediumseagreen'],
        jobs: ['pink', 'mediumseagreen'],
        netEmployment: ['pink', 'mediumseagreen'],
        publicTransport: ['pink', 'mediumseagreen'], 
        transportPopulationImpact: ['pink', 'mediumseagreen'], 
        transportDensityRating: ['pink', 'mediumseagreen'],
        transportJobs: ['pink', 'mediumseagreen'], 
        transportInvestmentImpact: ['pink', 'mediumseagreen'],
        jobsDensity: ['pink', 'mediumseagreen'],
        hiddenDensity: ['pink', 'mediumseagreen']
      };

      // var scale = d3.scaleLinear()
      //   .domain([d3.min(wardData, d => d[val]), d3.max(wardData, d => d[val])])
      //   .range(colorRanges[val]);


      var scale = d3.scaleSequential()
      .domain([d3.min(wardData, d => d[val]), d3.max(wardData, d => d[val])])
      // .interpolator(d3.interpolateGnBu);
      .interpolator(d3.interpolate("#b19cd9", "peachpuff"));
        // .interpolator(d3.interpolateWarm);
      
      d3.selectAll('.country')
        .transition()
        .duration(750)
        .ease(d3.easeBackIn)
        .attr('fill', d => {
          var data = d.properties[val];
          return data ? scale(data) : '#ccc';
        });
    }
 


    var selectRailInformation = d3.select('#trainDataSelect');

    selectRailInformation
      .on('change', d => {
        // console.log("d3.event.target.value", d3.event.target.value);
        setStationMarker(d3.event.target.value);
      });

    setStationMarker(selectRailInformation.property('value'));

    function setStationMarker(val) {
      const colorRanges = {
        entriesExits: ['orange', 'purple'],
        dlrEntriesExits: ['orange', 'purple'],
        tubeEntriesExits: ['orange', 'purple'],
        interChanges: ['orange', 'purple'],
        allRailJourneys: ['orange', 'purple'],
        rank: ['orange', 'purple'],
        journeyRank: ['green', 'orange']
      };

      var scaleColor = d3.scaleSequential()
        .domain([d3.min(allStationsGeoData, d => d.properties[val]), d3.max(allStationsGeoData, d => d.properties[val])])
        .interpolator(d3.interpolateWarm);

      // console.log("This is the updated value", val);

      var scaleRadius = d3.scaleLinear()
        .domain([d3.min(allStationsGeoData, d => d.properties[val]), d3.max(allStationsGeoData, d => d.properties[val])])
        .range([1, 20]);

        // console.log("What is returned from scale", scaleRadius);

        // console.log("This is the minimum", d3.min(allStationsGeoData, d => d.properties[val]));
        // console.log("This is the maximum", d3.max(allStationsGeoData, d => d.properties[val]));
        // console.log("What is returned from CJ 29604407", scaleRadius(29604407));
        
      
      d3.selectAll('.station')
        .transition()
        .duration(750)
        .ease(d3.easeBackIn)
        .attr('fill', d => {
          var data = d.properties[val];
          return data ? scaleColor(data) : '#fff';
        }) 
        .attr('r', d => {
          // console.log("What is returning as d", d);
          var data = d.properties[val];
          if( data === NaN || data === undefined ) {
            data = 0;
          }
          if(val === "rank" || val === "journeyRank" ) {

            //  data = d3.max(allStationsGeoData, d => d.properties[val]) - data;
          //   console.log("What is the data and val", data, val);
          // console.log("What is the scale(data)", scaleRadius(data));
            return data ? scaleRadius(d3.max(allStationsGeoData, d => d.properties[val]) - data) : 0;

          }
          // console.log("What is the data", data);
          // console.log("What is the scale(data)", scaleRadius(data));
          return data ? scaleRadius(data) : 0;
        });  
    }

  });



var tooltip = d3.select('body')
  .append('div')
  .classed('tooltip', true);

function showToolTip2(d) {
  // console.log(d);
  var properties = d.properties;
  tooltip
    .style('opacity', 1)
    // .style('left', d3.event.x - (tooltip.node().offsetWidth /2) + 'px')
    // .style('top', d3.event.y + 25 + 'px')

    .html(`
        <p>${properties.wardName}</p>
        <p>Population: ${properties.population}</p>
        <p>Area: ${properties.area} km2</p>
        <p>Open Space: ${properties.openSpace}%</p>
        <p>Open Space Each: ${properties.openSpaceEach} m2</p>
        <p>density: ${properties.density}</p>
        <p>hiddenDensity: ${properties.hiddenDensity}</p>
        <p>openSpace: ${properties.openSpace}</p>
        <p>availableArea: ${properties.availableArea} km2</p>
        <p>trueDensity: ${properties.trueDensity} per/km2</p>
        <p>jobs: ${properties.jobs}</p>
         <p>jobsDensity: ${properties.jobsDensity}</p>
        <p>Working age: ${properties.workingAge}</p>
        <p>Net Employment: ${properties.netEmployment}</p>
        <p>publicTransport: ${properties.publicTransport}</p>
        <p>transportJobs: ${properties.transportJobs}</p>
        <p>transportInvestmentImpact: ${properties.transportInvestmentImpact}</p>
      `);  
}
  
function hideToolTip2() {
  tooltip
    .style('opacity', 0);
}

function showToolTip(d) {
  // console.log(d);
  var properties = d.properties;
  tooltip
    .style('opacity', 1)
    // .style('left', d3.event.x - (tooltip.node().offsetWidth /2) + 'px')
    // .style('top', d3.event.y + 25 + 'px')

    .html(`
    <p>Name: ${properties.name}</p>
    <p>All Rail Journeys: ${((+properties.railEntriesExits ? +properties.railEntriesExits: 0) + (properties.tubeEntriesExits ? +properties.tubeEntriesExits : 0) + (properties.dlrEntriesExits ? +properties.dlrEntriesExits : 0 ) + (properties.interChanges ? +properties.interChanges : 0)).toLocaleString()}</p>
    <p>Heavy Rail: ${(properties.railEntriesExits ? +properties.railEntriesExits : 0).toLocaleString()}</p>
    <P>All As One: ${(properties.allRailJourneys).toLocaleString()}</p>
    <p>Underground:  ${(properties.tubeEntriesExits ? +properties.tubeEntriesExits : 0).toLocaleString()}</p>
    <p>DLR: ${(properties.dlrEntriesExits ? +properties.dlrEntriesExits : 0).toLocaleString()} </p>
    <p>InterChanges: ${(properties.interChanges ? +properties.interChanges : 0).toLocaleString()}</p>
    <p>All Journeys Rank: ${properties.journeyRank}</p>
    <p>Rank (1718 Entries & Exits - GB rank): ${properties.rank}</p>
    <p>NLC: ${properties.NLC}</p>
    <p>Route: ${properties.route}</p>
    <p>srsCode: ${properties.srsCode}</p>
    <p>Route Description: ${properties.routeDescription}</p>
      `);  
}
  
function hideToolTip() {
  tooltip
    .style('opacity', 0);
}
