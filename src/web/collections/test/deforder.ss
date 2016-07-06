(provide f1 f2 x y z foo)

;x has fwd ref to f1
;f1 we know will bubble up because it's a fun def
;x will stay put
(define x (f1))

;check-expect will sink to the bottom
(check-expect (f1) 3)

;f1 will bubble up because it's a fun def
;f1's body has fwd ref to y
;hopefully y will bubble higher than f1
(define (f1)
  (+ y 1))

;y has no fwd ref
;will bubble up ahead of fun defs, since it's a nonfun def
(define y 2)

;f2 will bubble up because it's a fun def
;f2's body has fwd ref to make-foo
;but make-foo is a struct def, so we know it'll bubble up ahead of even nonfun defs
(define (f2)
  (make-foo))

;z has fwd ref to make-foo, but no fwd ref to any regular fun def
;z will bubble up ahead of fun defs, but below struct defs
(define z (make-foo))

;foo and related defs will bubble up ahead of nonfun defs
(define-struct foo ())
