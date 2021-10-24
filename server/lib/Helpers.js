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

    // addErrorMessages(field) {
    //     const suffix = 'not found';
    //     let errorMessage;

    //     if (field === 'CustomerId') {
    //         errorMessage = `Customer id ${suffix}`;
    //     } else if (field === 'DsTypeId') {
    //         errorMessage = `Ds type id ${suffix}`;
    //     } else if (field === 'UserId') {
    //         errorMessage = `User id ${suffix}`;
    //     } else if (field === 'UserTypeId') {
    //         errorMessage = `User type id ${suffix}`;
    //     }

    //     return errorMessage;
    // }
}

module.exports = Helpers;
