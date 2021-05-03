const createError = require('http-errors');
const User = require('../models/User.model');
const { packageSchema, adminPaymentGatewaySchema } = require('../helpers/validation_schema');
const Package = require('../models/packages.model');
const Subscription = require('../models/subscription.model');
const receiptEmail = require('../helpers/package_receipt_email')

var axios = require('axios');
var qs = require('qs');
var btoa = require('btoa');

exports.getAllPackages = async (req, res, next) => {
  try {
    const packages = await Package.find();

    res.send({ message: 'puckages fetched successfuly', packages: packages });
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getPackage = async (req, res, next) => {
  try {
    const package = await Package.findOne({
      _id: req.body.id
    });

    if (!package) throw createError.NotFound();

    res.send(package);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.buyPackage = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.payload.aud });

    const package = await Package.findOne({
      _id: req.body.package._id
    });

    const admin = await User.findOne({
      role: 'admin'
    }).select("adminPaymentGateway")

    if (!package) throw createError.NotFound('Package not available');
    if (!admin) throw createError.NotFound();
    if (!admin.adminPaymentGateway) throw createError.InternalServerError()
    let { adminPaymentGateway } = admin;
    console.log('admin.adminPaymentGateway: ', adminPaymentGateway)

    if (req.body.payment && package && adminPaymentGateway) {
      let { id } = req.body.payment;
      let { amountInCents } = req.body;
      let currency = 'ZAR';
      const SECRET_KEY = adminPaymentGateway.secret_key;

      var data = qs.stringify({
        'token': id,
        'amountInCents': amountInCents,
        'currency': currency
      });

      var config = {
        method: 'post',
        url: 'https://online.yoco.com/v1/charges/',
        headers: {
          'Authorization': `Basic ${btoa(SECRET_KEY)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
      };

      axios(config).then(async (response) => {
        console.log(JSON.stringify(response.data));
        let payment = response.data;
        console.log('payment: ', payment)

        let expiryDate;
        if (package.expiryDate) {
          var future = new Date();
          future.setDate(future.getDate() + parseInt(package.expiryDate.days));

          expiryDate = {
            date: future,
            days: parseInt(package.expiryDate.days)
          }
        }

        console.log('expiryDate: ', expiryDate)

        if (payment) {
          if (payment.status !==  'successful') {
            throw createError.PaymentRequired('Payment Unsuccessful')
          }
          
          const subscription = new Subscription({
            item: package,
            payment: payment,
            subscriber: {
              name: user.firstName + ' ' + user.lastName,
              userId: user._id
            },
            expiryDate: expiryDate
          });

          let saveSub = await subscription.save();
          if (!saveSub) throw createError.BadRequest('Failed to save a Subscription');

          let data = [];
          data.push({
            item: package.name,
            description: package.description,
            price: `R${package.price}`
          });

          receiptEmail.sendReceipt({
            package: data,
            email: user.email,
            username: user.firstName + ' ' + user.lastName
          });

          res.send(saveSub);
        }
        else {
          throw createError.InternalServerError()
        }
      })
        .catch(function (error) {
          console.log(error);
          next(error);
        });
    }

  }
  catch (error) {
    console.log(error)
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}
