(check-expect
  (apply + '(1 2 3 4 5 6 7 8 9 10)) 55)

(check-expect
  (apply + 1 2 3 4 5 '(6 7 8 9 10)) 55)

(define x '(1 2 3))

(check-expect
  (map + x x x x x)
  (map (lambda (n) (* 5 n)) x))
