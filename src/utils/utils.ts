
import axios from 'axios';
import crypto from 'crypto';


export const objectHasKeys = (keys: any[], object: {}) => {

    let objectKeys = Object.keys(object)
    let status = true

    keys.map(k => {
        if (!objectKeys.includes(k)) {
            status = false
        }
    })

    return status
}

export const generateTransactionId = () => {
    return "TRX-" + new Date().getTime() + "-" + crypto.randomBytes(8).toString('hex')
}

export const pushToWebhook = async (origin: string, type: string, url: string, data: any) => {
    if (url && url.length > 0) {

        let webhookData = {
            origin,
            type,
            data,
        }

        // NOTE: Should await these calls or not?
        await axios.post(url, webhookData)
    }
}
