
var tester = require("../test-util/util.js");
var fs = require("fs");

function makeTest(name, expr, baseurl) {
  return `
include image
include image-structs
include either

i2 = image-url("${baseurl}" + "/test-images/" + "${name}" + ".png")
i1 = ${expr}

i1
i2

check:
  fun within-n-badness(n):
    lam(img1, img2):
      diff = images-difference(img1, img2)
      cases(Either) diff block:
        | left(diff-error) =>
          "no error" is diff-error
          false
        | right(badness) =>
          when not(badness <= n) block:
            badness satisfies (_ <= n)
          end
          badness <= n
      end
    end
  end
  i1 is%(within-n-badness(26)) i2
end`
}


describe("Image equality", function() {
  before(tester.setupMulti("Rendering errors"));
  after(tester.teardownMulti);

  var tests = [

["above-align-left",
`  above-align("left",
    circle(30, "solid", "red"),
    above-align("left", circle(50, "solid", "green"), circle(20, "solid", "blue")))`],

["above-align-right",
`  above-align("right",
    circle(30, "solid", "red"),
    above-align("right", circle(50, "solid", "green"), circle(20, "solid", "blue")))`],

["above-align-middle",
`  above-align("middle",
    circle(30, "solid", "red"),
    above-align("middle", circle(50, "solid", "green"), circle(20, "solid", "blue")))`],

["beside-align-top",
`  beside-align("top",
    circle(30, "solid", "red"),
    beside-align("top", circle(50, "solid", "green"), circle(20, "solid", "blue")))`],

["beside-align-bottom",
`  beside-align("bottom",
    circle(30, "solid", "red"),
    beside-align("bottom", circle(50, "solid", "green"), circle(20, "solid", "blue")))`],

["beside-align-middle",
`  beside-align("middle",
    circle(30, "solid", "red"),
    beside-align("middle", circle(50, "solid", "green"), circle(20, "solid", "blue")))`],


["solid-green-circle",
`  circle(20, "solid", "green")`],

["outline-turquoise-rectangle",
`  rectangle(20, 30, "outline", "turquoise")`],

["solid-translucent-red-rectangle",
`  rectangle(200, 300, 10 / 255, "red")`],

["outline-red-rectangle",
`  rectangle(200, 300, "outline", "red")`],

["invisible-red-rectangle",
`  rectangle(200, 300, 0, "red")`],

["solid-red-triangle",
`  triangle(50, "solid", "red")`],

["halfred-triangle",
`  triangle(50, "solid", color(255, 0, 0, 128 / 255))`],

["translucent-halfred-triangle",
`  triangle(50, 128 / 255, color(255, 0, 0, 128 / 255))`],

["quarterred-triangle",
`  triangle(50, "solid", color(255, 0, 0, 64 / 255))`],

["blue-circle-center-scene",
`  place-image(circle(50, "solid", "blue"), 50, 50, empty-scene(100, 100))`],

["blue-circle-ur-corner-scene",
`  put-image(circle(50, "solid", "blue"), 100, 100, empty-scene(100, 100))`],




["red-black-ellipses",
`  overlay(ellipse(10, 10, "solid", "red"),
    overlay(ellipse(20, 20, "solid", "black"),
      overlay(ellipse(30, 30, "solid", "red"),
        overlay(ellipse(40, 40, "solid", "black"),
          overlay(ellipse(50, 50, "solid", "red"),
            ellipse(60, 60, "solid", "black"))))))`],

["centered-target",
`  place-image(
    overlay(ellipse(10, 10, "solid", "white"),
      overlay(ellipse(20, 20, "solid", "black"),
        overlay(ellipse(30, 30, "solid", "white"),
          overlay(ellipse(40, 40, "solid", "black"),
            overlay(ellipse(50, 50, "solid", "white"),
              ellipse(60, 60, "solid", "black")))))),
    150, 100,
    rectangle(300, 200, "solid", "black"))`],


["australia-ish",
`let
flag2 =
  place-image(
    rotate(90,
      underlay-align("center", "center",
        rectangle(50, 450, "solid", "white"),
        underlay-align("center", "center",
          rotate(90, rectangle(50, 450, "solid", "white")),
          underlay-align("center", "center",
            rotate(90, rectangle(30, 450, "solid", "red")),
            rotate(180, rectangle(30, 450, "solid", "red")))))),
    200, 100,
    place-image(
      rotate(65,
        underlay-align("center", "center",
          rectangle(15, 450, "solid", "red"),
          rotate(50, rectangle(15, 450, "solid", "red")))),
      200, 100,
      place-image(
        rotate(65,
          underlay-align("center", "center",
            rectangle(40, 450, "solid", "white"),
            rotate(50, rectangle(40, 450, "solid", "white")))),
        200, 100,
        rectangle(400, 200, "solid", "navy")))):

place-image(flag2, 200, 100,
    place-image(star-polygon(30, 7, 3, "solid", "white"),
      650, 60,
      place-image(star-polygon(50, 7, 3, "solid", "white"),
        200, 300,
        place-image(star-polygon(40, 7, 3, "solid", "white"),
          500, 300,
          place-image(star-polygon(40, 7, 3, "solid", "white"),
            490, 220,
            rectangle(900, 400, "solid", "navy"))))))
end`],


  ];

  tests.forEach(function(t) {
    tester.testRunAndAllTestsPass(it, "image-equality-" + t[0], makeTest(t[0], t[1], process.env["BASE_URL"]) );
  });
});
/*
fun make-stars(n):
  ask:
    | 1 == n then: star(12, "solid", "purple")
    | otherwise: beside(star(12, "solid", "purple"), make-stars(n - 1))
  end
end
fun bar-graph(l1):
  ask:
    | l1 == empty then: circle(0, "outline", "blue")
    | otherwise: above-align("left", make-stars(l1.first), bar-graph(l1.rest))
  end
end
t("bar-graph",
  bar-graph([list: 1, 3, 5, 3, 9, 5, 3, 4, 4, 3, 5, 2]))

*/
