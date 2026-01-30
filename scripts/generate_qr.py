import qrcode
import sys

def generate_qr(url, filename):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(filename)
    print(f"QR code saved to {filename}")

if __name__ == "__main__":
    target_url = "https://story-link-silk.vercel.app/pasta"
    output_file = "pasta_qr.png"
    
    if len(sys.argv) > 1:
        output_file = sys.argv[1]

    generate_qr(target_url, output_file)
