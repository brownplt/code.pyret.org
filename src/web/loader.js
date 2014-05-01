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
    "Lashing the jib-boom..."
  ];
$("#loader p").text(texts[Math.floor(Math.random() * texts.length)]);
setInterval(function() {
  $("#loader p").text(texts[Math.floor(Math.random() * texts.length)]);
}, 1300);
