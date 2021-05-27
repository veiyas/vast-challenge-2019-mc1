import { axisBottom, axisLeft } from 'd3-axis';
import { scaleLinear, scaleOrdinal, scalePoint } from 'd3-scale';
import { select } from 'd3-selection';
import { csv, timeParse, group } from 'd3';
import { myColor } from './globalConfigs';

export default class ScatterPlot {
  constructor(data) {
    const div = document.getElementById('scatter');
    const containerWidth = div.clientWidth;
    const containerHeight = div.clientHeight;
    // set the dimensions and margins of the graph
    this.margin = { top: 10, right: 30, bottom: 30, left: 60 };
    this.width = 600 - this.margin.left - this.margin.right;
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

    this.svg
      .append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(axisBottom(this.x));
    this.svg.append('g').call(axisLeft(this.y));
  }

  drawPoints() {
    this.dots.html('');
    const dataForSelectedTime = this.data.get(this.selectedTime);
    dataForSelectedTime?.forEach((dataForLocation, key) => {
      const occurences = getNumberOfReportsPerValue(dataForLocation, this.selectedProp);
      this.dots
        .selectAll('dot')
        .data(occurences)
        .enter()
        .append('circle')
        .attr('cx', (d) => this.x(d.rating))
        .attr('cy', this.y(dataForLocation[0].location))
        .attr('r', (d) => Math.sqrt(d.occurences * 0.9))
        .style('fill', (d) => myColor(d.rating));
    });
  }

  setTime(date) {
    this.selectedTime = date;
    this.drawPoints();
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
