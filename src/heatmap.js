import { select, scaleBand, scaleLinear, axisBottom, axisLeft, timeFormat, axisTop } from 'd3';

const colors = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];

export function createHeatmap(data, location, slot) {
    const locationNameWidth = 115;
    var margin = {top: 0, right: 50, bottom: 0, left: 115},
    width = 1200 - margin.left - margin.right,
    height = 75 - margin.top - margin.bottom;
    
    if (slot === 0) { select("#heatmaps").append("svg").attr("id", "xAxisSVG"); }
    // Create div to contain heatmap with a paragraph before it
    var locationDiv = select("#heatmaps");
    locationDiv
    .append("p")
    .text(location)
    .style("float", "left")
    .style("width", locationNameWidth + "px");

    locationDiv = locationDiv
    .append("div")
    .attr("id", location)
    .style("height", height + margin.top + margin.bottom + "px");

    // Create SVG for axes, canvas for heatmap
    var svg = locationDiv
    .append("svg")
    .attr("id", "heatmapSVG")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var canvas = locationDiv
    .append("canvas")
    .attr("id", "heatmapCanvas")
    .attr("width", width)
    .attr("height", height)
    .style("margin-left", margin.left + "px")
    .style("margin-top", margin.top + "px")

    var context = canvas.node().getContext('2d')

    // Dates and timepoints
    const end = new Date('2020-04-10T00:00:00')
    for (var timePoints = [], dt = new Date('2020-04-06T00:00:00'); dt <= end; dt.setMinutes(dt.getMinutes() + 5)) { timePoints.push(new Date(dt)); }
    
    // Labels of row and columns
    const myVars = ["Sewer & Water", "Power", "Roads & Bridges", "Medical", "Buildings", "Shake Intensity"]
    const csvVariableNames = ["sewer_and_water", "power", "roads_and_bridges", "medical", "buildings", "shake_intensity"]

    // Build X scales and axis:
    var x = scaleBand()
    .range([ 0, width ])
    .domain(timePoints);
    
    if (slot == 0) { // Print x-axis on top
        const horizontalOffset = margin.left + locationNameWidth;
        const xAxisBarHeight = 20;
        select("#xAxisSVG")
        .attr("width", width + margin.left + margin.right + locationNameWidth)
        .attr("height", 20)
        .append("g")
        .attr("transform", "translate(" + horizontalOffset + "," + (xAxisBarHeight-0.5) + ")")
        .call(axisTop(x).
                tickValues(x.domain().filter(function(d) { return d.getMinutes() == 0 && d.getSeconds() == 0 && (d.getHours() % 8 == 0)}))
                .tickFormat(x => timeFormat("%B %d, %H:%M")(x)))
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
    .range(["white", colors[slot % colors.length]])
    .domain([1,10])

    data.forEach(obj => {
        const dataTimePoint = new Date(obj.time)        
        for (let index = 0; index < myVars.length; index++) {
            context.beginPath();
            context.rect(x(dataTimePoint), y(myVars[index]), x.bandwidth(), y.bandwidth());
            context.fillStyle = myColor(obj[csvVariableNames[index]])
            context.fill()
        }
    })

    return "Heatmap created"
}