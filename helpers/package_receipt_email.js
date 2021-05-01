const nodemailer = require('nodemailer');
const MailGen = require('mailgen');

var mailGenerator = new MailGen({
  theme: 'default',
  product: {
    name: 'Pandopot',
    link: 'https://mailgen.js/',
    logo: 'https://mailgen.js/img/logo.png'
  }
})

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'motswiridonald@gmail.com',
    pass: 'donald120'
  }
});

module.exports = {
  sendReceipt: (data) => {
    console.log('emial_receipt: data.package: ', data.package);

    var emailTemplate = {
      body: {
        name: data.username,
        intro: 'Your order has been processed successfully.',
        table: {
          data: data.package,
          columns: {
            customWidth: {
              item: '20%',
              price: '15%'
            },
            customAlignment: {
              price: 'right'
            }
          }
        },
        action: {
          instructions: 'You can check the status of your order and more in your dashboard:',
          button: {
            color: '#3869D4',
            text: 'Go to Dashboard',
            link: 'http://localhost:3000/my-subscriptions'
          }
        },
        outro: 'We thank you for your purchase.'
      }
    };

    var emailBody = mailGenerator.generate(emailTemplate);
    var emailText = mailGenerator.generatePlaintext(emailTemplate);

    // Optionally, preview the generated HTML e-mail by writing it to a local file
    require('fs').writeFileSync('preview.html', emailBody, 'utf8');
    require('fs').writeFileSync('preview.txt', emailText, 'utf8');

    // console.log(emailBody);

    const mailOptions = {
      from: 'motswiridonald@gmail.com',
      to: 'domotswiri@gmail.com', // (data.email) should be used 
      subject: `Pandopot Package Purchase`,
      html: emailBody
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err)
        console.log('send email error: ', err)
      else
        console.log(info);
    });
  }
}