;  Pinta-alafunktiot B
;
; Tässä harjoituksessa kaikki mitat ovat samassa yksikössä ja jätämme ne yksinkertaistuksen vuoksi pois.
;
; Huom! Koska tässä harjoituksessa jokaisessa tehtävässä tarvitaan piin likiarvoa, vastaukset ovat kaikki epätarkkoja.
; Siksi emme voi käyttää "check-expect" esimerkkejä/testejä vaan "check-within" funktiota, jolle kolmanneksi argumentiksi
; annetaan sallittu poikkeama (tarkkuus). Tarkkuus on lisätty testeihin valmiiksi (0.01).
; Merkintä i# vastauksen edessä varoittaa epätarkkuudesta!
; -------------------------------------------------------------
;  Tehtävä 1.
;
; Tee funktio, joka laskee ympyräiden pinta-aloja. Valitse muuttujille sopivat nimet/nimi (<...>).
; Täydennä funktioon kuvauksen puuttuvat tiedot (...). Tee myös esimerkkejä/testejä funktiollesi (check-expect).
; -------------------------------------------------------------

;; ympyrän-pinta-ala : Luku -> Luku
(define (ympyrän-pinta-ala r)
   (* pi (sqr r)))

(check-within (ympyrän-pinta-ala 5)
              (* pi (sqr 5))
              0.01)

(check-within (ympyrän-pinta-ala 15)
              (* pi 15 15)
              0.01)

; -------------------------------------------------------------
;  Tehtävä 2.
;
; Tee funktio, joka laskee sektoreiden pinta-aloja. Valitse muuttujille sopivat nimet/nimi (<...>).
; Täydennä funktioon kuvauksen puuttuvat tiedot (...). Tee myös esimerkkejä/testejä funktiollesi (check-expect).
;
; Vinkki: Käytä apuna aikaisemmin kirjoittamaasi ympyrän-pinta-ala -funktiota.
; -------------------------------------------------------------

;; sektorin-pinta-ala : Luku Luku -> Luku
(define (sektorin-pinta-ala r kulma)
   (* (/ kulma 360) (ympyrän-pinta-ala r)))

(check-within (sektorin-pinta-ala 20 90)
              (/ (ympyrän-pinta-ala 20) 4)
              0.01)

(check-within (sektorin-pinta-ala 20 180)
              (/ (ympyrän-pinta-ala 20) 2)
              0.01)

(check-within (sektorin-pinta-ala 20 78)
              (* (/ 78 360) (ympyrän-pinta-ala 20))
              0.01)

; -------------------------------------------------------------
;  Tehtävä 3.
;
; Tee funktio, joka laskee ympyrälieriön kokonaispinta-alan. Valitse muuttujille sopivat nimet/nimi (<...>).
; Täydennä funktioon kuvauksen puuttuvat tiedot (...). Tee myös esimerkkejä/testejä funktiollesi (check-expect).
;
; Vinkki: Käytä apuna aikaisemmin kirjoittamaasi ympyrän-pinta-ala -funktiota. Lisäksi tarvitset apufunktion joka laskee vaipan pinta-
; alan. Lopuksi kirjoita funktio, joka yhdistää tiedot (käyttää ympyrän- ja vaipan pinta-alojenlaskufunktiota).
; -------------------------------------------------------------

;; ympyrälierön-vaipan-pinta-ala : Luku Luku -> Luku
(define (ympyrälieriön-vaipan-pinta-ala r h)
   (* 2 pi r h))

(check-within (ympyrälieriön-vaipan-pinta-ala 5 15)
              (* 2 pi 5 15)
              0.01)

(check-within (ympyrälieriön-vaipan-pinta-ala 15 5)
              (* 2 pi 15 5)
              0.01)

;; ympyrälieriön-pinta-ala : Luku Luku -> Luku
(define (ympyrälieriön-pinta-ala r h)
   (+ (* 2 (ympyrän-pinta-ala r))
      (ympyrälieriön-vaipan-pinta-ala r h)))

(check-within (ympyrälieriön-pinta-ala 5 15)
              (+ (* 2 (ympyrän-pinta-ala 5))
                 (ympyrälieriön-vaipan-pinta-ala 5 15))
              0.01) 
