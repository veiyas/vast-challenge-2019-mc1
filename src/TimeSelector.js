import { scaleTime } from 'd3-scale';
import { select, selectAll, timeParse, timeFormat, axisBottom, brushX, drag } from 'd3';
import { clamp } from './util';

export default class TimeSelector {
  constructor(extent, onChangeCallback) {
    this.onChangeCallback = onChangeCallback;
    this.extent = extent;
    this.div = document.getElementById('time-selector');
    const containerWidth = this.div.clientWidth;
    // const containerHeight = this.div.clientHeight;
    this.margin = { top: 30, right: 0, bottom: 30, left: 250 };
    this.width = containerWidth - this.margin.left - this.margin.right;
    this.height = 100 - this.margin.top - this.margin.bottom;

    this.svg = select('#time-selector')
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.g = this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    this.scale = scaleTime().domain(extent).range([0, this.width]);
    this.axis = axisBottom().scale(this.scale);
    this.g
      .append('g')
      .attr('class', 'selector-axis')
      .attr('transform', `translate(0, ${this.height})`)
      .call(this.axis);

    this.selectedTime = extent[0]; // TODO Fix

    this.intializeSelector();
  }

  intializeSelector() {
    this.selector = this.g.append('g');

    this.selector
      .append('line')
      .attr('x1', 0)
      .attr('y1', 15)
      .attr('x2', 0)
      .attr('y2', this.height)
      .style('stroke', 'black')
      .style('opacity', 0.5);

    this.handle = this.selector
      .insert('circle')
      .attr('cx', 0)
      .attr('cy', this.height / 2)
      .attr('r', 8);

    this.selectorText = this.svg
      .append('text')
      .attr('text-anchor', 'left')
      .attr('transform', `translate(0, 70)`)
      .text(timeFormat('%a %B %d, %H:%M')(this.selectedTime));

    this.selector.call(
      drag().on('drag', (event, d) => {
        const temp = this.scale.invert(clamp(event.x, 0, this.width));
        this.selectedTime = this.restrictToDiscreteTimePoints(temp);
        this.selectorText.text(timeFormat('%a %B %d, %H:%M')(this.selectedTime));
        this.selector.attr('transform', `translate(${clamp(event.x, 0, this.width)}, 0)`);
        this.onChangeCallback(this.selectedTime);
      })
    );
  }

  restrictToDiscreteTimePoints(time) {
    const coeff = 1000 * 60 * 5;
    return new Date(Math.round(time.getTime() / coeff) * coeff);
  }
}
