// PaymentManagement.jsx
import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InvoiceTemplate from "../components/InvoicePDFGenerator";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import ViewModal from "../components/ViewModal";
import {
  PDFDownloadLink,
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Register custom font if needed (ensure correct path)
Font.register({
  family: "DejaVuSans",
  src: "/fonts/DejaVuSans.ttf",
});

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "DejaVuSans",
    backgroundColor: "#f7f7f7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  section: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
  },
  tableRow: { flexDirection: "row" },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 10,
    color: "#777777",
  },
});

// Simple InvoicePDF component
const InvoicePDF = ({ invoiceData }) => {
  const {
    invoiceNumber = "N/A",
    userName = "",
    collectorName = "",
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
          <View>
            <Text style={styles.title}>Invoice</Text>
            <Text style={styles.headerText}>
              Invoice Number: {invoiceNumber}
            </Text>
          </View>
          {logo && (
            <Image
              src={logo}
              style={{
                width: 80,
                height: 80,
                objectFit: "contain",
                borderRadius: 40,
              }}
            />
          )}
        </View>

        {/* Billing Info */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text>Bill To: {userName}</Text>
            <Text>Invoice Date: {formattedDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text>Collector: {collectorName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text>Contact: {contactNumber}</Text>
          </View>
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
          <View style={styles.infoRow}>
            <Text>Subtotal:</Text>
            <Text>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text>Tax:</Text>
            <Text>₹{tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.infoRow, { marginTop: 5 }]}>
            <Text style={{ fontWeight: "bold" }}>Total:</Text>
            <Text style={{ fontWeight: "bold" }}>₹{total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text>For any questions, contact us at info@example.com.</Text>
        </View>
      </Page>
    </Document>
  );
};

const PaymentManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [purchasePage, setPurchasePage] = useState(1);
  const [borrowPage, setBorrowPage] = useState(1);
  const itemsPerPage = 6;

  // Modal and invoice states
  const [modalImage, setModalImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Payment deletion state
  const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] =
    useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  // Fetch payments from API
  const fetchPayments = async () => {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/payments`;
      const response = await fetch(url);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Error fetching payments");
    }
  };

  useEffect(() => {
    fetchPayments();
    setPurchasePage(1);
    setBorrowPage(1);
  }, [paymentFilter, dateRangeFilter]);

  // Filtering logic
  const getTransactionDate = (item) =>
    item.paymentMethod === "borrow" ? item.borrowDate : item.purchaseDate;

  const getDateCutoff = () => {
    const now = new Date();
    const cutoff = new Date();
    switch (dateRangeFilter) {
      case "3months":
        cutoff.setMonth(now.getMonth() - 3);
        return cutoff;
      case "6months":
        cutoff.setMonth(now.getMonth() - 6);
        return cutoff;
      case "1year":
        cutoff.setFullYear(now.getFullYear() - 1);
        return cutoff;
      default:
        return null;
    }
  };

  const finalFilteredTransactions = transactions.filter((item) => {
    if (paymentFilter !== "all" && item.paymentMethod !== paymentFilter)
      return false;
    const text = searchText.toLowerCase();
    if (
      text &&
      !(
        item.bookName.toLowerCase().includes(text) ||
        item.userName.toLowerCase().includes(text) ||
        item.contactNumber.includes(text) ||
        (item.email && item.email.toLowerCase().includes(text))
      )
    )
      return false;
    const cutoff = getDateCutoff();
    if (cutoff) {
      const itemDate = getTransactionDate(item);
      if (!itemDate) return false;
      const d = new Date(itemDate);
      if (d < cutoff) return false;
    }
    return true;
  });

  const purchaseTransactions = finalFilteredTransactions.filter(
    (item) => item.paymentMethod === "cash" || item.paymentMethod === "online"
  );
  const borrowTransactions = finalFilteredTransactions.filter(
    (item) => item.paymentMethod === "borrow"
  );

  const purchaseStartIndex = (purchasePage - 1) * itemsPerPage;
  const paginatedPurchaseTransactions = purchaseTransactions.slice(
    purchaseStartIndex,
    purchaseStartIndex + itemsPerPage
  );
  const totalPurchasePages = Math.ceil(
    purchaseTransactions.length / itemsPerPage
  );

  const borrowStartIndex = (borrowPage - 1) * itemsPerPage;
  const paginatedBorrowTransactions = borrowTransactions.slice(
    borrowStartIndex,
    borrowStartIndex + itemsPerPage
  );
  const totalBorrowPages = Math.ceil(borrowTransactions.length / itemsPerPage);

  // CSV Export functions (including email field)
  const downloadCSV = (csvData, filename) => {
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("CSV downloaded successfully!");
  };

  const exportCashToCSV = () => {
    const cashTx = finalFilteredTransactions.filter(
      (item) => item.paymentMethod === "cash"
    );
    const csvHeader =
      "S.No,Book Name,Name,Email,Contact Number,Language,Quantity,Total Price,Payment Method,Purchase Date\n";
    const csvRows = cashTx.map((item, index) => {
      const sNo = index + 1;
      const purchaseDate = item.purchaseDate
        ? new Date(item.purchaseDate).toISOString().slice(0, 10)
        : "";
      const totalPrice =
        item.price && item.quantity
          ? (item.price * item.quantity).toFixed(2)
          : "0";
      return [
        sNo,
        `"${item.bookName}"`,
        `"${item.userName}"`,
        `"${item.email || ""}"`,
        `"${item.contactNumber}"`,
        item.language || "",
        item.quantity || "",
        totalPrice,
        item.paymentMethod,
        purchaseDate,
      ].join(",");
    });
    const csvData = csvHeader + csvRows.join("\n");
    downloadCSV(csvData, "cash_transactions.csv");
  };

  const exportOnlineToCSV = () => {
    const onlineTx = finalFilteredTransactions.filter(
      (item) => item.paymentMethod === "online"
    );
    const csvHeader =
      "S.No,Book Name,Name,Email,Contact Number,Language,Collector Name,Quantity,Total Price,Payment Method,Screenshot URL,Purchase Date\n";
    const csvRows = onlineTx.map((item, index) => {
      const sNo = index + 1;
      const purchaseDate = item.purchaseDate
        ? new Date(item.purchaseDate).toISOString().slice(0, 10)
        : "";
      const totalPrice =
        item.price && item.quantity
          ? (item.price * item.quantity).toFixed(2)
          : "0";
      return [
        sNo,
        `"${item.bookName}"`,
        `"${item.userName}"`,
        `"${item.email || ""}"`,
        `"${item.contactNumber}"`,
        item.language || "",
        item.collectorName || "",
        item.quantity || "",
        totalPrice,
        item.paymentMethod,
        item.screenshot || "",
        purchaseDate,
      ].join(",");
    });
    const csvData = csvHeader + csvRows.join("\n");
    downloadCSV(csvData, "online_transactions.csv");
  };

  const exportBorrowToCSV = () => {
    const borrowTx = finalFilteredTransactions.filter(
      (item) => item.paymentMethod === "borrow"
    );
    const csvHeader =
      "S.No,Book Name,Name,Email,Contact Number,Language,Borrow Date,Return Date\n";
    const csvRows = borrowTx.map((item, index) => {
      const sNo = index + 1;
      const borrowDate = item.borrowDate
        ? new Date(item.borrowDate).toISOString().slice(0, 10)
        : "";
      const returnDate = item.returnDate
        ? new Date(item.returnDate).toISOString().slice(0, 10)
        : "";
      return [
        sNo,
        `"${item.bookName}"`,
        `"${item.userName}"`,
        `"${item.email || ""}"`,
        `"${item.contactNumber}"`,
        item.language || "",
        borrowDate,
        returnDate,
      ].join(",");
    });
    const csvData = csvHeader + csvRows.join("\n");
    downloadCSV(csvData, "borrow_transactions.csv");
  };

  const exportAllToCSV = () => {
    const allTx = finalFilteredTransactions;
    const csvHeader =
      "S.No,Book Name,Name,Email,Contact Number,Language,Quantity,Total Price,Payment Method,Borrow/Purchase Date\n";
    const csvRows = allTx.map((item, index) => {
      const sNo = index + 1;
      const dateField =
        item.paymentMethod === "borrow" ? item.borrowDate : item.purchaseDate;
      const dateStr = dateField
        ? new Date(dateField).toISOString().slice(0, 10)
        : "";
      const totalPrice =
        item.price && item.quantity
          ? (item.price * item.quantity).toFixed(2)
          : "0";
      return [
        sNo,
        `"${item.bookName}"`,
        `"${item.userName}"`,
        `"${item.email || ""}"`,
        `"${item.contactNumber}"`,
        item.language || "",
        item.quantity || "",
        totalPrice,
        item.paymentMethod || "",
        dateStr,
      ].join(",");
    });
    const csvData = csvHeader + csvRows.join("\n");
    downloadCSV(csvData, "all_transactions.csv");
  };

  // IMAGE & INVOICE HANDLERS
  const handleViewImage = (screenshot) => {
    let url = screenshot;
    if (!screenshot.startsWith("http")) {
      url = `${import.meta.env.VITE_API_BASE_URL}/${screenshot}`;
    }
    setModalImage(url);
    setShowImageModal(true);
  };

  const handleGenerateInvoice = (item) => {
    setInvoiceData(item);
    setShowInvoiceModal(true);
  };

  // Delete modal functions
  const openDeletePaymentModal = (paymentId) => {
    setPaymentToDelete(paymentId);
    setIsDeletePaymentModalOpen(true);
  };

  const closeDeletePaymentModal = () => {
    setPaymentToDelete(null);
    setIsDeletePaymentModalOpen(false);
  };

  const handleDeletePayment = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/payments/${paymentToDelete}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setTransactions((prev) =>
          prev.filter((payment) => payment._id !== paymentToDelete)
        );
        toast.success("Payment deleted successfully!");
      } else {
        toast.error("Failed to delete payment.");
        console.error("Delete error:", response.statusText);
      }
    } catch (error) {
      toast.error("Error deleting payment.");
      console.error("Delete error:", error);
    } finally {
      closeDeletePaymentModal();
    }
  };

  return (
    <div className="p-6 w-full dark:bg-gray-900 dark:text-gray-200 mx-auto">
      <h1 className="text-3xl font-bold mb-4">Payment Management</h1>

      {/* Filters Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mb-4">
        <div className="flex space-x-2 items-center">
          <label className="font-semibold">Payment Method:</label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="select select-bordered"
          >
            <option value="all">All</option>
            <option value="cash">Cash</option>
            <option value="online">Online</option>
            <option value="borrow">Borrow</option>
          </select>
        </div>
        <div className="flex space-x-2 items-center">
          <label className="font-semibold">Date Range:</label>
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="select select-bordered"
          >
            <option value="all">All</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last 1 Year</option>
          </select>
        </div>
        <div className="flex space-x-2 items-center">
          <label className="font-semibold">Search:</label>
          <input
            type="text"
            className="input input-bordered"
            placeholder="Search Book/User/Contact/Email"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {paymentFilter === "all" && (
          <button onClick={exportAllToCSV} className="btn btn-sm btn-primary">
            Export All
          </button>
        )}
        {paymentFilter === "cash" && (
          <button onClick={exportCashToCSV} className="btn btn-sm btn-primary">
            Export Cash
          </button>
        )}
        {paymentFilter === "online" && (
          <button
            onClick={exportOnlineToCSV}
            className="btn btn-sm btn-secondary"
          >
            Export Online
          </button>
        )}
        {paymentFilter === "borrow" && (
          <button
            onClick={exportBorrowToCSV}
            className="btn btn-sm btn-primary"
          >
            Export Borrow
          </button>
        )}
      </div>

      {/* Purchase Transactions Section */}
      {(paymentFilter === "all" ||
        paymentFilter === "cash" ||
        paymentFilter === "online") && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Purchase Transactions</h2>
          <div className="overflow-x-auto dark:bg-gray-800 scrollbar-hide">
            <table className="table w-full table-zebra">
              <thead>
                <tr className="dark:text-gray-200">
                  <th>ID</th>
                  <th>Book Name</th>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Contact Number</th>
                  <th>Language</th>
                  <th>Payment Method</th>
                  <th>Collector Name</th>
                  <th>Total Price</th>
                  <th>Quantity</th>
                  <th>Screenshot</th>
                  <th>Invoice</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPurchaseTransactions.map((item) => (
                  <tr key={item._id}>
                    <td>{item._id}</td>
                    <td>{item.bookName}</td>
                    <td>{item.userName}</td>
                    <td>{item.email || "-"}</td>
                    <td>{item.contactNumber}</td>
                    <td>{item.language}</td>
                    <td className="capitalize">{item.paymentMethod}</td>
                    <td>
                      {item.paymentMethod === "online"
                        ? item.collectorName || "-"
                        : "-"}
                    </td>
                    <td>
                      {item.price && item.quantity
                        ? `₹${(item.price * item.quantity).toFixed(2)}`
                        : "-"}
                    </td>
                    <td>{item.quantity || "-"}</td>
                    <td>
                      {item.paymentMethod === "online" && item.screenshot ? (
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleViewImage(item.screenshot)}
                        >
                          View
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {(item.paymentMethod === "cash" ||
                        item.paymentMethod === "online") && (
                        <PDFDownloadLink
                          document={<InvoicePDF invoiceData={item} />}
                          fileName={`invoice-${
                            item.invoiceNumber || "N_A"
                          }.pdf`}
                          className="btn btn-sm btn-info"
                        >
                          {({ loading }) =>
                            loading ? "Loading..." : "Invoice"
                          }
                        </PDFDownloadLink>
                      )}
                    </td>
                    <td className=" gap-2">
                      <button
                        className="btn  btn-sm btn-error"
                        onClick={() => openDeletePaymentModal(item._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedPurchaseTransactions.length === 0 && (
                  <tr>
                    <td colSpan="13" className="text-center">
                      No purchase transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPurchasePages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                disabled={purchasePage === 1}
                onClick={() => setPurchasePage(purchasePage - 1)}
                className="btn btn-sm"
              >
                Previous
              </button>
              <span>
                Page {purchasePage} of {totalPurchasePages}
              </span>
              <button
                disabled={purchasePage === totalPurchasePages}
                onClick={() => setPurchasePage(purchasePage + 1)}
                className="btn btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Borrow Transactions Section */}
      {(paymentFilter === "all" || paymentFilter === "borrow") && (
        <div>
          <h2 className="text-2xl font-semibold mb-2">Borrow Transactions</h2>
          <div className="overflow-x-auto dark:bg-gray-800 scrollbar-hide">
            <table className="table w-full table-zebra">
              <thead>
                <tr className="dark:text-gray-200">
                  <th>ID</th>
                  <th>Book Name</th>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Contact Number</th>
                  <th>Language</th>
                  <th>Borrow Date</th>
                  <th>Return Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBorrowTransactions.map((item) => (
                  <tr key={item._id}>
                    <td>{item._id}</td>
                    <td>{item.bookName}</td>
                    <td>{item.userName}</td>
                    <td>{item.email || "-"}</td>
                    <td>{item.contactNumber}</td>
                    <td>{item.language}</td>
                    <td>
                      {item.borrowDate
                        ? new Date(item.borrowDate).toISOString().slice(0, 10)
                        : "-"}
                    </td>
                    <td>
                      {item.returnDate
                        ? new Date(item.returnDate).toISOString().slice(0, 10)
                        : "-"}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm  btn-error"
                        onClick={() => openDeletePaymentModal(item._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedBorrowTransactions.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center">
                      No borrow transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalBorrowPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                disabled={borrowPage === 1}
                onClick={() => setBorrowPage(borrowPage - 1)}
                className="btn btn-sm"
              >
                Previous
              </button>
              <span>
                Page {borrowPage} of {totalBorrowPages}
              </span>
              <button
                disabled={borrowPage === totalBorrowPages}
                onClick={() => setBorrowPage(borrowPage + 1)}
                className="btn btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image Modal for Preview */}
      {showImageModal && modalImage && (
        <ViewModal
          title="Image Preview"
          onClose={() => setShowImageModal(false)}
        >
          <img
            src={modalImage}
            alt="Full View"
            className="w-6xl mx-auto  object-contain"
          />
        </ViewModal>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && invoiceData && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <div id="invoiceContainer">
              <InvoiceTemplate invoiceData={invoiceData} />
            </div>
            <div className="modal-action flex gap-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowInvoiceModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeletePaymentModalOpen && (
        <DeleteConfirmModal
          message="Are you sure you want to delete this payment?"
          onConfirm={handleDeletePayment}
          onCancel={closeDeletePaymentModal}
        />
      )}

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default PaymentManagement;
