include image
include image-structs
include string-dict
include either

tests = make-mutable-string-dict()

fun i(name):
  image-url(BASE_URL + "/test-images/" + name + ".png")
end

fun add-test-and-print(name, image) block:
  tests.set-now(name, image)
  print(name)
  image
end
fun add-test(name, image) block:
  tests.set-now(name, image)
  nothing
end

# Switch t to add-test-and-print if you want to see all the images, as well.
# The default just prints the check results
t = add-test-and-print

t("above-align-left",
  above-align("left",
    circle(30, "solid", "red"),
    above-align("left", circle(50, "solid", "green"), circle(20, "solid", "blue"))))

t("above-align-right",
  above-align("right",
    circle(30, "solid", "red"),
    above-align("right", circle(50, "solid", "green"), circle(20, "solid", "blue"))))

t("above-align-middle",
  above-align("middle",
    circle(30, "solid", "red"),
    above-align("middle", circle(50, "solid", "green"), circle(20, "solid", "blue"))))

t("beside-align-top",
  beside-align("top",
    circle(30, "solid", "red"),
    beside-align("top", circle(50, "solid", "green"), circle(20, "solid", "blue"))))

t("beside-align-bottom",
  beside-align("bottom",
    circle(30, "solid", "red"),
    beside-align("bottom", circle(50, "solid", "green"), circle(20, "solid", "blue"))))

t("beside-align-middle",
  beside-align("middle",
    circle(30, "solid", "red"),
    beside-align("middle", circle(50, "solid", "green"), circle(20, "solid", "blue"))))


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

t("solid-green-circle",
  circle(20, "solid", "green"))

t("outline-turquoise-rectangle",
  rectangle(20, 30, "outline", "turquoise"))

t("solid-translucent-red-rectangle",
  rectangle(200, 300, 10, "red"))

t("outline-red-rectangle",
  rectangle(200, 300, "outline", "red"))

t("invisible-red-rectangle",
  rectangle(200, 300, 0, "red"))

halfred = color(255, 0, 0, 128)
quarterred = color(255, 0, 0, 64)
t("solid-red-triangle",
  triangle(50, "solid", "red"))
t("halfred-triangle",
  triangle(50, "solid", halfred))
t("translucent-halfred-triangle",
  triangle(50, 128, halfred))
t("quarterred-triangle",
  triangle(50, "solid", quarterred))

t("blue-circle-center-scene",
  place-image(circle(50, "solid", "blue"), 50, 50, empty-scene(100, 100)))

t("blue-circle-ur-corner-scene",
  put-image(circle(50, "solid", "blue"), 100, 100, empty-scene(100, 100)))


#| NOTE(joe): Images quite inconsistent across browsers

t("hello-20-black",
  text("hello world", 20, "black"))
t("hello-30-times-5-purple",
  text(string-repeat("hello word", 5), 30, "purple"))
t("hello-40-red",
  text("hello world", 40, "red"))

t("purple-gill-sans-24-bold",
  text-font("Goodbye", 24, "purple", "Gill Sans", "swiss", "normal", "bold", false))
t("green-gill-sans-24-light",
  text-font("Goodbye", 24, "green", "Gill Sans", "swiss", "normal", "light", false))

t("indigo-helvetica-italic",
  text-font("Goodbye", 48, "indigo", "Helvetica", "modern", "italic", "normal", false))

t("indigo-helvetica-normal",
  text-font("Goodbye", 48, "indigo", "Helvetica", "modern", "normal", "normal", false))

t("blue-helvetica-roman-underline",
  text-font("low-hanging glyphs", 36, blue, "Times", "roman", "normal", "bold", true))

|#



t("red-black-ellipses",
  overlay(ellipse(10, 10, "solid", "red"),
    overlay(ellipse(20, 20, "solid", "black"),
      overlay(ellipse(30, 30, "solid", "red"),
        overlay(ellipse(40, 40, "solid", "black"),
          overlay(ellipse(50, 50, "solid", "red"),
            ellipse(60, 60, "solid", "black")))))))

