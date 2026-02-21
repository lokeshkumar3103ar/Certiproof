import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hjQ.ttf", fontWeight: 600 },
    { src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hjQ.ttf", fontWeight: 700 },
  ],
});

export type CertificateType =
  | "course_completion"
  | "degree_diploma"
  | "achievement_award"
  | "workshop_seminar"
  | "internship";

export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
  course_completion:  "Certificate of Completion",
  degree_diploma:     "Certificate of Degree / Diploma",
  achievement_award:  "Certificate of Excellence",
  workshop_seminar:   "Certificate of Participation",
  internship:         "Certificate of Internship",
};

const CERTIFICATE_WORDING: Record<
  CertificateType,
  { preText: string; postText: string; subtitle: string }
> = {
  course_completion:  { subtitle: "CERTIFICATE OF COMPLETION",      preText: "This is to certify that",          postText: "has successfully completed the course" },
  degree_diploma:     { subtitle: "CERTIFICATE OF DEGREE / DIPLOMA", preText: "This is to certify that",          postText: "has fulfilled all requirements prescribed for the" },
  achievement_award:  { subtitle: "CERTIFICATE OF EXCELLENCE",       preText: "This certificate is presented to", postText: "in recognition of outstanding achievement in" },
  workshop_seminar:   { subtitle: "CERTIFICATE OF PARTICIPATION",    preText: "This is to certify that",          postText: "has successfully participated in and completed" },
  internship:         { subtitle: "CERTIFICATE OF INTERNSHIP",       preText: "This is to certify that",          postText: "has successfully completed an internship in" },
};

const s = StyleSheet.create({
  page: { backgroundColor: "#faf9f7", fontFamily: "Inter", flexDirection: "column" },

  // Decorative accents (absolute — do not affect layout)
  topBand:     { position: "absolute", top: 0,    left: 0, right: 0, height: 8, backgroundColor: "#e8b74a" },
  bottomBand:  { position: "absolute", bottom: 0, left: 0, right: 0, height: 4, backgroundColor: "#3a5b8e" },
  leftSidebar: { position: "absolute", top: 8, bottom: 4, left: 0, width: 6, backgroundColor: "#3a5b8e" },

  // Root content area — fills page between bands
  content: {
    position: "absolute",
    top: 8,       // below topBand
    bottom: 4,    // above bottomBand
    left: 6,      // right of leftSidebar
    right: 0,
    paddingTop: 40,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 0,
    flexDirection: "column",
  },

  // Body: vertically spaced from top
  bodyWrapper: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingBottom: 100,   // leave room so body never overlaps footer
  },

  headerColumn: { flexDirection: "column", alignItems: "center", marginBottom: 24 },
  logo: { width: 72, height: 72, objectFit: "contain", marginBottom: 12 },
  institutionName: { fontSize: 20, fontWeight: 700, color: "#3a5b8e", textTransform: "uppercase", letterSpacing: 1.5, textAlign: "center" },
  institutionDomain: { fontSize: 11, color: "#7a8a9e", letterSpacing: 1, marginTop: 4, textAlign: "center" },

  subtitle: { fontSize: 12, color: "#e8b74a", letterSpacing: 4, marginBottom: 36, textAlign: "center", fontWeight: 600 },

  preText:       { fontSize: 13, color: "#5a5a6e", marginBottom: 12, textAlign: "center" },
  recipientName: { fontSize: 42, fontWeight: 700, color: "#1a1a2e", marginBottom: 16, letterSpacing: 0.5, textAlign: "center" },
  postText:      { fontSize: 13, color: "#5a5a6e", marginBottom: 12, textAlign: "center" },
  courseName:    { fontSize: 22, fontWeight: 600, color: "#3a5b8e", marginBottom: 24, textAlign: "center" },
  dateText:      { fontSize: 13, fontWeight: 600, color: "#1a1a2e", textAlign: "center" },

  // Footer — absolutely positioned at the bottom of the content area
  footerRow: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 12,
    borderTop: "0.5pt solid #d0d8e4",
  },

  qrBlock:  { alignItems: "center", width: 72 },
  qrImage:  { width: 62, height: 62 },
  qrLabel:  { fontSize: 6, color: "#9a9aaa", marginTop: 3, textAlign: "center" },

  hashBlock: { flex: 1, marginHorizontal: 16, alignItems: "center" },
  sealText:  { fontSize: 7, color: "#9a9aaa", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 3 },
  uriText:   { fontSize: 8.5, fontWeight: 600, color: "#3a5b8e", marginBottom: 3, textAlign: "center" },
  hashLabel: { fontSize: 7, color: "#9a9aaa", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  // Larger mono font split over 2 lines (~33 chars each) for OCR readability
  hashText:  { fontSize: 8, color: "#4a5a6e", textAlign: "center", fontFamily: "Courier", letterSpacing: 0.3 },

  signatureBlock:       { width: 130, alignItems: "center" },
  signatureImage:       { width: 110, height: 36, objectFit: "contain", marginBottom: 2 },
  signaturePlaceholder: { width: 110, height: 36, marginBottom: 2 },
  signatureLine:        { width: 110, height: 0.5, backgroundColor: "#b3c2d5", marginBottom: 4 },
  signatureLabel:       { fontSize: 7, color: "#9a9aaa", textTransform: "uppercase", letterSpacing: 1 },
  signatureName:        { fontSize: 8, fontWeight: 600, color: "#3a5b8e", textAlign: "center" },
});

