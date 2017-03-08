import image as I
import world as W

var LAHTO = 0

var UFO = I.overlay-xy(I.ellipse(120, 40, "solid", "violet"),
                     30, -25,
                     I.circle(30, "outline", "black"))

var TAUSTA = I.empty-scene(300, 500)

fun piirra-ufo(y):
  I.place-image(UFO, 150, y, TAUSTA)
end

fun pysahdy-p(y):
  y > 465
end

fun siirra-ufo(y):
  y + 3
end

W.big-bang(LAHTO, [list:
  W.to-draw(piirra-ufo),
  W.on-tick(siirra-ufo),
  W.stop-when(pysahdy-p)
])
