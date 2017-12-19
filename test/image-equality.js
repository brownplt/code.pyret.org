
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
`  above-align(x-left,
    circle(30, mode-solid, red),
    above-align(x-left, circle(50, mode-solid, green), circle(20, mode-solid, blue)))`],

["above-align-right",
`  above-align(x-right,
    circle(30, mode-solid, red),
    above-align(x-right, circle(50, mode-solid, green), circle(20, mode-solid, blue)))`],

["above-align-middle",
`  above-align(x-middle,
    circle(30, mode-solid, red),
    above-align(x-middle, circle(50, mode-solid, green), circle(20, mode-solid, blue)))`],

["beside-align-top",
`  beside-align(y-top,
    circle(30, mode-solid, red),
    beside-align(y-top, circle(50, mode-solid, green), circle(20, mode-solid, blue)))`],

["beside-align-bottom",
`  beside-align(y-bottom,
    circle(30, mode-solid, red),
    beside-align(y-bottom, circle(50, mode-solid, green), circle(20, mode-solid, blue)))`],

["beside-align-middle",
`  beside-align(y-center,
    circle(30, mode-solid, red),
    beside-align(y-center, circle(50, mode-solid, green), circle(20, mode-solid, blue)))`],


["solid-green-circle",
`  circle(20, mode-solid, green)`],

["outline-turquoise-rectangle",
`  rectangle(20, 30, mode-outline, turquoise)`],

["solid-translucent-red-rectangle",
`  rectangle(200, 300, mode-fade(10 / 255), red)`],

["outline-red-rectangle",
`  rectangle(200, 300, mode-outline, red)`],

["invisible-red-rectangle",
`  rectangle(200, 300, mode-fade(0), red)`],

["solid-red-triangle",
`  triangle(50, mode-solid, red)`],

["halfred-triangle",
`  triangle(50, mode-solid, color(255, 0, 0, 128 / 255))`],

["translucent-halfred-triangle",
`  triangle(50, mode-fade(128 / 255), color(255, 0, 0, 128 / 255))`],

["quarterred-triangle",
`  triangle(50, mode-solid, color(255, 0, 0, 64 / 255))`],

["blue-circle-center-scene",
`  place-image(circle(50, mode-solid, blue), 50, 50, empty-scene(100, 100))`],

["blue-circle-ur-corner-scene",
`  put-image(circle(50, mode-solid, blue), 100, 100, empty-scene(100, 100))`],

["howdy-yall",
` let aligned-text =
    overlay-align(x-middle, y-baseline,
      line(100, 0, red),
      beside-align(y-baseline, 
        overlay-align(x-middle, y-baseline, line(100, 0, red), text("Ĥowdy", 50, black)),
        overlay-align(x-middle, y-baseline, line(100, 0, green), text(" y'all", 10, blue)))):
    place-image(line(200, 0, purple), 0, image-baseline(aligned-text), frame(aligned-text))
  end`],

["framed-overlay-triangle",
` frame(
    overlay-align(x-pinhole, y-pinhole, 
      circle(3, mode-solid, black), 
      draw-pinhole(triangle(50, mode-outline, blue))))`],

["rotate-right-triangle-center",
` for fold(acc from empty-image, row from range(0, 3)):
    above(
      for fold(shadow acc from empty-image, col from range(0, 10)):
        beside(acc,
          overlay-align(x-pinhole, y-pinhole, 
            draw-pinhole(circle(50 / num-sqrt(2), mode-outline, black)), 
            draw-pinhole(rotate(((row * 10) + col) * 12,
                center-pinhole(triangle-sas(50, 90, 50, mode-outline, green))))))
      end,
      acc)
  end`],

["rotate-right-triangle-pinhole",
` for fold(acc from empty-image, row from range(0, 3)):
    above(
      for fold(shadow acc from empty-image, col from range(0, 10)):
        beside(acc,
          overlay-align(x-pinhole, y-pinhole, 
            draw-pinhole(circle(50 / num-sqrt(2), mode-outline, black)), 
            draw-pinhole(rotate(((row * 10) + col) * 12, triangle-sas(50, 90, 50, mode-outline, green)))))
      end,
      acc)
  end`],

