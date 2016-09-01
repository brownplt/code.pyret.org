include image

check "regression":
  # Regression test for a bad merge that made scale-image comparison fail
  scale(0.2, circle(50, "solid", "red")) is-not
    scale(0.3, circle(50, "solid", "red"))

  scale(0.2, circle(50, "solid", "red")) is-not
    scale(0.3, circle(50, "solid", "red"))
end
