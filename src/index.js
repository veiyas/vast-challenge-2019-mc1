import { csv } from 'd3';
import './style.scss';
import {createHeatmap} from './heatmap.js'
// import { Tooltip, Toast, Popover } from 'bootstrap';
const locationNames = [
  "Palace Hills", "Northwest", "Old Town", "Safe Town", "Southwest", "Downtown", "Wilson Forest",
  "Scenic Vista", "Broadview", "Chapparal", "Terrapin Springs", "Pepper Mill", "Cheddarford",
  "Easton", "Weston", "Southton", "Oak Willow", "East Parton", "West Parton"]

const main = async () => {
  try {
    const data = await csv('data/mc1-reports-data.csv');

    for (let index = 0; index < locationNames.length / 6 /* TO DEBUG FASTER */; index++) {
      createHeatmap(data.filter(d => d['location'] == index + 1), locationNames[index])
    }
  } catch (err) {
    console.error(err);
  }
};

main();
