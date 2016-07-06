(provide even odd)

(define (even n) "wontwork")
(define (odd n) "wontwork")

(letrec ((even (lambda (n) (if (= n 1) false (odd (- n 1)))))
         (odd (lambda (n) (if (= n 1) true (even (- n 1))))))
  (begin
    (check-expect (even 100) true)
    (check-expect (odd 5) true)
    (check-expect (odd 6) false)
    (check-expect (even 3) false)))

(check-expect (even 100) "wontwork")
(check-expect (odd 100) "wontwork")
