// /**
//  * Coding Challenge - Tip Calculator
//  * Case Western Reserve University
//  * Data Analytics Boot Camp
//  * Robert Wood
//  */ 

// // Function to calculate results based on input fields
// function handleCalculate(event) {

//     // Prevent the page from refreshing
//     d3.event.preventDefault();

//     // Grab values from input fields
//     var billAmt = d3.select("#bill-amt").property("value");
//     var tipPct = d3.select("#tip-pct").property("value");
//     var splitNum = d3.select("#split-num").property("value");

//     // Bill Amount - strip leading $ if exists
//     if (billAmt[0] == "$") {
//         billAmt = billAmt.slice(1, billAmt.length);
//     }

//     // Tip Percentage - strip trailing % if exists
//     if (tipPct[tipPct.length-1] == "%") {
//         tipPct = tipPct.slice(0, tipPct.length-1);
//     }

//     /* If Bill Amount or Desired Tip Percentage are blank, exit the function
//     (to avoid throwing errors on initial window resizing) */
//     if (billAmt == "" || tipPct == "") {
//         return;
//     }

//     // Declare error flags, to be set if an entry error is detected
//     var billAmtErr = false;
//     var tipPctErr = false;

//     // Check to see if Total Bill is a number
//     if (isNaN(billAmt)) {
//         // if not, throw an error and set the error flag
//         alert("Total Bill value must be a number.  Please enter a number and try again.");
//         billAmtErr = true;
//     }

//     // Check to see if Total Bill is > 0
//     if (billAmt <=0) {
//         // if not, throw an error and set the error flag
//         alert("Total Bill value must be greater than 0.  Please enter a positive number and try again.");
//         billAmtErr = true;
//     }
    
//     // Check to see if Desired Tip Percentage is a number
//     if (isNaN(tipPct)) {
//         // if not, throw an error and set the error flag
//         alert("Desired Tip Percentage value must be a number.  Please enter a number and try again.");
//         tipPctErr = true;
//     }

//     // Check to see if Desired Tip Percentage is > 0
//     if (tipPct <=0) {
//         // if not, throw an error, reset the field, and exit the function
//         alert("Desired Tip Percentage must be greater than 0.  Please enter a positive number and try again.");
//         tipPctErr = true;
//     }

//     // If an error was detected in the Total Bill field, reset the field
//     if (billAmtErr) {
//         document.getElementById('bill-amt').value = '';
//     }
//     // If an error was detected in the Desired Tip Percentage field, reset the field
//     if (tipPctErr) {
//         document.getElementById('tip-pct').value = '';
//     }

//     // If either of the error flags were set during error checking, exit the function
//     if (billAmtErr || tipPctErr) {
//         return;
//     }

//     // Cast variables as numbers
//     billAmt = +billAmt;
//     tipPct = +tipPct;
//     splitNum = +splitNum;

//     // Calculate tip
//     var tipAmt = billAmt * (tipPct / 100)
//     // Calculate split amount
//     var splitAmt = tipAmt / splitNum;

//     /* Round Tip Amount and Split Amount to two-decimal places,
//     using a calculation, as .toFixed does not always behave properly
//     Save as strings to preserve trailing zeroes if they exist */
//     var tipAmtStr = (Math.round( tipAmt * 100 ) / 100).toFixed(2);
//     var splitAmtStr = (Math.round( splitAmt * 100 ) / 100).toFixed(2);

//     /* Edge case handling
//     Increase splitAmt by $.01 if the combined tip is less than tipAmt due to rounding */
//     if (+splitAmtStr * splitNum < +tipAmtStr) {
//         splitAmt += .01;
//         splitAmtStr = splitAmt.toFixed(2);
//     }

//     // Display results
//     displayResults(tipAmtStr,splitNum,splitAmtStr);

//     // Clear any previous pie chart and reset the class of the table-pie div
//     d3.selectAll("#table-pie>div").remove();
//     d3.select("#table-pie").attr("class","");