t("centered-target",
  place-image(
    overlay(ellipse(10, 10, "solid", "white"),
      overlay(ellipse(20, 20, "solid", "black"),
        overlay(ellipse(30, 30, "solid", "white"),
          overlay(ellipse(40, 40, "solid", "black"),
            overlay(ellipse(50, 50, "solid", "white"),
              ellipse(60, 60, "solid", "black")))))),
    150, 100,
    rectangle(300, 200, "solid", "black")))

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
        rectangle(400, 200, "solid", "navy"))))

t("australia-ish",
  place-image(flag2, 200, 100,
    place-image(star-polygon(30, 7, 3, "solid", "white"),
      650, 60,
      place-image(star-polygon(50, 7, 3, "solid", "white"),
        200, 300,
        place-image(star-polygon(40, 7, 3, "solid", "white"),
          500, 300,
          place-image(star-polygon(40, 7, 3, "solid", "white"),
            490, 220,
            rectangle(900, 400, "solid", "navy")))))))

check:
  fun within-n-badness(n):
    lam(img1, img2):
      diff = images-difference(img1, img2)
      cases(Either) diff block:
        | left(diff-error) =>
          "no error" is diff-error
          false
        | right(badness) =>
          when not(badness <= n):
            badness satisfies (_ <= n)
          end
          badness <= n
      end
    end
  end

  for each(k from tests.keys-list-now()):
    i1 = i(k)
    i2 = tests.get-value-now(k)
    i1 is%(within-n-badness(26)) i2
  end
end

check "equivalences":
  overlay(circle(20, "solid", color(50, 50, 255, 255)),
          square(40, "solid", color(100, 100, 255, 255)))
    is
    overlay(circle(20, "solid", color(50, 50, 255, 255)),
            regular-polygon(40, 4, "solid", color(100, 100, 255, 255)))


  fun bulls-eye(shadow i, color1, color2):
    ask:
      | i <= 0 then: empty-image
      | otherwise:
        overlay(bulls-eye(i - 1, color2, color1),
                circle(i * 10, "solid", color1))
    end
  end
  bulls-eye(0, "blue", "red") is empty-image
  bulls-eye(1, "blue", "red") is circle(10, "solid", "blue")
  bulls-eye(2, "blue", "red") is
    overlay(circle(10, "solid", "red"), circle(20, "solid", "blue"))

  c = circle(15, "solid", "red")
  for each(shadow i from range(0, 20)):
    rotate(i * 18, c) is c
  end

  s = square(15, "solid", "red")
  for each(shadow i from range(0, 3)):
    rotate(i * 90, c) is c
  end
  
  el = ellipse(30, 40, "solid", "red")
  rotate(180, el) is el

  circle(50, 90, "orange") is ellipse(100, 100, 90, "orange")

  regular-polygon(40, 4, "solid", "black") is rectangle(40, 40, "solid", "black")

  scale(1/2, square(100, "solid", "blue")) is square(50, "solid", "blue")
  scale(1/3, square(100, "solid", "blue")) is-not square(50, "solid", "blue")

  image-url("http://www.bootstrapworld.org/images/icon.gif") is
    image-url("http://www.bootstrapworld.org/images/icon.gif")

  image-url("http://www.bootstrapworld.org/images/icon.gif") is-not
    rectangle(150, 150, "solid", "pink")

  image-url("http://www.bootstrapworld.org/images/icon.gif") is-not
    image-url("http://www.bootstrapworld.org/images/icon.png")

  empty-scene(20, 50) is empty-scene(20, 50)

  triangle(50, "solid", "blue") is-not triangle(50, "outline", "blue")

  c2 = circle(50, "solid", "blue")
  color-list-to-bitmap(image-to-color-list(c2), 100, 100) is c2
  # TODO(joe): pinhole args don't seem to matter
  color-list-to-image(image-to-color-list(c2), 100, 100, 437, 952) is c2

end


# NOTE(joe): Below here are @schanzer's wescheme tests, which can be ported
# over entirely


