import { csv, select, svg } from 'd3';
import './style.scss';
import { createHeatmap } from './heatmap.js';
// import { Tooltip, Toast, Popover } from 'bootstrap';
import ChoroplethMap from './ChoroplethMap';
import { StopWatch } from './util';
import LoadAnimation from './LoadAnimation';

const main = async () => {
  const data = await csv('data/mc1-reports-data.csv');
  const variableSelector = document.getElementById('variable-select');
  variableSelector.value = 'Average';
  variableSelector.onchange = handleVariableChange;

  constructHeatmaps('Average');

  select('#loading-icon').remove();

  // const mapSvgFile = await svg('data/map.svg');
  // const map = new ChoroplethMap(data, mapSvgFile);
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

const handleVariableChange = async (event) => {
  const spinner = new LoadAnimation(document.getElementById('heatmaps'));
  event.target.disabled = true;
  const mode = event.target.value;
  await constructHeatmaps(mode);
  event.target.disabled = false;
  spinner.finished();
};

// Mode is the variable to show or overall things like average
const constructHeatmaps = async (mode) => {
  // if (document.getElementById('avg-plot').checked) {
  //   select('#header-text').text(
  //     'Average reported severity from each location, sorted by number of reports'
  //   );
  // } else {
  //   select('#header-text').text(
  //     'Full report of severity from each location, sorted by number of reports'
  //   );
  // }

  let stopWatch = new StopWatch('Loading heatmap csvs');
  // Read all data and sort by number of reports
  const allLocationData = [];
  for (let index = 0; index < locationNames.length; index++) {
    const tmpData = await csv('data/location' + (index + 1) + '.csv');
    allLocationData[index] = { data: tmpData, index: index + 1 };
  }
  allLocationData.sort((a, b) => b.data.length - a.data.length);
  console.dir(allLocationData);
  stopWatch.stop();

  stopWatch = new StopWatch('Drawing heatmaps');
  for (let index = 0; index < locationNames.length; index++) {
    createHeatmap(
      allLocationData[index].data,
      locationNames[allLocationData[index].index - 1],
      allLocationData[index].index, // Location ID
      index, // Row in heatmap matrix
      mode
    );
  }
  stopWatch.stop();
};

main();
