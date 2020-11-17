// console.log('Hello world!!!!!');
const axios = require('axios').default;

const options = {
    headers: {
        'Authorization': 'Bearer 03aa7ba718da920e0ea362c876505c6df32197940669c5b150711b03650a78cf',
        'Content-Type': 'application/json'
    }
}


async function getCode(){
    try{
        const response = await axios.post('https://australia-southeast1-reporting-290bc.cloudfunctions.net/driverlicence', {
            birthDate : '1985-02-08',
            givenName : 'James',
            middleName : 'Robert',
            familyName : 'Smith',
            licenceNumber : '94977000',
            stateOfIssue : 'NSW',
            expiryDate : '2020-02-01'
        }, options);
        //convert to case switch later
        if(response.data.verificationResultCode === 'Y'){
            return {'kycResult': true}
        } else if (response.data.verificationResultCode === 'N') {
            return {'kycResult': false}
        } else if (response.data.verificationResultCode === 'D') {
            return {
                'code': 'D',
                'message' : 'Document Error'
            } 
        } else if (response.data.verificationResultCode === 's') {
            return {
                'code': 's',
                'message' : 'Server Error'
            } 
        }
    } catch (error){
        console.error(error)
        return(error)
    }
}

getCode().then((val) => console.log(val));





