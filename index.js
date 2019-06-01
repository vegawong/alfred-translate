
const cmd = process.argv[2]

if(!cmd) {
    console.log('Usage: alfred-tranlate <cmd> <appId> <appKey> [queryString]')
    process.exit(1)
}

require('./src/' + cmd + '.js')

