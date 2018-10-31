import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import differenceBy from 'lodash/differenceBy';

import injectData from '../injectData';
import exportableToPng from '../exportableToPng';
import * as d3 from 'd3';

const styles = {
    tooltip: {
        marginTop: 900,
    },
    vertical: {
        marginTop: 60,
        height: 190,
        pointerEvents: 'none',
    },
    legend: {
        position: 'relative',
    },
    legendItem: {
        marginTop: 2,
    },
    legentItemText: {
        marginLeft: 5,
    },
    legendButton: {
        height:15,
        width: 15,
    },
};

let xAxisScale;
let yAxisScale;
let xAxis;
let yAxisL;
let yAxisR;
let gx;
let gyr;
let gyl;
let streams;

// ===========================================================================================
// getCssToString get the css js object and return it as string
// ===========================================================================================

function getCssToString(cssToChange) {
    const cssString = Object.keys(styles.legend).map(key => {
        return `${key}: ${styles.legend[key]};`
    }).join(" ");
    return (cssString);
}

// ===========================================================================================
// zoomFunction will update the zoom on the graph
// ===========================================================================================

function zoomFunction() {
    // create new scale ojects based on event
    let new_xScale = d3.event.transform.rescaleX(xAxisScale);
    let new_yScale = d3.event.transform.rescaleY(yAxisScale);

    // update axes
    gx.call(xAxis.scale(new_xScale));
    gyr.call(yAxisR.scale(new_yScale));
    gyl.call(yAxisL.scale(new_yScale));

    // update streams
    streams.attr("transform", d3.event.transform);
};

// ===========================================================================================
// stackMax and stackMin functions returns the max and the min value of a @layer
// ===========================================================================================

function stackMax(layer) {
    return d3.max(layer, function (d) { console.log("Max..."); console.log(d); return d[1]; });
}

function stackMin(layer) {
    return d3.min(layer, function (d) { return d[1]; });
}

// ===========================================================================================
// Test data generator
// Inspired by Lee Byron’s test data generator.
// ===========================================================================================

function bumps(n, m) {
    let a = [], i;
    for (i = 0; i < n; ++i) a[i] = 0;
    for (i = 0; i < m; ++i) bump(a, n);
    return a;
}

function bump(a, n) {
    let x = 1 / (0.1 + Math.random()),
        y = 2 * Math.random() - 0.5,
        z = 10 / (0.1 + Math.random());
    for (let i = 0; i < n; i++) {
        let w = (i / n - y) * z;
        a[i] += x * Math.exp(-w * w);
    }
}

// ===========================================================================================
// distinctColors : return a list of @count different and distinct colors in hsl hexa
// ===========================================================================================

function distinctColors(count) {
    let colors = [];
    for (let hue = 0; hue < 360; hue += 360 / count) {
        colors.push(hslToHex(hue, 90, 50));
    }
    return colors;
}

// ===========================================================================================
// hslToHex : Convert hsl values color to hex color
// ===========================================================================================

function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ===========================================================================================
// transformDataIntoMap : convert all the data into a map
// ===========================================================================================

function transformDataIntoMap(formatData) {
    let dateMin = -42;
    let dateMax = -42;
    let valuesObjectsArray = [];

    if (formatData) {
        for (let i = 0; i < formatData.length; i++) {
            let elem = formatData[i];
            if (elem) {
                // source: "2010"
                // target: "Pétrogenèse de roches basaltiques"
                // weight: 0.9013102637325718


                if (elem.source && elem.weight) {

                    let currentItem = undefined;

                    for (let tmpElem of valuesObjectsArray) {
                        if (tmpElem.name === elem.target) {
                            currentItem = tmpElem;
                        }
                    }

                    if (currentItem === undefined) {
                        currentItem = {
                            name: elem.target, 
                            values: []
                        }
                        valuesObjectsArray.push(currentItem);
                    }

                    currentItem.values.push({
                        date: new Date(elem.source),
                        value: elem.weight
                    });

                    // save min date and maxDate
                    if (parseInt(elem.source) < dateMin || dateMin === -42) {
                        dateMin = parseInt(elem.source);
                    }
                    if (parseInt(elem.source) > dateMax || dateMax === -42) {
                        dateMax = parseInt(elem.source);
                    }
                }
            }
        }
    }

    let namesList = [];
    for (let element of valuesObjectsArray) {
        namesList.push(element.name)
    }

    let currentDate = dateMin;
    let valuesArray = [];

    while (currentDate <= dateMax) {
        let tmpName = [];
        let newElem = {
            date: new Date(String(currentDate))
        };

        for (let element of valuesObjectsArray) {
            // loop which add each values for the good year
            for (let dateValue of element.values) {
                if (dateValue.date.getFullYear() == currentDate) {
                    newElem[element.name] = dateValue.value;
                    tmpName.push(element.name);
                }
            }

            // loop which add 0 value to the missing keys
            let resMissingNameList = differenceBy(namesList, tmpName);
            for (let elemToAdd of resMissingNameList){
                newElem[elemToAdd] = 0;
            }
        }

        valuesArray.push(newElem);
        currentDate ++;
    }

    return ([valuesObjectsArray, valuesArray, dateMin, dateMax, namesList]);
}

