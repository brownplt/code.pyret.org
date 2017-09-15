;#lang scheme/gui

#;(require (only-in htdp/draw
                  draw-circle draw-solid-disk
                  draw-solid-rect draw-solid-line)
         htdp/world
         (for-syntax scheme/base)
         (except-in htdp/testing test)
         lang/prim)
(provide random-direction
         random-color
         #;TEST
         #;(rename-out (on-key-event/new on-key-event))
         #;(rename-out (on-mouse-event/new on-mouse-event))
         #;(except-out (all-from-out htdp/world)
                     on-key-event
                     on-mouse-event))

;(define-higher-order-primitive on-key-event/new on-key-event/proc (key-handler))
;(define-higher-order-primitive on-mouse-event/new on-mouse-event/proc (mouse-handler))

;; char->string : char -> String
(define (char->string c)
  (cond ((char=? c " ") "space")
        (else c)))

;; on-key-event/proc : (World Key-event -> World) -> Boolean
(define (on-key-event/proc key-handler)
  (on-key (lambda (w key)
                  (let ((key-str (cond
                                   ((symbol? key) (symbol->string key))
                                   ((char? key) (char->string key))
                                   (else key))))
                    (key-handler w key-str)))))

;; on-mouse-event/proc : (World Number Number Mouse-Event -> World) -> Boolean
#;(define (on-mouse-event/proc mouse-handler)
  (on-mouse-event (lambda (w x y Mouse-event)
                    (let ((event-str (symbol->string Mouse-event)))
                      (mouse-handler w x y event-str)))))

;; direction? : String? -> Boolean?
(define (direction? s)
  (or (equal? s "up")
      (equal? s "down")
      (equal? s "left")
      (equal? s "right")))

;; random-direction : -> Direction?
(define (random-direction)
  (let ((n (random 4)))
    (case n
      ((0) "up")
      ((3) "down")
      ((1) "left")
      ((2) "right"))))

;; random-color : String -> String
(define (random-color c)
  (let ([new-c (random 8)])
    (case new-c
      [(0) (ensure-different-color "red" c)]
      [(1) (ensure-different-color "green" c)]
      [(2) (ensure-different-color "yellow" c)]
      [(3) (ensure-different-color "blue" c)]
      [(4) (ensure-different-color "turquoise" c)]
      [(5) (ensure-different-color "purple" c)]
      [(7) (ensure-different-color "magenta" c)])))

;; ensure-different-color : String String -> String
(define (ensure-different-color c1 c2)
  (if (equal? c1 c2)
      (random-color c2)
      c1))

;; a `test' macro that is a synonym for `check-expect', catches expansion
;; errors and pretends that they come from `test'.
;(require (for-syntax syntax/kerncase))
#;(define-syntax (TEST stx)
  (syntax-case stx ()
    [(_ x ...)
     (with-handlers ([exn? (lambda (e)
                             (raise (make-exn
                                     (regexp-replace*
                                      #rx"check-expect"
                                      (exn-message e)
                                      "test")
                                     (exn-continuation-marks e))))])
       (local-expand (syntax/loc stx (check-expect x ...))
                     (syntax-local-context)
                     (kernel-form-identifier-list)))]))
