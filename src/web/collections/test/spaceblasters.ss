(require bootstrap2012/bootstrap-teachpack)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; 0. Game title: Write the title of your game here
(define TITLE "Space Blasters!")
(define TITLE-COLOR "white")

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Graphics - danger, target, projectile and player images
(define BACKGROUND (bitmap/url "http://www.bootstrapworld.org/clipart/Backgrounds/Space.jpg"))
(define DANGER (bitmap/url "http://www.bootstrapworld.org/clipart/Things/asteroid.gif"))
(define TARGET (list (bitmap/url "http://www.bootstrapworld.org/clipart/Things/diamond.gif")
                     (bitmap/url "http://www.animationplayhouse.com/corny10.gif")))
(define PLAYER (bitmap/url "http://www.bootstrapworld.org/clipart/Vehicles/ship2.gif"))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; 1. Making the Danger and the Target Move

; update-danger: Number Number -> Posn
; given the danger's x-coordinate, output the NEXT x

(define (update-danger x y)  (make-posn (+ x 50) (+ y 20)))


; update-target : Number -> Number
; given the target's x-coordinate, output the NEXT x
(EXAMPLE (update-target 600) (- 600 30))
(EXAMPLE (update-target 400) (- 400 30))
(define (update-target x)  (- x 30))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; 2. Making the Danger and the Target Come Back Again: 
;;    Are they still onscreen?

; safe-left? : Number -> Boolean
; is the character protected on the left side of the screen?
(EXAMPLE (safe-left? 100) (> 100 -50))
(EXAMPLE (safe-left? -200) (> -200 -50))
(define (safe-left? x) (> x -50))


; safe-right? : Number -> Boolean
; is the character protected on the right side of the screen?
(EXAMPLE (safe-right? 100)(< 400 690))
(EXAMPLE (safe-right? -200) (< -200 690))
(define (safe-right? x) (< x 690))


; onscreen? : Number Number -> Boolean
; Determines if the coordinates are within 100 pixels of the screen
(EXAMPLE (onscreen? 100)
         (and (safe-left? 100)
              (safe-right? 100)))
(EXAMPLE (onscreen? -730)
         (and (safe-left? -730)
              (safe-right? -730)))
(define (onscreen? x)
  (and (safe-left? x)
       (safe-right? x)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; 3. Get our Player moving!

; update-player : Number Number String -> Posn
; given the player's y-coordinate and a direction, output the NEXT y
(define (update-player x y key)
  (cond
    [(string=? key "up") (make-posn x (+ y 20))]
    [(string=? key "down") (make-posn x (- y 20))]
    [(string=? key "left") (make-posn (- x  20) y)]
    [(string=? key "right") (make-posn (+ x 20) y)]
    [else y]))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; 4. Collisions: When the player is close enough to the Target
;;    or the Danger, then something should happen!
;;    We need to know what "close enough" means, and we need to
;;    know how far apart things are.

;; If *distances-color* is not "", then the game will show
;; a triangle between the player and each character. 
;; That triangle will be labelled with line-length on the legs,
;; and with distance on the hypotenuse.
(define *distances-color* "")

; line-length : Number Number -> Number
; the distance between two points on a number line
(EXAMPLE (line-length 20 10) 10)
(EXAMPLE (line-length 10 20) 10)
(define (line-length a b)
  (cond
    [(> a b) (- a b)]
    [else (- b a)]))
  

; distance : Number Number Number Number -> Number
; We have the player's position (px, py), 
; and a character's position (cx, cy).
; How far apart are they?
(EXAMPLE (distance 0 4 3 0) 
         (sqrt (+ (sq (line-length 0 4))
                  (sq (line-length 3 0)))))
(EXAMPLE (distance 10 300 320 240) 
         (sqrt (+ (sq (line-length 10 320))
                  (sq (line-length 300 240)))))
(define (distance px py cx cy)
  (sqrt (+ (sq (line-length px cx))
           (sq (line-length py cy)))))


; collide? : Number Number Number Number -> Boolean 
; We have (px, py) and (cx, cy). Are they close enough for a collision?
(EXAMPLE (collide? 10 300 320 240) 
         (< (distance 10 300 320 240) 50))
(EXAMPLE (collide? 0 4 3 0) 
         (< (distance 0 4 3 0) 50))
(define (collide? px py cx cy)
         (< (distance px py cx cy) 50))


; a final secret:
(define mystery (radial-star 5 5 3 "solid" "silver"))
(EXAMPLE (update-mystery 32) (- 32 30))
(EXAMPLE (update-mystery 100) (- 100 30))
(define (update-mystery x) 
  (- x 30))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; PROVIDED CODE

;; defines a game level, using all the images and functions
;; defined above.
(define game_level (make-game TITLE TITLE-COLOR 
                     BACKGROUND 
                     DANGER update-danger
                     TARGET update-target
                     PLAYER update-player
                     mystery update-mystery
                     *distances-color* line-length distance
                     collide? onscreen?))

;; starts the game, using game_level
(play game_level)
