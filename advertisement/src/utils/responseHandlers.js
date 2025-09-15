function responseHandler(res, data, statusCode = 200) {
  res.status(statusCode).json({ data, status: "ok" });
}

function errorResponseHandler(res, message, statusCode) {
  if (statusCode) {
    res.status(statusCode).json({ error: message, status: "error"});
  } else {
    res.json({ error: message, status: "error"});
  }
}

exports.responseHandler = responseHandler;
exports.errorResponseHandler = errorResponseHandler;