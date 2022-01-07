const {Notification} = require('./notification')
const { PromisePool } = require('@supercharge/promise-pool')

exports.App = async () => {
    console.log(`Initialize monitor application`)

    this.config = require('./config')
    this.monitor = require('./monitor')
    this.notification = new Notification({
        recipients: this.config.data.recipients,
        account: this.config.data.smtp,
    })

    console.log(`Start monitors...`)
    for (let monitor of this.config.data.monitors) {
        console.log(`Creating monitor #${monitor.name}`)
        this.monitor.create({
            name: monitor.name,
            url: monitor.url,
            // interval: this.config.data.checking_timeout * 1000 * 60,       // calc minutes from miliseconds
            notification: this.notification
        })
    }

    this.handleRun = async () => {
        console.log(`Starting new monitoring interval iteration...`)
        const { results, errors } = await PromisePool
            .for(Object.values(this.monitor.monitors))
            .withConcurrency(1)
            .process(async (monitor, index, pool) => {
                console.log(`Process monitor #${index}`)
                await monitor.handle()
            })
        console.debug(`Sync interval iteration finished with results and errors`, results, errors)
    }

    this.timeout = this.config.data.checking_timeout * 1000 * 60

    this.syncIntervalHandle = setInterval(await this.handleRun, this.timeout)       // calc minutes from miliseconds  * 1000 * 60
}

