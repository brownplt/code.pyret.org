(define START (text "press a button" 60 "purple"))

(define (draw-world word)
  (put-image word 250 150 (rectangle 500 300 "outline" "black")))

(define (keypress n key)
  (cond
    [(string=? key "up") (text "you pressed up" 60 "blue")]
    [(string=? key "down") (text "you pressed down" 60 "orange")]
    [(string=? key "left") (text "you pressed left" 60 "red")]
    [(string=? key "right") (text "you pressed right" 60 "purple")]
    [(string=? key "p") (text "you pressed p" 60 "green")]
    [(string=? key " ") (text "you pressed the spacebar" 40 "blue")]
    [else (text "oops" 60 "yellow")]))

(big-bang START
          (on-redraw draw-world)
          (on-key keypress))
