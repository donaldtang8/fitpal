// leaves room for things like axes and legends
const margin = { top: 40, right: 20, bottom: 50, left: 100 };
const graphWidth = 560 - margin.left - margin.right;
const graphHeight = 400 - margin.top - margin.bottom;

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", graphWidth + margin.left + margin.right)
  .attr("height", graphHeight + margin.top + margin.bottom);

const graph = svg
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// scales
const x = d3.scaleTime().range([0, graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0]);

// axes group
const xAxisGroup = graph
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${graphHeight})`);

const yAxisGroup = graph.append("g").attr("class", "y-axis");

// d3 line path generator
const line = d3
  .line()
  .x(function(d) {
    return x(new Date(d.date));
  })
  .y(function(d) {
    return y(d.distance);
  });

// create line path element
const path = graph.append("path");

// tooltip
const tip = d3
  .tip()
  .attr("class", "tip card")
  .html(d => {
    let date = new Date(d.date).toISOString().split("T")[0];
    let content = `<div class="date">${date}</div>`;
    content += `<div class="distance">${d.distance}m</div>`;
    return content;
  });

graph.call(tip);

const update = data => {
  // filter data based on activity. We want objects that are equal to selected activity
  data = data.filter(item => item.activity === activity);

  // sort data based on date objects
  data.sort((a, b) => new Date(a.date) - new Date(b.date));

  // set scale domains
  // look at all of the data and compare all of the dates
  x.domain(d3.extent(data, d => new Date(d.date)));
  y.domain([0, d3.max(data, d => d.distance)]);

  // update path data - we must pass entire data array when passing data to a path element
  path
    .data([data])
    .attr("fill", "none")
    .attr("stroke", "#00bfa5")
    .attr("stroke-width", 2)
    .attr("d", line);

  // join data to circle elements and create circle for objects
  const circles = graph.selectAll("circle").data(data);

  // remove unwanted points
  circles.exit().remove();

  // update current pointers
  circles.attr("cx", d => x(new Date(d.date))).attr("cy", d => y(d.distance));

  // add new points
  circles
    .enter()
    .append("circle")
    .attr("r", 5)
    .attr("cx", d => x(new Date(d.date)))
    .attr("cy", d => y(d.distance))
    .attr("fill", "#ccc");

  // create listener events
  graph
    .selectAll("circle")
    .on("mouseover", (d, i, n) => {
      tip.show(d, n[i]);
      handleMouseOver(d, i, n);
    })
    .on("mouseleave", (d, i, n) => {
      tip.hide();
      handleMouseLeave(d, i, n);
    });

  // create axes
  // pass in scale to the axes
  const xAxis = d3
    .axisBottom(x)
    .ticks(5)
    .tickFormat(d3.timeFormat("%b %d"));
  const yAxis = d3
    .axisLeft(y)
    .ticks(5)
    .tickFormat(d => d + "m");

  // to place axes in graph, use call method to call axes
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
  xAxisGroup.selectAll("text").attr("fill", "#fff");
  yAxisGroup.selectAll("text").attr("fill", "#fff");

  // rotate axis test
  xAxisGroup
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .attr("text-anchor", "end");
};

// data and firestore
let data = [];

db.collection("activities").onSnapshot(res => {
  // res.docChanges will return an array of all the edits made to the documents in the database
  res.docChanges().forEach(change => {
    const doc = { ...change.doc.data(), id: change.doc.id };
    // change type can be added, removed, or modified
    switch (change.type) {
      case "added":
        data.push(doc);
        break;
      case "modified":
        const index = data.findIndex(item => item.id === doc.id);
        data[index] = doc;
        break;
      case "removed":
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }
  });
  update(data);
});

const handleMouseOver = (d, i, n) => {
  d3.select(n[i])
    .transition()
    .duration(100)
    .attr("r", 10)
    .attr("fill", "#fff");
};

const handleMouseLeave = (d, i, n) => {
  d3.select(n[i])
    .transition()
    .duration(100)
    .attr("r", 5)
    .attr("fill", "#ccc");
};
