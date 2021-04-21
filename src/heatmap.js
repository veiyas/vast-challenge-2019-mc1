import { select, scaleBand, scaleLinear, axisBottom, axisLeft } from 'd3';

export function createHeatmap(data, location) {
    var margin = {top: 30, right: 30, bottom: 30, left: 100},
    width = 1200 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = select("#heatmap")
    .append("p")
    .text(location)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Dates and timepoints
    const end = new Date('2020-04-10T00:00:00')
    for(var timePoints = [], dt = new Date('2020-04-06T00:00:00'); dt <= end; dt.setMinutes(dt.getMinutes() + 5)) {
    timePoints.push(new Date(dt));
    }
    
    // Labels of row and columns
    var myVars = ["Sewer & Water", "Power", "Roads & Bridges", "Medical", "Buildings", "Shake Intensity"]

    // Build X scales and axis:
    var x = scaleBand()
    .range([ 0, width ])
    .domain(timePoints);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(axisBottom(x))

    // Build X scales and axis:
    var y = scaleBand()
    .range([ height, 0 ])
    .domain(myVars)
    .padding(0.01);
    svg.append("g")
    .call(axisLeft(y));

    // Build color scale
    var myColor = scaleLinear()
    .range(["white", "#c90000"])
    .domain([1,10])

    // Populate heatmap
    svg.selectAll()
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(new Date(d['time'])) })
        .attr("y", function(d) { return 0.1 /*y(d['power'])*/ })
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return myColor(d['power'])} )

        return 0
    }