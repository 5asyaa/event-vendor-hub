require("dotenv").config();
const db = require("./config/db");
const xenditClient = require("./services/xenditService");

async function run() {
  db.query("SELECT * FROM payments ORDER BY id_payment DESC LIMIT 1", async (err, results) => {
    if (err) return console.error(err);
    if (!results.length) return console.log("No payments");
    const p = results[0];
    console.log("Latest payment:", p);
    
    if (p.xendit_invoice_id) {
      try {
        const { Invoice } = xenditClient;
        const inv = await Invoice.getInvoiceById({ invoiceId: p.xendit_invoice_id });
        console.log("Invoice status:", inv.status);
      } catch (e) {
        console.error("Error fetching invoice:", e.message);
      }
    }
    process.exit(0);
  });
}
run();