#|

(printf "images.rkt\n")


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; IMAGE-URL & VIDEO-URL
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"importing images and video"
(image-url "http://www.bootstrapworld.org/images/icon.png")
(open-image-url "http://www.bootstrapworld.org/images/icon.png")

;(video-url "http://www.quirksmode.org/html5/videos/big_buck_bunny.mp4")
;(overlay (circle 20 "solid" "red")
;  (video-url "http://www.quirksmode.org/html5/videos/big_buck_bunny.mp4"))
;(rotate 45
;  (video-url "http://www.quirksmode.org/html5/videos/big_buck_bunny.mp4"))




;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; OVERLAY/XY
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"should be some overlay/xys"
(overlay/xy (rectangle 20 20 "outline" "black")
            20 0
            (rectangle 20 20 "outline" "black"))
(overlay/xy (rectangle 20 20 "solid" "red")
            20 20
            (rectangle 20 20 "solid" "black"))
(overlay/xy (rectangle 20 20 "solid" "red")
            -20 -20
            (rectangle 20 20 "solid" "black"))
(overlay/xy
 (overlay/xy (ellipse 40 40 "outline" "black")
             10
             15
             (ellipse 10 10 "solid" "forestgreen"))
 20
 15
 (ellipse 10 10 "solid" "forestgreen"))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; OVERLAY/ALIGN
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"some examples of overlay/align"
(overlay/align "middle" "middle"
               (ellipse 60 30 "solid" "purple")
               (rectangle 30 60 "solid" "orange"))
(overlay/align "right" "top"
               (ellipse 60 30 "solid" "purple")
               (rectangle 30 60 "solid" "orange"))
(overlay/align "left" "bottom"
               (ellipse 60 30 "solid" "purple")
               (rectangle 30 60 "solid" "orange"))

(overlay/align "right" "bottom"
               (rectangle 20 20 "solid" "silver")
               (rectangle 30 30 "solid" "seagreen")
               (rectangle 40 40 "solid" "silver")
               (rectangle 50 50 "solid" "seagreen"))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; UNDERLAY
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"some underlays"
(underlay (circle 20 'solid 'green)
          (rectangle 10 20 'solid 'blue))

(underlay (ellipse 10 60 "solid" "red")
          (ellipse 20 50 "solid" "black")
          (ellipse 30 40 "solid" "red")
          (ellipse 40 30 "solid" "black")
          (ellipse 50 20 "solid" "red")
          (ellipse 60 10 "solid" "black"))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; UNDERLAY/XY & UNDERLAY/ALIGN
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"examples of underlay and underlay/align"
(underlay/xy (circle 20 'solid 'green)
             30 10
             (rectangle 10 20 'solid 'blue))



;; color list
"the following should be a blue circle, but by using color-list->image"
(let ([circle-color-list (image->color-list (circle 20 'solid 'blue))])
  ;; fixme: add tests for number of colors
  (color-list->image circle-color-list 40 40 0 0))




(underlay/align "middle" "middle"
                (ellipse 60 30 "solid" "purple")
                (rectangle 30 60 "solid" "orange"))
(underlay/align "right" "top"
                (ellipse 60 30 "solid" "purple")
                (rectangle 30 60 "solid" "orange"))
(underlay/align "left" "bottom"
                (ellipse 60 30 "solid" "purple")
                (rectangle 30 60 "solid" "orange"))

(underlay/align "right" "bottom"
                (rectangle 50 50 "solid" "silver")
                (rectangle 40 40 "solid" "seagreen")
                (rectangle 30 30 "solid" "silver")
                (rectangle 20 20 "solid" "seagreen"))

"This is issue 40 https://github.com/dyoo/WeScheme/issues/40"
(underlay/align "left" "middle"
                (rectangle 30 60 "solid" "orange")
                (ellipse 60 30 "solid" "purple"))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; BESIDE & BESIDE/ALIGN
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"examples of beside and beside/align"
(beside (ellipse 20 70 "solid" "gray")
        (ellipse 20 50 "solid" "darkgray")
        (ellipse 20 30 "solid" "dimgray")
        (ellipse 20 10 "solid" "black"))

