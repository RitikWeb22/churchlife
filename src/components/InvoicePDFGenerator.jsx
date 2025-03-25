import React from "react";
import PropTypes from "prop-types";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

// Create styles for your PDF document
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  section: {
    marginVertical: 10,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: { flexDirection: "row" },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
});

// Updated InvoicePDF component with Email field in billing info
const InvoicePDF = ({ invoiceData }) => {
  const {
    invoiceNumber = "N/A",
    userName = "",
    email = "",
    contactNumber = "",
    purchaseDate = new Date().toISOString(),
    bookName = "",
    language = "",
    quantity = 1,
    price = 0,
    logo = "https://img.lovepik.com/freepng/28/22/33/47W58PICG2wBy33diB4Vt_PIC2018.png_wh860.png",
  } = invoiceData;

  const formattedDate = new Date(purchaseDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const lineTotal = quantity * price;
  const subtotal = lineTotal;
  const tax = 0;
  const total = subtotal + tax;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Invoice</Text>
          <Text>Invoice Number: {invoiceNumber}</Text>
        </View>

        {/* Billing Info */}
        <View style={styles.section}>
          <Text>Bill To: {userName}</Text>
          {email && <Text>Email: {email}</Text>}
          <Text>Contact: {contactNumber}</Text>
          <Text>Invoice Date: {formattedDate}</Text>
        </View>

        {/* Items Table */}
        <View style={[styles.section, styles.table]}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>Item</Text>
            <Text style={styles.tableCol}>Language</Text>
            <Text style={styles.tableCol}>Quantity</Text>
            <Text style={styles.tableCol}>Unit Price</Text>
            <Text style={styles.tableCol}>Total</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol}>{bookName}</Text>
            <Text style={styles.tableCol}>{language}</Text>
            <Text style={styles.tableCol}>{quantity}</Text>
            <Text style={styles.tableCol}>₹{Number(price).toFixed(2)}</Text>
            <Text style={styles.tableCol}>₹{lineTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text>Subtotal: ₹{subtotal.toFixed(2)}</Text>
          <Text>Tax: ₹{tax.toFixed(2)}</Text>
          <Text style={{ fontWeight: "bold" }}>Total: ₹{total.toFixed(2)}</Text>
        </View>

        {/* Footer */}
        <View style={styles.section}>
          <Text>Thank you for your business!</Text>
          <Text style={{ fontSize: 10 }}>
            For any questions, contact us at info@example.com.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

InvoicePDF.propTypes = {
  invoiceData: PropTypes.shape({
    invoiceNumber: PropTypes.string,
    userName: PropTypes.string,
    email: PropTypes.string,
    contactNumber: PropTypes.string,
    purchaseDate: PropTypes.string,
    bookName: PropTypes.string,
    language: PropTypes.string,
    quantity: PropTypes.number,
    price: PropTypes.number,
  }).isRequired,
};

// Main component to show the download link
const InvoiceTemplate = ({ invoiceData }) => {
  return (
    <div className="p-6">
      <PDFDownloadLink
        document={<InvoicePDF invoiceData={invoiceData} />}
        fileName={`invoice-${invoiceData.invoiceNumber || "N_A"}.pdf`}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {({ loading }) => (loading ? "Preparing document..." : "Download PDF")}
      </PDFDownloadLink>
    </div>
  );
};

InvoiceTemplate.propTypes = {
  invoiceData: PropTypes.shape({
    invoiceNumber: PropTypes.string,
    userName: PropTypes.string,
    email: PropTypes.string,
    contactNumber: PropTypes.string,
    purchaseDate: PropTypes.string,
    bookName: PropTypes.string,
    language: PropTypes.string,
    quantity: PropTypes.number,
    price: PropTypes.number,
  }),
};

export default InvoiceTemplate;
