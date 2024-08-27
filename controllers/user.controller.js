const createError = require('http-errors');
const ms = require('ms');
const User = require('../models/User.model');
const { authSchema, emailSchema, organisationSchema } = require('../helpers/validation_schema');
const Product = require('../models/product.model');
const Market = require('../models/market.model');
const Organisation = require('../models/organisation.model');
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

/**
 * Registers a new user by validating the input data, hashing the password, saving the user,
 * generating access and refresh tokens, and sending a registration email.
 *
 * @async
 * @function register
 * @param {Object} req - Express request object containing ther user's email, password firstName, lastName, and role.
 * @param {Object} res - Express response object use to send the access and refressh tokens.
 * @param {Function} next - Express middleware next function for error handling.
 * @param {Promise<void>} - Returns nothing, sends response or passes errors to the next middleware.
 * 
 * @throws {ConflictError} If the email is already registered.
 * @throws {ValidationError} If the input is invalid (handle by Joi).
 */
exports.register = async (req, res, next) => {
  try {
    // Hash the users's password.
    const hashedPassword = await generatePassword(req.body.password);

    /**
     * Validate the user's email and hashed password using the defined schema.
     * Check if the user already exists in the database.
     * If a user is found, throw a Conflict error indicating the email is already registered.
     */
    const result = await authSchema.validateAsync({ email: req.body.email, password: hashedPassword });
    const doesExist = await User.findOne({ email: result.email });
    if (doesExist) throw createError.Conflict(`${result.email} is already registered`);

    /**
     * If both firstName and lastName are provided in the request body,
     * trim any extra whitespace and add them to the result object.
     */
    if (req.body.firstName && req.body.lastName) {
      result.firstName = req.body.firstName.trim();
      result.lastName = req.body.lastName.trim();
    }

    /**
     * For both user and admin registration, assign the role from the request 
     * if provided and not empty. If omitted, the user is registered as a general user.
     */
    if (req.body.role && req.body.role !== '') {
      result.role = req.body.role;
    }

    // Create a new User instance with the result data and save it to the database.
    const user = new User(result);
    const savedUser = await user.save();

    /**
     * Generate tokens for the registered user:
     * - An access token for authentication.
     * - A refresh token for token renewal.
     * - A confirmation token for email verification.
     *
     * @async
     * @returns {Promise<void>}
     */
    const accessToken = await signAccessToken(savedUser.id);
    const rereshToken = await signRefreshToken(savedUser.id);
    const confirmToken = await generateConfirmToken(result.email);

    /**
     * Send a registration confirmation email to the user with the confirmation token.
     */
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
    if (error.isJoi === true) {
      error.status = 422;
      var msg = error.details.map(detail => detail.message).join(', ');
      error.message = 'Validation error: ' + msg
    }
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
      maxAge: 31536000000 // ms(process.env.SESSION_LIFETIME) * 1000
    });

    res.send({ accessToken, rereshToken });
  }
  catch (error) {
    console.log("Error: ", error)
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

exports.updateUserOrganisation = async (req, res, next) => {
  try {
    console.log('query', req.query)
    if (!req.body) throw createError.BadRequest('User details area required');
    let update = {}
    console.log('body: ', req.body);
    // const updateOrganisation = Organisation.findOneAndUpdate({_id: req.query.id}, update);

    res.send({});
  }
  catch (error) {
    // console.log(error);
    next(error);
  }
}

exports.addUserOrganisation = async (req, res, next) => {
  try {
    if (!req.body) throw createError.BadRequest('User details area required');

    const user = await User.findOne({ _id: req.payload.aud });
    if (!user) throw createError.BadRequest('Could Not Find User');

    const result = await organisationSchema.validateAsync({
      name: req.body.name,
      province: req.body.name,
      city: req.body.city,
      address: req.body.address,
      author: {
        name: `${user.firstName} ${user.lastName}`,
        userId: user._id
      },
    });

    const organisation = new Organisation(result);
    const saveOrganisation = await organisation.save(result);

    const update = {
      organisation: [
        ...user.organisation,
        {
          organisationId: saveOrganisation._id,
          name: saveOrganisation.name
        }
      ]
    }

    const saveUserOrganisation = await User.findOneAndUpdate({ _id: req.payload.aud }, update);
    res.send(saveUserOrganisation);
  }
  catch (error) {
    console.log(error);
    next(error);
  }
}

exports.getUserOrganisation = async (req, res, next) => {
  try {
    const organisation = await Organisation.findOne({
      _id: req.query.id || req.params.id
    });

    res.send(organisation);
  }
  catch (error) {
    console.log(error);
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

exports.saveOrganisation = async (req, res, next) => {
  try {
    console.log('saveOrganisation:: User Id: ', req.payload.aud);

    // const organisation = await Organisation.find();
    // console.log('users: ', users);
    res.send({ message: 'save organisation' });
  }

  catch (error) {
    // console.log(error)
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}