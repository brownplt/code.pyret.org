;  Ufo laskeutuu
;
; Tehtävä 1:
; Korjaa alla oleva piirrä-ufo funktion koodi niin, että ufo laskeutuu
; alaspäin (nyt se on jumissa taivaalla kohdassa x=150 ja y=0).
;
; Tehtävä 2:
; Korjaa pysähdy? funktiota niin, että se huomaa milloin ufo
; on maassa ja lopettaa animaation.
;
; Tehtävä 3:
; Saatko ufon lentämään nopeammin? Muokkaa siirrä-ufo funktiota.
;
; Tehtävä 4:
; Keksitkö jo miten saat ufon lentämään alhaalta ylös ja pysähtymään
; yläreunaan (vinkki: ufo lähtee liikkeelle kohdasta LÄHTÖ).
;
; Tehtävä 5:
; Keksitkö jo, miten ufon saa lentämään vaakatasossa, vasemmalta oikealle?
;
; Tehtävä 6:
; Entäpä ufo, joka tulee esiin uudelleen ja uudelleen (rullaa).
; Vinkki: ehtolause...
; ----------------------------------------------------------------

(define LÄHTÖ 0)   ; Tehtävä 4 ---> (define LÄHTÖ 466)

(define UFO (overlay/xy (ellipse 120 40 "solid" "violet")
                        30 -25
                        (circle 30 "outline" "black")))

(define TAUSTA (empty-scene 300 500))

;; piirrä-ufo : Luku -> Kuva
(define (piirrä-ufo y)
  (begin
    ;(display "piirra-ufo")
  (place-image UFO 150 y TAUSTA)))

;; pysähdy? : Luku -> Totuusarvo
(define (pysähdy? y)
  (begin
    ;(display "pysahdy?")
  (> y 465)))         ; Tehtävä 4 ---> (< y 0)

;; siirrä-ufo : Luku -> Luku
(define (siirrä-ufo y)
  (begin
    ;(display "siirra-ufo")
  (+ y 3)))           ; Tehtävä 4 ---> (- y 3)

;; Tehtävä 6 (rullaava):
;(define (siirrä-ufo y)
;  (if (>= y 460)
;      0
;      (+ y 3)))

;; ---------------- älä muokkaa tästä alaspäin ------------------
(big-bang LÄHTÖ
   (to-draw piirrä-ufo)
   (on-tick siirrä-ufo)
   (stop-when pysähdy?))
