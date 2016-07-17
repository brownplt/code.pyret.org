include image

check "Overlay equality":
  fun mk-image():
    overlay(circle(100, 'solid', 'red'), circle(50, 'solid', 'red'))
  end
  mk-image() is mk-image()
  mk-image() is underlay(circle(50, 'solid', 'red'), circle(100, 'solid', 'red'))
end

check "Polygons":
  triangle(4, "solid", "red") satisfies is-image
  triangle(~4, "solid", "red") satisfies is-image
  triangle(4, "solid", "red", true) raises ""
  triangle("blue", "solid", "red", true) raises ""

  right-triangle(45, 52, "solid", "black") satisfies is-image
  right-triangle(~45, ~52, "solid", "black") satisfies is-image
  right-triangle("blue", 44, "solid", "black") raises ""
  right-triangle(4, 44, "solid", "black", true) raises ""

  isosceles-triangle(4, 56, "solid", "black") satisfies is-image
  isosceles-triangle(~4, ~56, "solid", "black") satisfies is-image
  isosceles-triangle("red", 56, "solid", "black") raises ""
  isosceles-triangle(4, 56, "solid", "black", true) raises ""

  fun test-triangle-fun(f) block:
    f(4, 5, 6, "outline", "black") satisfies is-image
    f(~4, ~5, ~6, "outline", "black") satisfies is-image
    f(1, 2, 3, "", true) raises ""
    f(1, 2, 3, "outline", "red", true) raises ""
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

  square(44, "solid", "red") satisfies is-image
  square(~44, "solid", "red") satisfies is-image
  square("blue", "solid", "green") raises ""
  square(44, "solid", "green", true) raises ""

  rectangle(30, 50, "solid", "blue") satisfies is-image
  rectangle(~30, ~50, "solid", "blue") satisfies is-image
  rectangle("blue", 50, "solid", "blue") raises ""
  rectangle(30, 50, "solid", "blue", true) raises ""

  rhombus(40, 45, "solid", "black") satisfies is-image
  rhombus(~40, ~45, "solid", "black") satisfies is-image
  rhombus("blue", 45, "solid", "black") raises ""
  rhombus(40, 45, "solid", "black", true) raises ""

  star(33, "solid", "blue") satisfies is-image
  star(~33, "solid", "blue") satisfies is-image
  star({}, "solid", "blue") raises ""
  star(33, "solid", "blue", true) raises ""

  radial-star(33, 10, 50, "solid", "blue") satisfies is-image
  radial-star(33, ~10, ~50, "solid", "blue") satisfies is-image
  radial-star("blue", 10, 50, "solid", "blue") raises ""
  radial-star(33, 10, 50, "solid", "blue", true) raises ""

  star-sized(33, 10, 50, "solid", "blue") satisfies is-image
  star-sized(33, ~10, ~50, "solid", "blue") satisfies is-image
  star-sized("blue", 10, 50, "solid", "blue") raises ""
  star-sized(33, 10, 50, "solid", "blue", true) raises ""

  star-polygon(43, 2, 5, "solid", "blue") satisfies is-image
  star-polygon(~43, 2, 5, "solid", "blue") satisfies is-image
  star-polygon("blue", 2, 5, "solid", "blue") raises ""
  star-polygon(43, 2, 5, "solid", "blue", {}) raises ""

  regular-polygon(45, 10, "solid", "blue") satisfies is-image
  regular-polygon(45, 10, "solid", "blue") satisfies is-image
  regular-polygon(true, 10, "solid", "blue") raises ""
  regular-polygon(45, 10, "solid", "blue", 4) raises ""

  empty-scene(20, 50) satisfies is-image
end

check "properties":
  
  image-width(ellipse(30, 40, "solid", "orange")) is 30
  image-height(ellipse(30, 40, "solid", "orange")) is 40


  even-overlay = overlay(circle(20, "solid", "orange"), circle(20, "solid", "purple"))
  image-height(even-overlay) is 40
  image-width(even-overlay) is 40

  indigo-text = text-font("Goodbye", 48, "indigo", "Helvetica", "modern", "normal", "normal", false)
  image-height(indigo-text) is%(within-abs(5)) 50
  image-baseline(indigo-text) is 0

  image-baseline(rectangle(100, 100, "solid", "black")) is 100

  image-height(rectangle(100, 100, "solid", "black")) is 100
end

check "predicates":
  "solid" satisfies is-mode
  "outline" satisfies is-mode
  "checkered" violates is-mode

  0 violates is-step-count
  1 satisfies is-step-count

  2 violates is-side-count
  3 satisfies is-side-count

  -290 violates is-angle
  290 satisfies is-angle
  0 satisfies is-angle
  360 violates is-angle
  359 satisfies is-angle

  "up-top" violates is-x-place
  "left" satisfies is-x-place
  "right" satisfies is-x-place
  "center" satisfies is-x-place
  "middle" satisfies is-x-place

  "centered" violates is-y-place
  "top" satisfies is-y-place
  "bottom" satisfies is-y-place
  "center" satisfies is-y-place
  "middle" satisfies is-y-place
  "baseline" satisfies is-y-place

  "pink" satisfies is-image-color
  "puke" violates is-image-color

end

