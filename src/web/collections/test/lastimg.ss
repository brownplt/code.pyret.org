(big-bang 10
          (last-image (lambda (x) (text "75" 75 "red")))
          (to-draw (lambda (x) (text (number->string x) x "blue")))
          (on-tick (lambda (x) (+ x 10)))
          (stop-when (lambda (x) (> x 90))))
