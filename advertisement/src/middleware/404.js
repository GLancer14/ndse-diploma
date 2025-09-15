const { errorResponseHandler } = require("../utils/responseHandlers");

module.exports = (req, res) => {
  errorResponseHandler(res, "404 | Not found", 404);
};