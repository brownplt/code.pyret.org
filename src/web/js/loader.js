var texts = [
    "Raising the masts...",
    "Securing the oarlocks...",
    "Hoisting the anchor...",
    "Swabbing the decks...",
    "Debarnacling the keel...",
    "Checking the cargo manifest...",
    "Assembling the crew...",
    "Inspecting the turnbuckles...",
    "Furling the rollers...",
    "Lashing the jib-boom...",
    "Tying the rigging...",
    "Reinforcing the hull...",
    "Bailing the bilge...",
    "Feeding the parrot...",
    "Consulting the map...",
    "Calibrating the compass...",
    "Polishing the spyglass...",
    "Latching the portholes..."
  ];
$("#loader p").text(texts[Math.floor(Math.random() * texts.length)]);
var intervalID = setInterval(function() {
  $("#loader p").text(texts[Math.floor(Math.random() * texts.length)]);
}, 1300);
$("#loader").data("intervalID", intervalID);
