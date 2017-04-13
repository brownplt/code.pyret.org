;  Tee tietokilpailupeli, joka näyttää käyttäjälle kuvia ja/tai tekstimuotoisia kysymyksiä. Tarkista
; vastauksen oikeelliseuus ja kerro käyttäjälle onko hänen antamansa vastaus oikein vain väärin.
; Voit hakea kuvat netistä ja lisätä ne koodiin valikosta: Images. Kannattaa valita pienikokoisia
; kuvia tai pienentää ne esim. GIMP-ohjelmalla.
;
; Käytä display-read -funktiota vastauksen kysymiseen. Se avaa editori-ikkunan, johon käyttäjä
; voi kirjoittaa vastauksensa (merkkijono). Teksti hyväksytään editorissa painamalla <enter>.
; Kun olet tutkinut vastauksen oikeellisuuden, ilmoita siitä käyttäjälle display-info:n avulla.
;
; Vinkki: Laita kysymykset ja vastaukset listaksi, tee erillinen funktio joka kysyy ja tarkistaa vastauksen ja
; toinen funktio, joka kutsuu tarkastajaa jokaiselle kysymys-vastaus-parille.
; ---------------------------------------------------------------------------
(require wescheme/dhnSHUnLTh)

(define KYSYMYS (text "Mikä tämä on?" 30 "black"))
(define OMENA (bitmap/url "https://drive.google.com/uc?export=download&id=0B9OEGAkXoOfLaXE0aVJTLWlBajA"))
(define OMENA-KYSYMYS (above KYSYMYS OMENA))
(define PAPRIKA (bitmap/url "https://drive.google.com/uc?export=download&id=0B9OEGAkXoOfLWndyUHlVbWZES3c"))
(define PAPRIKA-KYSYMYS (above KYSYMYS PAPRIKA))

;; kerätään kysymykset ja oikeat vastaukset listaksi
(define KYSYMYKSET (list (list OMENA-KYSYMYS "omena")
                         (list PAPRIKA-KYSYMYS "paprika")))

;; funktio, joka kysyy käyttäjältä kysymyksen ja tarkistaa onko vastaus oikein (1 piste)vai väärin (0 pistettä)
;; tarkista : Lista -> Luku
(define (tarkista kysymys-vastaus)
  (if (string=? (display-read (first kysymys-vastaus))
                (second kysymys-vastaus))
      (begin (display-info "Oikein")
             1)
      (begin (display-info "Väärin")
             0)))

;; pelaa : Lista -> Luku
(define (pelaa kysymykset)
      (display-value "Sait pisteitä:"
                     (apply + (map tarkista kysymykset))))

;; käynnistää pelin
(pelaa KYSYMYKSET)

; ---------------------------------------------------------------------
;  Tunnistuspeli (osa 2)
; Voit parantaa peliäsi niin, että vastauksesksi kelpaavat myös sanan synonyymit sekä isoilla
; ja pienillä kirjaimilla kirjoitetut vastaukset. Lisää uudet vaihtoehdot kysymys- ja vastauslistaan.
; Voit testata onko annettu vastaust listalla member-funktion avulla.
; ---------------------------------------------------------------------

;; kysymykset listana mutta nyt on monta oikeaa vastausta
(define KYSYMYKSET2 (list (list OMENA-KYSYMYS "omena" "OMENA" "Omena" "valkeakuulas")
                          (list PAPRIKA-KYSYMYS "paprika" "PAPRIKA" "Paprika" "punainen paprika")))

;; funktio, joka kysyy käyttäjältä kysymyksen ja tarkistaa onko vastaus oikein (1 piste)vai väärin (0 pistettä)
;; tarkista2 : Lista -> Luku
(define (tarkista2 kysymys-vastaukset)
  (if (member? (display-read (first kysymys-vastaukset))
               (rest kysymys-vastaukset))
      (begin (display-info "Oikein")
             1)
      (begin (display-info "Väärin")
             0)))

;; pelaa2 : Lista -> Luku
(define (pelaa2 kysymykset)
      (display-value "Sait pisteitä:"
                     (apply + (map tarkista2 kysymykset))))

;; käynnistää pelin
(pelaa2 KYSYMYKSET2)
