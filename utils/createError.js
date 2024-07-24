const createErrorResponse = (res, status, message) => {
  return res.status(status).json({
    status: status,
    error: getErrorType(status),
    message: message || "An unknown error occurred",
  });
};


const getErrorType = (status) => {
  switch (status) {
    case 400:
      return "Bad Request";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "Not Found";
    case 422:
      return "Unprocessable Entity";
    case 500:
      return "Internal Server Error";
    default:
      return "Error";
  }
};

module.exports = { createErrorResponse };
