(define xbox (box 9))

(check-expect (box? xbox) #t)

(set-box! xbox 8)

(check-expect (unbox xbox) 8)
