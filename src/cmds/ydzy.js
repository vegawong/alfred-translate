/**
 * 有道智云翻译
 * https://ai.youdao.com/docs/doc-trans-api.s#p01
 * 
 * ```
 * $ <script> ydzy <appKey> <secretKey> [queryString]
 * ```
 */

const axios = require('axios').default
const uuid = require('uuid')
const sha256 = require('sha256')

const translate = (appKey, secretKey, query) => {
    const now = Number(Date.now() / 1000).toFixed(0)
    const idStr = uuid()
    const getSign = function () {
        let input = query
        if (query.length > 20) {
            input = `${query.substr(0, 10)}${query.length}${query.substr(query.length - 10, 10)}`
        }
        return sha256(appKey + input + idStr + now + secretKey)
    }
    const sign = getSign()

    axios.get('https://openapi.youdao.com/api', {
        params: {
            q: query,
            from: 'en',
            to: 'zh_CHS',
            appKey: appKey,
            salt: idStr,
            sign: sign,
            signType: 'v3',
            curtime: now
        }
    }).then(res => {
        const {data} = res 
        const {errorCode, translation} = data 
        if(Number(errorCode) === 0 && !!translation) {
            console.log(JSON.stringify({
                items: res.data.translation.map(v => ({ title: v, arg: v }))
            }))
        } else {
            console.error(`errorCode: ${errorCode}`)
            console.log(JSON.stringify({
                items: []
            }))
        } 
    }).catch(err => {
        console.error(err)
    })
}

const queryStr = process.argv.slice(5).join(' ')
const appKey = process.argv[3]
const secretKey = process.argv[4]
translate(appKey, secretKey, queryStr)