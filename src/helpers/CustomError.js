class CustomErrorAPI extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
const customErrorApi = (statusCode, message) => new CustomErrorAPI(statusCode, message);
module.exports = { customErrorApi, CustomErrorAPI };
