// Function to calculate results based on input fields
function handlePredict(event) {

  // Prevent the page from refreshing
  d3.event.preventDefault();

  // Clear any existing room suggestion
  d3.select("#room-selection>ul").remove();

  // Clear any existing artist metadata
  d3.select("#band-metadata>ul").remove();

  // Grab values from input fields
  var bandName = d3.select("#tags").property("value");

  // If the band name contains a "/", replace it with "---" to pass to metadata route
  bandName = bandName.replace(/\//g,"---");

  var showDate = d3.select("#datepicker").property("value");

  if (showDate == "") {
    $("#dialog-date").dialog({
      autoOpen: false,
      modal: true,
      draggable: false

    });
    $('#dialog-date').dialog('open');
  }

  // Feed band name into a route which returns artist metadata
  d3.json(`/metadata/${bandName}`).then( function(data){

    // If the band name was previously formatted to replace a "/", put it back
    bandName = bandName.replace(/---/g,"/");

    // If a band is entered that is not in the database, set output values manually
    if (data[0] == 'e') {

      // Output values for Ballroom
      var totalSales = 38;
      var ticketPrice = 9;
      var advanceSales = 0;
      var barRevenue = 354;

      populateRoom(totalSales);

      // Call function to update gage charts and slider
      updateDashboard(advanceSales,totalSales,ticketPrice,barRevenue);

      // Populate panel with warning statement (band not found)
      // Select band-metadata div
      var metadataDiv = d3.select("#band-metadata");

      // Append <ul> element
      var metadataUL = metadataDiv.append("ul").attr("class","list-group");

      // Append <li> element
      var metadataLI = metadataUL.append("li").attr("class","list-group-item");

      // Append <span> with warning message to communicate that the band was not found
      metadataLI.append("span").html(`<strong>Warning: </strong>This artist (${bandName}) was not found in the database. They might be a smaller local act that would not generate organic ticket sales.  These results represent our best guess.`);

    }
    else {
      // Unpack artist metadata and assign to variables
      bandName = data[0].Artist;

      // If the band name returned by the route doesn't match the input (lowercase input),
      // Update the text of the input field to match the proper band name
      if (bandName != d3.select("#tags").property("value")) {
        document.getElementById('tags').value = bandName;
      }

      var averageAge = data[0].average_age;
      var bandGenres = data[0].genre;

      // If no band genres were returned from the database, display the result more nicely
      if (bandGenres == null) {
        bandGenres = "None listed";
        console.log(bandGenres);
      }

      var percentMale = 1 - data[0].percent_female;
      var streamsTransformed = data[0].popularity_transformed;
      var spotifyURI = data[0].uri;

      // Reformat show date to pass to model route
      var showDateFormatted = showDate.replace(/\//g,"-");

      // Feed stream count, gender, room selection, age, and date into ML model
      d3.json(`/model/${streamsTransformed}/${percentMale}/${averageAge}/${showDateFormatted}`).then( function(data){

        // Return advance sales, total sales, ticket price, and bar revenue
        var totalSales = +Math.round(data[0][0]);
        var ticketPrice = +Math.round(data[1][0]);
        var advanceSales = +Math.round(data[2][0]);
        var barRevenue = +Math.round(data[3][0]);
        
        populateRoom(totalSales);

        // Call function to update gage charts and slider
        updateDashboard(advanceSales,totalSales,ticketPrice,barRevenue);

      });

      var spotifyURL = "https://open.spotify.com/artist/" + spotifyURI;
      var roundedAge = Math.round(averageAge);

      // Call function to populate band metadata panel on dashboard
      populateMetadata(bandName,bandGenres,roundedAge,spotifyURL);

      // Smooth scroll to top of metadata panel
      $('html, body').animate({
        scrollTop: $("#band-metadata").offset().top
      }, 1000);
    }

  });

}

// Function to populate band metadata panel on dashboard
function populateRoom(totalSales) {

  if (totalSales > 200) {
    var roomSelection = "Large";
    var roomCapacity = 500;
  }
  else {
    var roomSelection = "Small";
    var roomCapacity = 150;
  }

  // Populate panel with room recommendation
  // Select room-selection div
  var roomDiv = d3.select("#room-selection");

  // Append <ul> element
  var roomUL = roomDiv.append("ul").attr("class","list-group");

  // Append <li> element
  var roomLI = roomUL.append("li").attr("class","list-group-item");

  // Append <span> with warning message to communicate that the band was not found
  roomLI.append("span").html(`<strong>Room: </strong>${roomSelection} (capacity ${roomCapacity})`);

}


// Function to populate band metadata panel on dashboard
function populateMetadata(bandName,bandGenres,fanAge,spotifyURL) {

  // Select band-metadata div
  var metadataDiv = d3.select("#band-metadata");

  // Append <ul> element
  var metadataUL = metadataDiv.append("ul").attr("class","list-group");

  // Append <li> element
  var metadataLI = metadataUL.append("li").attr("class","list-group-item");

  // Append <span> with band name
  metadataLI.append("span").html(`Artist Details for <strong>${bandName}</strong>`);

  // Append <hr>
  metadataLI.append("hr").attr("class","my-1");

  // Append <span> with genres
  metadataLI.append("span").html(`<strong>Genre(s): </strong>${bandGenres}`);

  // Append <br>
  metadataLI.append("br");

  // Append <span> with average listener age
  metadataLI.append("span").html(`<strong>Avg. Listener Age: </strong>${fanAge}`);

  // Append <br>
  metadataLI.append("br");

  // Append <hr>
  metadataLI.append("hr").attr("class","my-1");

  // Append link to listen on Spotify
  metadataLI.append("a").html(`Stream ${bandName} on Spotify`).attr("href",`${spotifyURL}`).attr("target","_blank");

}

// Function to update gage charts and slider
function updateDashboard(advanceSales,totalSales,ticketPrice,barRevenue) {

  // Calculate missing values needed to update gages
  var doorSales = totalSales - advanceSales;
  var ticketRevenue = totalSales * ticketPrice;
  var totalRevenue = ticketRevenue + barRevenue;

  if (totalSales > 1500) {
    $("#dialog-sellout").dialog({
      autoOpen: false,
      modal: true,
      draggable: false

    });
    $('#dialog-sellout').dialog('open');
  }

  // If ticket price exceeds default max, reset max
  if (ticketPrice > 50) {
    slider.noUiSlider.updateOptions({
      range: {
          'min': 0,
          'max': ticketPrice
      }
    });
  }
  // Else set max to initial value (for multiple successive predictions)
  else {
    slider.noUiSlider.updateOptions({
      range: {
          'min': 0,
          'max': 50
      }
    });
  }

  // Update slider
  slider.noUiSlider.set(ticketPrice);

  // If ticket sales exceeds 500, update gauge values and reset the max value of the gauges
  if (totalSales > 500) {
    totalTicketSalesGage.refresh(totalSales,totalSales);
    advanceTicketSalesGage.refresh(advanceSales,totalSales);
    doorTicketSalesGage.refresh(doorSales,totalSales);
  }
  // Else update the gauge values and reset max to initial value (for multiple successive predictions)
  else {
    totalTicketSalesGage.refresh(totalSales,500);
    advanceTicketSalesGage.refresh(advanceSales,500);
    doorTicketSalesGage.refresh(doorSales,500);
  }

  // If total revenue exceeds 30000, update gauge values and reset the max value of the gauges
  if (totalRevenue > 30000) {
    totalRevenueGage.refresh(totalRevenue,totalRevenue);
    ticketRevenueGage.refresh(ticketRevenue,totalRevenue);
    barRevenueGage.refresh(barRevenue,totalRevenue);
  }
  // Else update the gauge values and reset max to initial value (for multiple successive predictions)
  else {
    totalRevenueGage.refresh(totalRevenue,30000);
    ticketRevenueGage.refresh(ticketRevenue,30000);
    barRevenueGage.refresh(barRevenue,30000);
  }

}

// Function to update revenue gauges on slider change
function updateRevenue(newTicketPrice) {
  // Pull number of total ticket sales from existing gauge
  var totalTicketSales = totalTicketSalesGage.config.value;

  // Calculate new ticket revenue
  var newTicketRevenue = totalTicketSales * newTicketPrice;

  // Update ticket revenue gauge
  ticketRevenueGage.refresh(newTicketRevenue);

  // Pull bar revenue from existing gauge
  var barRevenue = barRevenueGage.config.value;

  // Calculate new total revenue
  var newTotalRevenue = newTicketRevenue + barRevenue;

  // Update total revenue gauge
  totalRevenueGage.refresh(newTotalRevenue);
  
}



// Function to clear fields and remove Results and pie chart divs
function handleClear(event) {

  // Prevent the page from refreshing
  d3.event.preventDefault();

  // Clear input fields
  document.getElementById('tags').value = '';
  document.getElementById('datepicker').value = '';

  // Clear room suggestion panel
  d3.select("#room-selection>ul").remove();

  // Clear metadata panel
  d3.select("#band-metadata>ul").remove();

  // Reset gages to 0
  totalTicketSalesGage.refresh(0);
  advanceTicketSalesGage.refresh(0);
  doorTicketSalesGage.refresh(0);
  totalRevenueGage.refresh(0);
  ticketRevenueGage.refresh(0);
  barRevenueGage.refresh(0);

  // Reset slider
  slider.noUiSlider.reset();

}

// Format number with commas (for file output revenue values)
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



var totalTicketSalesGage = new JustGage({
    id: 'total-ticket-sales',
    value: 0,
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
    value: 0,
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
    value: 0,
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
    value: 0,
    valueMinFontSize: 20,
    humanFriendly: true,
    humanFriendlyDecimal: 1,
    min: 0,
    max: 30000,
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
    value: 0,
    valueMinFontSize: 20,
    humanFriendly: true,
    humanFriendlyDecimal: 1,
    min: 0,
    max: 30000,
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
    value: 0,
    valueMinFontSize: 20,
    humanFriendly: true,
    humanFriendlyDecimal: 1,
    min: 0,
    max: 30000,
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
  animate: true,
  animationDuration: 750,
  start: 0,
  connect: 'lower',
  // define price range
  range: {
    'min': 0,
    'max': 50
  },
  step: 1,
  // tooltips: true
  });

var price = +slider.noUiSlider.get();
var priceDisplay = document.getElementById('price')
// Set initial price displayed
priceDisplay.innerHTML = price;
  
slider.noUiSlider.on('update', function (values, handle) {
  // Pull handle value and assign as new ticket price
  var newPrice = +values[handle];
  // Update price display below slider
  priceDisplay.innerHTML = `$${newPrice}`;
  // Update revenue gauges on slider change
  updateRevenue(newPrice);
});

// Declare variable for Predict button
var predictButton = d3.select("#predict-btn");

// Declare variable for Clear button
var clearButton = d3.select("#clear-btn");

// Define Predict button action
predictButton.on("click",handlePredict);

// Define Clear button action
clearButton.on("click",handleClear);


// JQuery Datepicker script method
$("#datepicker").datepicker({
  showAnim: "slideDown",
  minDate : 0
});


// Load list of all band names on page load
d3.json(`/bandlist`).then( function(data){
  
  var availableTags = data;

  $( "#tags" ).autocomplete({
    classes: {
      "ui-autocomplete": "jquery-autocomplete"
    },
    autoFocus: true,
    source: availableTags,
    minLength: 5
  });
});

// Event listener to save output summary to .txt file
$("#btn-save").click( function() {
  var bandName = d3.select("#tags").property("value");
  var showDate = d3.select("#datepicker").property("value");

  var totalTicketSales = numberWithCommas(totalTicketSalesGage.config.value);
  var advanceSales = numberWithCommas(advanceTicketSalesGage.config.value);
  var doorSales = numberWithCommas(doorTicketSalesGage.config.value);

  if (totalTicketSales > 200) {
    var roomSelection = "Large (capacity 500)";
  }
  else {
    var roomSelection = "Small (capacity 150)";
  }

  var ticketPrice = +slider.noUiSlider.get();

  var totalRevenue = numberWithCommas(totalRevenueGage.config.value);
  var ticketRevenue = numberWithCommas(ticketRevenueGage.config.value);
  var barRevenue = numberWithCommas(barRevenueGage.config.value);

  var formatDate = showDate.replace(/\//g,".");

  var text = `Artist: ${bandName}\r\nDate: ${showDate}\r\n\r\nSuggested Room Size: ${roomSelection}\r\n\r\nExpected Total Ticket Sales: ${totalTicketSales} tickets\r\nExpected Advance Ticket Sales: ${advanceSales} tickets\r\nExpected Door Ticket Sales: ${doorSales} tickets\r\n\r\nSuggested Ticket Price: $${ticketPrice}\r\n\r\nExpected Total Revenue: $${totalRevenue}\r\nExpected Ticket Revenue: $${ticketRevenue}\r\nExpected Bar Revenue: $${barRevenue}`;
  var filename = `${bandName} ${formatDate}`;
  var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
  saveAs(blob, filename+".txt");
});

// Tooltip with warning regarding adjusting ticket price
$('#tooltip').on({
  "click": function() {
    $(this).tooltip({ items: "#tooltip", content: "Warning: The model will suggest a ticket price based on historical data. Changing this price will recalculate revenue, but be aware that attendance may also be affected by altering the ticket price."});
    $(this).tooltip("open");
  },
  "mouseout": function() {    
     $(this).tooltip("disable"); 
  }
});