(beside/align "bottom"
              (ellipse 20 70 "solid" "lightsteelblue")
              (ellipse 20 50 "solid" "mediumslateblue")
              (ellipse 20 30 "solid" "slateblue")
              (ellipse 20 10 "solid" "navy"))

(beside/align "top"
              (ellipse 20 70 "solid" "mediumorchid")
              (ellipse 20 50 "solid" "darkorchid")
              (ellipse 20 30 "solid" "purple")
              (ellipse 20 10 "solid" "indigo"))

"align these text images on their baselines"
(beside/align "baseline"
              (text "ijy" 18 "black")
              (text "ijy" 24 "black"))               


"issue 25 https://github.com/dyoo/WeScheme/issues/25"
(beside/align "top"
              (rectangle 20 100 "solid" "black")
              (rectangle 20 120 "solid" "black")
              (rectangle 20 80 "solid" "black"))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; ABOVE & ABOVE/ALIGN
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"should be some examples of above and above/align"
(above (ellipse 70 20 "solid" "gray")
       (ellipse 50 20 "solid" "darkgray")
       (ellipse 30 20 "solid" "dimgray")
       (ellipse 10 20 "solid" "black"))

(above/align "right"
             (ellipse 70 20 "solid" "gold")
             (ellipse 50 20 "solid" "goldenrod")
             (ellipse 30 20 "solid" "darkgoldenrod")
             (ellipse 10 20 "solid" "sienna"))
(above/align "left"
             (ellipse 70 20 "solid" "yellowgreen")
             (ellipse 50 20 "solid" "olivedrab")
             (ellipse 30 20 "solid" "darkolivegreen")
             (ellipse 10 20 "solid" "darkgreen"))



;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; PLACE-IMAGE/ALIGN
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"should be right in the center"
(place-image/align (circle 16 "solid" "yellow")
                   32 32 "center" "center"
                   (rectangle 64 64 "solid" "goldenrod"))

"should be at the bottom-right corner"
(place-image/align (circle 16 "solid" "yellow")
                   32 32 "left" "top"
                   (rectangle 64 64 "solid" "goldenrod"))

"should be at the upper-left corner"
(place-image/align (circle 16 "solid" "yellow")
                   32 32 "right" "bottom"
                   (rectangle 64 64 "solid" "goldenrod"))  

"test 'beside' with scenes -- from the DrRacket documentation"
(beside (place-image/align (circle 8 "solid" "tomato")
                           0 0 "center" "center"
                           (rectangle 32 32 "outline" "black"))
        (place-image/align (circle 8 "solid" "tomato")
                           8 8 "center" "center"
                           (rectangle 32 32 "outline" "black"))
        (place-image/align (circle 8 "solid" "tomato")
                           16 16 "center" "center"
                           (rectangle 32 32 "outline" "black"))
        (place-image/align (circle 8 "solid" "tomato")
                           24 24 "center" "center"
                           (rectangle 32 32 "outline" "black"))
        (place-image/align (circle 8 "solid" "tomato")
                           32 32 "center" "center"
                           (rectangle 32 32 "outline" "black")))   

"some overlay and place-image stress tests"                           
(define flag2
  (place-image
   (rotate 90
              (underlay/align
               "center" "center"
               (rectangle 50 450 "solid" "white")
               (rotate 90
                       (rectangle 50 450 "solid" "white"))
               (rotate 90 
                       (rectangle 30 450 "solid" "red"))
               (rotate 180
                       (rectangle 30 450 "solid" "red"))))
           
   200 100
   (place-image
    (rotate 65
           (underlay/align
            "center" "center"
            (rectangle 15 450 "solid" "red")       
            (rotate 50
                    (rectangle 15 450 "solid" "red"))))
   200 100
    (place-image
     (rotate 65
             (underlay/align
             "center" "center"
             (rectangle 40 450 "solid" "white")
             (rotate 50
                     (rectangle 40 450 "solid" "white"))))
     200 100
    (rectangle 400 200 "solid" "navy")))))
   

