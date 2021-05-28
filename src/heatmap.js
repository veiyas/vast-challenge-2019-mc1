import { select, scaleBand, axisBottom, axisLeft, timeFormat, axisTop, lch, mean } from 'd3';
import { csvVariableNames } from './mappings';
import { myColor } from './globalConfigs';

const tooltipHeight = 110;

export function createHeatmap(data, location, locationID, slot, mode, totNumReports) {
  const isAvgPlot = mode === 'Average';
  const div = document.getElementById('heatmaps');
  const containerWidth = div.clientWidth;
  const margin = { top: 0, right: 0, bottom: 0, left: 250 },
    width = containerWidth - margin.left - margin.right,
    height = mode !== 'All' ? 40 - margin.top - margin.bottom : 75 - margin.top - margin.bottom;

  if (slot === 0) {
    select('#heatmaps').html('').append('svg').attr('id', 'xAxisSVG').style('left', margin.left);
  }
  // Create div to contain heatmap with a paragraph before it
  var tooltipDiv = select('#tooltip-div');
  var locationDiv = select('#heatmaps');

  locationDiv = locationDiv
    .append('div')
    .attr('id', location)
    .style('height', height + margin.top + margin.bottom + 'px');

  var svg = locationDiv
    .append('svg')
    .attr('id', 'heatmapSVG')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var canvas = locationDiv
    .append('canvas')
    .attr('id', 'heatmapCanvas' + (locationID + 1))
    .attr('class', 'heatmapCanvas')
    .attr('location', locationID + 1)
    .attr('width', width)
    .attr('height', height)
    .style('margin-left', margin.left + 'px')
    .style('margin-top', margin.top + 'px');

  locationDiv
    .append('p')
    .text(location + ' (' + totNumReports + ')')
    .style('width', margin.left + 'px');

  if (mode !== 'All') {
    canvas
      .on('mouseover', function (event) {
        const currentCanvas = event.target;
        tooltipDiv
          .style('width', containerWidth + 'px')
          .transition()
          .duration(100)
          .style('opacity', 1.0)
          .style('top', currentCanvas.offsetTop + 'px')
          .style('border-color', 'black');

        createTooltipHeatmap(data, slot, width, margin);
      })
      .on('mouseout', function () {
        tooltipDiv.transition().duration(100).style('opacity', 0);
      });
  }

  var context = canvas.node().getContext('2d');

  printHeatmap(data, context, svg, slot, mode, width, height, margin, false);

  return 'Heatmap created';
}

function printHeatmap(data, context, svg, slot, mode, width, height, margin, isTooltip) {
  const isAvgPlot = mode === 'Average';
  // Dates and timepoints
  const end = new Date('2020-04-11T00:00:00');
  const timePoints = [];
  for (let dt = new Date('2020-04-06T00:00:00'); dt <= end; dt.setMinutes(dt.getMinutes() + 5)) {
    timePoints.push(new Date(dt));
  }

  const myVars = isAvgPlot
    ? ['Severity']
    : mode === 'All'
    ? ['Sewer & Water', 'Power', 'Roads & Bridges', 'Medical', 'Buildings', 'Shake Intensity']
    : [mode];

  // Build X scales and axis:
  var x = scaleBand().range([0, width]).domain(timePoints);
  if (isTooltip) {
    svg
      .append('g')
      .attr('transform', 'translate(0, -0.5)') // why?
      .call(
        axisTop(x)
          .tickValues(
            x.domain().filter(function (d) {
              return d.getMinutes() == 0 && d.getSeconds() == 0 && d.getHours() % 8 == 0;
            })
          )
          .tickFormat((x) => timeFormat('%B %d, %H:%M')(x))
      );
  }

  // Build Y scales and axis:
  var y = scaleBand().range([0, height]).domain(myVars).padding(0.01);
  svg.append('g').call(axisLeft(y));

  if (slot == 0 && !isTooltip) {
    // Print x-axis on top
    const xAxisBarHeight = 20;
    select('#xAxisSVG')
      .attr('width', width + margin.left + margin.right)
      .attr('height', 20)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + (xAxisBarHeight - 0.5) + ')')
      .call(
        axisTop(x)
          .tickValues(
            x.domain().filter(function (d) {
              return d.getMinutes() == 0 && d.getSeconds() == 0 && d.getHours() % 8 == 0;
            })
          )
          .tickFormat((x) => timeFormat('%B %d, %H:%M')(x))
      );
  }

  data.forEach((dataPointsAtTime, time) => {
    if (isAvgPlot) {
      const means = [];
      for (const [iLikeCookies, csvName] of csvVariableNames) {
        const theMean = mean(dataPointsAtTime, (d) => d[csvName]);
        if (theMean !== undefined) {
          means.push(theMean);
        }
      }
      const avgSeverity = mean(means);
      if (avgSeverity !== undefined) {
        context.beginPath();
        context.rect(x(time), y(myVars[0]), x.bandwidth(), y.bandwidth());
        context.fillStyle = myColor(avgSeverity);
        context.fill();
      }
    } else {
      for (let index = 0; index < myVars.length; index++) {
        const theMean = mean(dataPointsAtTime, (d) => d[csvVariableNames.get(myVars[index])]);
        if (theMean !== undefined) {
          context.beginPath();
          context.rect(x(time), y(myVars[index]), x.bandwidth(), y.bandwidth());
          context.fillStyle = myColor(theMean);
          context.fill();
        }
      }
    }
  });

  if (slot == 18 && !isTooltip) {
    // Print x-axis on bottom
    const xAxisBarHeight = 20;
    select('#heatmaps')
      .append('svg')
      .attr('id', 'botttom-bar')
      .attr('width', width + margin.left + margin.right)
      .attr('height', 20)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ', -0.5)')
      .call(
        axisBottom(x)
          .tickValues(
            x.domain().filter(function (d) {
              return d.getMinutes() == 0 && d.getSeconds() == 0 && d.getHours() % 8 == 0;
            })
          )
          .tickFormat((x) => timeFormat('%B %d, %H:%M')(x))
      );
  }
}

function createTooltipHeatmap(data, slot, width, margin) {
  const height = 75 - margin.top - margin.bottom;

  var svg = select('#tooltip-div')
    .html('')
    .append('svg')
    .attr('id', 'heatmapSVG')
    .attr('width', width + margin.left + margin.right)
    .attr('height', tooltipHeight)
    .style('top', '0px')
    .style('left', '0px')
    .append('g')
    .attr('width', width)
    .attr('height', height)
    .attr(
      'transform',
      'translate(' + (margin.left - 1) + ', ' + ((tooltipHeight - height) / 1.5 - 1) + ')'
    );

  var canvas = select('#tooltip-div')
    .append('canvas')
    .attr('id', 'heatmapCanvas')
    .attr('class', 'heatmapCanvas')
    .attr('width', width)
    .attr('height', tooltipHeight)
    .style('left', margin.left + 'px')
    .style('top', (tooltipHeight - height) / 1.5 + 'px');

  printHeatmap(
    data,
    canvas.node().getContext('2d'),
    svg,
    slot,
    'All',
    svg.attr('width'),
    height,
    margin,
    true
  );
}

function darken(color, k = 1) {
  const { l, c, h } = lch(color);
  return lch(l - 18 * k, c, h);
}
