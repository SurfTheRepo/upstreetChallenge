const axios = require('axios').default;
class VerifyDocumentError extends Error{
    constructor(message:string, name:string) {
        super(message);
        this.name = name;
    }
}
const options = {
    headers: {
        'Authorization': 'Bearer 03aa7ba718da920e0ea362c876505c6df32197940669c5b150711b03650a78cf',
        'Content-Type': 'application/json'
    }
}

async function getCode(){

    const response = await axios.post('https://australia-southeast1-reporting-290bc.cloudfunctions.net/driverlicence', {
        birthDate : '1985-02-08',
        givenName : 'James',
        middleName : 'Robert',
        familyName : 'Smith',
        licenceNumber : '94977000',
        stateOfIssue : 'NSW',
        expiryDate : '2020-02-01'
    }, options);
    
    switch(response.data.verificationResultCode) {
        case 'Y':
            return {'kycResult': true}
        case 'N': 
            return {'kycResult': false}
        case 'D':
            throw new VerifyDocumentError('Document Error', 'd');
        case 'S':
            throw new VerifyDocumentError('Server Error', 's');     
    }
}

getCode().then((val) => console.log(val)).catch((err) => console.error(err))

