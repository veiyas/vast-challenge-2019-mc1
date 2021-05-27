import { axisBottom, axisLeft } from 'd3-axis';
import { scaleLinear, scaleOrdinal, scalePoint } from 'd3-scale';
import { select } from 'd3-selection';
import { csv, timeParse, group } from 'd3';
import { myColor } from './globalConfigs';
import { csvVariableNames, locationIdToName } from './mappings';

export default class ScatterPlot {
  constructor(data) {
    const div = document.getElementById('scatter');
    const containerWidth = div.clientWidth;
    const containerHeight = div.clientHeight;
    // set the dimensions and margins of the graph
    this.margin = { top: 10, right: 0, bottom: 40, left: 90 };
    this.width = containerWidth - this.margin.left - this.margin.right;
    this.height = 600 - this.margin.top - this.margin.bottom;

    // append the svg object to the body of the page
    this.svg = select('#scatter')
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    this.dots = this.svg.append('g').attr('class', 'dots');

    this.parseTime = timeParse('%Y-%m-%d %H:%M:%S');
    this.selectedTime = this.parseTime('2020-04-06 00:00:00');
    this.selectedProp = 'shake_intensity';

    this.ungroupedData = data;
    this.data = group(
      data,
      (d) => this.parseTime(d.time),
      (d) => d.location
    );

    this.initializeAxes();
    this.drawPoints();
  }

  initializeAxes() {
    this.x = scaleLinear().domain([-1, 10]).range([0, this.width]);
    this.y = scalePoint()
      .domain(Array.from({ length: 19 }, (x, i) => i + 1))
      .range([this.height, 0])
      .padding(1);

    this.xAxis = this.svg
      .append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(axisBottom(this.x));
    this.svg
      .append('text')
      .attr(
        'transform',
        'translate(' + this.width / 2 + ' ,' + (this.height + this.margin.top + 25) + ')'
      )
      .style('text-anchor', 'middle')
      .style('color', 'black')
      .text('Rating');
    this.yAxis = this.svg
      .append('g')
      .call(axisLeft(this.y).tickFormat((locationId) => locationIdToName(+locationId)));
  }

  drawPoints() {
    this.dots.html('');
    const dataForSelectedTime = this.data.get(this.selectedTime);
    dataForSelectedTime?.forEach((dataForLocation, key) => {
      const currentLocationId = dataForLocation[0].location;
      const occurences = getNumberOfReportsPerValue(dataForLocation, this.selectedProp);
      this.dots
        .append('g')
        .attr('id', `region-${currentLocationId}-group`)
        .attr('class', 'dots-group')
        .selectAll('dot')
        .data(occurences)
        .enter()
        .append('circle')
        .attr('cx', (d) => this.x(d.rating))
        .attr('cy', this.y(currentLocationId))
        .attr('r', (d) => Math.sqrt(d.occurences * 0.9))
        .style('fill', (d) => myColor(d.rating))
        .style('stroke', 'black')
        .style('stroke-width', '0.5px');
    });
  }

  setTime(date) {
    this.selectedTime = date;
    this.drawPoints();
  }

  setMode(mode) {
    if (mode === 'All' || mode === 'Average')
      console.error('All or Average are not supported by Scatter map atm');
    this.selectedProp = csvVariableNames.get(mode);
    this.drawPoints();
  }

  /** Null to reset */
  highlightLocation(locationId) {
    this.yAxis
      .selectAll('.tick')
      .transition()
      .duration(locationId ? 50 : 200)
      .style('opacity', (d) => (!locationId || d === locationId ? 1 : 0.2));
    this.dots
      .selectAll('.dots-group')
      .transition()
      .duration(locationId ? 50 : 200)
      .style('opacity', locationId ? 0.2 : 1);
    this.dots
      .select(`#region-${locationId}-group`)
      .transition()
      .duration(locationId ? 50 : 200)
      .style('opacity', 1);
  }
}

function getNumberOfReportsPerValue(data, selectedProp) {
  const numOcc = new Array(11).fill(0);
  if (!data) return numOcc;

  for (const d of data) {
    numOcc[+d[selectedProp]] += 1;
  }

  return numOcc.map((x, i) => {
    return { occurences: x, rating: i };
  });
}
