import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

interface CauseAmount {
  cause: string;
  amount: string;
}

interface LetterData {
  institutionName: string;
  recipientName: string;
  date: string;
  reference: string;
  totalAmount: string;
  causes: CauseAmount[];
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  headerSection: {
    backgroundColor: '#4A90E2',
    height: 120,
    position: 'relative',
    marginBottom: 0,
  },
  headerContent: {
    position: 'absolute',
    right: 40,
    top: 30,
    color: 'white',
    textAlign: 'right',
  },
  logoArea: {
    position: 'absolute',
    right: 40,
    top: 30,
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  heartIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  companyName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  mainContent: {
    padding: 40,
    paddingTop: 30,
  },
  contactInfo: {
    marginBottom: 40,
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.4,
  },
  contactLine: {
    marginBottom: 2,
  },
  website: {
    color: '#4A90E2',
    textDecoration: 'underline',
  },
  recipientSection: {
    marginBottom: 30,
    marginTop: 60,
  },
  date: {
    marginBottom: 40,
    fontSize: 11,
    color: '#333333',
  },
  reference: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333333',
  },
  greeting: {
    marginBottom: 25,
    fontSize: 11,
    color: '#333333',
  },
  bodyText: {
    marginBottom: 25,
    fontSize: 11,
    lineHeight: 1.5,
    color: '#333333',
  },
  table: {
    marginTop: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    minHeight: 35,
    alignItems: 'center',
  },
  tableRowLast: {
    flexDirection: 'row',
    minHeight: 35,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tableCell: {
    padding: 10,
    flex: 2,
    borderRightWidth: 1,
    borderRightColor: '#cccccc',
    fontSize: 11,
  },
  tableCellAmount: {
    padding: 10,
    flex: 1,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: 'bold',
  },
  totalRow: {
    backgroundColor: '#f0f8ff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  closing: {
    marginTop: 30,
    marginBottom: 50,
    fontSize: 11,
    color: '#333333',
  },
  signature: {
    marginTop: 40,
    fontSize: 18,
    fontFamily: 'Times-Italic',
    color: '#333333',
  },
  signatureName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#333333',
  },
  title: {
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#4A90E2',
  },
  diagonalShape: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: '#4A90E2',
    transform: 'skewY(-2deg)',
    transformOrigin: 'bottom left',
  },
});

// Create Document Component
const DistributionLetter = ({ data }: { data: LetterData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.logoArea}>
          <Text style={styles.heartIcon}>♥</Text>
          <Text style={styles.companyName}>Kinship Canada</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Contact Information */}
        <View style={styles.contactInfo}>
          <Text style={styles.contactLine}>Kinship Canada</Text>
          <Text style={styles.contactLine}>43 Matson Dr, Bolton, ON L7E0B1</Text>
          <Text style={styles.contactLine}>647-919-4368</Text>
          <Text style={styles.contactLine}>info@kinshipcanada.com</Text>
          <Text style={[styles.contactLine, styles.website]}>www.kinshipcanada.com</Text>
        </View>

        {/* Recipient */}
        <View style={styles.recipientSection}>
          <Text>{data.institutionName}</Text>
        </View>

        {/* Date */}
        <View style={styles.date}>
          <Text>{data.date}</Text>
        </View>

        {/* Reference */}
        <View style={styles.reference}>
          <Text>Reference: {data.reference}</Text>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text>Assalamu Alaykum Br. {data.recipientName}</Text>
        </View>

        {/* Body Text */}
        <View style={styles.bodyText}>
          <Text>
            I pray you are well. We have wired ${data.totalAmount} CAD equivalent to $5066.27. GBP, to be used toward the Ramadhan poverty relief campaign. Jazakallah for your and Br. Sibtains efforts on the ground.
          </Text>
        </View>

        {/* Causes Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Cause</Text>
            <Text style={styles.tableCellAmount}>Amount</Text>
          </View>
          {data.causes.map((item, index) => (
            <View key={index} style={index === data.causes.length - 1 ? styles.tableRowLast : styles.tableRow}>
              <Text style={styles.tableCell}>{item.cause}</Text>
              <Text style={styles.tableCellAmount}>${item.amount}</Text>
            </View>
          ))}
          <View style={[styles.tableRowLast, styles.totalRow]}>
            <Text style={styles.tableCell}>Total</Text>
            <Text style={styles.tableCellAmount}>${data.totalAmount}</Text>
          </View>
        </View>

        {/* Closing */}
        <View style={styles.closing}>
          <Text>Warm regards,</Text>
        </View>

        {/* Signature */}
        <View style={styles.signature}>
          <Text>Ruby Hussein</Text>
          <Text style={styles.signatureName}>Ruby Hussein</Text>
          <Text style={styles.title}>ADMINISTRATOR</Text>
        </View>
      </View>

      {/* Footer with diagonal shape */}
      <View style={styles.diagonalShape} />
    </Page>
  </Document>
);

export const DistributionLetterDownload = ({ data }: { data: LetterData }) => (
  <PDFDownloadLink
    document={<DistributionLetter data={data} />}
    fileName={`distribution-letter-${data.reference.toLowerCase().replace(/\s+/g, '-')}.pdf`}
  >
    {({ blob, url, loading, error }) =>
      loading ? 'Generating PDF...' : 'Download PDF'
    }
  </PDFDownloadLink>
);

export default DistributionLetter; 