(define Australia2
  (place-image
   flag2
   200 100
   (place-image
    (star-polygon 30 7 3 "solid" "white")
   650 60
   (place-image 
    (star-polygon 50 7 3 "solid" "white")
   200 300
    (place-image 
    (star-polygon 40 7 3 "solid" "white")
   60 20
     (place-image 
    (star-polygon 40 7 3 "solid" "white")
   68 124
   (rectangle 900 400 "solid" "navy")))))))
   flag2
Australia2


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; TRIANGLE, RIGHT TRIANGLE & ISOSCELES-TRIANGLE
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"Three triangles of various sizes and fills"
(triangle 36 "solid" "darkslategray")
(triangle  4 "solid" "purple")
(triangle 30 "outline" "cornflowerblue")

"Triangles side by side"
(beside (triangle 36 "solid" "darkslategray")
        (triangle 30 "solid" "cornflowerblue"))

"Triangles above."
(above (triangle 36 "solid" "darkslategray")
       (triangle 30 "solid" "cornflowerblue"))

"Three right triangles of various sizes and fills"
(right-triangle 36 48 "solid" "darkslategray")
(right-triangle  4 60 "solid" "purple")
(right-triangle 30 40 "solid" "cornflowerblue")

"Three isosceles triangles of various sizes and fills"

(isosceles-triangle 60 30 "solid" "aquamarine")
(isosceles-triangle 200 170 "outline" "seagreen")
(isosceles-triangle 60 330 "solid" "lightseagreen")

"Trying ASA triangle (30 40 60)"
(triangle/asa 30 40 60 "solid" "blue")

"Trying AAS triangle (30 60 40)"
(triangle/aas 30 60 40 "outline" "green")

"Trying SAA triangle (100 30 90)"
(triangle/saa 100 30 90 "solid" "red")

"Trying SSA triangle (60 60 40)"
(triangle/ass 60 60 40 "outline" "turquoise")

"Trying ASS triangle (60 80 90)"
(triangle/ass 60 80 90 "solid" "maroon")

"Trying SSS triangle (60 60 60)"
(triangle/sss 60 60 60 "outline" "red")
   
"Trying SAS triangle (60 30 60)"
(triangle/sas 60 30 60 "solid" "brown")

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; STAR, RADIAL-STAR & STAR-POLYGON
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"old star implementation"

(star 5  8  4 "solid"   "darkslategray")
(star 5 30 15 "outline" "black")
(star 5 20 10 "solid"   "red")

"new star implementation"
(star 8 "solid"    "darkslategray")
(star 30 "outline" "black")
(star 20 "solid"   "red")

"radial star"
(radial-star 8 8 64 "solid" "darkslategray")
(radial-star 32 30 40 "outline" "black")
(radial-star 5 20 40 "solid" "red")

"star-polygon"
(star-polygon 40 5 2 "solid" "seagreen")
(star-polygon 40 7 3 "outline" "darkred")
(star-polygon 20 10 3 "solid" "cornflowerblue")
"should look like a pentagon"
(star-polygon 20 5 1 "solid" "darkblue")

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; SQUARE
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"Three squares of various sizes and fills"
(square 60 "outline" "black")
(square 200 "solid" "seagreen")
(square 100 "outline" "blue")

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; RHOMBUS 
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"Three rhombuses of various sizes and fills"
(rhombus 40 45 "solid" "magenta")
(rhombus 100 200 "solid" "orange")
(rhombus 80 330 "outline" "seagreen")

