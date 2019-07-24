$('#tt').on({
  "click": function() {
    $(this).tooltip({ items: "#tt", content: "Displaying on click"});
    $(this).tooltip("open");
  },
  "mouseout": function() {      
     $(this).tooltip("disable");   
  }
});