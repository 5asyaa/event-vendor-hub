const db = require("../config/db");
const xenditClient = require("../services/xenditService");

// CREATE PAYMENT
exports.createPayment = async (req, res) => {
  try {
    const {
      id_booking,
      jumlah_bayar,
      metode_pembayaran,
      jenis_pembayaran = 'dp'
    } = req.body;

    const transaction_id =
      "TRX-" + Date.now();

    const external_id =
      "BOOKING-" + id_booking + "-" + Date.now();

    const { Invoice } = xenditClient;

    const invoice = await Invoice.createInvoice({
      data: {
        amount: Number(jumlah_bayar),
        externalId: external_id,
        description: `Pembayaran Booking #${id_booking}`,
        currency: "IDR",
        invoiceDuration: 86400, // 24 jam
        successRedirectUrl: `${process.env.FRONTEND_BASE_URL}/customer/booking-berhasil.html?id_booking=${id_booking}`,
        failureRedirectUrl: `${process.env.FRONTEND_BASE_URL}/customer/pembayaran.html?id_booking=${id_booking}&status=failed`
      }
    });

    db.query(
      `INSERT INTO payments
      (
        id_booking,
        jenis_pembayaran,
        jumlah_bayar,
        metode_pembayaran,
        status_bayar,
        transaction_id,
        waktu_bayar,
        xendit_invoice_id,
        xendit_invoice_url,
        external_id
      )
      VALUES
      (?, ?, ?, ?, 'pending', ?, NULL, ?, ?, ?)`,
      [
        id_booking,
        jenis_pembayaran,
        jumlah_bayar,
        metode_pembayaran,
        transaction_id,
        invoice.id,
        invoice.invoiceUrl,
        external_id
      ],
      (err, result) => {
        if (err) {
          console.error(err);

          return res.status(500).json({
            message: "Gagal menyimpan pembayaran",
            error: err
          });
        }

        res.json({
          message: "Invoice berhasil dibuat",
          id_payment: result.insertId,
          transaction_id,
          xendit_invoice_id: invoice.id,
          invoice_url: invoice.invoiceUrl,
          external_id
        });
      }
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Gagal membuat invoice",
      error: error.message
    });
  }
};

