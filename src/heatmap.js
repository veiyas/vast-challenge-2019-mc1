import { select, scaleBand, scaleLinear, axisBottom, axisLeft, timeFormat, axisTop, lch, schemeCategory10 } from 'd3';

const colorArray = schemeCategory10.concat(schemeCategory10.map(color => darken(color, 5)));
const tooltipHeight = 110;

export function createHeatmap(data, location, locationID, slot, isAvgPlot) {
    const margin = {top: 0, right: 50, bottom: 0, left: 250},
    width = 1200 - margin.left - margin.right,
    height =  isAvgPlot ? 40 - margin.top - margin.bottom : 75 - margin.top - margin.bottom;
    
    if (slot === 0) { select("#heatmaps").html("").append("svg").attr("id", "xAxisSVG").style("left", margin.left); }
    // Create div to contain heatmap with a paragraph before it
    var tooltipDiv = select("#tooltip-div");
    var locationDiv = select("#heatmaps");
    
    locationDiv = locationDiv
    .append("div")
    .attr("id", location)
    .style("height", height + margin.top + margin.bottom + "px");
    
    var svg = locationDiv
    .append("svg")
    .attr("id", "heatmapSVG")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")");
    
    var canvas = locationDiv
    .append("canvas")
    .attr("id", ("heatmapCanvas" + (locationID+1)))
    .attr("class", "heatmapCanvas")
    .attr("location", (locationID+1))
    .attr("width", width)
    .attr("height", height)
    .style("margin-left", margin.left + "px")
    .style("margin-top", margin.top + "px")
    
    locationDiv
    .append("p")
    .text(location + " (" + data.length + ")")
    .style("width", margin.left + "px");

    if(isAvgPlot) {
        canvas
        .on("mouseover", function(d) {
            const currentCanvas = document.getElementById(d.explicitOriginalTarget.id);
            tooltipDiv
            .transition()
            .duration(100)
            .style("opacity", 1.0)
            .style("left", (currentCanvas.offsetLeft - margin.left) + "px")
            .style("top", (currentCanvas.offsetTop - tooltipHeight) + "px")
            .style("border-color", colorArray[slot]);

            createTooltipHeatmap(data, slot, width, margin)
        }).on("mouseout", function(d) {
            tooltipDiv.transition()
            .duration(100)
            .style("opacity", 0)});
    }
        
    var context = canvas.node().getContext('2d');

    printHeatmap(data, context, svg, slot, isAvgPlot, width, height, margin, false);

    return "Heatmap created"
}

function printHeatmap(data, context, svg, slot, isAvgPlot, width, height, margin, isTooltip) {
    // Dates and timepoints
    const end = new Date('2020-04-10T00:00:00')
    for (var timePoints = [], dt = new Date('2020-04-06T00:00:00'); dt <= end; dt.setMinutes(dt.getMinutes() + 5)) { timePoints.push(new Date(dt)); }
    
    const myVars = isAvgPlot ? ["Severity"] : ["Sewer & Water", "Power", "Roads & Bridges", "Medical", "Buildings", "Shake Intensity"];
    const csvVariableNames = ["sewer_and_water", "power", "roads_and_bridges", "medical", "buildings", "shake_intensity"]

    // Build X scales and axis:
    var x = scaleBand()
    .range([ 0, width ])
    .domain(timePoints);
    if(isTooltip) {
        svg.append("g")
        .attr("transform", "translate(0, -0.5)")
        .call(axisTop(x)
        .tickValues(x.domain().filter(function(d) { return d.getMinutes() == 0 && d.getSeconds() == 0 && (d.getHours() % 8 == 0)}))
        .tickFormat(x => timeFormat("%B %d, %H:%M")(x)));
    }

    // Build Y scales and axis:
    var y = scaleBand()
    .range([0, height])
    .domain(myVars)
    .padding(0.01);
    svg.append("g")
    .call(axisLeft(y));

    // Build color scale
    var myColor = scaleLinear()
    .range(["white", colorArray[slot % colorArray.length]])
    .domain([1,10]);
    if (slot == 0 && !isTooltip) { // Print x-axis on top
        const xAxisBarHeight = 20;
        select("#xAxisSVG")
        .attr("width", width + margin.left*2 + margin.right)
        .attr("height", 20)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + (xAxisBarHeight-0.5) + ")")
        .call(axisTop(x)
        .tickValues(x.domain().filter(function(d) { return d.getMinutes() == 0 && d.getSeconds() == 0 && (d.getHours() % 8 == 0)}))
        .tickFormat(x => timeFormat("%B %d, %H:%M")(x)));
    }

    data.forEach(obj => {
        const dataTimePoint = new Date(obj.time);
        if (isAvgPlot) {
            var avgSeverity = 0;
            for (let index = 0; index < csvVariableNames.length; index++) {
                avgSeverity += obj[csvVariableNames[index]] / csvVariableNames.length;
            }
            context.beginPath();
            context.rect(x(dataTimePoint), y(myVars[0]), x.bandwidth(), y.bandwidth());
            context.fillStyle = myColor(avgSeverity);
            context.fill()
        } else {
            for (let index = 0; index < myVars.length; index++) {
                context.beginPath();
                context.rect(x(dataTimePoint), y(myVars[index]), x.bandwidth(), y.bandwidth());
                context.fillStyle = myColor(obj[csvVariableNames[index]])
                context.fill()
            }
        }
    })

    if (slot == 18 && !isTooltip) { // Print x-axis on bottom
        const xAxisBarHeight = 20;
        select("#heatmaps")
        .append("svg")
        .attr("id", "botttom-bar")
        .attr("width", width + margin.left*2 + margin.right)
        .attr("height", 20)
        .append("g")
        .attr("transform", "translate(" + margin.left + ", -0.5)")
        .call(axisBottom(x)
        .tickValues(x.domain().filter(function(d) { return d.getMinutes() == 0 && d.getSeconds() == 0 && (d.getHours() % 8 == 0)}))
        .tickFormat(x => timeFormat("%B %d, %H:%M")(x)))
    }
}

function createTooltipHeatmap(data, slot, width, margin) {
    const height = 75 - margin.top - margin.bottom;
    
    var svg = select("#tooltip-div")
    .html("")
    .append("svg")
    .attr("id", "heatmapSVG")
    .attr("width", width + margin.left + margin.right)
    .attr("height", tooltipHeight)
    .style("top", "0px")
    .style("left", "0px")
    .append("g")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", "translate(" + (margin.left-1) + ", " + (((tooltipHeight - height)/1.5)-1) + ")");
    
    var canvas = select("#tooltip-div")
    .append("canvas")
    .attr("id", "heatmapCanvas")
    .attr("class", "heatmapCanvas")
    .attr("width", width)
    .attr("height", tooltipHeight)
    .style("left", margin.left + "px")
    .style("top", ((tooltipHeight - height)/1.5) + "px")

    printHeatmap(data, canvas.node().getContext('2d'), svg, slot, false, svg.attr("width"), height, margin, true);
}

function darken(color, k = 1) {
    const {l, c, h} = lch(color);
    return lch(l - 18 * k, c, h);
  }