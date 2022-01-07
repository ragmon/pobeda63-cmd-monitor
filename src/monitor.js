const axios = require('axios')
const fs = require('fs')
const cheerio = require('cheerio')

const monitors = {}

function Monitor({name, url, notification}) {
    this.parsePageContent = (content) => {
        console.debug(`Monitor #${name}; Parsing page content...`)
        const $ = cheerio.load(content)
        const url = $('.card-wrapper .card-title').first().attr('href')
        console.log(`Find first product url on page list`, url)
        return url
    }

    this.checkingForNewProducts = async (url) => {
        console.log(`Monitor #${name}; Checking for new products on url: `, url)
        try {
            const response = await axios.get(url)

            const currentLastProductUrl = this.parsePageContent(response.data)
            if (currentLastProductUrl != this.lastProductUrl) {
                console.debug(`Monitor #${name}; New products detected!`)
                this.updateLastProduct(currentLastProductUrl)

                notification.sendEmail({
                    category: name,
                    url: url,
                })
            } else {
                console.debug(`No new products in category "${name}"`)
            }
        } catch (e) {
            // Handle Error Here
            console.error(`Error load html content from site`, e)
        }
    }

    this.handle = async () => {
        const timestamp = new Date().toLocaleString()
        console.log(`[${timestamp}] Handle monitor #${name}`)

        this.lastProductUrl = this.loadLastProduct()
        console.debug(`Monitor #${name}; Last product url: ${this.lastProductUrl}`)

        await this.checkingForNewProducts(url)
    }

    this.lastProductUrl = null

    this.loadLastProduct = () => {
        const filename = `temp/${name}.data`
        try {
            return fs.readFileSync(filename)
        } catch (err) {
            console.error(`Can't read monitor temp file ${filename}`)
        }
    }
    this.updateLastProduct = (url) => {
        console.debug(`Update last product in temp for category #${name}; url = ${url}`)
        const filename = `temp/${name}.data`
        try {
            fs.writeFileSync(filename, url)
            this.lastProductUrl = url
        } catch (err) {
            console.error(`Can't write monitor temp file ${filename}`)
        }
    }

    // this.start = () => {
    //     if (this.intervalHandle) {
    //         throw `Monitor #${name} already running`
    //     }
    //     this.lastProductUrl = this.loadLastProduct()
    //     console.debug(`Monitor #${name}; Last product url: ${this.lastProductUrl}`)
    //     this.intervalHandle = setInterval(this.handle, interval)
    // }
    //
    // this.stop = () => {
    //     if (!this.intervalHandle) {
    //         throw `Monitor #${name} not running`
    //     }
    //     clearInterval(this.intervalHandle)
    // }

    // if (autostart) {
    //     this.start()
    // }
}

const create = ({name, url, interval, notification}) => {
    return monitors[name] = new Monitor({
        name,
        url,
        autostart: false,
        interval,
        notification
    })
}

exports.monitors = monitors
exports.Monitor = Monitor
exports.create = create
