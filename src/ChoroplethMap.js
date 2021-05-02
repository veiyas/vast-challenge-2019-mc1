import { group, mean, select, timeFormat, timeParse } from 'd3';

export default class ChoroplethMap {
  constructor(data, mapSvg) {
    // this.data = data;
    this.mapSvg = mapSvg;

    this.parseTime = timeParse('%Y-%m-%d %H:%M:%S');

    this.selectedTime = this.parseTime('2020-04-09 17:45:00');
    this.selectedProp = 'shake_intensity';

    this.data = group(
      data,
      (d) => this.parseTime(d.time),
      (d) => d.location
    );

    // console.log(this.data.get(this.selectedTime));

    this.draw();
  }

  draw() {
    // Add the map svg
    select('#map-test').node().append(this.mapSvg.documentElement);
    this.svg = select('#map-test').select('svg');

    // Set map colors
    this.svg
      .select('#regions')
      .selectAll('g')
      .each((d, i, nodes) => {
        const svgElement = select(nodes[i]).select('*');
        // The numerical id of the geographical region
        const regionId = select(nodes[i]).node().id.split('-')[1];

        const dataForTimeAndRegion = this.data
          .get(this.selectedTime)
          .get(regionId);

        // Check if there are no reports in the selected region at the selected time
        if (dataForTimeAndRegion === undefined) {
          svgElement.style('fill', 'gray');
          return;
        }

        const theMean = mean(dataForTimeAndRegion, (d) => d[this.selectedProp]);
        // console.log(theMean);
        svgElement.style('fill', 'red');
        svgElement.style('opacity', theMean / 10); // TODO Real color scale
      });
  }

  setTime(date) {
    // TODO
  }
}
