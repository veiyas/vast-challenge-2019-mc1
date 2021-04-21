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
    const myVars = ["Sewer & Water", "Power", "Roads & Bridges", "Medical", "Buildings", "Shake Intensity"]
    const csvVariableNames = ["sewer_and_water", "power", "roads_and_bridges", "medical", "buildings", "shake_intensity"]

    // Build X scales and axis:
    var x = scaleBand()
    .range([ 0, width ])
    .domain(timePoints);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(axisBottom(x))

    // Build Y scales and axis:
    var y = scaleBand()
    .range([0, height])
    .domain(myVars)
    .padding(0.01);
    svg.append("g")
    .call(axisLeft(y));

    // Build color scale
    var myColor = scaleLinear()
    .range(["white", "#c90000"])
    .domain([1,10])

    // Populate heatmap
    var column = svg.selectAll()
        .data(data)
        .enter()
        .append("g");
        
        for (let index = 0; index < myVars.length; index++) {
            column.append("rect")
            .attr("x", function(d) { return x(new Date(d.time)) })
            .attr("y", function(d) { return y(myVars[index])})
            .attr("width", x.bandwidth() )
            .attr("height", y.bandwidth() )
            .style("fill", function(d) { return myColor(d[csvVariableNames[index]])})
        }

    return "Heatmap created"
}