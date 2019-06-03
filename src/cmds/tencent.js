/**
 * 腾讯AI开放平台 机器翻译
 * https://ai.qq.com/console/capability/detail/7
 * 
 * ```
 * $ <script> tencent <appKey> <secretKey> [queryString]
 * ```
 */

const axios = require('axios').default
const uuid = require('uuid')
const qs = require('qs')
const md5 = require('md5')
const utils = require('../utils')

function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
        // We don’t escape the key '__proto__'
        // which can cause problems on older engines
        obj[k] = v;
    }
    return obj;
}

const getSign = function (params, secretKey) {
    const paramsMap = new Map()
    Object.keys(params).forEach(key => {
        paramsMap.set(key, params[key])
    })
    const newParamsMap = new Map([...paramsMap.entries()].sort())
    const qsVal = qs.stringify(strMapToObj(newParamsMap), { encoder: utils.urlencode }) + '&app_key=' + secretKey
    return md5(qsVal).toUpperCase()
}

const translate = (appKey, secretKey, query) => {
    const now = Number(Date.now() / 1000).toFixed(0)
    const idStr = uuid().substr(0, 32)

    const param = {
        text: query,
        app_id: appKey,
        nonce_str: idStr,
        time_stamp: now,
        source: 'en',
        target: 'zh'
    }

    const sign = getSign(param, secretKey)

    axios.post('https://api.ai.qq.com/fcgi-bin/nlp/nlp_texttranslate', {
        ...param,
        sign
    }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            transformRequest: (data) => qs.stringify(data)
        }).then(res => {
            const { data } = res
            const { ret, data: body } = data
            if (Number(ret) === 0) {
                console.log(JSON.stringify({
                    items: [{
                        title: body.target_text,
                        arg: body.target_text
                    }]
                }))
            } else {
                console.error(`retCode: ${ret}`)
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
