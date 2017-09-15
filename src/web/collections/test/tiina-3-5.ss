;   Kertolaskupeli
;
; Kertolaskupeli, joka kysyy käyttäjältä oikeaa vastausta kertolaskutehtäviin, tarkistaa tuloksen,
; kertoo käyttäjälle menikö oikein ja laskee pisteet.
; ---------------------------------------------------------------

;(require teachpacks/display-read)
(require wescheme/dhnSHUnLTh)

;; RATKAISU1

;; kysymys: Luku Luku -> Merkkijono
(define (kysymys a b)
  (string-append "Laske: " (number->string a) " * " (number->string b)))

;; kertolaskukoe : Luku Luku -> Luku
(define (kertolaskukoe kerrat pisteet)
  (let* [(a (random 10))
         (b (random 10))
         (vastaus (display-read-number (kysymys a b)))]
    (if (<= kerrat 0)
        (display-value "Testi loppui. Pisteesi: " pisteet)
        (if (and (number? vastaus) (= (* a b) vastaus))
            (begin
              (display-info "Oikein")
              (kertolaskukoe (sub1 kerrat) (add1 pisteet)))
            (begin
              (display-info "Väärin")
              (kertolaskukoe (sub1 kerrat) pisteet))))))

;; koe : Luku -> Luku
(define (koe kerrat)
  (kertolaskukoe kerrat 0))

;; aloittaa kokeen (kysymysten määrä)
(koe 10)

;; RATKAISU2 (kysyy uudelleen, jos meni väärin)
;; kertolasku-koe2 : Luku Luku Luku Luku -> Luku
(define (kertolaskukoe2 kerrat pisteet a b)
  (let [(vastaus (display-read-number (kysymys a b)))]
    (if (<= kerrat 0)
        (display-value "Testi loppui. Pisteesi: " pisteet)
        (if (and (number? vastaus) (= (* a b) vastaus))
            (begin
              (display-info "Oikein")
              (kertolaskukoe2 (sub1 kerrat) (add1 pisteet) (random 10)(random 10)))
            (begin
              (display-info "Väärin. Yritä uudelleen.")
              (kertolaskukoe2 (sub1 kerrat) pisteet a b))))))

;; koe2 : Luku -> Luku
(define (koe2 kerrat)
  (kertolaskukoe2 kerrat 0 (random 10)(random 10)))

(koe2 10)
