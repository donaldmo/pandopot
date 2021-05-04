const createError = require('http-errors');
const User = require('../models/User.model');
const Subscription = require('../models/subscription.model');

exports.getSubscriptions = async (req, res, next) => {
  try {
    console.log('query: ', req.query);
    let { page, size } = req.query;
    if (!page || page === '' || page === undefined) page = 1;
    if (!size || size === '' || size === undefined ) size = 3;

    const limit = parseInt(size);
    const skip = (parseInt(page) - 1) * parseInt(size);
    console.log('limit: ', limit, 'skip: ', skip);

    const subscriptions = await Subscription.find().limit(limit).skip(skip);
    // console.log(subscriptions);

    if (!subscriptions) throw createError.NotFound();
    // console.log('subscriptions: ', subscriptions);
    subscriptions.map(item => console.log('id: ',item._id, 'usage: ', item.usage))

    res.send(subscriptions);
  }
  catch (error) {
    console.log(error)
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getSubscription = async (req, res, next) => {
  try {
    console.log("bodyId", req.body.id);
    console.log("parmasId", req.params.id);

    const subscription = await Subscription.findOne({
      _id: req.body.id || req.params.id
    });

    if (!subscription) throw createError.NotFound();

    res.send(subscription);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.deleteSubscription = async (req, res, next) => {
  try {
    console.log("bodyId", req.body.id);
    console.log("parmasId", req.params.id);

    const deleteSubscription = await Subscription.findOneAndDelete({
      _id: req.body.id || req.params.id
    });

    res.send(deleteSubscription);
  }
  
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

