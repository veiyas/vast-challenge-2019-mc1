const csvVariableNames = new Map([
  ['Sewer & Water', 'sewer_and_water'],
  ['Power', 'power'],
  ['Roads & Bridges', 'roads_and_bridges'],
  ['Medical', 'medical'],
  ['Buildings', 'buildings'],
  ['Shake Intensity', 'shake_intensity'],
]);

const locationNames = [
  'Palace Hills',
  'Northwest',
  'Old Town',
  'Safe Town',
  'Southwest',
  'Downtown',
  'Wilson Forest',
  'Scenic Vista',
  'Broadview',
  'Chapparal',
  'Terrapin Springs',
  'Pepper Mill',
  'Cheddarford',
  'Easton',
  'Weston',
  'Southton',
  'Oak Willow',
  'East Parton',
  'West Parton',
];

function locationIdToName(id) {
  return locationNames[id - 1];
}

export { csvVariableNames, locationNames, locationIdToName };
