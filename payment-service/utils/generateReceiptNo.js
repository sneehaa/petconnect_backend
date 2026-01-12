const generateReceiptNo = () => {
  return "RCPT-" + Date.now();
};

export default generateReceiptNo;
