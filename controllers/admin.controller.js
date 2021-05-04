const createError = require('http-errors');
const User = require('../models/User.model');
const { packageSchema, adminPaymentGatewaySchema } = require('../helpers/validation_schema');
const Package = require('../models/packages.model');
const ProductCategory = require('../models/product_categories.model');
const Boosting = require('../models/boosting.model');
const Terms = require('../models/terms.model');
const Post = require('../models/post.model');

exports.getAdminAccount = async (req, res, next) => {
  try {
    const admin = await User.findOne({
      _id: req.payload.aud,
      role: "admin"
    }).select("-password -cart");

    if (!admin) throw createError.NotFound('Admin could not be found.');

    res.send({ message: 'get admin account', admin });
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

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

exports.getAdminPackage = async (req, res, next) => {
  try {
    const package = await Package.findOne({
      _id: req.body.id,
      "author.userId": req.payload.aud
    });

    res.send(package);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getAdminPackages = async (req, res, next) => {
  try {
    const packages = await Package.find({ "author.userId": req.payload.aud });

    res.send(packages);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.addPackage = async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.aud);
    if (!user) throw createError.NotFound('User not registered');

    // if (user.confirmedEmail === false) throw createError.BadRequest('You need to verify your email first.');
    if (user.role !== 'admin') {
      throw createError.BadRequest('You have to be admin to add a puckage');
    }

    const result = await packageSchema.validateAsync({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      expiryDate: { days: req.body.expiryDate },
      features: req.body.features,
    });

    result.author = {
      name: user.firstName + " " + user.lastName,
      userId: user._id
    }

    const _package = new Package(result);
    let savePackage = await _package.save();

    res.send({ message: 'puckage added successfuly', package: savePackage });
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.editPackage = async (req, res, next) => {
  try {
    let update = {};
    console.log('body: ', req.body)

    if (req.body.name) update.name = req.body.name;
    if (req.body.price) update.price = req.body.price;
    if (req.body.features) update.features = req.body.features;
    if (req.body.description) update.description = req.body.description;
    if (req.body.icon) update.description = req.body.icon;

    if (req.body.expiryDate) update.expiryDate = {
      days: parseInt(req.body.expiryDate)
    }

    if (Object.keys(update).length === 0 && update.constructor === Object) {
      throw createError.BadRequest('No update info received');
    }

    const updatePackage = await Package.findOneAndUpdate({
      _id: req.body.id,
      "author.userId": req.payload.aud
    }, update);
    console.log('updatePackage: ', updatePackage);

    // if (!updatePackage) throw createError.NotFound();

    const getPackage = await Package.findOne({
      _id: req.body.id,
      "author.userId": req.payload.aud
    });
    
    res.send(updatePackage);
  }
  catch (error) {
    console.log(error)
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.deletePackage = async (req, res, next) => {
  try {
    const package = await Package.findOne({
      _id: req.params.id.toString(),
      "author.userId": req.payload.aud
    });

    if (!package) throw createError.NotFound();

    const deletePackage = await Package.deleteOne({
      _id: req.params.id,
      "author.userId": req.payload.aud
    });
    if (!deletePackage) throw createError.BadRequest();

    res.send(deletePackage);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.addCategories = async (req, res, next) => {
  try {
    if (!req.body.categories) createError.BadRequest('Caterories can not be empty')
    const user = await User.findById(req.payload.aud);
    if (!user) throw createError.Unauthorized();

    // if (user.confirmedEmail === false) throw createError.BadRequest('You need to verify your email first.');
    if (user.role !== 'admin') {
      throw createError.Unauthorized();
    }

    let categories;
    let saveCategories;

    for (const key in req.body.categories) {
      if (req.body.categories.hasOwnProperty(key)) {
        const element = req.body.categories[key];
        console.log('element: ', element);

        element.author = {
          name: user.firstName + " " + user.lastName,
          icon: element.icon,
          userId: user._id
        }

        categories = new ProductCategory(element);
        saveCategories = await categories.save();
      }
    }

    res.send(saveCategories);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}


exports.getAllCategories = async (req, res, next) => {
  try {
    let filter = {}
    if (req.query.categoryType) filter = {
      categoryType: req.query.categoryType
    }
    console.log('filter: ', filter);

    const categories = await ProductCategory.find(filter);
    if (!categories) throw createError.NotFound('No categories found');

    res.send(categories);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getAdminCategories = async (req, res, next) => {
  try {
    const categories = await ProductCategory.find({
      "author.userId": req.payload.aud
    });

    res.send(categories);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getAdminCategory = async (req, res, next) => {
  try {
    const category = await ProductCategory.findOne({
      _id: req.body.id,
      "author.userId": req.payload.aud
    });

    if (!category) throw createError.NotFound();

    res.send(category);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getCategory = async (req, res, next) => {
  try {
    const category = await ProductCategory.findOne({
      _id: req.body.id || req.params.id
    });

    if (!category) throw createError.NotFound();

    res.send(category);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.editAdminCategory = async (req, res, next) => {
  try {
    let update = {};
    console.log('body: ', req.body)
    if (req.body.name) update.name = req.body.name;
    if (req.body.description) update.description = req.body.description;
    if (req.body.icon) update.icon = req.body.icon;
    if (req.body.categoryType) update.categoryType = req.body.categoryType;

    if (Object.keys(update).length === 0 && update.constructor === Object) {
      throw createError.BadRequest('No update info received');
    }

    const updateCategory = await ProductCategory.updateOne({
      _id: req.body.id,
      "author.userId": req.payload.aud
    }, update);

    if (updateCategory.nModified === 0) {
      throw createError.BadRequest('Failed to update');
    }

    res.send(updateCategory);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.deleteCategory = async (req, res, next) => {
  try {

    const deletePackage = await ProductCategory.deleteOne({
      _id: req.params.id,
      "author.userId": req.payload.aud
    });
    if (deletePackage.deletedCount === 0) {
      throw createError.BadRequest('Failed to delete');
    }

    res.send(deletePackage);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.addAdminPaymentGateway = async (req, res, next) => {
  try {
    console.log('body: ', req.body)
    const admin = await User.findOne({
      _id: req.payload.aud,
      role: "admin"
    }).select("-password -cart");
    if (!admin) throw createError.NotFound('Admin could not be found.');

    const result = await adminPaymentGatewaySchema.validateAsync({
      name: req.body.name,
      public_key: req.body.public_key,
      secret_key: req.body.secret_key,
    });

    const save = await admin.addAdminPaymentGateway(result);
    console.log('save: ', save);
    res.send(save)
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getPaymentGateway = async (req, res, next) => {
  try {
    console.log('admin id: ', req.payload.aud);

    const admin = await User.find({
      _id: req.payload.aud
    }).select("adminPaymentGateway");
    if (!admin) throw createError.NotFound('Admin could not be found.');

    let { adminPaymentGateway } = admin;

    res.send(adminPaymentGateway)
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getShopPaymentGateway = async (req, res, next) => {
  try {
    const admin = await User.findOne({
      role: 'admin'
    }).select("adminPaymentGateway")

    if (!admin) throw createError.NotFound();
    if (!admin.adminPaymentGateway) throw createError.NotFound();
    console.log('admin.adminPaymentGateway: ', admin)

    res.send(admin.adminPaymentGateway)
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password -cart");
    if (!users) throw createError.NotFound('No users found.');

    res.send(users);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id }).select("-password -cart");
    if (!user) throw createError.NotFound('User not found.');

    res.send(user);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.setUserAsAdmin = async (req, res, next) => {
  try {
    const setAsAdmim = await User.updateOne({ _id: req.body.id }, {
      'role': 'admin'
    });

    if (!setAsAdmim) throw createError.NotFound('User not found.');
    res.send(setAsAdmim);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.unsetUserAdmin = async (req, res, next) => {
  try {
    const unsetAsAdmim = await User.updateOne({ _id: req.body.id }, {
      'role': 'user'
    });

    if (!unsetAsAdmim) throw createError.NotFound('User not found.');
    res.send(unsetAsAdmim);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.addBoosting = async (req, res, next) => {
  try {
    if (!req.body.boosting) createError.BadRequest('Boosting Options cannot be empty')
    const user = await User.findById(req.payload.aud);
    if (!user) throw createError.Unauthorized();

    // if (user.confirmedEmail === false) throw createError.BadRequest('You need to verify your email first.');
    if (user.role !== 'admin') {
      throw createError.Unauthorized();
    }

    let boosting;
    let saveBoosting;

    for (const key in req.body.boosting) {
      if (req.body.boosting.hasOwnProperty(key)) {
        const element = req.body.boosting[key];
        console.log('element: ', element);

        element.author = {
          name: user.firstName + " " + user.lastName,
          icon: element.icon,
          userId: user._id
        }

        boosting = new Boosting(element);
        saveBoosting = await boosting.save();
      }
    }

    res.send(saveBoosting);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getBoostings = async (req, res, next) => {
  try {
    const boostings = await Boosting.find();
    // console.log('boostings', boostings)

    if (!boostings) throw createError.NotFound();
    res.send(boostings);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getBoosting = async (req, res, next) => {
  try {
    const boosting = await Boosting.findOne({
      _id: req.params.id, "author.userId": req.payload.aud
    });
    // console.log('boosting', boosting)

    if (!boosting) throw createError.NotFound();
    res.send(boosting);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.editBoosting = async (req, res, next) => {
  try {
    let update = {};
    console.log(req.body);

    if (req.body.name) update.name = req.body.name;
    if (req.body.price) update.price = req.body.price;
    if (req.body.description) update.description = req.body.description;
    if (req.body.icon) update.icon = req.body.icon;

    if (Object.keys(update).length === 0 && update.constructor === Object) {
      throw createError.BadRequest('No update info received');
    }

    const updateBoosting = await Boosting.findOneAndUpdate({
      _id: req.body.id,
      "author.userId": req.payload.aud
    }, update);
    console.log('updateBoosting: ', updateBoosting)

    if (!updateBoosting) throw createError.NotFound();

    const getBoosting = await Boosting.findOne({
      _id: req.body.id,
      "author.userId": req.payload.aud
    });
    console.log('getBoosting', getBoosting)

    res.send(getBoosting);
  }
  catch (error) {
    console.log(error)
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.addTerms = async (req, res, next) => {
  try {
    if (!req.body.boosting) createError.BadRequest('Boosting Options cannot be empty')
    const user = await User.findById(req.payload.aud);
    if (!user) throw createError.Unauthorized();

    // if (user.confirmedEmail === false) throw createError.BadRequest('You need to verify your email first.');
    if (user.role !== 'admin') {
      throw createError.Unauthorized();
    }

    if (!req.body.contents) throw createError('Error, Terms contents is required!')
    if (!req.body.title) throw createError('Error, Title contents is required!')

    let termsData = {
      ...req.body,
      author: {
        name: user.lastName + " " + user.firstName,
        userId: user._id
      }
    }
    console.log('termsData: ', termsData);

    const terms = new Terms(termsData);
    let saveTerms = await terms.save();
    console.log('saveTerms: ', saveTerms)

    res.send(saveTerms);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.addTerms = async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.aud);
    if (!user) throw createError.Unauthorized();

    // if (user.confirmedEmail === false) throw createError.BadRequest('You need to verify your email first.');
    if (user.role !== 'admin') {
      throw createError.Unauthorized();
    }

    if (!req.body.contents) throw createError('Error, Terms contents is required!')
    if (!req.body.title) throw createError('Error, Title contents is required!')

    let termsData = {
      ...req.body,
      author: {
        name: user.lastName + " " + user.firstName,
        userId: user._id
      }
    }
    console.log('termsData: ', termsData);

    const terms = new Terms(termsData);
    let saveTerms = await terms.save();
    console.log('saveTerms: ', saveTerms)

    res.send(saveTerms);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getTerms = async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.aud);
    if (!user) throw createError.Unauthorized();

    // if (user.confirmedEmail === false) throw createError.BadRequest('You need to verify your email first.');
    if (user.role !== 'admin') {
      throw createError.Unauthorized();
    }
    
    const terms = await Terms.findOne();
    console.log('terms: ', terms)

    res.send(terms);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getStoreTerms = async (req, res, next) => {
  try {    
    const terms = await Terms.findOne();
    console.log('terms: ', terms)

    res.send(terms);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.editTerms = async (req, res, next) => {
  try {
    console.log('body: ', req.body);
    console.log('query: ', req.body.query);
    console.log('params: ', req.body.params);
    const user = await User.findById(req.payload.aud);
    if (!user) throw createError.Unauthorized();

    // if (user.confirmedEmail === false) throw createError.BadRequest('You need to verify your email first.');
    if (user.role !== 'admin') {
      throw createError.Unauthorized();
    }
    
    const updateTerms = await Terms.updateOne({
      _id: req.query.id || req.params.id || req.body.id || req.body._id,
    }, req.body);

    console.log('updateTerms: ', updateTerms)

    res.send(updateTerms);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getAdminPost = async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.aud);
    if (!user) throw createError.Unauthorized();

    // if (user.confirmedEmail === false) throw createError.BadRequest('You need to verify your email first.');
    if (user.role !== 'admin') {
      throw createError.Unauthorized();
    }

    const post = await Post.findById(req.body.id || req.params.id || req.query.id);
    console.log('post: ', post)

    res.send(post);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}
exports.getAdminPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.aud);
    if (!user) throw createError.Unauthorized();

    // if (user.confirmedEmail === false) throw createError.BadRequest('You need to verify your email first.');
    if (user.role !== 'admin') {
      throw createError.Unauthorized();
    }
    
    const posts = await Post.find();
    console.log('posts: ', posts)

    res.send(posts);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getStorePosts = async (req, res, next) => {
  try {    
    const posts = await Post.find();
    console.log('posts: ', posts)

    res.send(posts);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.getStorePost = async (req, res, next) => {
  try {    
    const post = await Post.findById(req.body.id || req.params.id || req.query.id);
    console.log('post: ', post)

    res.send(post);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.addPost = async (req, res, next) => {
  try {
    console.log(req.body)
    const user = await User.findById(req.payload.aud);
    if (!user) throw createError.Unauthorized();

    // if (user.confirmedEmail === false) throw createError.BadRequest('You need to verify your email first.');
    if (user.role !== 'admin') {
      throw createError.Unauthorized();
    }

    if (!req.body.contents) throw createError('Error, Post Contents is required!')
    if (!req.body.title) throw createError('Error, Post Title is required!');

    let postData = {
      ...req.body,
      author: {
        name: user.lastName + " " + user.firstName,
        userId: user._id
      }
    }
    console.log('postData: ', postData);

    const terms = new Post(postData);
    let savePost = await terms.save();
    console.log('savePost: ', savePost)

    res.send(savePost);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.editPost = async (req, res, next) => {
  try {
    const user = await User.findById(req.payload.aud);
    let id = req.query.id || req.params.id || req.body.id || req.body._id;
    if (!user) throw createError.Unauthorized();

    // if (user.confirmedEmail === false) throw createError.BadRequest('You need to verify your email first.');
    if (user.role !== 'admin') {
      throw createError.Unauthorized();
    }
    let update = {};

    if (req.body.title) update.title = req.body.title;
    if (req.body.description) update.description = req.body.description;
    if (req.body.contents) update.contents = req.body.contents;
    if (req.body.featuredImage) update.featuredImage = req.body.featuredImage;
    if (req.body.postType) update.postType = req.body.postType;
    if (req.body.youtubeEmbed) update.youtubeEmbed = req.body.youtubeEmbed;

    if (!Object.keys(update).length) {
      throw createError.BadRequest('Error, Nothing to update.')
    }
  console.log('body: ', req.body)
    
    const updatePost = await Post.updateOne({
      _id: id,
    }, update);

    res.send(updatePost);
  }
  catch (error) {
    console.log(error);
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id.toString(),
      "author.userId": req.payload.aud
    });

    if (!post) throw createError.NotFound();

    const deletePost = await Post.deleteOne({
      _id: req.params.id,
      "author.userId": req.payload.aud
    });

    res.send(deletePost);
  }
  catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}