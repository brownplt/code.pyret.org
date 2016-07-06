(provide glob)

(define (glob n) "wontwork")

(let ((glob (lambda (n) "willwork")))
  (print (glob 9)))
