import qrcode

# 1. QR 코드에 담을 데이터 (Site URL)
data = "https://reply-link.vercel.app/"

# 2. QR 코드 객체 생성
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)
qr.add_data(data)
qr.make(fit=True)

# 3. 이미지 생성 및 저장
img = qr.make_image(fill_color="black", back_color="white")
img.save("reply_site_qr.png")
