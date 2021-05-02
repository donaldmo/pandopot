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
      from: 'app@pandopot.com', 
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
    const subject = 'Welcome to Pandopot We\'re very excited to have you on board.'
    const { email, token } = data;
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
            link: `http://localhost:3001/reset-password?token=${token}`
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
      from: 'motswiridonald@gmail.com', // sender address
      to: 'domotswiri@gmail.com', // list of receivers
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
    const subject = `New message from ${author.firstName} ${author.lastName}`;

    var emailTemplate = {
      body: {
        name: data.enquireName,
        intro: data.enquireMessage,
        outro: `Detail: phone: ${data.enquireContact}, emial: ${data.enquireEmail}.`
      }
    };

    var emailBody = mailGenerator.generate(emailTemplate);
    var emailText = mailGenerator.generatePlaintext(emailTemplate);

    require('fs').writeFileSync('preview.html', emailBody, 'utf8');
    require('fs').writeFileSync('preview.txt', emailText, 'utf8');

    // console.log(emailBody);

    const mailOptions = {
      from: 'motswiridonald@gmail.com',
      to: 'domotswiri@gmail.com',
      subject: subject,
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