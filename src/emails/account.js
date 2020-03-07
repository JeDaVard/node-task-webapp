const sgMail = require('@sendgrid/mail');
const sendgridAPIKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendgridAPIKey);

const sendByeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'jedavard@gmail.com',
        subject: 'Task App team',
        text: `Hi, ${name}!\n You just deleted your account.\n\n Regards, Task app team.\n\n\n*This email was sent ny Node.js | Sendgrid mail system*`,
    })
}

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
            to: email,
            from: 'jedavard@gmail.com',
            subject: 'Task App team',
            text: `Hi, ${name}!\n Welcome to Task app.\n\n Regards, Task App team.\n\n\n*This email was sent ny Node.js | Sendgrid mail system*`,
            html: `<body style="height: 100%; width: 100%; background: #090306; color: white; text-align: center">
            <img src="https://i.ibb.co/R75h2Gg/mml.png" width="186" alt="Logo"/>
            <div style="background: #090306; color: white">
                <h2>Hi, ${name}!</h2>
                <p style="font-size: 18px">Thanks for joining Task app.</p>
                <p style="font-size: 18px">To complate account sign-up: verify your email address to keep you account secure and provide a way to revocer your password.</p>
                <button style="background: #4D1329; font-size: 24px; padding: 12px; outline: 0; border: none; color: white; cursor: pointer;">Confirm email</button>
                <br />
                <br />
                <p>Not your account?</p>
                <a href="#">Remove your email address</a>
                <br />
                <br />
                <br />
                <p>***This is a generated email, please don't reply***</p>
                <p>Regards, Task App team 
                <p>Have a question? <a href="#">Our help center</a></p>
            </div>
        </body>`
        })
}
module.exports = {
    sendWelcomeEmail,
    sendByeEmail
}