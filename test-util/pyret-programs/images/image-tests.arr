include image
include image-structs

check "Overlay equality":
  fun mk-image():
    overlay(circle(100, mode-solid, red), circle(50, mode-solid, red))
  end
  mk-image() is mk-image()
  mk-image() is underlay(circle(50, mode-solid, red), circle(100, mode-solid, red))
end

check "Polygons":
  triangle(4, mode-solid, red) satisfies is-image
  triangle(~4, mode-solid, red) satisfies is-image
  triangle(4, mode-solid, red, true) raises ""
  triangle(blue, mode-solid, red, true) raises ""

  right-triangle(45, 52, mode-solid, black) satisfies is-image
  right-triangle(~45, ~52, mode-solid, black) satisfies is-image
  right-triangle(blue, 44, mode-solid, black) raises ""
  right-triangle(4, 44, mode-solid, black, true) raises ""

  isosceles-triangle(4, 56, mode-solid, black) satisfies is-image
  isosceles-triangle(~4, ~56, mode-solid, black) satisfies is-image
  isosceles-triangle(red, 56, mode-solid, black) raises ""
  isosceles-triangle(4, 56, mode-solid, black, true) raises ""

  fun test-triangle-fun(f) block:
    f(4, 5, 6, mode-outline, black) satisfies is-image
    f(~4, ~5, ~6, mode-outline, black) satisfies is-image
    f(1, 2, 3, "", true) raises ""
    f(1, 2, 3, mode-outline, red, true) raises ""
  end
  triangles = [list:
    triangle-sss,
    triangle-ass,
    triangle-sas,
    triangle-ssa,
    triangle-aas,
    triangle-saa
  ]
  each(test-triangle-fun, triangles)

  square(44, mode-solid, red) satisfies is-image
  square(~44, mode-solid, red) satisfies is-image
  square(blue, mode-solid, green) raises ""
  square(44, mode-solid, green, true) raises ""

  rectangle(30, 50, mode-solid, blue) satisfies is-image
  rectangle(~30, ~50, mode-solid, blue) satisfies is-image
  rectangle(blue, 50, mode-solid, blue) raises ""
  rectangle(30, 50, mode-solid, blue, true) raises ""

  rhombus(40, 45, mode-solid, black) satisfies is-image
  rhombus(~40, ~45, mode-solid, black) satisfies is-image
  rhombus(blue, 45, mode-solid, black) raises ""
  rhombus(40, 45, mode-solid, black, true) raises ""

  star(33, mode-solid, blue) satisfies is-image
  star(~33, mode-solid, blue) satisfies is-image
  star({}, mode-solid, blue) raises ""
  star(33, mode-solid, blue, true) raises ""

  radial-star(33, 10, 50, mode-solid, blue) satisfies is-image
  radial-star(33, ~10, ~50, mode-solid, blue) satisfies is-image
  radial-star(blue, 10, 50, mode-solid, blue) raises ""
  radial-star(33, 10, 50, mode-solid, blue, true) raises ""
  radial-star(1, 10, 50, mode-solid, blue) raises ""

  star-sized(33, 10, 50, mode-solid, blue) satisfies is-image
  star-sized(33, ~10, ~50, mode-solid, blue) satisfies is-image
  star-sized(blue, 10, 50, mode-solid, blue) raises ""
  star-sized(33, 10, 50, mode-solid, blue, true) raises ""
  star-sized(1, 10, 50, mode-solid, blue) raises ""

  star-polygon(43, 3, 5, mode-solid, blue) satisfies is-image
  star-polygon(~43, 3, 5, mode-solid, blue) satisfies is-image
  star-polygon(blue, 3, 5, mode-solid, blue) raises ""
  star-polygon(43, 3, 5, mode-solid, blue, {}) raises ""
  star-polygon(43, 2, 5, mode-solid, blue) raises ""
  star-polygon(43, 3, 0, mode-solid, blue) raises ""

  regular-polygon(45, 10, mode-solid, blue) satisfies is-image
  regular-polygon(45, 10, mode-solid, blue) satisfies is-image
  regular-polygon(true, 10, mode-solid, blue) raises ""
  regular-polygon(45, 10, mode-solid, blue, 4) raises ""
  regular-polygon(45, 2, mode-solid, blue) raises ""

  empty-scene(20, 50) satisfies is-image
end

check "color-lists":
  color-list-to-image([list: red, green, blue], 2, 2) raises ""
  color-list-to-image([list: red, green, blue, black], 2, 2) satisfies is-image
end

check "properties":
  
  image-width(ellipse(30, 40, mode-solid, orange)) is 30
  image-height(ellipse(30, 40, mode-solid, orange)) is 40


  even-overlay = overlay(circle(20, mode-solid, orange), circle(20, mode-solid, purple))
  image-height(even-overlay) is 40
  image-width(even-overlay) is 40

  indigo-text = text-font("Goodbye", 48, indigo, "Helvetica", ff-modern, fs-normal, fw-normal, false)
  image-height(indigo-text) is%(within-abs(5)) 50
  image-baseline(indigo-text) is%(within-abs(2)) 43

  image-baseline(rectangle(100, 100, mode-solid, black)) is 100

  image-height(rectangle(100, 100, mode-solid, black)) is 100
end

check "predicates":
  mode-solid satisfies is-FillMode
  mode-outline satisfies is-FillMode
  "checkered" violates is-FillMode

  0 violates is-step-count
  1 satisfies is-step-count

  2 violates is-side-count
  3 satisfies is-side-count

  -290 violates is-angle
  290 satisfies is-angle
  0 satisfies is-angle
  360 violates is-angle
  359 satisfies is-angle

  "up-top" violates is-XPlace
  x-left satisfies is-XPlace
  x-right satisfies is-XPlace
  x-middle satisfies is-XPlace

  "centered" violates is-YPlace
  y-top satisfies is-YPlace
  y-bottom satisfies is-YPlace
  y-center satisfies is-YPlace
  y-baseline satisfies is-YPlace

  pink satisfies is-Color
  "puke" violates is-Color

end

