import { csv, interpolateSinebow, interpolateTurbo, lch, rgb, scaleSequential, schemeCategory10, select, svg } from 'd3';
import './style.scss';
import { createHeatmap } from './heatmap.js';
// import { Tooltip, Toast, Popover } from 'bootstrap';

const main = async () => {
  try {
    const data = await csv('data/mc1-reports-data.csv');
    document.getElementById('full-plot').onclick = function () {
      constructHeatmaps(data);
    };
    document.getElementById('avg-plot').onclick = function () {
      constructHeatmaps(data);
    };

    constructHeatmaps(data);

    select('#loading-icon').remove();

    const mapSvgFile = await svg('data/map.svg');
    select('#map-test').node().append(mapSvgFile.documentElement);
    select('#map-test')
      .select('svg')
      .select('#region-1')
      .select('path')
      .style('fill', 'red');
    select('#map-test')
      .select('svg')
      .select('#region-3')
      .select('path')
      .style('fill', 'green');
  } catch (err) {
    console.error(err);
  }
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

function constructHeatmaps(data) {
  document.getElementById('loading-text').textContent = 'Loading...';

  for (let index = 0; index < locationNames.length; index++) {
    createHeatmap(
      data.filter((d) => d['location'] == index + 1),
      locationNames[index],
      index,
      document.getElementById('avg-plot').checked
    );
  }
  document.getElementById('loading-text').textContent = '';
}

main();
