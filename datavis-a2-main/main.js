// Waiting until document has loaded
window.onload = () => {

  console.log("JS loaded.");

  // 1. Basic layout
  const margin = { top: 40, right: 40, bottom: 60, left: 80 };
  const width = 900 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;
  const legendSpace = 180;

  // Create SVG inside #chart
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right + legendSpace)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Tooltip div (absolute positioned)
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

  // 2. Load the data set from the assets folder:
  d3.csv("cars.csv").then(data => {
    console.log("CSV loaded:", data);

    // ⭐ Debug: show column names exactly as D3 sees them
    console.log("Keys in first row:", Object.keys(data[0]));

    // Clean and convert numeric fields
    data.forEach(d => {
      d.retailPrice = +d["Retail Price"];
      d.hp          = +d["Horsepower(HP)"];
      d.weight      = +d["Weight"];
      d.type        = d["Type"];
      d.name        = d["Name"];
    });

    // Filter out rows with missing important values
    data = data.filter(d =>
      !isNaN(d.retailPrice) &&
      !isNaN(d.hp) &&
      !isNaN(d.weight) &&
      d.type
    );

    // console.log("After filtering:", data.length, "rows");
    // console.log("Sample:", data[0]);
    // console.log("Any NaN retailPrice?", data.some(d => isNaN(d.retailPrice)));
    // console.log("Any NaN hp?", data.some(d => isNaN(d.hp)));
    // console.log("Any NaN weight?", data.some(d => isNaN(d.weight)));

    // 3. Create scales
    // X: Horsepower
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.hp))
      .nice()
      .range([0, width]);
    
    // Y: Retail Price
    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.retailPrice))
      .nice()
      .range([height, 0]);

    // Color: Type
    const types = Array.from(new Set(data.map(d => d.type)));
    const color = d3.scaleOrdinal()
      .domain(types)
      .range(d3.schemeCategory10);

    // Size: Weight (sqrt scale so area ~ value)
    const weightExtent = d3.extent(data, d => d.weight);
    const r = d3.scaleSqrt()
      .domain(weightExtent)
      .range([4, 15]);

    // 4. Axes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y).ticks(8);

    // X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .text("Horsepower (HP)");

    // Y axis
    svg.append("g")
      .call(yAxis);

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -55)
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .text("Retail Price (USD)");

    // 5. Bubbles
    const circles = svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.hp))
      .attr("cy", d => y(d.retailPrice))
      .attr("r", d => r(d.weight))
      .attr("fill", d => color(d.type))
      .attr("fill-opacity", 0.7)
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5);

    // 6. Tooltip
    circles
    .on("mouseover", d => {
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>${d.name}</strong><br>
          Type: ${d.type}<br>
          HP: ${d.hp}<br>
          Price: $${d3.format(",")(d.retailPrice)}<br>
          Weight: ${d.weight} lbs`
        );
    })
    .on("mousemove", () => {
      tooltip
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top",  (d3.event.pageY + 10) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

    // 7. Color legend (Type)
    const legendColor = svg.append("g")
      .attr("transform", `translate(${width + 40}, 0)`);

    legendColor.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-weight", "bold")
      .text("Car Type");

    types.forEach((t, i) => {
      const g = legendColor.append("g")
        .attr("transform", `translate(0, ${(i + 1) * 20})`);

      g.append("rect")
        .attr("x", 0)
        .attr("y", -10)
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", color(t));

      g.append("text")
        .attr("x", 20)
        .attr("y", 0)
        .attr("dominant-baseline", "middle")
        .text(t);
    });

    // 8. Size legend (Weight)
    const legendSize = svg.append("g")
      .attr("transform", `translate(${width + 40}, ${types.length * 20 + 40})`);

    legendSize.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-weight", "bold")
      .text("Weight (lbs)");

    const weightSamples = [
      weightExtent[0],
      (weightExtent[0] + weightExtent[1]) / 2,
      weightExtent[1]
    ];

    weightSamples.forEach((w, i) => {
      const yOffset = 20 + i * 28;
      const radius = r(w);

      legendSize.append("circle")
        .attr("cx", radius)
        .attr("cy", yOffset)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("stroke", "#333");

      legendSize.append("text")
        .attr("x", radius * 2 + 8)
        .attr("y", yOffset)
        .attr("dominant-baseline", "middle")
        .text(Math.round(w) + " lbs");
    });
  })

};
