
import crypto from 'crypto';


export const objectHasKeys = (keys: any[], object: {}) => {

    let objectKeys = Object.keys(object)
    let status = true 

    keys.map(k => {
        if (!objectKeys.includes(k)){
            status = false
        }
    })

    return status
}

export const generateTransactionId = () => {
    return "TRX-"+new Date().getTime()+"-"+crypto.randomBytes(8).toString('hex')
}
