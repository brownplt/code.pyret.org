;  Laskuautomaatti
;
; Tee ohjelma, joka kysyy käyttäjältä tietoja ja käyttää niitä jonkun asian laskemiseen. Lopuksi ilmoita vastaus käyttäjälle.
; Muista tarkistaa saatujen tietojen järkevyys. Tee ensin check-expect - lausekkeet.

;(require teachpacks/display-read)
(require wescheme/dhnSHUnLTh)
;(require test/display-read)

;(require teachpacks/math-utils)
(require wescheme/lenBmnorzi)

(define KYSYMYS1 "Anna suorakulmion kanta:")
(define KYSYMYS2 "Anna suorakulmion korkeus:")
(define KYSYMYS3 "Anna yksikkö")
(define VASTAUS1 "Suorakulmion pinta-ala on: ")
(define VASTAUS2 "Anna lukuja")

;; pinta-ala : Luku Luku -> Luku
(define (pinta-ala a b)
       (* a b))

(check-expect (pinta-ala 30 40)
              (* 30 40))

;; vastaus : Luku Merkkijono -> Kuva
(define (vastaus A yksikkö)
      (quantity->image A yksikkö 2 30 "black"))

(check-expect (vastaus 30 "cm")
              (quantity->image 30 "cm" 2 30 "black"))

;; automaattilaskuri-silmukka (ilman lopetusehtoa)
(define (automaattilaskuri)
  (let [(a1 (display-read-number KYSYMYS1))
        (b1 (display-read-number KYSYMYS2))
        (yksikkö (display-read KYSYMYS3))]
    (if (and (number? a1)(number? b1))
        (begin (display-value VASTAUS1 (vastaus (pinta-ala a1 b1) yksikkö))
               (automaattilaskuri))
        (begin (display-info VASTAUS2)
               (automaattilaskuri)))))

;; käynnistys:
;(automaattilaskuri)

;; automaattilaskuri-silmukka (lopettaa kun i on nolla)
(define (automaattilaskuri2 i)
  (if (<= i 0)
      (display-info "Kiitos ja näkemiin")
      (let [(a1 (display-read-number KYSYMYS1))
            (b1 (display-read-number KYSYMYS2))
            (yksikkö (display-read KYSYMYS3))]
        (if (and (number? a1)(number? b1))
            (begin
              (display-value VASTAUS1 (vastaus (pinta-ala a1 b1) yksikkö))
              (automaattilaskuri2 (sub1 i)))
            (begin (display-info VASTAUS2)
                   (automaattilaskuri2 (sub1 i)))))))

;; käynnistys
(automaattilaskuri2 3)
