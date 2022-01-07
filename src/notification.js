const nodemailer = require("nodemailer")

/*

To prevent having login issues you should either use OAuth2 (see details here) or use another delivery provider and preferably a dedicated one.
Usually these providers have free plans available that are comparable to the daily sending limits of Gmail.
Gmail has a limit of 500 recipients a day (a message with one To and one Cc address counts as two messages since it has two recipients)
for @gmail.com addresses and 2000 for Google Apps customers, larger SMTP providers usually offer about 200-300 recipients a day for free.

https://nodemailer.com/usage/using-gmail/

 */

function Notification ({recipients, account}) {
    this.sendEmail = async ({category, url}) => {
        console.debug(`New notification ${category}; Url: ${url}`)

        function makeMessageText() {
            return `
                Новые товары в категории ${category}
                Ссылка: ${url}
            `
        }

        function makeMessageHtml() {
            return `
                <b>Новые товары в категории ${category}</b><br>
                Ссылка: <a href="${url}" target="_blank">${url}</a>
            `
        }

        try {
            console.debug(`Send notification email to ${recipients.join(', ')}...`)

            // create reusable transporter object using the default SMTP transport
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465 ,
                secure: true, // true for 465, false for other ports
                auth: {
                    user: account.user, // generated ethereal user
                    pass: account.password, // generated ethereal password
                },
            });

            // send mail with defined transport object
            const info = await transporter.sendMail({
                from: `Уведомление <${account.user}>`, // sender address
                to: recipients.join(', '), // list of receivers
                subject: `Замечены новые товары на сайте "победа-63.рф"`, // Subject line
                text: makeMessageText(), // plain text body
                html: makeMessageHtml(), // html body
            });

            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        } catch (e) {
            console.error(`Send email error`, e)
        }
    }
}

exports.Notification = Notification