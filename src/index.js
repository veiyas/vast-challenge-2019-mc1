import { csv, select, svg } from 'd3';
import './style.scss';
import { createHeatmap } from './heatmap.js';
// import { Tooltip, Toast, Popover } from 'bootstrap';

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

const main = async () => {
  try {
    const data = await csv('data/mc1-reports-data.csv');

    for (let index = 0; index < locationNames.length; index++) {
      createHeatmap(
        data.filter((d) => d['location'] == index + 1),
        locationNames[index]
      );
    }

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

main();
