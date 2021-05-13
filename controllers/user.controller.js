const createError = require('http-errors');
const ms = require('ms');
const User = require('../models/User.model');
const { authSchema, emailSchema } = require('../helpers/validation_schema');
const Product = require('../models/product.model');
const Market = require('../models/market.model');
const request = require('request');
const { pagenate } = require('../helpers/pagenate');

const {
  generatePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateConfirmToken,
  generateResetToken
} = require('../helpers/jwt_helper');

const sendEmail = require('../helpers/send_email');

exports.register = async (req, res, next) => {
  try {
    // console.log('user.controller.js::register: body: ', req.body)
    const hashedPassword = await generatePassword(req.body.password);
    // console.log('hashedPassword: ', hashedPassword)

    const result = await authSchema.validateAsync({ email: req.body.email, password: hashedPassword });
    const doesExist = await User.findOne({ email: result.email });
    if (doesExist) throw createError.Conflict(`${result.email} is already registered`);

    if (req.body.firstName && req.body.lastName) {
      result.firstName = req.body.firstName.trim();
      result.lastName = req.body.lastName.trim();
    }

    if (req.body.role && req.body.role !== '') result.role = req.body.role;

    const user = new User(result);
    const savedUser = await user.save();

    const accessToken = await signAccessToken(savedUser.id);
    const rereshToken = await signRefreshToken(savedUser.id);
    const confirmToken = await generateConfirmToken(result.email);

    sendEmail.registerEmail({
      username: req.body.email,
      confirmToken: confirmToken,
      email: result.email
    });

    res.cookie(process.env.SESSION_NAME, accessToken, {
      httpOnly: true,
      maxAge: ms(process.env.SESSION_LIFETIME) * 1000
    });

    res.send({ accessToken, rereshToken });
  }
  catch (error) {
    // console.log(error)
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.login = async (req, res, next) => {
  try {
    const result = await authSchema.validateAsync(req.body);
    const user = await User.findOne({ email: result.email });
    if (!user) throw createError.NotFound('User not registered');

    const isMatch = await user.isValidPassword(result.password);
    if (!isMatch) throw createError.Unauthorized('Invalid username/password');

    const accessToken = await signAccessToken(user.id);
    const rereshToken = await signRefreshToken(user.id);

    res.cookie(process.env.SESSION_NAME, accessToken, {
      httpOnly: true,
      maxAge: ms(process.env.SESSION_LIFETIME) * 1000
    });

    res.send({ accessToken, rereshToken });
  }
  catch (error) {
    if (error.isJoi === true) {
      return next(createError.BadRequest('Invalid username/password'));
    }

    next(error);
  }
}

exports.refreshToken = async (req, res, next) => {
  try {
    if (!req.body.refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(req.body.refreshToken);

    const accessToken = await signAccessToken(userId);
    const refreshToken = await signRefreshToken(userId);

    res.send({ accessToken, refreshToken });
  }

  catch (error) {

    next(error.message);
  }
}

exports.confirmEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.payload.aud });
    // console.log(req.payload)
    if (!user) throw createError.NotFound('User not registered');
    if (user.confirmedEmail === true) throw createError.BadRequest('Email already confirmed');

    user.confirmedEmail = true;
    const confirmUser = await user.save();
    if (!confirmUser) throw createError.NotFound('User not registered');

    res.send({ message: 'Email verified successfuly' });
  }
  catch (error) {
    // console.log(error)
    next(error);
  }
}

exports.sendEmail = async (req, res, next) => {
  const data = {
    username: req.body.username,
    email: req.body.email,
    confirmToken: 'd9729feb74992cc3482b350163a1a010'
  }

  sendEmail.registerEmail(data);

  res.send('ok')
}

exports.getUserAccount = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.payload.aud });
    res.send({ user: user });
  }
  catch (err) {
    next(err);
  }
}

exports.updateUserAccount = async (req, res, next) => {
  try {
    // console.log(req.body)
    // throw createError.BadRequest('User details area required');
    if (!req.body) throw createError.BadRequest('User details area required');
    let update = {};

    let address = {};

    if (req.body.province) address.province = req.body.province;
    if (req.body.city) address.city = req.body.city;
    if (req.body.suburb) address.suburb = req.body.suburb;
    if (req.body.street) address.street = req.body.street;
    if (req.body.zipcode) address.zipcode = req.body.zipcode;

    if (req.body.firstName) update.firstName = req.body.firstName;
    if (req.body.lastName) update.lastName = req.body.lastName;
    if (req.body.address) update.address = req.body.address;
    if (req.body.gender) update.gender = req.body.gender;

    if (req.body.province || req.body.city || req.body.suburb || req.body.street || req.body.zipcode || req.body.apartment) update.address = address;

    if (req.body.public_key) {
      update.paymentGateway = {
        public_key: ''
      }
      update.paymentGateway.public_key = req.body.public_key
      // update = {
      //   ...update,
      //   paymentGateway: {
      //     public_key: req.body.public_key
      //   }
      // }
    }

    if (req.body.secret_key) {
      update.paymentGateway = { secret_key: req.body.secret_key }
    }

    if (req.body.featuredImage) update.featuredImage = req.body.featuredImage;
    // console.log('update: ', update)

    const saveUser = await User.findOneAndUpdate({ _id: req.payload.aud }, update);
    let user = await User.findById(saveUser._id);

    res.send({ message: 'user account updated', user: user });
  }
  catch (error) {
    // console.log(error);
    next(error);
  }
}

