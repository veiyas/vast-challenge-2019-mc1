import { csv, select, svg } from 'd3';
import './style.scss';
import { createHeatmap } from './heatmap.js';
// import { Tooltip, Toast, Popover } from 'bootstrap';
import ChoroplethMap from './ChoroplethMap';

const main = async () => {
  const data = await csv('data/mc1-reports-data.csv');
  document.getElementById('full-plot').onclick = function () { constructHeatmaps(data);};
  document.getElementById('avg-plot').onclick = function () { constructHeatmaps(data);};

  constructHeatmaps(data);

  select('#loading-icon').remove();

  const mapSvgFile = await svg('data/map.svg');
  const map = new ChoroplethMap(data, mapSvgFile);
};

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

const constructHeatmaps = async () => {
  if (document.getElementById('avg-plot').checked) {
    select("#header-text").text("Average reported severity from each location, sorted by number of reports")
  } else {
    select("#header-text").text("Full report of severity from each location, sorted by number of reports")
  }
  document.getElementById('loading-text').textContent = 'Loading...';

  // Read all data and sort by number of reports
  const allLocationData = [[{data: [], location: -1}]]
  for (let index = 0; index < locationNames.length; index++) {
    const tmpData = await csv('data/location' + (index + 1) + '.csv');
    allLocationData[index] = {data: tmpData, index: index+1};
  }
  allLocationData.sort((a, b) => a.data.length < b.data.length)

  for (let index = 0; index < locationNames.length; index++) {
    createHeatmap(
      allLocationData[index].data,
      locationNames[allLocationData[index].index - 1],
      allLocationData[index].index, // Location ID
      index,                        // Slot in heatmap matrix
      document.getElementById('avg-plot').checked
    );
  }
  document.getElementById('loading-text').textContent = '';
};

main();
