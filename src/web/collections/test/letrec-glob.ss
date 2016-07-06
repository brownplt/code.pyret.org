(provide glob)

(define (glob n) "wontwork")

(letrec ((glob (lambda (n) "willwork")))
  (print (glob 9)))
