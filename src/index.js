import { csv, select, svg } from 'd3';
import './style.scss';
import { createHeatmap } from './heatmap.js';
// import { Tooltip, Toast, Popover } from 'bootstrap';
import ChoroplethMap from './ChoroplethMap';
import { StopWatch } from './util';
import LoadAnimation from './LoadAnimation';
import { locationIdToName } from './mappings';
import ProcessedData from './ProcessedData';

const main = async () => {
  const spinner = new LoadAnimation(document.body);
  const rawData = await csv('data/mc1-reports-data.csv');
  const processedData = new ProcessedData(rawData);

  constructHeatmaps('Average', processedData);

  select('#loading-icon').remove();

  const mapSvgFile = await svg('data/map.svg');
  const map = new ChoroplethMap(processedData, mapSvgFile);

  // Bind event listeners
  const variableSelector = document.getElementById('variable-select');
  variableSelector.value = 'Average';
  variableSelector.onchange = (event) => handleVariableChange(event, map, processedData);
  document.getElementById('show-all').onclick = (event) =>
    handleShowAllToggle(event, map, processedData);

  spinner.finished();
};

const handleVariableChange = async (event, map, processedData) => {
  const spinner = new LoadAnimation(document.getElementById('heatmaps'));
  event.target.disabled = true;
  const mode = event.target.value;

  const isAllChecked = select('#show-all').property('checked');

  await map.setMode(mode);
  await constructHeatmaps(isAllChecked ? 'All' : mode, processedData);

  event.target.disabled = false;
  spinner.finished();
};

const handleShowAllToggle = async (event, map, processedData) => {
  const mode = select('#variable-select').property('value');
  const isAllChecked = select('#show-all').property('checked');
  await constructHeatmaps(isAllChecked ? 'All' : mode, processedData);
};

// Mode is the variable to show or overall things like average
const constructHeatmaps = async (mode, processedData) => {
  const stopWatch = new StopWatch('Drawing heatmaps');

  let index = 0;
  processedData.groupedByLocationAndTime.forEach((locationData, locationId) => {
    const totNumReports = processedData.totalNumberOfReportsPerLocation.get(locationId);
    createHeatmap(
      locationData,
      locationIdToName(locationId),
      locationId,
      index,
      mode,
      totNumReports
    );
    ++index;
  });

  stopWatch.stop();
};

main();