["rotate-equilateral-triangle-pinhole",
` for fold(acc from empty-image, row from range(0, 3)):
    above(
      for fold(shadow acc from empty-image, col from range(0, 10)):
        beside(acc,
          overlay-align(x-pinhole, y-pinhole, 
            draw-pinhole(circle(50 / num-sqrt(3), mode-outline, black)), 
            draw-pinhole(rotate(((row * 10) + col) * 12, triangle(50, mode-outline, green)))))
      end,
      acc)
  end`],

["triangle-pinhole-center", 
` beside(
    overlay-align(x-pinhole, y-pinhole, 
      triangle(50, mode-outline, red),
      rotate(180, triangle(50, mode-outline, purple)))
    ,
    overlay(
      triangle(50, mode-outline, red),
      rotate(180, triangle(50, mode-outline, purple))))`],

["star-pinhole-center",
` beside(
    overlay-align(x-pinhole, y-pinhole, 
      star(50, mode-outline, red),
      rotate(180, star(50, mode-outline, purple)))
    ,
    overlay(
      star(50, mode-outline, red),
      rotate(180, star(50, mode-outline, purple))))`],

["red-black-ellipses",
`  overlay(ellipse(10, 10, mode-solid, red),
    overlay(ellipse(20, 20, mode-solid, black),
      overlay(ellipse(30, 30, mode-solid, red),
        overlay(ellipse(40, 40, mode-solid, black),
          overlay(ellipse(50, 50, mode-solid, red),
            ellipse(60, 60, mode-solid, black))))))`],

["centered-target",
`  place-image(
    overlay(ellipse(10, 10, mode-solid, white),
      overlay(ellipse(20, 20, mode-solid, black),
        overlay(ellipse(30, 30, mode-solid, white),
          overlay(ellipse(40, 40, mode-solid, black),
            overlay(ellipse(50, 50, mode-solid, white),
              ellipse(60, 60, mode-solid, black)))))),
    150, 100,
    rectangle(300, 200, mode-solid, black))`],


["australia-ish",
`let
flag2 =
  place-image(
    rotate(90,
      underlay-align(x-middle, y-center,
        rectangle(50, 450, mode-solid, white),
        underlay-align(x-middle, y-center,
          rotate(90, rectangle(50, 450, mode-solid, white)),
          underlay-align(x-middle, y-center,
            rotate(90, rectangle(30, 450, mode-solid, red)),
            rotate(180, rectangle(30, 450, mode-solid, red)))))),
    200, 100,
    place-image(
      rotate(65,
        underlay-align(x-middle, y-center,
          rectangle(15, 450, mode-solid, red),
          rotate(50, rectangle(15, 450, mode-solid, red)))),
      200, 100,
      place-image(
        rotate(65,
          underlay-align(x-middle, y-center,
            rectangle(40, 450, mode-solid, white),
            rotate(50, rectangle(40, 450, mode-solid, white)))),
        200, 100,
        rectangle(400, 200, mode-solid, navy)))):

place-image(flag2, 200, 100,
    place-image(star-polygon(30, 7, 3, mode-solid, white),
      650, 60,
      place-image(star-polygon(50, 7, 3, mode-solid, white),
        200, 300,
        place-image(star-polygon(40, 7, 3, mode-solid, white),
          500, 300,
          place-image(star-polygon(40, 7, 3, mode-solid, white),
            490, 220,
            rectangle(900, 400, mode-solid, navy))))))
end`],


  ];

  tests.forEach(function(t) {
    tester.testRunAndAllTestsPass(it, "image-equality-" + t[0], makeTest(t[0], t[1], process.env["BASE_URL"]) );
  });
});
/*
fun make-stars(n):
  ask:
    | 1 == n then: star(12, mode-solid, "purple")
    | otherwise: beside(star(12, mode-solid, "purple"), make-stars(n - 1))
  end
end
fun bar-graph(l1):
  ask:
    | l1 == empty then: circle(0, "outline", blue)
    | otherwise: above-align("left", make-stars(l1.first), bar-graph(l1.rest))
  end
end
t("bar-graph",
  bar-graph([list: 1, 3, 5, 3, 9, 5, 3, 4, 4, 3, 5, 2]))

*/