//     // If split is chosen, build pie chart with array of split amounts
//     if (splitNum > 1) {
//         // Create array of split amounts
//         var splitAmts = [];
//         for(var i=0; i<splitNum; i++) {
//             splitAmts.push(splitAmt);
//         }
//         // Build pie chart
//         buildPie(splitAmts);
//     }
// }

// // Function to clear fields and remove Results and pie chart divs
// function handleClear(event) {

//     // Prevent the page from refreshing
//     d3.event.preventDefault();

//     // Clear input fields
//     document.getElementById('bill-amt').value = '';
//     document.getElementById('tip-pct').value = '';
//     document.getElementById('split-num').value = '1';

//     // Delete current chart
//     d3.selectAll("#table-pie>div").remove();

//     // Reset the class of the table-pie div
//     d3.select("#table-pie").attr("class","");

//     // Delete results
//     d3.selectAll("#results>div").remove();

//     // Reset the class of the results div
//     d3.select("#results").attr("class","");
// }

// // Function to display calculation results
// function displayResults(tipAmtStr,splitNum,splitAmtStr) {

//     // Select Results div
//     var results = d3.select("#results");

//     // Assign card class to Results div
//     results.attr("class","card border-primary mb-3")

//     // Clear any previous results
//     d3.selectAll("#results>div").remove();

//     // Create a card and display the calculated Tip Amount
//     results.append("div").text(`Results`).attr("class","card-header");
//     var resultCardBody = results.append("div").attr("class","card-body");
//     resultCardBody.append("p").text(`Tip Amount: $${tipAmtStr}`).attr("class","card-text");

//     // If the split option was chosen, display split information
//     if (splitNum > 1) {
//         resultCardBody.append("p").text(`Split between ${splitNum} people...`).attr("class","card-text");
//         resultCardBody.append("p").text(`Tip per Person: $${splitAmtStr}`).attr("class","card-text");    
//     }
// }

// // Function to build pie chart with the split amounts
// function buildPie(splitAmts) {

//     // Create arrays for labels, colors, and text using length of passed value array
//     var labels = [];
//     var colors = [];
//     var splitAmtsFormatted = [];
//     for(var i=0; i<splitAmts.length; i++) {
//         labels.push(i+1);
//         colors.push("#af8555");
//         splitAmtsFormatted.push(`$${splitAmts[i].toFixed(2)}`);
//     }

//     // Create trace element using passed array
//     trace = {
//         type: 'pie',
//         labels: labels,
//         values: splitAmts,
//         text: splitAmtsFormatted,
//         textinfo: 'text',
//         hole: .35,
//         marker: {
//             colors: colors,
//             line: {
//                 color: "#000000",
//                 width: 1
//             },
//         },
//         showlegend: false
//     };

//     // define width of SVG as width of parent element
//     var pieWidth = document.getElementById('table-pie').offsetWidth - 20;

//     // Create layout element
//     var layout = {
//         margin: {
//             l: 10,
//             r: 10,
//             t: 0,
//             b: 0
//         },
//         hovermode: false,
//         width: pieWidth,
//         height: pieWidth,
//         paper_bgcolor: 'rgba(0,0,0,0)',
//         plot_bgcolor: 'rgba(0,0,0,0)'
//     };
    
//     // Assign data variable for plotting
//     var data = [trace];

//     // Select Results div
//     var pieDiv = d3.select("#table-pie");

//     // Assign card class to Pie div
//     pieDiv.attr("class","card border-primary mb-3")

//     // Display results
//     pieDiv.append("div").text(`Useful Visualization*`).attr("class","card-header");
//     var pieCardBody = pieDiv.append("div").attr("class","card-body").attr("id","pie-chart").attr("style","padding:10px");

//     // Draw pie chart
//     Plotly.newPlot("pie-chart",data,layout,{displayModeBar: false},{responsive: true});
//     pieCardBody.append("p").text("*Actual usefulness may vary").attr("class","card-text").attr("style","font-size:small"); 
// }

