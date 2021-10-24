/* eslint-disable object-shorthand */
class ApiResponse {
    /*
    * NOTE: List of HTTP status codes that can be used
    * 200 - OK - success response
    * 201 - Created - when a resource is created
    * 400 - Bad Request - client's fault used when inputs are incorrect
    * 401 - Unauthorized - not logged in
    * 403 - Forbidden - not allowed to access certain routes
    * 404 - Not Found - when a resource doesn't exist
    * 500 - Internal Server Error - generic error used when it's the server's fault
    */
    coreResponse(data, message, statusCode, isSuccess = true) {
        // if (!message) {
        //     return {
        //         message: 'Message is required',
        //         statusCode: 500,
        //     };
        // }

        // Send success response
        if (isSuccess) {
            return {
                message: message,
                error: false,
                statusCode: statusCode,
                data: data,
            };
        }

        // Send error response
        return {
            message: message,
            error: true,
            statusCode: statusCode,
        };
    }

    success(data, message = '', statusCode = 200) {
        return this.coreResponse(data, message, statusCode, true);
    }

    error(message = '', statusCode = 500) {
        let errorMessage;

        if (statusCode === 404) {
            errorMessage = 'Not Found';
        } else if (statusCode === 401) {
            errorMessage = 'Unauthenticated';
        }

        // If message param is filled up, use it as the message text
        if (message) return this.coreResponse(null, message, statusCode, false);

        return this.coreResponse(null, errorMessage, statusCode, false);
    }
}

module.exports = ApiResponse;
