//Otto Flaherty Coding Challenge for Upstreet  2020

import axios from "axios";
class VerifyDocumentError extends Error {
    code: string;
    constructor(message: string, code: string) {
        super(message);
        this.code = code;
    }
}
/**
 * Checks that all the data pass the necessary formating and returns true if so, false if not
 */
function checkData(birthDate: string, givenName: string, familyName: string, stateOfIssue: string, licenceNumber: string, middleName?: string, expiryDate?: string) {
    
    const states = ["NSW", "QLD", "SA", "TAS", "VIC", "WA", "ACT", "NT"];
    const dateRegExp = /^\d{4}-\d{2}-\d{2}$/;
    const licenceNumberRegExp = /^\d{9}$/;
    
    if (!states.includes(stateOfIssue)) {
        return false;
    }
    if (dateRegExp.test(birthDate) === false) {
        return false;
    }
    if (expiryDate) {
        if (dateRegExp.test(expiryDate) === false) {
            return false;
        }
    }
    if (licenceNumberRegExp.test(licenceNumber) === false) {
        return false;
    }
    if (givenName.length > 100) {
        return false;
    }
    if (familyName.length > 100) {
        return false;
    }
    if (middleName != undefined) {
        if (middleName.length > 100) {
            return false;
        }
    }
    //No checks failed, data is good
    return true;
}
/**
 * Gets a Know Your Customer result from an API given certain customer information
 * 
 * @param birthDate Required. Format: YYYY-MM-DD.
 * @param givenName Required . Max 100 Characters.
 * @param familyName Required. Max 100 Characters.
 * @param stateOfIssue Required. One of "NSW", "QLD", "SA", "TAS", "VIC", "WA", "ACT", "NT".
 * @param licenceNumber Required. 9 Digit String.
 * @param middleName Optional. Max 100 Characters. If Not used, pass undefined
 * @param expiryDate Optional. Format: YYYY-MM-DD. If Not used, pass undefined
 */
export async function kycCheck(birthDate: string, givenName: string, familyName: string, stateOfIssue: string, licenceNumber: string, middleName?: string, expiryDate?: string) {
    
    if (checkData(birthDate, givenName, familyName, stateOfIssue, licenceNumber, middleName, expiryDate) === false) {
        throw new Error("Invalid Data Entered");
    }
    const options = {
        headers: {
            'Authorization': "Bearer 03aa7ba718da920e0ea362c876505c6df32197940669c5b150711b03650a78cf",
            'Content-Type' : "application/json",
      },
    };
    var data = {
        birthDate: birthDate,
        givenName: givenName,
        stateOfIssue: stateOfIssue,
        familyName: familyName,
        licenceNumber: licenceNumber,
        middleName: middleName,
        expiryDate: expiryDate,
    };

    return axios.post("https://australia-southeast1-reporting-290bc.cloudfunctions.net/driverlicence", data, options)
    .then((response) => {
        let verificationResultCode = response.data.verificationResultCode;
        switch (verificationResultCode) {
            case "Y":
                return { kycResult: true };
            case "N":
                return { kycResult: false };
            case "D":
                throw new VerifyDocumentError("Document Error", "d");
            case "S":
                throw new VerifyDocumentError("Server Error", "s");
            default:
                throw new VerifyDocumentError('Unknown Verification Code Returned', 'U')
         }
    })
    .catch((err) => {
        if (err.response) {
            // Error catching responses beyond server/document error
            throw err.message;
        } else if (err.request) {
            //client never received a response, or request never left, returns code
            throw new Error(err.code);
        } else {
            // Errors of type VerifyDocumentError will go through here
            throw err;
        }
    });
}

//Testing code, Chose to create own framework as Mocha/Chai were having too many setup problems for a coding challenge

// When testing, as the API is non-deterministic, could not test that two calls of the function with the same data have the same result
// When recieving a Error of S or D type, this can still pass a test, as they are a known API issue, other errors do not pass.




//This Test checks that the function returns one of the possible server responses, given all correct data
console.log("*--- STARTING TESTING ---*")
kycCheck("1985-02-08", 'Thomas', "Smith", "NSW", "949770001", 'Mitchel', "1985-02-08")
.then((val) => {
    console.log("Testing with correct values")
    if(val.kycResult === true || val.kycResult === false ) {
        console.log('   Test Passed')
    } else {
        console.log('   Test Failed')
    }
})
.catch((err) => {
    console.log("Testing with correct values")
    if(err === new VerifyDocumentError("Document Error", "d") || new VerifyDocumentError("Server Error", "s")) {
        console.log('   Test Passed')
    } else {
        console.log('   Test Failed, Not known server Error')
    }
});
// Check that function works without the optional data
kycCheck("1985-02-08", 'Thomas', "Smith", "NSW", "949770001",undefined,undefined)
.then((val) => {
    console.log("Testing without optional values")
    // console.log(val);
    if(val.kycResult === true || val.kycResult === false ) {
        console.log('   Test Passed')
    } else {
        console.log('   Test Failed')
    }
})
.catch((err) => {
    // console.error(err)
    console.log("Testing without optional values")
    if(err === new VerifyDocumentError("Document Error", "d") || new VerifyDocumentError("Server Error", "s")) {
        console.log('   Test Passed')
    } else {
        console.log('   Test Failed, Not known server Error')
    }
});

// Check that invalid data doesn't have a correct API call (Invalid birthdate)
kycCheck("198502-08", 'Thomas', "Smith", "NSW", "949770001", 'Mitchel', "1985-02-08")
.then((val) => {
    console.log("Testing with incorrect values (Invalid birthdate)"); 
    console.log('   Test Failed')
})
.catch((err) => {
    console.log("Testing with incorrect values (Invalid birthdate)")
    if(err.message === "Invalid Data Entered") {
        console.log('   Test Passed')
    } else {
        console.log('   Test Failed, wrong error message')
    }
});

// Check that invalid data doesn't have a correct API call (FirstName too long)
kycCheck("1985-02-08", 'ThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomas', "Smith", "NSW", "949770001", 'Mitchel', "1985-02-08")
.then((val) => {
    console.log("Testing with incorrect values (firstName too long)"); 
    console.log('   Test Failed')
})
.catch((err) => {
    console.log("Testing with incorrect values (firstName too long)")
    if(err.message === "Invalid Data Entered") {
        console.log('   Test Passed')
    } else {
        console.log('   Test Failed, wrong error message')
    }
});

// Check that invalid data doesn't have a correct API call (lastName too long)
kycCheck("1985-02-08", 'Thomas', "SmithThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomasThomas", "NSW", "949770001", 'Mitchel', "1985-02-08")
.then((val) => {
    console.log("Testing with incorrect values (lastName too long)"); 
    console.log('   Test Failed')
})
.catch((err) => {
    console.log("Testing with incorrect values (lastName too long)")
    if(err.message === "Invalid Data Entered") {
        console.log('   Test Passed')
    } else {
        console.log('   Test Failed, wrong error message')
    }
});