"rhombuses beside each other"
(beside (rhombus 40 45 "solid" "magenta")
        (rhombus 100 200 "solid" "orange")
        (rhombus 80 330 "outline" "seagreen"))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; REGULAR-POLYGON
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"Some regular polygons..."
"A triangle of side-length 20: should be 20x17"
(regular-polygon 20 3 "solid" "purple")
"A square of side-length 40: should be 40x40"
(regular-polygon 40 4 "solid" "aquamarine")
"A pentagon of side-length 30: should be 49x46"
(regular-polygon 30 5 "solid" "pink")
"A hexagon of side-length 20: should be 40x35"
(regular-polygon 20 6 "solid" "gold")
"A septagon of side-length 40: should be 90x88"
(regular-polygon 40 7 "solid" "goldenrod")
"An octagon of side-length 30: should be 72x72"
(regular-polygon 30 8 "solid" "darkgoldenrod")
"A nonagon of side-length 20: should be 58x57"
(regular-polygon 20 9 "solid" "sienna")

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; POLYGON
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"Some polygons defined with posns..."
(polygon (list (make-posn 0 0)
                (make-posn -10 20)
                (make-posn 60 0)
                (make-posn -10 -20))
          "solid"
          "burlywood")
          
(polygon (list (make-posn 0 0)
                 (make-posn 0 40)
                 (make-posn 20 40)
                 (make-posn 20 60)
                 (make-posn 40 60)
                 (make-posn 40 20)
                 (make-posn 20 20)
                 (make-posn 20 0))
           "solid"
           "plum")

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; ROTATE
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"Three images at 30, 60, 90 degree rotation:"
(rotate 30 (image-url "http://www.bootstrapworld.org/images/icon.png"))
(rotate 60 (image-url "http://www.bootstrapworld.org/images/icon.png"))
(rotate 90 (image-url "http://www.bootstrapworld.org/images/icon.png"))

"Rotated, huge image"
(rotate 30 (scale 3 (image-url "http://www.bootstrapworld.org/images/icon.png")))

"From the Racket documentation:"
(rotate 45 (ellipse 60 20 "solid" "olivedrab"))
(rotate 5 (rectangle 50 50 "outline" "black"))
"unrotated T"
(beside/align
         "center"
         (rectangle 40 20 "solid" "darkseagreen")
         (rectangle 20 100 "solid" "darkseagreen"))
"rotate 45 degrees"
(rotate 45
        (beside/align
         "center"
         (rectangle 40 20 "solid" "darkseagreen")
         (rectangle 20 100 "solid" "darkseagreen")))

(beside
 (rotate 30 (square 50 "solid" "red"))
 (flip-horizontal
  (rotate 30 (square 50 "solid" "blue"))))

"A solid blue triangle, rotated 30 degrees. Should be flush left"
(rotate 30 (triangle 100 "solid" "blue"))

"Rotation should preserve fractional pixels"
(define img2 (rotate 45 (square 40 "outline" "black")))
(define both (beside img2 img2))
(check-expect (image-width img2) 57)
(check-expect (image-width both) 113)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; SCALE & SCALE/XY
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;       
"scaling small and large"
(scale 1/2 (image-url "http://www.bootstrapworld.org/images/icon.png"))
(scale 2 (image-url "http://www.bootstrapworld.org/images/icon.png"))

(scale/xy 1 2 (image-url "http://www.bootstrapworld.org/images/icon.png"))
(scale/xy 2 1 (image-url "http://www.bootstrapworld.org/images/icon.png"))

"This should be the normal image"
(scale/xy 1 1 (image-url "http://www.bootstrapworld.org/images/icon.png"))

"From the Racket documentation: two identical ellipses, and a circle"
(scale 2 (ellipse 20 30 "solid" "blue"))
(ellipse 40 60 "solid" "blue")
(scale/xy  3
           2
           (ellipse 20 30 "solid" "blue"))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; FRAME AND CROP
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;       
"frame and crop examples from DrRacket documentation"
(frame (ellipse 20 20 "outline" "black"))

(beside
 (ellipse 20 70 "solid" "lightsteelblue")
 (frame (ellipse 20 50 "solid" "mediumslateblue"))
 (ellipse 20 30 "solid" "slateblue")
 (ellipse 20 10 "solid" "navy"))

