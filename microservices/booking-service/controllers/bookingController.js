const db = require("../config/db");

// CREATE BOOKING
exports.createBooking = (req, res) => {
  const {
    id_user,
    id_service,
    tanggal_event,
    waktu_mulai,
    lokasi,
    no_telepon,
    catatan,
    total_harga
  } = req.body;

  db.query(
    `INSERT INTO bookings
    (
      id_user,
      id_service,
      tanggal_event,
      waktu_mulai,
      lokasi,
      no_telepon,
      catatan,
      total_harga,
      status
    )
    VALUES
    (
      ?, ?, ?, ?, ?, ?, ?, ?, 'pending'
    )`,
    [
      id_user,
      id_service,
      tanggal_event,
      waktu_mulai,
      lokasi,
      no_telepon,
      catatan,
      total_harga
    ],
    async (err, result) => {
      if (err) {
        console.error(err);

        return res.status(500).json({
          message: "Gagal membuat booking",
          error: err
        });
      }

      const id_booking = result.insertId;
      
      res.json({
        message: "Booking berhasil dibuat, menunggu konfirmasi vendor",
        id_booking: id_booking
      });
    }
  );
};

// GET BOOKING BY ID
exports.getById = (req, res) => {
  const id = req.params.id;

  db.query(
    "SELECT * FROM bookings WHERE id_booking = ?",
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length === 0) {
        return res.status(404).json({
          message: "Booking tidak ditemukan"
        });
      }

      res.json(result[0]);
    }
  );
};

// GET ALL BOOKINGS
exports.getAll = (req, res) => {
  db.query(
    "SELECT * FROM bookings ORDER BY id_booking DESC",
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
};

// CONFIRM BOOKING
// CONFIRM BOOKING
exports.confirmBooking = (req, res) => {

  const id = req.params.id;

  db.query(
    `
    UPDATE bookings
    SET
      status='confirmed',
      status_pembayaran='belum_bayar'
    WHERE id_booking=?
    `,
    [id],
    (err) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Booking berhasil dikonfirmasi",
        id_booking: id,
        status: "confirmed",
        status_pembayaran: "belum_bayar"
      });

    }
  );

};

// REJECT BOOKING
exports.rejectBooking = (req, res) => {
  const id = req.params.id;

  db.query(
    "UPDATE bookings SET status='rejected' WHERE id_booking=?",
    [id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Booking berhasil ditolak",
        id_booking: id
      });
    }
  );
};

  // UPDATE STATUS PEMBAYARAN
exports.updatePaymentStatus = (req, res) => {

  const id = req.params.id;
  const { status_pembayaran } = req.body;

  db.query(
    "UPDATE bookings SET status_pembayaran=? WHERE id_booking=?",
    [status_pembayaran, id],
    (err) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Status pembayaran berhasil diperbarui",
        id_booking: id,
        status_pembayaran
      });

    }
  );

};