// // Function to create array and populate Split select dropdown
// function populateSplit() {

//     // Create array for Split select dropdown
//     var splitNums = [];

//     // Create array from 1 to 10 (increase '10' below to extend select dropdown)
//     for(var i=1; i<=10; i++) {
//         splitNums.push(i);
//     }

//     // Select html element for Split select dropdown
//     var splitNum = d3.select("#split-num");

//     // Populate Split select dropdown
//     splitNums.forEach(function(number) {
//         var option = splitNum.append("option");
//         option.text(number);
//     });
// }

// // Define variable to hold the Total Bill field
// var billAmtField = document.getElementById("bill-amt");

// // Add event listener for focusout to reformat entry
// billAmtField.addEventListener('focusout', (event) => {

//     // Define variable to hold the value entered in the field
//     var billAmtEntered = event.target.value;

//     // If dollar sign was added, remove it for now
//     if (billAmtEntered[0] == "$") {
//         billAmtEntered = billAmtEntered.slice(1,billAmtEntered.length);
//     }

//     // Check to see if we have ended up with a valid number
//     if (isNaN(billAmtEntered) || (billAmtEntered == "") || (billAmtEntered < 0)) {
//         // Do nothing, error will be thrown when Calculate is pressed
//     }
//     // If we have a number, cast as a number and reformat the field
//     else {
//         billAmtEntered = +billAmtEntered;

//         // Round and display Total Bill to two decimal places
//         billAmtEntered = (Math.round( billAmtEntered * 100 ) / 100).toFixed(2);

//         // Reformat the field
//         event.target.value = "$" + billAmtEntered;
//     }
// });

// // Define variable to hold the Desired Tip Percentage field
// var tipPctField = document.getElementById('tip-pct');

// // Add event listener for focusout to reformat entry
// tipPctField.addEventListener('focusout', (event) => {

//     // Define variable to hold the value entered in the field
//     var tipPctEntered = event.target.value;

//     // If percent sign was added, remove it for now
//     if (tipPctEntered[tipPctEntered.length - 1] == "%") {
//         tipPctEntered = tipPctEntered.slice(0,tipPctEntered.length-1);
//     }

//     // Check to see if we have ended up with a valid number
//     if (isNaN(tipPctEntered) || (tipPctEntered == "") || (tipPctEntered < 0)) {
//         // Do nothing, error will be thrown when Calculate is pressed
//     }
//     // If we have a number, cast as a number and reformat the field
//     else {
//         tipPctEntered = +tipPctEntered;

//         // Check if the tip was entered as decimal instead of percentage
//         if (tipPctEntered < 1) {
//             // multiply by 100
//             tipPctEntered = tipPctEntered * 100;
//         }
//         // Reformat the field
//         event.target.value = tipPctEntered + "%";
//     }
// });

// // Declare variable for Calculate button
// var calculateButton = d3.select("#calculate-btn");

// // Declare variable for Clear Filter button
// var clearButton = d3.select("#clear-btn");

// // Define Calculate button action
// calculateButton.on("click",handleCalculate);

// // Define Clear Filter button action
// clearButton.on("click",handleClear);

// // Populate Split select dropdown on page load
// populateSplit();

// /* When the browser window is resized, handleCalculate() is called
// to generate a rescaled pie chart */
// d3.select(window).on("resize", handleCalculate);

// /* Add event listener to scroll to bottom of the page to view results
// (especially useful for mobile) */
// document.getElementById("calculate-btn").addEventListener("click", function() {
//     // Scroll down to see results
//     window.scrollTo(0,document.body.scrollHeight);
// });



// Function to clear fields and remove Results and pie chart divs
function handleClear(event) {

  // Prevent the page from refreshing
  d3.event.preventDefault();

  // Clear input fields
  document.getElementById('band-name').value = '';
  document.getElementById('show-date').value = '';

  // Reset gages to 0
  totalTicketSalesGage.refresh(0);
  advanceTicketSalesGage.refresh(0);
  doorTicketSalesGage.refresh(0);
  totalRevenueGage.refresh(0);
  ticketRevenueGage.refresh(0);
  barRevenueGage.refresh(0);
}



