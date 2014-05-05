provide {
  rocket: rocket,
  start: start
}
end
import error as E
import teachpack-util as T

base-url = T.get-base-url()
rocket = image-url(base-url + "/teachpacks/static/rocket.png")

fun our-on-tick(ticks):
  ticks + 1
end
fun start(rocket-height):
  fun draw(ticks):
    height = rocket-height(ticks)
    place-image(rocket, 50, 500 - height, rectangle(100, 500, "solid", "white"))
  end
  when (not(is-function(rocket-height))):
    raise(E.generic-type-mismatch(rocket-height, "Function"))
  end
  big-bang(0, link(
    on-tick-n(our-on-tick, 1000),
      link(
        to-draw(draw),
        empty
    )))
end
