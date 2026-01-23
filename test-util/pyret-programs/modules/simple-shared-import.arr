import s-exp as S
import shared-gdrive("parse-copy", "0B32bNEogmncOd1dBTUhVVjE0VU0") as P

check:
  P.p-many(P.p-num)(S.read-s-exp("(3 4)")) is some([list: 3, 4])
end

