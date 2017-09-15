;(require wescheme/3fqNYHy7zE)
(require bootstrap2015/g-teachpack)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; 0. Game title: Write the title of your game here
(define TITLE "Race Through Space")
(define TITLE-COLOR "white")

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Graphics - danger, target, projectile and player images
(define BACKGROUND (bitmap/url "http://cdn.wonderfulengineering.com/wp-content/uploads/2014/04/space-wallpapers-6.jpg"))
(define BACKGROUND2 (put-image (scale .3 (bitmap/url "http://www.english-grammar.at/online_exercises/tenses/images/ufo.gif"))
                               140 850
                               BACKGROUND))
(define DANGER (scale .2 (bitmap/url "http://img3.wikia.nocookie.net/__cb20130216185423/scribblenauts/images/1/12/Alien.png")))
(define TARGET (scale .17 (bitmap/url "http://pngimg.com/upload/star_PNG1597.png")))
(define PLAYER (scale .18 (bitmap/url "http://fc07.deviantart.net/fs70/i/2012/160/b/d/astronaut_running_by_hoodiepatrol89-d52uzx3.png")))

;; here's a screenshot of the game, with the PLAYER at (320, 240),
;; the TARGET at (400 500) and the DANGER at (150, 200)
(define SCREENSHOT (put-image DANGER
                                150 200
                                (put-image TARGET
                                           500 400
                                           (put-image PLAYER
                                                      320 240
                                                      BACKGROUND))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; 1. Making the Danger and the Target Move

; update-danger: Number -> Number
; subtract 50 from the x-coordinate

;; write EXAMPLEs for update-danger below this line
(EXAMPLE (update-danger 100) ( - 100 50))
(EXAMPLE (update-danger 275) ( - 275 50))

(define (update-danger x-coordinate) ( - x-coordinate 50))

; update-target : Number -> Number
; add 50 to x-coordinate

;; write EXAMPLEs for update-target below this line
(EXAMPLE (update-target 100) (+ 100 50))
(define (update-target x-coordinate) (+ x-coordinate 50))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; 2. Making the Danger and the Target Come Back Again:
;;    We need to know that they're gone!
;;    Are they on the screen?

; safe-left? : Number -> Boolean
; takes a x-coordinate and tells trues or false if it is greater than -50
(EXAMPLE(safe-left? -40) (> -40 -50))
(EXAMPLE(safe-left? -100) (> -100 -50))
(define (safe-left? x-coordinate) (> x-coordinate -50))

; safe-right? : Number -> Boolean
; takes in a x-coordinate and checks to see if it is les than 690
(EXAMPLE(safe-right? 200) (< 200 690))
(EXAMPLE(safe-right? 710) (< 710 690))

(define (safe-right? x-coordinate) (< x-coordinate 690))

;; onscreen? : Number -> Boolean
;; onscreen takes in the targets x-coordinate and checks to see if Sam is protected on both sides
(EXAMPLE(onscreen? 600) (and (safe-left? 600) (safe-right? 600)))
(EXAMPLE (onscreen? -40) (and (safe-right? -40) (safe-left? -40)))
(define(onscreen? x-coordinate) (and (safe-right? x-coordinate) (safe-left? x-coordinate)))
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; 3. Get our Player moving!

; update-player : Number String -> Number
; takes player y-coordinate and the name of the key pressed and returns new y-coordinate

; EXAMPLEs:
(EXAMPLE(update-player 128 "up")(+ 128 30))
(EXAMPLE(update-player 128 "down") (- 128 30))
(EXAMPLE(update-player 140 "up") (+ 140 30))
(EXAMPLE(update-player 140 "down") (- 140 30))

(define (update-player y key)
(cond
[(string=? key "up") (+ y 30)]
[(string=? key "down") (- y 30)]
[else (= y 0)]))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; 4. Collisions: When the player is close enough to the Target
;;    or the Danger, then something should happen!
;;    We need to know what "close enough" means, and we need to
;;    know how far apart things are.

;; If *distances-color* is set to "yellow", then the game will draw
;; a yellow triangle between the player and each character.
;; That triangle will be labelled with line-length on the legs,
;; and with distance on the hypotenuse. (This works for any valid color)
(define *distances-color* "yellow")

; line-length : Number Number -> Number
; the distance between two points on a number line
;; some examples - notice that we should always return the
;; same answer, no matter what the order of the inputs is!
(EXAMPLE (line-length 20 10) 10)
(EXAMPLE (line-length 10 20) 10)

(define (line-length a b)
  (cond
    [(> a b) (- a b)]
    [else (- b a)]))

; distance : Number Number Number Number -> Number
; The distance between two points on screen:
; We have the player's x and y, and a character's x and y.
; How far apart are they?
; EXAMPLEs:

(define (distance px py cx cy)
  (sqrt(+(sqr(- cx px)) (sqr(- cy py)))))

; collide? : Number Number Number Number -> Boolean
; How close is close enough?
; We have the player's x and y, and a character's x and y.
; We can ask how far apart they are.  Did they collide?
; EXAMPLEs:
(EXAMPLE(collide? 50 120 2 21) (<= (distance 50 120 2 21)50))
(EXAMPLE(collide? 10 20 35 60) (<=(distance 10 20 35 60)50))
(define (collide? px py cx cy) (<=(distance px py cx cy)50))
 ; false)

; a final secret:
(define mystery (radial-star 5 5 3 "solid" "silver"))
(define (update-mystery x)
  (+ x 40))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; PROVIDED CODE

(define g (make-game TITLE TITLE-COLOR
                     BACKGROUND2
                     DANGER update-danger
                     TARGET update-target
                     PLAYER update-player
                     mystery update-mystery
                     *distances-color* line-length distance
                     collide? onscreen?))

;; click Run and then type this in the Interactions window to
;; start the game, or uncomment the next line to start the
;; game automatically when you click Run:
(play g)
