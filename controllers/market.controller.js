const createError = require('http-errors');
const User = require('../models/User.model');
const ProductCategory = require('../models/product_categories.model');
const { marketSchema, marketUpdateSchema } = require('../helpers/validation_schema');
const Market = require('../models/market.model');
const { pagenate } = require('../helpers/pagenate')

exports.addMarket = async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.aud);
    if (!user) throw createError.NotFound('User not registered');

    const getCategory = await ProductCategory.findById(req.body.categoryId);
    if (!getCategory) throw createError.NotFound('market category no found.');

    const result = await marketSchema.validateAsync({
      name: req.body.name,
      description: req.body.description,
      location: req.body.location,
      phone: req.body.phone,
      website: req.body.website,
      category: {
        name: getCategory.name,
        categoryId: getCategory._id
      },
      author: {
        name: user.firstName + " " + user.lastName,
        userId: user._id
      }
    });

    if (req.body.hiking) result.hikingData = {
      trailType: req.body.trailType,
      trailLevel: req.body.trailLevel,
      province: req.body.province,
      location: req.body.location,
      price_start: req.body.price_start,
      price_end: req.body.price_end,
      details: req.body.details
    }

    let market = new Market(result);
    let saveMarket = await market.save();

    res.send(saveMarket)
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.editMarket = async (req, res, next) => {
  try {
    if (!req.body) throw createError.BadRequest('Update fields are required');
    console.log('body: ', req.body);

    const user = await User.findById(req.payload.aud);
    if (!user) throw createError.NotFound('User not registered');

    const result = await marketUpdateSchema.validateAsync(req.body);

    if (Object.keys(result).length <= 1) {
      throw createError.BadRequest('Update Fields are Required')
    }

    let update = await Market.updateOne({
      _id: req.body.marketId,
      'author.userId': req.payload.aud
    }, result);

    console.log('update: ', update)

    res.send(update)
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getMarkets = async (req, res, next) => {
  try {
    let { size, page } = pagenate(req.query);
    const limit = parseInt(size);
    const skip = (parseInt(page) - 1) * parseInt(size);
    console.log('limit: ', limit, 'skip: ', skip);

    const markets = await Market.find({}, {}, { limit, skip });

    res.send(markets)
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getMarketsByCategory = async (req, res, next) => {
  try {
    console.log(req.query)
    console.log('categoryId: ', req.query.id || req.body.id);
    const markets = await Market.find({
      "category.categoryId": req.query.id || req.body.id
    });

    res.send(markets);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getUserMarkets = async (req, res, next) => {
  try {
    let { size, page } = pagenate(req.query);
    const limit = parseInt(size);
    const skip = (parseInt(page) - 1) * parseInt(size);
    console.log('limit: ', limit, 'skip: ', skip);

    const markets = await Market.find({
      "author.userId": req.payload.aud
    }, {}, { limit, skip });
    console.log('markets: ', markets);

    res.send(markets);
  }
  
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getSingleMarket = async (req, res, next) => {
  try {
    if (!req.params.id) throw createError.BadRequest('Market ID Not Provided.');

    let market = await Market.findOne({
      _id: req.params.id
    });

    res.send(market);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.updateMarket = async (req, res, next) => {
  try {

  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.deleteMarket = async (req, res, next) => {
  try {
    if (!req.params.id || req.body.id) {
      throw createError.BadRequest('Please provide ID')
    }
    const remove = await Market.deleteOne(req.params.id || req.body.id);
    console.log(remove);

    res.send(remove);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}