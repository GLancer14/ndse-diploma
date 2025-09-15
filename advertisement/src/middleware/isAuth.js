const { errorResponseHandler } = require("../utils/responseHandlers");

module.exports = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return errorResponseHandler(res, "Вы не авторизованы", 401);
  }

  next();
};