(provide eff)

(define (eff n)
  (put-image (text (number->string n) 30 "purple")
             230 230
             (rectangle 330 330 "outline" "red")))