var totalTicketSalesGage = new JustGage({
    id: 'total-ticket-sales',
    value: 70,
    valueMinFontSize: 25,
    formatNumber: true,
    min: 0,
    max: 500,
    hideMinMax: true,
    label: "tickets",
    pointer: true,
    gaugeWidthScale: 1.0,
    levelColors: ["#ff6437"],
    pointerOptions: {
      toplength: 0,
      bottomlength: 5,
      bottomwidth: 2,
      color: '#000'
    },
    counter: true,
    relativeGaugeSize: true
  });

  var advanceTicketSalesGage = new JustGage({
    id: 'advance-ticket-sales',
    value: 50,
    valueMinFontSize: 25,
    formatNumber: true,
    min: 0,
    max: 500,
    hideMinMax: true,
    label: "tickets",
    pointer: true,
    gaugeWidthScale: 0.7,
    levelColors: ["#ff6437"],
    pointerOptions: {
      toplength: 0,
      bottomlength: 5,
      bottomwidth: 2,
      color: '#000'
    },
    counter: true,
    relativeGaugeSize: true
  });

  var doorTicketSalesGage = new JustGage({
    id: 'door-ticket-sales',
    value: 20,
    valueMinFontSize: 25,
    formatNumber: true,
    min: 0,
    max: 500,
    hideMinMax: true,
    label: "tickets",
    pointer: true,
    gaugeWidthScale: 0.7,
    levelColors: ["#ff6437"],
    pointerOptions: {
      toplength: 0,
      bottomlength: 5,
      bottomwidth: 2,
      color: '#000'
    },
    counter: true,
    relativeGaugeSize: true
  });

  var totalRevenueGage = new JustGage({
    id: 'total-revenue',
    value: 983,
    valueMinFontSize: 25,
    decimals: 2,
    min: 0,
    max: 1000,
    hideMinMax: true,
    pointer: true,
    gaugeWidthScale: 1.0,
    levelColors: ["#78c2ad"],
    pointerOptions: {
      toplength: 0,
      bottomlength: 5,
      bottomwidth: 2,
      color: '#000'
    },
    counter: true,
    relativeGaugeSize: true
  });

  var ticketRevenueGage = new JustGage({
    id: 'ticket-revenue',
    value: 275,
    valueMinFontSize: 25,
    decimals: 2,
    min: 0,
    max: 1000,
    hideMinMax: true,
    pointer: true,
    gaugeWidthScale: 0.7,
    levelColors: ["#78c2ad"],
    pointerOptions: {
      toplength: 0,
      bottomlength: 5,
      bottomwidth: 2,
      color: '#000'
    },
    counter: true,
    relativeGaugeSize: true
  });

  var barRevenueGage = new JustGage({
    id: 'bar-revenue',
    value: 708,
    valueMinFontSize: 25,
    decimals: 2,
    min: 0,
    max: 1000,
    hideMinMax: true,
    pointer: true,
    gaugeWidthScale: 0.7,
    levelColors: ["#78c2ad"],
    pointerOptions: {
      toplength: 0,
      bottomlength: 5,
      bottomwidth: 2,
      color: '#000'
    },
    counter: true,
    relativeGaugeSize: true
  });

// Define slider
var slider = document.getElementById('price-slider');

slider.style.width = '90%';
slider.style.background = '#edebeb';


// Create slider
noUiSlider.create(slider, {
  start: 25,
  connect: 'lower',
  // define price range
  range: {
    'min': 0,
    'max': 100
  },
  step: 1,
  // tooltips: true
  });

  



// Declare variable for Clear Filter button
var clearButton = d3.select("#clear-btn");

// Define Clear Filter button action
clearButton.on("click",handleClear);