class Streamgraph extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            width: 800,
            height: 300
        }
    }

    setGraph() {
        let [valuesObjectsArray, valuesArray, minDate, maxDate, nameList] = transformDataIntoMap(this.props.formatData);
        let { width, height } = this.state;
        const svgWidth = width;
        const svgHeight = height;

        const divContainer = d3.select(this.refs.divContainer)
        const svgViewport = d3.select(this.refs.anchor);

        // ===========================================================================================
        // Set all the variables (to move in states)
        // ===========================================================================================

        let layersNumber = valuesObjectsArray.length;  // number of layers

        // stack the datas
        let stackMethod = d3.stack()
            .keys(nameList)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetWiggle);

        let stackedData
        if (valuesArray.length > 0) {
            stackedData = stackMethod(valuesArray);
        }

        const margin = { top: 60, right: 40, bottom: 50, left: 60 };
        width = svgWidth - margin.left - margin.right;
        height = svgHeight - margin.top - margin.bottom;

        let colorNameList = []; // e.g.: [Thematique,#FFFFFF]

        // ===========================================================================================
        // Set the bases of the elements
        // ===========================================================================================

        // Zoom Function
        const zoom = d3.zoom()
            .scaleExtent([1, 32])
            .on("zoom", zoomFunction);

        svgViewport.append("defs")
            .append("clipPath")
            .attr("id", "mask")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        // Inner Drawing Space
        const innerSpace = svgViewport.append("g")
            .attr("class", "inner_space")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // graphZone where the area will be append
        const graphZone = innerSpace.append("g")
            .attr("width", width)
            .attr("height", height)
            .attr("clip-path", "url(#mask)")
            .call(zoom);

        // set a background with rect to catch the zoom 
        graphZone.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("opacity", 0);

        // ===========================================================================================
        // Create and set axis
        // ===========================================================================================

        // create scale objects
        minDate = new Date(String(minDate));
        maxDate = new Date(String(maxDate));
        xAxisScale = d3.scaleTime() // test
            .domain([minDate, maxDate]) // 2000, 2013
            .range([0, width]);
        
        xAxis = d3.axisBottom(xAxisScale)
        .tickFormat(d3.timeFormat("%Y"))
        .ticks(d3.timeYear, 1);
        //.ticks(1);        
        //xAxisScale = d3.scaleLinear() // origin
        //    .domain([0, maxElementsNumber - 1])
        //    .range([0, width]);
        //console.log("xAxis");
        //console.log(xAxis);        //xAxisScale = d3.scaleLinear() // origin
        //    .domain([0, maxElementsNumber - 1])
        //    .range([0, width]);

        gx = innerSpace.append("g")
            .attr("class", "x axis")        //xAxisScale = d3.scaleLinear() // origin
            //    .domain([0, maxElementsNumber - 1])
            //    .range([0, width]);
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        yAxisScale = d3.scaleLinear()
            //.domain([d3.min(layersValues, stackMin), d3.max(layersValues, stackMax)])
            //.domain([d3.min(valuesArray, stackMin), d3.max(valuesArray, stackMax)])
            .domain([-5, 5])
            .range([height, 0]);

        yAxisL = d3.axisLeft(yAxisScale);
        yAxisR = d3.axisRight(yAxisScale);

        // append y axis to the right of the chart    
        gyr = innerSpace.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + width + ", 0)")
            .call(yAxisR);

        // append y axis to the left of the chart
        gyl = innerSpace.append("g")
            .attr("class", "y axis")
            .call(yAxisL);

        // color set
        const z = distinctColors(layersNumber);
        //var z = d3.interpolateRainbow;
        //var z = d3.interpolateCool; 

        // ===========================================================================================
        // Create and set the streams
        // ===========================================================================================

        const area = d3.area() 
            .x(function (d, i) {
                 return (xAxisScale(d.data.date));
            }) 
            .y0(function (d) { return yAxisScale(d[0]); })
            .y1(function (d) { return yAxisScale(d[1]); })

        streams = graphZone.selectAll("path")
            .data(stackedData)
            .enter().append("path") // append all paths (area streams)
            .attr("d", function (d) {
                if (d) {
                    return area(d);
                } else {
                    return ([]);
                }
            }) 
            .attr("name", function (d, i) {
                let name = nameList[i];
                let color = z[i];
                colorNameList.push([name, color]);
                return (name);
            })
            .attr("opacity", 1)
            .attr("fill", function (d, i) { return (z[i]); });

        // ===========================================================================================
        // Set tooltip
        // ===========================================================================================

        //const tooltip = svgViewport.append("div")
        const tooltip = divContainer.append("div")
            .attr("class", "remove")
            .attr("id", "tooltip")
            .attr("style", getCssToString(styles.tooltip))
            .style("position", "absolute")
            .style("z-index", "2")
            .style("visibility", "hidden")
            .style("top", "4px")
            .style("left", "12px");

        let hoveredKey;
        let hoveredValue;

        // ===========================================================================================
        // Set vertical line
        // ===========================================================================================

        let mouseIsOverStream = false;

        // vertical line
        const vertical = divContainer.append("div")
            //.attr("class", {style.vertical})
            .style("position", "absolute")
            .style("z-index", "19")
            .style("width", "1px")
            .style("height", `${height}px`)
            .style("top", "10px")
            .style("bottom", "30px")
            .style("left", "0px")
            .style("margin-top", `${margin.top - 10}px`)
            .style("pointer-events", "none")
            .style("background", "#000");

        // ===========================================================================================
        // Set legend
        // ===========================================================================================

        const legendView = divContainer
            .attr("id", "legend")
            .attr("style", getCssToString(styles.legend))
            .append('div');

        for (let index = colorNameList.length - 1; index > 0; index--) {
            let element = colorNameList[index];
            let legendItemContainer = legendView.append("div")
                .attr("style", getCssToString(styles.legendItem))
                .attr("class", "legendItem");

            legendItemContainer.append("svg")
                .attr("width", 15)
                .attr("height", 15)
                .style("background-color", element[1]);

            legendItemContainer.append("text")
                .attr("style", getCssToString(styles.legentItemText))
                .attr("class", "legentItemText")
                .text(element[0]);
        }

        // ===========================================================================================
        // Mouse events - svgViewport events
        // 
        // Can't split in different blocks because .on("") events 
        // definition erase the previous ones
        // ===========================================================================================

        svgViewport.on("mouseover", function (d, i) {

            // *******************************************************
            // update the status (hidden or visible) and the position
            // of the vertical bar
            // *******************************************************

            if (mouseIsOverStream) {
                let mousex = d3.mouse(this);
                //mousex = mousex[0] + 28;
                mousex = mousex[0];
                vertical.style("visibility", "visible")
                vertical.style("left", mousex + "px");
            } else {
                vertical.style("visibility", "hidden");
            }
        }).on("mousemove", function (d, i) {
            if (mouseIsOverStream) {
                let mousex = d3.mouse(this);
                mousex = mousex[0]; // + 6
                vertical.style("visibility", "visible")
                vertical.style("left", mousex + "px");
            } else {
                vertical.style("visibility", "hidden");
            }
        });



        // ===========================================================================================
        // Mouse events - streams events
        // ===========================================================================================

        streams.on("mousemove", function (d, i) {

            // *******************************************************
            // Get the hovered values for tooltip
            // set hover and display tooltip
            // *******************************************************

            let mousex = d3.mouse(this)[0];
            var invertedx = xAxisScale.invert(mousex);

            hoveredKey = d3.select(this).attr("name");
            hoveredValue = d[Math.floor(invertedx)][1] - d[Math.floor(invertedx)][0];

            d3.select(this)
                .classed("hover", true)
                .attr("stroke", "#000")
                .attr("stroke-width", "0.5px"),
                tooltip.html("<p>" + hoveredKey + "<br>" + hoveredValue + "</p>").style("visibility", "visible");
        }).on("mouseover", function (d, i) {

            // *******************************************************
            // set the hover opacity
            // *******************************************************

            mouseIsOverStream = true;
            streams.transition()
                .duration(25)
                .attr("opacity", function (d, j) {
                    return j != i ? 0.3 : 1;
                })
        })
            .on("mouseout", function (d, i) {

                // *******************************************************
                // unset hover and hide tooltip
                // *******************************************************

                mouseIsOverStream = false;
                streams.transition()
                    .duration(25)
                    .attr("opacity", "1");
                d3.select(this)
                    .classed("hover", false)
                    .attr("stroke-width", "0px"),
                    tooltip.html("<p>" + hoveredKey + "<br>" + hoveredValue + "</p>").style("visibility", "hidden");
            });
    }

    componentDidMount() {
        this.setGraph();
    }
    
    render() {
        const { width, height } = this.state;
        return (
            <div ref="divContainer">
                <svg width={width} height={height}>
                    <g ref="anchor" />
                </svg>
            </div>
        );
    }
};

const mapStateToProps = (state, { formatData }) => {
    //console.log("mapStateToProps - state:");
    //console.log(state);
    return ({});
};

export default compose(injectData(), connect(mapStateToProps), exportableToPng)(
    Streamgraph,
);