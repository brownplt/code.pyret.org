provide {
  rocket: rocket,
  start: start
}
end
import error as E
import teachpack-util as T

base-url = T.get-base-url()
rocket = image-url(base-url + "/teachpacks/static/rocket.png")

fun draw(height):
  place-image(rocket, 50, 500 - height, rectangle(100, 500, "solid", "white"))
end
fun start(student-ticker):
  when (not(is-function(student-ticker))):
    raise(E.generic-type-mismatch(student-ticker, "Function"))
  end
  big-bang(0, link(
    on-tick(student-ticker),
      link(
        to-draw(draw),
        empty
    )))
end
