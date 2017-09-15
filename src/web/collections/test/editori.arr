import image as I
import world as W

var LEVEYS = 500
var KORKEUS = 50

var KUVA = I.empty-scene(LEVEYS, KORKEUS)

fun piirra(teksti):
  I.overlay-align("left", "middle", I.text(teksti, 20, "black"), KUVA)
end

fun kirjoita(teksti, nappain):
  if (string-length(teksti) > 0) and W.is-key-equal("\b", nappain):
    string-substring(teksti, 0, string-length(teksti) - 1)
  else if W.is-key-equal("\b", nappain):
    teksti
  else if string-length(nappain) == 1:
    string-append(teksti, nappain)
  else:
    teksti
  end
end

W.big-bang("", [list:
  W.to-draw(piirra),
  W.on-key(kirjoita)
  ])