export interface CertificatePDFProps {
  recipientName: string;
  courseName: string;
  orgName: string;
  orgDomain: string;
  issueDate: string;
  certificateHash: string;
  uri: string;
  qrDataUrl?: string;
  logoUrl?: string;
  signatureUrl?: string;
  certificateType?: CertificateType;
}

export function CertificatePDF({
  recipientName, courseName, orgName, orgDomain,
  issueDate, certificateHash, uri, qrDataUrl,
  logoUrl, signatureUrl, certificateType = "course_completion",
}: CertificatePDFProps) {
  const wording = CERTIFICATE_WORDING[certificateType];
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.page}>

        {/* Decorative bands — absolute, don't affect flex layout */}
        <View style={s.topBand} />
        <View style={s.bottomBand} />
        <View style={s.leftSidebar} />

        {/* Content pane — absolutely covers usable page area */}
        <View style={s.content}>

          {/* Body: vertically spaced from top */}
          <View style={s.bodyWrapper}>
            <View style={s.headerColumn}>
              {logoUrl && <Image src={logoUrl} style={s.logo} />}
              <Text style={s.institutionName}>{orgName}</Text>
              <Text style={s.institutionDomain}>{orgDomain}</Text>
            </View>

            <Text style={s.subtitle}>{wording.subtitle}</Text>
            <Text style={s.preText}>{wording.preText}</Text>
            <Text style={s.recipientName}>{recipientName}</Text>
            <Text style={s.postText}>{wording.postText}</Text>
            <Text style={s.courseName}>{courseName}</Text>
            <Text style={s.dateText}>
              {"Issued on " + new Date(issueDate).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </Text>
          </View>

          {/* Footer — absolute at bottom of content pane, untouched */}
          <View style={s.footerRow}>
            <View style={s.qrBlock}>
              {qrDataUrl
                ? <Image src={qrDataUrl} style={s.qrImage} />
                : <View style={[s.qrImage, { backgroundColor: "#e8edf2" }]} />}
              <Text style={s.qrLabel}>Scan to verify</Text>
            </View>

            <View style={s.hashBlock}>
              <Text style={s.sealText}>Digitally Certified – Blockchain Verified</Text>
              <Text style={s.uriText}>{uri}</Text>
              <Text style={s.hashLabel}>SHA-256 Certificate Hash</Text>
              {/* Split into two ~33-char lines so OCR can read the full hash */}
              <Text style={s.hashText}>{certificateHash.slice(0, 33)}</Text>
              <Text style={s.hashText}>{certificateHash.slice(33)}</Text>
            </View>

            <View style={s.signatureBlock}>
              {signatureUrl
                ? <Image src={signatureUrl} style={s.signatureImage} />
                : <View style={s.signaturePlaceholder} />}
              <View style={s.signatureLine} />
              <Text style={s.signatureName}>{orgName}</Text>
              <Text style={s.signatureLabel}>Authorised Signatory</Text>
            </View>
          </View>

        </View>
      </Page>
    </Document>
  );
}