// PAYMENT CALLBACK (Webhook dari Xendit)
exports.paymentCallback = async (req, res) => {
  try {
    const callbackToken = req.headers["x-callback-token"];
    const expectedToken = process.env.XENDIT_CALLBACK_TOKEN;

    // 1. Validasi Token Webhook Xendit
    if (expectedToken && callbackToken !== expectedToken) {
      console.warn("Unauthorized webhook attempt. Invalid token.");
      return res.status(401).json({ message: "Invalid callback token" });
    }

    // Payload dari Xendit
    const {
      id: xendit_invoice_id,
      external_id,
      status,
      payment_method,
      paid_at
    } = req.body;

    console.log(`Menerima callback Xendit untuk external_id: ${external_id}, status: ${status}`);

    if (!external_id) {
      return res.status(400).json({ message: "Missing external_id" });
    }

    // Ambil id_booking dari external_id (Format: BOOKING-id_booking-timestamp)
    const parts = external_id.split("-");
    const id_booking = parts[1];

    if (!id_booking) {
      return res.status(400).json({ message: "Invalid external_id format" });
    }

    let status_bayar = "pending";
    let shouldConfirmBooking = false;
    let shouldRejectBooking = false;

    if (status === "PAID") {
      status_bayar = "paid";
      shouldConfirmBooking = true;
    } else if (status === "EXPIRED") {
      status_bayar = "expired";
      shouldRejectBooking = true;
    } else if (status === "FAILED") {
      status_bayar = "failed";
      shouldRejectBooking = true;
    }

    const paymentTime = paid_at ? new Date(paid_at) : new Date();
    const paymentData =
      await new Promise((resolve, reject) => {

        db.query(
          "SELECT * FROM payments WHERE xendit_invoice_id = ?",
          [xendit_invoice_id],
          (err, result) => {

            if (err) reject(err);
            else resolve(result[0]);

          }
        );

      });

    const statusPembayaran =
      paymentData.jenis_pembayaran === "pelunasan"
        ? "lunas"
        : "dp";
    const paymentResult = await new Promise((resolve, reject) => {

      db.query(
        "SELECT * FROM payments WHERE xendit_invoice_id = ?",
        [xendit_invoice_id],
        (err, result) => {

          if (err) reject(err);
          else resolve(result[0]);

        }
      );

    });

    const jenisPembayaran =
      paymentResult?.jenis_pembayaran;
    // 2. Update status_bayar di payment_db
    db.query(
      `UPDATE payments 
       SET status_bayar = ?, 
           waktu_bayar = ?, 
           metode_pembayaran = ? 
       WHERE xendit_invoice_id = ?`,
      [
        status_bayar,
        status === "PAID" ? paymentTime : null,
        payment_method || "Xendit",
        xendit_invoice_id
      ],
      async (err, result) => {
        if (err) {
          console.error("Gagal mengupdate status pembayaran:", err);
          return res.status(500).json({ message: "Database update failed", error: err });
        }

        try {
          const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || "http://localhost:3003";

          // 3. Sinkronisasi status booking ke booking-service
          if (shouldConfirmBooking) {
            // 1) Pastikan booking dikonfirmasi terlebih dahulu (status='confirmed')
            await fetch(`${bookingServiceUrl}/bookings/${id_booking}/confirm`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" }
            }).catch(e => console.error("Gagal confirm booking:", e.message));

            // 2) Update status_pembayaran menjadi 'dp' atau 'lunas'
            const paymentStatusRes =
              await fetch(
                `${bookingServiceUrl}/bookings/${id_booking}/payment-status`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    status_pembayaran:
                      statusPembayaran
                  })
                }
              );

              console.log(
                "Update booking payment status:",
                id_booking,
                statusPembayaran
              );

            if (!paymentStatusRes.ok) {
              console.error(
                `Gagal update status pembayaran booking #${id_booking}`
              );
            } else {
              console.log(
                `Booking #${id_booking} status pembayaran => ${statusPembayaran}`
              );
            }
          } else if (shouldRejectBooking) {
            const rejectRes = await fetch(`${bookingServiceUrl}/bookings/${id_booking}/reject`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" }
            });
            if (!rejectRes.ok) {
              console.error(`Gagal menolak booking #${id_booking} ke booking-service`);
            } else {
              console.log(`Booking #${id_booking} berhasil ditolak secara otomatis`);
            }
          }

          res.json({
            message: "Callback processed successfully",
            id_booking,
            status_bayar
          });
        } catch (svcErr) {
          console.error("Error communicating with booking-service:", svcErr);
          res.json({
            message: "Callback processed with booking update warning",
            error: svcErr.message
          });
        }
      }
    );
  } catch (err) {
    console.error("Callback error:", err);
    res.status(500).json({ message: "Internal callback handler error", error: err.message });
  }
};

// GET PAYMENT BY ID
exports.getById = (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT * FROM payments WHERE id_payment = ?",
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length === 0) {
        return res.status(404).json({
          message: "Data pembayaran tidak ditemukan"
        });
      }

      res.json(result[0]);
    }
  );
};

