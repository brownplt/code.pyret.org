(define (foo x)
  (cond
    [(> x 10) "greater than 10"]
    [(> x 8) "greater than 8"]
    [(> x 6) "greater than 6"]
    [else "too small"]))

(check-expect (foo 12) "greater than 10")
(check-expect (foo 11) "greater than 10")
(check-expect (foo 10) "greater than 8")
(check-expect (foo 9) "greater than 8")
(check-expect (foo 8) "greater than 6")
(check-expect (foo 7) "greater than 6")
(check-expect (foo 6) "too small")
(check-expect (foo 5) "too small")
(check-expect (foo 4) "too small")
(check-expect (foo 3) "too small")
(check-expect (foo 2) "too small")
(check-expect (foo 1) "too small")
(check-expect (foo 0) "too small")
