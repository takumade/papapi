


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