// GET PAYMENT BY BOOKING ID
exports.getByBookingId = (req, res) => {
  const id_booking = req.params.id_booking;

  db.query(
    "SELECT * FROM payments WHERE id_booking = ? ORDER BY id_payment ASC",
    [id_booking],
    async (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Data pembayaran untuk booking ini tidak ditemukan"
        });
      }

      let total_dibayar = 0;
      let tagihan_aktif = null;

      let adaDPPaid = false;
      let adaPelunasanPaid = false;

      // Iterasi pembayaran
      for (let i = 0; i < results.length; i++) {
        let payment = results[i];

        // Jika pembayaran masih pending, coba sinkronisasi manual ke Xendit
        // Ini berguna ketika environment localhost sehingga webhook tidak masuk
        if (payment.status_bayar === 'pending' && payment.xendit_invoice_id) {
          try {
            const { Invoice } = xenditClient;
            const invoice = await Invoice.getInvoiceById({ invoiceId: payment.xendit_invoice_id });

            if (invoice.status === 'PAID' || invoice.status === 'SETTLED') {
              payment.status_bayar = 'paid';
              payment.waktu_bayar = invoice.paidAt ? new Date(invoice.paidAt) : new Date();
              payment.metode_pembayaran = invoice.paymentMethod || payment.metode_pembayaran || 'Xendit';

              // Update status di database lokal
              await new Promise((resolve) => {
                db.query(
                  "UPDATE payments SET status_bayar = ?, waktu_bayar = ?, metode_pembayaran = ? WHERE id_payment = ?",
                  [payment.status_bayar, payment.waktu_bayar, payment.metode_pembayaran, payment.id_payment],
                  () => resolve()
                );
              });

              // Sinkronisasi ke booking-service secara sinkron (await) agar response konsisten
              const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || "http://localhost:3003";
              const targetStatus = payment.jenis_pembayaran === "pelunasan" ? "lunas" : "dp";
              
              try {
                await fetch(`${bookingServiceUrl}/bookings/${payment.id_booking}/confirm`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" }
                });
                await fetch(`${bookingServiceUrl}/bookings/${payment.id_booking}/payment-status`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status_pembayaran: targetStatus })
                });
                console.log(`Booking #${payment.id_booking} status_pembayaran terupdate ke: ${targetStatus}`);
              } catch(e) {
                console.error("Gagal update booking-service:", e.message);
              }

            } else if (invoice.status === 'EXPIRED') {
              payment.status_bayar = 'expired';

              // Update status di database lokal
              db.query(
                "UPDATE payments SET status_bayar = ? WHERE id_payment = ?",
                [payment.status_bayar, payment.id_payment]
              );

              // Informasikan booking-service untuk reject jika ini pembayaran pertama (DP)
              if (i === 0) {
                const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || "http://localhost:3003";
                fetch(
                  `${bookingServiceUrl}/bookings/${payment.id_booking}/payment-status`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      status_pembayaran:
                        payment.jenis_pembayaran === "pelunasan"
                          ? "lunas"
                          : "dp"
                    })
                  }
                ).catch(e =>
                  console.error(
                    "Gagal update status pembayaran:",
                    e.message
                  )
                );
              }
            }
          } catch (error) {
            console.error("Gagal mengambil data dari Xendit secara manual:", error.message);
          }
        }

        if (payment.status_bayar === 'paid') {

            total_dibayar += Number(payment.jumlah_bayar);

            if (payment.jenis_pembayaran === 'dp') {
                adaDPPaid = true;
            }

            if (payment.jenis_pembayaran === 'pelunasan') {
                adaPelunasanPaid = true;
            }
        } else if (payment.status_bayar === 'pending') {
            tagihan_aktif = payment;
        }
      }

      let statusPembayaran = "belum_bayar";

        if (adaPelunasanPaid) {

            statusPembayaran = "lunas";

            tagihan_aktif = null;

        } else if (adaDPPaid) {

            statusPembayaran = "dp";

        }

      if (statusPembayaran === "lunas") {

          tagihan_aktif = null;

      }

      res.json({
        total_dibayar,
        riwayat: results,
        tagihan_aktif,
        status_pembayaran: statusPembayaran,
        jumlah_bayar: total_dibayar,
        invoice_url:
          tagihan_aktif
            ? tagihan_aktif.xendit_invoice_url
            : null
      });
    }
  );
};

// GET ALL PAYMENTS
exports.getAll = (req, res) => {
  db.query(
    "SELECT * FROM payments ORDER BY id_payment DESC",
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
};