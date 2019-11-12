d3.queue()
  .defer(d3.json, './eastLondon.json') 
  .defer(d3.json, './tube_lines_ordered_branches.json') 
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
  .defer(d3.csv, './dlr-usage-2015-2016.csv', function(row){
    var name = row['Station'];
    var stationUsage = row['BoardAlight'];

    return {
      name: name,
      entriesExits: stationUsage,
    };
  })
  .await(function(error, eastLondon, tubeLinesOrderedBranches, mapData, stationsData, allStationsData, wardData, stationUsageData, tubeStationUsageData, dlrStationUsageData){
    if(error) throw error;

    // console.log(mapData);

    var geoData = topojson.feature(mapData, mapData.objects.wards).features;
    var stationsGeoData = topojson.feature(stationsData, stationsData.objects.london_stations).features;
    //  var allStationsGeoData = topojson.feature(stationsData, stationsData.objects.london_stations).features;
    var allStationsGeoData = allStationsData.features;
    var tubeLineRoutes = tubeLinesOrderedBranches.london_underground;

    // console.log('allStationsGeoData',allStationsGeoData);

    // console.log('tubeLineRoutes', tubeLineRoutes);


    var orderedTubeLines = [];

    tubeLineRoutes.forEach(line => {
      // console.log('name', line.line);
      // console.log('branches', line.branches.length);
      var tubeLine = line.branches;
      

      tubeLine.forEach(branch => {
        var numberOfSubbranches = line.branches.length;
        var tubeLineSubBranch = line.branches.indexOf(branch);


        console.log('tubeLineSubBranch', tubeLineSubBranch);
        // console.log('name', branch);
        branch.forEach(station => {
          var matchingStation = allStationsGeoData.filter(d => d.properties.name === station );

          if(matchingStation.length < 1) {
            return console.log('Unmatched station', station);
          } else {

          station = {station};

          station.properties = { ...station, ...matchingStation[0].geometry.coordinates };

          // console.log('...matchingStation[0].geometry.coordinatess', ...matchingStation[0].geometry.coordinates);
          // console.log('station.properties', station.properties);

          var coordinates = matchingStation[0].geometry.coordinates;

          if(orderedTubeLines[`${line.line}-${numberOfSubbranches}-${tubeLineSubBranch}`]){
            // tubeLines[`${lineName}`].push({'geometry': {'coordinates': coordinates, type: 'MultiPolygon'}, type: 'Feature'});
            orderedTubeLines[`${line.line}-${numberOfSubbranches}-${tubeLineSubBranch}`][0]['geometry']['coordinates'][0].push(coordinates);
  
          } else {
            orderedTubeLines[`${line.line}-${numberOfSubbranches}-${tubeLineSubBranch}`] = [];
            // tubeLines[`${lineName}`].push({'geometry': {'coordinates': coordinates, type: 'MultiPolygon'}, type: 'Feature'});
            orderedTubeLines[`${line.line}-${numberOfSubbranches}-${tubeLineSubBranch}`].push({'geometry': {'coordinates': [[coordinates]], type: 'Polygon'}, type: 'Feature', id: `${line.line}-${numberOfSubbranches}-${tubeLineSubBranch}` });
          }


          // console.log('stations', station);
          matchingStation.forEach(station => {
            // console.log('matchingStation', matchingStation);
            // console.log('matchingStation[0].properties', matchingStation[0].properties);
            matchingStation[0].properties = { ...matchingStation[0].properties, stationOrder:{tubeLineSubBranch} };
            // console.log('country after', country);
            // console.log('matchingStation[0].properties', matchingStation[0].properties);

            
          });
        }
        });
      
      });


    });

    console.log('orderedTubeLines', orderedTubeLines );




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

    dlrStationUsageData.forEach(row => {
      console.log('row', row);
      
      var stations = allStationsGeoData.filter(d => {
        // console.log('data d', d);
        return d.properties.name === row.name;
      }
        
      );
      console.log('stations', stations);
      stations.forEach(station => {
        // console.log('station before', station);
        station.properties = row;
        console.log('station after', station);
      });
    });

    // allStationsGeoData.forEach(row => {
      
    //   var stations = stationUsageData.filter(d => 
    //     +d.NLC === row.properties.nlc_id
    //   );

    //   stations.forEach(station => {
    //     console.log('station before', station);
    //     station.properties = row;
    //     console.log('station after', station);
    //   });
    // });

    var tubeLines = [];
    // console.log('stationsGeoData',stationsGeoData);
  
    stationsGeoData.forEach(station => {
      // console.log(station);
      var id = station.properties.id;
      var lines = station.properties.lines;
      var coordinates = station.geometry.coordinates;
      // console.log(lines, id);
      lines.forEach(line => {
        // console.log(line);
        var lineName = line.name; 
        if(tubeLines[`${lineName}`]){
          // tubeLines[`${lineName}`].push({'geometry': {'coordinates': coordinates, type: 'MultiPolygon'}, type: 'Feature'});
          tubeLines[`${lineName}`][0]['geometry']['coordinates'][0].push(coordinates);

        } else {
          tubeLines[`${lineName}`] = [];
          // tubeLines[`${lineName}`].push({'geometry': {'coordinates': coordinates, type: 'MultiPolygon'}, type: 'Feature'});
          tubeLines[`${lineName}`].push({'geometry': {'coordinates': [[coordinates]], type: 'Polygon'}, type: 'Feature', id: lineName });
        }
      });
    });

    // console.log('tubeLines', tubeLines);

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
        trainRoute[`${lines}`].push({'geometry': {'coordinates': [[coordinates]], type: 'Polygon'}, type: 'Feature', id: lines });
      }

      
    });

    // console.log(`trainRoute`, trainRoute);

    // d3.select('#map')
    //   .attr('width', width)
    //   .attr('height', height)
    //   .selectAll('.eastLondon')
    //   .data(trainRoute[`${lines}`])
    //   .enter()
    //   .append('path')
    //   .classed('eastLondon', true)
    //   .attr('d', path)
    //   .on('mousemove', showToolTip)
    //   .on('touchStart', showToolTip)
    //   .on('mouseout', hideToolTip)
    //   .on('touchEnd', hideToolTip);


    // console.log('trainRoute', trainRoute);
    // console.log('tubeLines', tubeLines);

    // console.log( tubeLines);
    // console.log("hi");

    // console.log('length', tubeLines, Object.keys(tubeLines), tubeLines.length);

    // var lineNames = Object.keys(tubeLines);

    // lineNames.forEach(line => {
    //   console.log('current', tubeLines[line]);
    //   var linesGeoData = tubeLines[line];
    //   console.log('linesGeoData', linesGeoData);
    //   return (
    //     d3.select('#map')
    //       .attr('width', width)
    //       .attr('height', height)
    //       .selectAll('.line')
    //       .data(linesGeoData)
    //       .enter()
    //       .append('path')
    //       .classed('line', true)
    //       .attr('d', path)
    //       .style('fill', 'green')
    //       .on('mousemove', showToolTip)
    //       .on('touchStart', showToolTip)
    //       .on('mouseout', hideToolTip)
    //       .on('touchEnd', hideToolTip)

    //   );
    // });
      

    var lineRoutes = Object.keys(trainRoute);
    var tubeRoutes = Object.keys(tubeLines);
    var orderedTubeRoutes = Object.keys(orderedTubeLines); 

    console.log('orderedTubeRoutes', orderedTubeRoutes);

    // console.log('lineRoutes', lineRoutes);

    function makeLine(linesGeoData) {
      console.log('make lines with linesGeoData', linesGeoData);
      var width = 1600;
      var height = 1200;

      var projection = d3.geoMercator()
        .center([0.3848, 51.5074])
        .scale(90000)
        .translate([width, height/2]);

      var path = d3.geoPath()
        .projection(projection);
        
      // debugger;

      // console.log('what are you? linesGeoData[0].id', linesGeoData[0].id)

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
        .on('mousemove', showToolTip)
        .on('touchStart', showToolTip)
        .on('mouseout', hideToolTip)
        .on('touchEnd', hideToolTip)
        .attr('opacity', d => {
          var tubeLines = d.id;
          var noBranches = tubeLines.split('-')[1];
          console.log(noBranches);
          return 1 / (1 + noBranches);

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
          console.log('d.id', tubeLines);
          tubeLines = tubeLines.split('-')[0];
          tubeLines = tubeLines.split('_')[0];
          console.log('Overground? ', tubeLines);
          return lineColors[tubeLines] ? color = lineColors[tubeLines] : color = 'green';
        
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

    // lineRoutes.forEach(line => {
    //   if (line === 'undefined' || trainRoute[line][0].geometry.coordinates[0].length < 2) {
    //     return console.log('unknownline');
    //   } else {
    //     // console.log('current', trainRoute[line]);
    //     var linesGeoData = trainRoute[line];
    //     // console.log('linesGeoData', linesGeoData);

    //     makeLine(linesGeoData);
    //   }
      
    // });

    // tubeRoutes.forEach(line => {
    //   if (line === 'undefined' || tubeLines[line][0].geometry.coordinates[0].length < 2) {
    //     return console.log('unknownline');
    //   } else {
    //     // console.log('current', trainRoute[line]);
    //     var tubeGeoData = tubeLines[line];
    //     console.log('tubeGeoData', tubeGeoData);

    //     makeLine(tubeGeoData);
    //   }
      
    // });
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

    console.log('geoData', geoData);

    d3.select('#map')
      .attr('width', width)
      .attr('height', height)
      .selectAll('.country')
      .data(geoData)
      .enter()
      .append('path')
      .classed('country', true)
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

    // d3.select('#map')
    //   .attr('width', width)
    //   .attr('height', height)
    //   .selectAll('.eastLondon')
    //   .data(eastLondon.features)
    //   .enter()
    //   .append('path')
    //   .classed('eastLondon', true)
    //   .attr('d', path)
    //   .on('mousemove', showToolTip)
    //   .on('touchStart', showToolTip)
    //   .on('mouseout', hideToolTip)
    //   .on('touchEnd', hideToolTip);

    // d3.select('#map')
    //   .attr('width', width)
    //   .attr('height', height)
    //   .selectAll('.eastLondon')
    //   .data(trainRoute)
    //   .enter()
    //   .append('path')
    //   .classed('eastLondon', true)
    //   .attr('d', path)
    //   .on('mousemove', showToolTip)
    //   .on('touchStart', showToolTip)
    //   .on('mouseout', hideToolTip)
    //   .on('touchEnd', hideToolTip);

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

    // d3.selectAll('.line')
    //   .transition()
    //   .duration(750)
    //   .ease(d3.easeBackIn)
    //   .attr('stroke', d => {
    //     var color;
    //     var lineColors = {
    //       'Bakerloo': '#B36305', 	
    //       'Central': '#E32017',	
    //       'Circle': '#FFD300',
    //       'District': '#00782A',	
    //       'Hammersmith & City': '#F3A9BB',	
    //       'Jubilee': '#A0A5A9',	
    //       'Metropolitan': '#9B0056',	
    //       'Northern': '#000000',
    //       'Piccadilly': '#003688',	
    //       'Victoria': '#0098D4',	
    //       'Waterloo & City': '#95CDBA',
    //       'DLR': '#00A4A7',	
    //       'London Overground': '#EE7C0E',
    //       'Tramlink': '#84B817',	
    //       'Emirates Air Line': '#E21836',	
    //       'Crossrail': '#7156A5',
    //       'TfL Rail': '#0019a8',
    //       'East London': 'orange'
    //     };
    //     var tubeLines = d.id;
    //     tubeLines.forEach(line => {
    //     // console.log('line', line.name, lineColors[line.name]);
    //       return color = lineColors[line.name];
    //     });
    //     return color;
    //   });



    // 'Bethnal Green - Stansted Airport': 
    // 'Brighton - Havant': 
    // 'Bromley North Branch': 
    // 'Chingford Branch': 
    // 'Chislehurst - Ashford': 
    // 'Chislehurst - Tonbridge': 
    // 'Dartford Lines to Gravesend and Hayes Branch': 
    // 'East Grinstead Line': 
    // 'East London Line': 
    // 'Euston - Watford Junction (DC Lines)': 
    // 'Fenchurch Street - Shoeburyness': 
    // 'Forest Gate Jcn - Barking': 
    // 'Gospel Oak - Stratford': 
    // 'Gospel Oak - Woodgrange Park': 
    // 'Greenford Lines': 
    // 'Hackney Downs - Cheshunt / Enfield Town': 
    // 'Heathrow Airport Jcn - Reading': 
    // 'Hertford Loop': 
    // 'Inner Windsor Lines': 
    // 'Kings Cross - Peterborough': 
    // 'Liverpool Street - Shenfield': 
    // 'London - Chislehurst': 
    // 'London Bridge - Windmill Bridge Jcn': 
    // 'Main Line Suburban Lines': 
    // 'Marylebone - Aynho Jcn': 
    // 'Metropolitan Line': 
    // 'Moorgate Branch': 
    // 'Paddington - Heathrow Airport Jcn': 
    // 'Plymouth - Penzance': 
    // 'Richmond - Willesden Jcn': 
    // 'South Central Inner Suburban': 
    // 'South Central Sutton Lines': 
    // 'St Pancras - Bedford': 
    // 'Tattenham Corner and Caterham Lines': 
    // 'Thameslink Routes' : 
    // 'Tilbury Loop': 
    // 'Upminster Branch': 
    // 'Victoria - Windmill Bridge Jcn': 
    // 'Victoria Lines': 
    // 'Waterloo - Woking': 
    // 'West London Line': 
    // 'Willesden Jcn - Gospel Oak': 
    // 'Windmill Bridge Jcn - Brighton': 
     

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

//   Bakerloo: (25) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// Central: (49) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// Circle: (36) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// Crossrail: (41) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// DLR: (45) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// District: (60) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// East London: (9) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// Emirates Air Line: (2) [{…}, {…}]
// Hammersmith & City: (29) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// Jubilee: (27) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// London Overground: (112) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, …]
// Metropolitan: (38) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// Northern: (52) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// Piccadilly: (52) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// Piccadily: [{…}]
// TfL Rail: (14) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// Tramlink: (39) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// Victoria: (16) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
// Waterloo & City

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
