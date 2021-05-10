const nodemailer = require('nodemailer');
const MailGen = require('mailgen');
require('dotenv').config();

// Configure mailgen by setting a theme and your product info
const mailGenerator = new MailGen({
  theme: 'default',
  product: {
    name: 'Pandopot',
    link: 'https://pandopot.com/',
    logo: 'https://pandopot.com/pandopot-logo-grey.png' 
  }
});

var transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, 
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME, 
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = {
  registerEmail: (data) => {

    const { username, confirmToken } = data;
    const subject = 'Welcome to Pandopot We\'re very excited to have you on board.'

    var emailTemplate = {
      body: {
        name: username,
        intro: 'Welcome to pandopot.com We\'re very excited to have you on board.',
        action: {
          instructions: 'To get started , please click  a button below to confirm your email:',
          button: {
            color: '#22BC66',
            text: 'Confirm your account',
            link: `${process.env.API_ENDPOINT}/auth/verify-email/?token=${confirmToken}`
          }
        },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
      }
    };

    // Generate an HTML email with the provided contents
    var emailBody = mailGenerator.generate(emailTemplate);

    // Generate the plaintext version of the e-mail (for clients that do not support HTML)
    var emailText = mailGenerator.generatePlaintext(emailTemplate);

    // Optionally, preview the generated HTML e-mail by writing it to a local file
    require('fs').writeFileSync('preview.html', emailBody, 'utf8');
    require('fs').writeFileSync('preview.txt', emailText, 'utf8');

    // console.log(emailBody);

    const mailOptions = {
      from: process.env.EMAIL_USERNAME, 
      to: data.email, 
      subject: subject,
      html: emailBody
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err)
        console.log('send email error: ', err)
      else
        console.log(info);
    });
  },

  forgotPassword: (data) => {
    const subject = 'Pandopot.com reset password request'
    const { email, resetToken } = data;
    console.log('send_email: Data', data);

    // Prepare email contents
    var emailTemplate = {
      body: {
        name: email,
        intro: 'You have received this email because a password reset request for your account was received.',
        action: {
          instructions: 'Click the button below to reset your password:',
          button: {
            color: '#DC4D2F',
            text: 'Reset your password',
            link: `https://pandopot.com/new-password?token=${resetToken}` // https:pandopot.com/reset-password?token=${token}
          }
        },
        outro: 'If you did not request a password reset, no further action is required on your part.'
      }
    };

    // Generate an HTML email with the provided contents
    var emailBody = mailGenerator.generate(emailTemplate);

    // Generate the plaintext version of the e-mail (for clients that do not support HTML)
    var emailText = mailGenerator.generatePlaintext(emailTemplate);

    // Optionally, preview the generated HTML e-mail by writing it to a local file
    require('fs').writeFileSync('preview.html', emailBody, 'utf8');
    require('fs').writeFileSync('preview.txt', emailText, 'utf8');

    // console.log(emailBody);

    const mailOptions = {
      from: process.env.EMAIL_USERNAME, // sender address
      to: email, // list of receivers
      subject: subject, // Subject line
      html: emailBody// plain text body
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err)
        console.log('send email error: ', err)
      else
        console.log(info);
    });
  },

  contactUserEmail: (info) => {
    const { author, data } = info;
    console.log('info: ', info)
    const subject = `New message from ${author.firstName} ${author.lastName}`;

    var emailTemplate = {
      body: {
        name: data.enquireName,
        intro: data.enquireMessage,
        outro: `<b>Details:</b>
                <br/>
                <b>name</b>: ${data.enquireName}<br/>
                <b>phone:</b> ${data.enquireContact}<br/>
                <b>emial:</b> ${data.enquireEmail}<br/>`
      }
    };

    var emailBody = mailGenerator.generate(emailTemplate);
    var emailText = mailGenerator.generatePlaintext(emailTemplate);

    require('fs').writeFileSync('preview.html', emailBody, 'utf8');
    require('fs').writeFileSync('preview.txt', emailText, 'utf8');

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: author.email,
      subject: subject,
      html: emailBody
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err)
        console.log('send email error: ', err)
      else
        console.log('contactUserEmail: ', info);
    });
  },

  contactUs: (info) => {
    const { author, data } = info;
    console.log('info: ', info)
    const subject = `New message from ${data.enquireName}`;

    var emailTemplate = {
      body: {
        name: data.enquireName,
        intro: data.enquireMessage,
        outro: `<b>Details:</b>
                <br/>
                <b>name</b>: ${data.enquireName}<br/>
                <b>phone:</b> ${data.enquireContact}<br/>
                <b>emial:</b> ${data.enquireEmail}<br/>`
      }
    };

    var emailBody = mailGenerator.generate(emailTemplate);
    var emailText = mailGenerator.generatePlaintext(emailTemplate);

    require('fs').writeFileSync('preview.html', emailBody, 'utf8');
    require('fs').writeFileSync('preview.txt', emailText, 'utf8');

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: `admin@pandopot.com`,
      subject: subject,
      html: emailBody
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err)
        console.log('send email error: ', err)
      else
        console.log('contactUserEmail: ', info);
    });
  },

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
            link: `https://pandopot.com/my-subscriptions`
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
      from: process.env.EMAIL_USERNAME,
      to: data.email, // (data.email) should be used 
      subject: data.subject,
      html: emailBody
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if (err)
        console.log('send email error: ', err);
      else
        console.log('sendReceipt: ', info);
    });
  }
}