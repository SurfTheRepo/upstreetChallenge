// const axios = require('axios').default;
import axios from "axios";
class VerifyDocumentError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}
const options = {
  headers: {
    'Authorization': "Bearer 03aa7ba718da920e0ea362c876505c6df32197940669c5b150711b03650a78cf",
    'Content-Type' : "application/json",
  },
};

//Checks the entered data against specifications given in challenge document
function checkData(
  birthDate: string,
  givenName: string,
  familyName: string,
  stateOfIssue: string,
  licenceNumber: string,
  middleName?: string,
  expiryDate?: string
) {
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
  return true;
}

async function getKycCheck(
  birthDate: string,
  givenName: string,
  familyName: string,
  stateOfIssue: string,
  licenceNumber: string,
  middleName?: string,
  expiryDate?: string
) {
    console.log(middleName)
  if (
    checkData(
      birthDate,
      givenName,
      familyName,
      stateOfIssue,
      licenceNumber,
      middleName,
      expiryDate
    ) === false
  ) {
    throw new Error("Invalid Data Entered");
  }
  var data = {
    birthDate: birthDate,
    givenName: givenName,
    stateOfIssue: stateOfIssue,
    familyName: familyName,
    licenceNumber: licenceNumber,
    middleName: middleName,
    expiryDate: expiryDate,
  };

  return axios
    .post(
      "https://australia-southeast1-reporting-290bc.cloudfunctions.net/driverlicence",
      data,
      options
    )
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

//Testing code
getKycCheck("1985-02-08", 'Thomas', "Smith", "NSW", "949770001", undefined, "1985-02-08")
  .then((val) => console.log(val))
  .catch((err) => console.error(err));
