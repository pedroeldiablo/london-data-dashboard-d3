var orderedTrainLines = [];

trainLineRoutes.forEach(line => {
  var trainLine = line.branches;

  console.log(`trainLine ${line}`, line);


//   trainLine.forEach(branch => {
//     var numberOfSubbranches = line.branches.length;
//     var trainLineSubBranch = line.branches.indexOf(branch);

//     branch.forEach(station => {
//       var matchingStation = allStationsGeoData.filter(d => d.properties.name === station );

//       if(matchingStation.length < 1) {
//         return console.log('Unmatched station', station);
//       } else {

//       station = {station};

//       station.properties = { ...station, ...matchingStation[0].geometry.coordinates };
//       var coordinates = matchingStation[0].geometry.coordinates;

//       if(orderedTrainLines[`${line.terminus}-${numberOfSubbranches}-${trainLineSubBranch}`]){
//         orderedTrainLines[`${line.terminus}-${numberOfSubbranches}-${trainLineSubBranch}`][0]['geometry']['coordinates'][0].push(coordinates);
//       } else {
//         orderedTrainLines[`${line.terminus}-${numberOfSubbranches}-${trainLineSubBranch}`] = [];
//         orderedTrainLines[`${line.terminus}-${numberOfSubbranches}-${trainLineSubBranch}`].push({'geometry': {'coordinates': [[coordinates]], type: 'Polygon'}, type: 'Feature', id: `${line.line}-${numberOfSubbranches}-${trainLineSubBranch}` });
//       }
//       matchingStation.forEach(station => {
//         matchingStation[0].properties = { ...matchingStation[0].properties, stationOrder:{trainLineSubBranch} };
        
//       });
//     }
//     });  
//   });
});
