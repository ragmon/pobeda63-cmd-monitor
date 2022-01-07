const fs = require('fs')

let data = null

const loadFromFile = (filename) => {
    try {
        data = JSON.parse(fs.readFileSync(filename))
        console.debug(`Loaded configs:`, data)
        return data
    } catch (err) {
        console.error(`Error load config file. ${err}`)
    }
}

const getConfig = () => data

loadFromFile(`./configs.json`)

exports.loadFromFile = loadFromFile
exports.getConfig = getConfig
exports.data = data