const xenditClient = require("../services/xenditService");

exports.testXendit = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Xendit client berhasil dimuat",
      hasSecretKey: !!process.env.XENDIT_SECRET_KEY
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};