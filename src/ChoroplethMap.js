import { extent, group, mean, select, timeParse } from 'd3';
import { StopWatch } from './util';
import TimeSelector from './TimeSelector';
import { csvVariableNames, csvVariableNamesToNice, locationIdToName } from './mappings';
import ScatterPlot from './ScatterPlot';
import { myColor } from './globalConfigs';

export default class ChoroplethMap {
  constructor(data, mapSvg) {
    const stopWatch = new StopWatch('Building cloropleth map');

    // this.data = data;
    this.mapSvg = mapSvg;

    this.parseTime = timeParse('%Y-%m-%d %H:%M:%S');

    this.selectedTime = this.parseTime('2020-04-06 00:00:00');
    this.selectedProp = 'shake_intensity';

    this.data = group(
      data,
      (d) => this.parseTime(d.time),
      (d) => d.location
    );

    // Add the map svg
    select('#map-test').node().append(this.mapSvg.documentElement);
    this.svg = select('#map-test')
      .select('svg')
      .attr('class', 'img-fluid mx-auto d-block')
      .style('max-height', '600px');

    // Yes, I misspelled hospital in the svg, but I can't be bothered to fix it
    select('#map-test')
      .select('svg')
      .select('#HostpitalAndPowerPlant')
      .attr('pointer-events', 'none');

    this.tooltipDiv = select('body')
      .append('div')
      .attr('class', 'tooltip-choropleth')
      .style('opacity', 0);

    this.draw();
    stopWatch.stop();

    this.scatterRef = new ScatterPlot(data);

    new TimeSelector(
      extent(data, (d) => this.parseTime(d.time)),
      (newTime) => {
        this.setTime(newTime);
        this.scatterRef.setTime(newTime);
      }
    );
  }

  draw() {
    // Set map colors
    this.svg
      .select('#regions')
      .selectAll('g')
      .each((d, i, nodes) => {
        const svgElement = select(nodes[i]).select('*');
        // The numerical id of the geographical region
        const regionId = select(nodes[i]).node().id.split('-')[1];

        const dataForTimeAndRegion = this.data.get(this.selectedTime)?.get(regionId);

        // Check if there are no reports in the selected region at the selected time
        let theMean = undefined;
        if (dataForTimeAndRegion === undefined) {
          svgElement.style('opacity', 1);
          svgElement.style('fill', '#eeeeee');
        } else {
          theMean = mean(dataForTimeAndRegion, (d) => d[this.selectedProp]);
          svgElement.style('fill', myColor(theMean));
        }

        // TODO Make sure this doesnt add a gazillion eventlisteners
        svgElement
          .on('mouseover', (event) => {
            this.tooltipDiv.transition().duration(50).style('opacity', 1);
            this.tooltipDiv
              .html(
                `
                <div class="card">
                  <div class="card-body">
                    <h6>${locationIdToName(regionId)}</h6>
                    Average rating: ${theMean !== undefined ? theMean.toFixed(1) : 'Unknown'}
                  </div>
                </div>
              `
              )
              .style('left', event.pageX + 10 + 'px')
              .style('top', event.pageY - 15 + 'px');
            this.scatterRef.highlightLocation(+regionId);
          })
          .on('mouseout', () => {
            this.tooltipDiv.transition().duration(50).style('opacity', 0);
            this.scatterRef.highlightLocation(null);
          });
      });
  }

  setTime(date) {
    this.selectedTime = date;
    this.draw();
  }

  setMode(mode) {
    if (mode === 'All' || mode === 'Average')
      console.error('All or Average are not supported by choropleth map atm');
    this.selectedProp = csvVariableNames.get(mode);
    this.draw();
    this.scatterRef.setMode(mode);
  }
}
