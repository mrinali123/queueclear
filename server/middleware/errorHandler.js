function errorHandler(error, request, response, next) {
  console.error(error);

  const requestedStatus = Number(error.statusCode ?? error.status);
  const statusCode =
    Number.isInteger(requestedStatus) && requestedStatus >= 400 && requestedStatus <= 599
      ? requestedStatus
      : 500;

  response.status(statusCode).json({
    error: statusCode < 500 ? "Request failed" : "Internal server error",
  });
}

export default errorHandler;