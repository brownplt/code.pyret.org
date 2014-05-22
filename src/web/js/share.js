function drawShareWidget(shareUrl) {
  $("<div>").append([
      redditWidget(shareUrl),
      googleWidget(shareUrl)
    ]);
}

function redditWidget(shareUrl) {
  // NOTE(joe 19 May 2014):
  // Adapted from first button at http://www.reddit.com/buttons/
  var link = $("<a>");
  link
    .attr("href", "http://www.reddit.com/submit?url=" + encodeURIComponent(shareUrl))
    .attr("target", "_blank")
    .attr("alt", "Share on Reddit")
    .append($("<img>")
              .attr("src", "http://www.reddit.com/static/spreddit1.gif")
              .css("border", 0));
  return link;
}

function googleWidget(shareUrl) {
  var link = $("<a>");
  link
    .attr("href", "https://plus.google.com/share?url=" + encodeURIComponent(shareUrl))
    .attr("target", "_blank")
    .attr("alt", "Share on Google+")
    .append($("<img>")
              .attr({ "width": 14, "height": 14 })
              .attr("src", "https://www.gstatic.com/images/icons/gplus-64.png")
              .attr("alt", "Share on Google+"));
  return link;
}

function facebookWidget(shareUrl) {
  var link = $("<a>");
  link
    .attr("href", "https://facebook.com/sharer.php?u=" + encodeURIComponent(shareUrl))
    .attr("target", "_blank")
    .attr("alt", "Share on Facebook")
    .append($("<img>")
            .attr({ "width": 14, "height": 14 })
            .attr("src", "http://www.wescheme.org/images/icon_facebook.gif"));
  return link;
}
