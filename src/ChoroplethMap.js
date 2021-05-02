import { select } from 'd3';

export default class ChoroplethMap {
  constructor(data, mapSvg) {
    this.data = data;
    this.mapSvg = mapSvg;

    this.draw();
  }

  draw() {
    // Add the map svg
    select('#map-test').node().append(this.mapSvg.documentElement);
    this.svg = select('#map-test').select('svg');
    this.svg.style('opacity', 0).transition().duration(500).style('opacity', 1);

    // Set map colors
    this.svg
      .select('#regions')
      .selectAll('g')
      .each(function (d, i, nodes) {
        const svgElement = select(this).select('*');
        // Get the numerical id of the geographical region
        const svgElementMapId = select(this).node().id.split('-')[1];
        // TODO Color according to data
        svgElement.style('fill', 'green');
      });
  }

  setTime(date) {
    // TODO
  }
}
