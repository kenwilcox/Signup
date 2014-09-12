/* jshint -W097 */
'use strict';

var CLASS_SIZE = 15;

// Create our Firebase reference
var userListRef = new Firebase('https://class-signup.firebaseio.com/classList');

// Keep a mapping of firebase locations to HTML elements, so we can move / remove elements as necessary.
var htmlForPath = {};

// Helper function that takes a new student snapshot and adds an appropriate row to our leaderboard table.
function handleStudentAdded(snapshot, prevName) {
  var instructor = "Nope";
  var newRow = $("<tr/>");
  
  if (snapshot.val().instructor) {
    instructor = "Yes";
    newRow = $("<tr class=\"info\"></tr>");
  }
  
  newRow.append($("<td/>").append($("<em/>").text(snapshot.val().name)));
  newRow.append($("<td/>").text(instructor));

  // Store a reference to the table row so we can get it again later.
  htmlForPath[snapshot.name()] = newRow;

  // Insert the new student in the appropriate place in the table.
  if (prevName === null) {
    $("#signupTable").append(newRow);
  } else {
    var lowerRow = htmlForPath[prevName];
    lowerRow.after(newRow);
  }
}

// Helper function to handle a student object being removed; just removes the corresponding table row.
function handleStudentRemoved(snapshot) {
//  debugger;
  var removedRow = htmlForPath[snapshot.name()];
  removedRow.remove();
  delete htmlForPath[snapshot.name()];
}

// Create a view to only receive callbacks for the last CLASS_SIZE
var userListView = userListRef.limit(CLASS_SIZE);

// Add a callback to handle when a new student is added.
userListView.on('child_added', function (newSnapshot, prevName) {
  handleStudentAdded(newSnapshot, prevName);
});

// Add a callback to handle when a student is removed
userListView.on('child_removed', function (oldSnapshot) {
  handleStudentRemoved(oldSnapshot);
});

// Add a callback to handle when a student changes or moves positions.
var changedCallback = function (snapshot, prevName) {
  handleStudentRemoved(snapshot);
  handleStudentAdded(snapshot, prevName);
};
userListView.on('child_moved', changedCallback);
userListView.on('child_changed', changedCallback);

// Handle KeyPress
var keypressEvent = function (e) {
  if (e.keyCode === 13) {

    var name = $("#nameInput").val();
    name = name.trim();
    $("#nameInput").val("");
    $("#instructorInput").val("");
    $("#nameInput").focus();

    var instructorFlag = $("#instructorInput");
    var priority = name;
    if (instructorFlag !== []) {
      if (instructorFlag.val() === "Yes") {
        priority = " " + name;
      }
    }
    
    if (name.length === 0) {
      return;
    }

    var userRef = userListRef.child(name);
    userRef.setWithPriority({
      name: name,
    }, priority);
  }
};
  
// When the user presses enter on nameInput, add the name
$("#nameInput").keypress(keypressEvent);
$("#instructorInput").keypress(keypressEvent);