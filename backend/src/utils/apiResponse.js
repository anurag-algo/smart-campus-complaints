class ApiResponse {
  constructor(statusCode, message = "Succes", data = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.success = statusCode < 400;
    if (data != null) {
      this.data = data;
    }
  }
}
export default ApiResponse;
