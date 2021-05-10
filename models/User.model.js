const createError = require('http-errors');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Order = require('./order.model');
const createHttpError = require('http-errors');

const UserSchema = new Schema({
  role: String,
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  firstName: String,
  lastName: String,
  gender: String,
  address: {
    street: String,
    suburb: String,
    zipcode: String,
    province: String,
    city: String,
    apartment: String
  },

  featuredImage: {
    imageName: String,
    url: String
  },

  paymentGateway: {
    secret_key: String,
    public_key: String
  },
  adminPaymentGateway: {
    name: String,
    secret_key: String,
    public_key: String,
  },
  confirmedEmail: Boolean,
  resetPassword: {
    type: Boolean,
    default: false
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ]
  }
});

UserSchema.index({
  firstName: 'text',
  lastName: 'text',
}, {
  weights: {
    firstName: 5,
    lastName: 1,
  },
});

// UserSchema.pre('save', async function (next) {
//   try {
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(this.password, salt);
//     this.password = hashedPassword;
//   }
//   catch (error) {
//     next(error);
//   }
// });

UserSchema.post('save', async function (next) {
  try {
    console.log('User.model.js:: called after saving a user')
    // const data = {
    //   username: this.email,
    //   email: req.body.email,
    //   confirmToken: 'd9729feb74992cc3482b350163a1a010'
    // }

    // sendEmail.registerEmail(data);
  }
  catch (error) {
    next(err)
  }
});

UserSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  }
  catch (error) {
    throw error;
  }
}

UserSchema.methods.generatePassword = async function (password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }
  catch (error) {
    next(error);
  }
}

UserSchema.methods.getCart = async function (password) {

}

UserSchema.methods.addToCart = async function (product, quantity) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString()
  });

  const updatedCartItems = [...this.cart.items];
  if (parseInt(quantity) <= 0) parseInt(quantity) = 1;

  if (cartProductIndex >= 0) {
    // const newQuantity = parseInt(this.cart.items[cartProductIndex].quantity) + parseInt(quantity);
    // updatedCartItems[cartProductIndex].quantity = newQuantity;

    updatedCartItems[cartProductIndex].quantity = parseInt(quantity);

  }
  else {
    updatedCartItems.push({
      productId: product._id,
      quantity: parseInt(quantity)
    });
  }

  const updatedCart = { items: updatedCartItems }
  this.cart = updatedCart;
  let saveCart = await this.save();
  return saveCart.cart;
}

UserSchema.methods.removeFromCart = async function (productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });

  this.cart.items = updatedCartItems;
  await this.save();
  return updatedCartItems;
}

UserSchema.methods.getCartItem = async function (productId) {
  const cartItem = this.cart.items.filter(item => {
    return item.productId.toString() === productId.toString();
  });

  return cartItem;
}

UserSchema.methods.clearCart = async function () {
  this.cart = { item: [] };
  return await this.save();
}

UserSchema.methods.addOrder = async function (products) {
  try {
    console.log('products: ', products)

    let orderData = {
      items: products,
      user: {
        _id: this._id,
        name: this.firstName + ' ' + this.lastName
      }
    }

    console.log('user.model: orderData: ', orderData);

    const order = new Order(orderData);
    saveOrder = await order.save();
    console.log('user.model: saveOrder: ', saveOrder)

    if (saveOrder) {
      this.cart = { items: [] }
      await this.save();    
      return saveOrder;
    }
  }
  catch (err) {
    console.log(err)
  }
}

UserSchema.methods.addAdminPaymentGateway = async function (adminPaymentGateway) {
  try {
    if (!adminPaymentGateway) throw createError.BadRequest('payment gateway details not provided');

    this.adminPaymentGateway = adminPaymentGateway;

    return await this.save();
  }
  catch (err) {
    console.log(err)
  }
}

UserSchema.methods.getAdminPaymentGateway = async function () {
  try {
    return await this.adminPaymentGateway;
  }
  catch (err) {
    console.log(err)
  }
}

const User = mongoose.model('user', UserSchema);
module.exports = User;