class Helpers {
    checkIfValidPositiveInteger(stringValue) {
        // Parse the passed string value as int
        const parsedInt = parseInt(stringValue, 10);
        const convertToString = parsedInt.toString();

        // Check if the parsed int converted to string is equal to its original string
        const isParsedStringEqualToOriginal = convertToString === stringValue;

        if (isParsedStringEqualToOriginal === true && parsedInt > 0) return true;

        return {
            message: 'Cannot be parsed into an integer',
            error: true,
            statusCode: 500,
        };
    }

    addErrorMessage(field) {
        const suffix = 'not found';
        let errorMessage;

        if (field === 'categoryId') {
            errorMessage = `Category id ${suffix}`;
        } else if (field === 'userId') {
            errorMessage = `User id ${suffix}`;
        }

        return errorMessage;
    }
}

module.exports = Helpers;
