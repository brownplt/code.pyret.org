provide {
  rocket: rocket,
  start: start
}
end
import error as E

rocket = image-url("http://www.wescheme.org/images/teachpacks/rocket.png")

fun draw(height):
  place-image(rocket, 50, height, rectangle(100, 500, "solid", "white"))
end
fun start(student-ticker):
  when (not(is-function(student-ticker))):
    raise(E.generic-type-mismatch(student-ticker, "Function"))
  end
  big-bang(0, [
      on-tick(student-ticker),
      to-draw(draw)
    ])
end