(crop 0 0 40 40 (circle 40 "solid" "chocolate"))
(crop 40 60 40 60 (ellipse 80 120 "solid" "dodgerblue"))
(above
 (beside (crop 40 40 40 40 (circle 40 "solid" "palevioletred"))
         (crop 0 40 40 40 (circle 40 "solid" "lightcoral")))
 (beside (crop 40 0 40 40 (circle 40 "solid" "lightcoral"))
         (crop 0 0 40 40 (circle 40 "solid" "palevioletred"))))

"should be a quarter of a circle, inscribed in a square"
(place-image
 (crop 0 0 20 20 (circle 20 "solid" "Magenta"))
 10 10
 (rectangle 40 40 "solid" "blue"))
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; LINE, ADD-LINE & SCENE+LINE
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"Three tests for line"
(line 30 30 "black")

(line -30 20 "red")

(line 30 -20 "red")

"Three tests for add-line"
(add-line (ellipse 40 40 "outline" "maroon")
          0 40 40 0 "maroon")

(add-line (rectangle 40 40 "solid" "gray")
          -10 50 50 -10 "maroon")

(add-line
 (rectangle 100 100 "solid" "darkolivegreen")
 25 25 100 100
 "goldenrod")

"Three tests for scene+line: should be identical to above, but cropped around base image"
(scene+line (ellipse 40 40 "outline" "maroon")
            0 40 40 0 "maroon")

(scene+line (rectangle 40 40 "solid" "gray")
            -10 50 50 -10 "maroon")

(scene+line
 (rectangle 100 100 "solid" "darkolivegreen")
 25 25 100 100
 "goldenrod")

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; FLIP-VERTICAL & FLIP-HORIZONTAL
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
"a red triangle, a blue one flippled horizontally and a green one flippled vertically"
(right-triangle 30 40 "solid" "red")
(flip-horizontal (right-triangle 30 40 "solid" "blue"))
(flip-vertical (right-triangle 30 40 "solid" "green"))

"those three triangles beside each other"
(beside (right-triangle 30 40 "solid" "red")
        (flip-horizontal (right-triangle 30 40 "solid" "blue"))
        (flip-vertical (right-triangle 30 40 "solid" "green")))



"one image flipped vertically, and one flipped horizontally"
(flip-vertical (image-url "http://www.bootstrapworld.org/images/icon.png"))
(flip-horizontal (image-url "http://www.bootstrapworld.org/images/icon.png"))

"BESIDE: reference image"
(beside (square 20 "solid" (make-color  50  50 255))
        (square 34 "solid" (make-color 150 150 255)))

"flip the second one horizontally"          
(beside (square 20 "solid" (make-color  50  50 255))
        (flip-horizontal (square 34 "solid" (make-color 150 150 255))))

"flip the second one vertically"          
(beside (square 20 "solid" (make-color  50  50 255))
        (flip-vertical (square 34 "solid" (make-color 150 150 255))))

"flip the first one horizontally"          
(beside (flip-horizontal (square 20 "solid" (make-color  50  50 255)))
        (square 34 "solid" (make-color 150 150 255)))

"flip the first one vertically"          
(beside (flip-vertical (square 20 "solid" (make-color  50  50 255)))
        (square 34 "solid" (make-color 150 150 255)))

"ABOVE: reference image"
(above (square 20 "solid" (make-color  50  50 255))
       (square 34 "solid" (make-color 150 150 255)))

"flip the second one horizontally"          
(above (square 20 "solid" (make-color  50  50 255))
       (flip-horizontal (square 34 "solid" (make-color 150 150 255))))

"flip the second one vertically"          
(above (square 20 "solid" (make-color  50  50 255))
       (flip-vertical (square 34 "solid" (make-color 150 150 255))))

"flip the first one horizontally"          
(above (flip-horizontal (square 20 "solid" (make-color  50  50 255)))
       (square 34 "solid" (make-color 150 150 255)))

"flip the first one vertically"          
(above (flip-vertical (square 20 "solid" (make-color  50  50 255)))
       (square 34 "solid" (make-color 150 150 255)))
       |#
