// @desc    Test Backend Route
// @route   GET /api/test
// @access  Public
const testBackend = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend running successfully"
  });
};

module.exports = { testBackend };