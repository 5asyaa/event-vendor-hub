const xenditClient = require("../services/xenditService");

exports.createTestInvoice = async (req, res) => {
  try {
    const { Invoice } = xenditClient;

    const data = {
      amount: 10000,
      externalId: "TEST-" + Date.now(),
      description: "Test Invoice Event Vendor Hub",
      currency: "IDR",
      invoiceDuration: 86400
    };

    const response = await Invoice.createInvoice({
      data
    });

    res.json(response);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal membuat invoice",
      error: error.message
    });
  }
};