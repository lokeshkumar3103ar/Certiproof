import QRCode from "qrcode";

/**
 * Generate a QR code as a Data URL (base64 PNG).
 * The QR encodes the verification URL for the certificate.
 */
export async function generateQRCodeDataUrl(
  certificateHash: string
): Promise<string> {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${appUrl}/verify/${certificateHash}/confirm`;

  return QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 256,
    color: {
      dark: "#1a1a2e",
      light: "#ffffff",
    },
  });
}

/**
 * Generate a QR code as a Buffer (PNG) for embedding in PDFs.
 */
export async function generateQRCodeBuffer(
  certificateHash: string
): Promise<Buffer> {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${appUrl}/verify/${certificateHash}/confirm`;

  return QRCode.toBuffer(verificationUrl, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 256,
    color: {
      dark: "#1a1a2e",
      light: "#ffffff",
    },
  });
}
