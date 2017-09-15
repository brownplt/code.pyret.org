; ------------------------------------------------------------------------
;  Editori
;
; Tee itsellesi tekstieditori. Muokkaa kirjoita-funktiota niin, että editorikenttään
; voi kirjoittaa tekstiä ja poistaa
; sitä backspacelle. Huomaa, että kaikki näppäimet eivät ole kirjoitusmerkkejä.
; Kirjoita ensin check-expect esimerkit ja paina
; "run". Kun testit toimivat jatka kirjoita - funktio loppuun.
; ------------------------------------------------------------------------

(define LEVEYS 500)
(define KORKEUS 50)
(define KUVA (empty-scene LEVEYS KORKEUS))

;; piirrä : Merkkijono -> Kuva
(define (piirrä teksti)
  (overlay/align "left" "middle" (text teksti 20 "black") KUVA))

;; kirjoita : Merkkijono Näppäin -> Merkkijono
(define (kirjoita teksti näppäin)
  (cond   [(and (> (string-length teksti) 0) (key=? "\b" näppäin))
         (substring teksti 0 (sub1 (string-length teksti)))]
          [(key=? "\b" näppäin)
           teksti]
          [(= 1 (string-length näppäin))
           (string-append teksti näppäin)]
        [else teksti]))

(check-expect (kirjoita "" "k")
              "k")

(check-expect (kirjoita "k" "\b")
              "")

(check-expect (kirjoita "" "\b")
              "")

(check-expect (kirjoita "" "left")
              "")

;; käynnistä
(big-bang ""
          (to-draw piirrä)
          (on-key kirjoita))