exports.updateUserPaymentGateway = async (req, res, next) => {
  try {
    // console.log(req.body)
    if (!req.body) throw createError.BadRequest('User details area required');
    let saveUser;

    if (req.body.public_key) {
      saveUser = await User.findOneAndUpdate({ _id: req.payload.aud }, {
        'paymentGateway.public_key': req.body.public_key
      });
    }

    if (req.body.secret_key) {
      saveUser = await User.findOneAndUpdate({ _id: req.payload.aud }, {
        'paymentGateway.secret_key': req.body.secret_key
      });
    }

    res.send(saveUser);
  }
  catch (error) {
    // console.log(error);
    next(error);
  }
}

exports.forgotPassword = async (req, res, next) => {
  try {
    // console.log(req.body);
    const result = await emailSchema.validateAsync({ email: req.body.email, });
    const doesExist = await User.findOneAndUpdate({ email: result.email }, {
      resetPassword: true
    });

    if (!doesExist) throw createError.NotFound();
    const resetToken = await generateResetToken(result.email);

    sendEmail.forgotPassword({
      resetToken: resetToken,
      email: result.email
    });

    res.send({ resetToken });
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
    // console.log(error);
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const user = new User();
    const newPassword = await user.generatePassword(req.body.password);

    const resetPassword = await User.updateOne({
      email: req.payload.aud,
      resetPassword: true
    },
      {
        resetPassword: false,
        password: newPassword
      });

    if (resetPassword.nModified === 0) {
      throw createError.BadRequest('Reset Password Failed');
    }

    res.send(resetPassword);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.contactUser = async (req, res, next) => {
  try {
    // console.log(req.body);
    const getAuthor = await User.findOne({ _id: req.body.author.userId });
    // console.log('getAuthor: ', getAuthor);

    sendEmail.contactUserEmail({
      data: req.body,
      author: {
        firstName: getAuthor.firstName,
        lastName: getAuthor.lastName,
        email: getAuthor.email
      }
    });

    res.send({ message: 'message sent' });
  }

  catch (error) {
    // console.log(error)
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getSingleUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id || req.query.id });
    // console.log('user: ', user);
    res.send(user);
  }

  catch (error) {
    // console.log(error)
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ confirmedEmail: true });
    // console.log('users: ', users);
    res.send(users);
  }

  catch (error) {
    // console.log(error)
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getUserItems = async (req, res, next) => {
  try {
    let { page, size } = pagenate(req.query);
    const limit = parseInt(size);
    const skip = (parseInt(page) - 1) * parseInt(size);

    console.log('limit: ', limit, 'skip: ', skip);
    console.log('query: ', req.query);

    let items = { products: [], market: [] };

    if (req.query.itemType === 'market') {
      // console.log('type: ', req.query.itemType)
      let getMarket = await Market.find({
        "author.userId": req.query.userId
      }).limit(limit).skip(skip);

      items.market = getMarket;
    }

    else if (req.query.itemType === 'product') {
      // console.log('type: ', req.query.itemType)
      let getProducts = await Product.find({
        "author.userId": req.query.userId
      }).limit(limit).skip(skip);

      items.products = getProducts;
    }

    else {
      // console.log('type: ', 'nada')
      let products = await Product.find({
        "author.userId": req.query.userId
      }).limit(limit).skip(skip);

      let market = await Market.find({
        "author.userId": req.query.userId
      }).limit(limit).skip(skip);

      items.products = products;
      items.market = market;
    }

    console.log('items: ', items);
    res.send(items);
  }

  catch (error) {
    console.log(error)
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.subscribe = async (req, res, next) => {
  try {
    // console.log('body: ', req.body);
    if (!req.body.email) throw createError.BadRequest('Email is required');
    let mcData = {
      members: [{
        email_address: req.body.email,
        status: 'pending'
      }]
    }

    let mcDataPost = JSON.stringify(mcData);

    let MAILCHIMP_API_KEY = '57ba9921c6b448770990fbe7479dc935-us1';
    let MAILCHIMP_DC = 'us1';
    let MAILCHIMP_AUDIENCE_ID = 'a1e141d66c';

    let options = {
      url: `https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}`,
      method: 'POST',
      headers: {
        Authorization: `auth ${MAILCHIMP_API_KEY}`
      },
      body: mcDataPost
    }

    request(options, (err, response, body) => {
      if (err) throw createError.BadRequest();
      console.log('body: ', body)
      res.send({ message: 'success' });
    });
  }

  catch (error) {
    console.log(error)
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}