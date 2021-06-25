const Joi = require('@hapi/joi');

const authSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required()
});

const emailSchema = Joi.object({
  email: Joi.string().email().lowercase().required()
});

const packageSchema = Joi.object({
  name: Joi.string().required(),
  expiryDate: {
    days: Joi.number().required()
  },
  description: Joi.string(),
  price: Joi.number().required(),
  features: Joi.array().required()
});

const productSchema = Joi.object({
  name: Joi.string().required(),
  name: Joi.string().required(),
  category: Joi.string().required(),
  payment: Joi.string().required(),
  price: Joi.number().required(),
  description: Joi.string().required(),
  delivery: Joi.string().required(),
  deliveryPrice: Joi.string().required(),
  units: Joi.string().required(),
  province: Joi.string().required(),
  city: Joi.string().required(),
  images: Joi.array(),
  featuredImage: Joi.object(),
  subscriptionId: Joi.string().required(),
  boostInfo: Joi.object()
});

const productUpdateSchema = Joi.object({
  name: Joi.string(),
  category: Joi.string(),
  subCaterory: Joi.string(),
  payment: Joi.string(),
  price: Joi.number(),
  description: Joi.string(),
  delivery: Joi.string(),
  deliveryPrice: Joi.string(),
  units: Joi.string(),
  province: Joi.string(),
  city: Joi.string(),
  images: Joi.string(),
  imagesUpdate: Joi.boolean(),
  id: Joi.string(),
  images: Joi.array(),
  featuredImage: Joi.object(),
  subscriptionId: Joi.string(),
  boostInfo: Joi.object(),
  published: Joi.boolean()
});

const adminPaymentGatewaySchema = Joi.object({
  name: Joi.string(),
  public_key: Joi.string(),
  secret_key: Joi.string(),
})

const marketSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  author: Joi.object().required(),
  category: Joi.object().required(),
  location: Joi.string().required(),
  phone: Joi.string().required(),
  website: Joi.string(),
  organisation: Joi.string()
})

const marketUpdateSchema = Joi.object({
  marketId: Joi.string().required(),
  name: Joi.string(),
  description: Joi.string(),
  author: Joi.object(),
  category: Joi.object(),
  location: Joi.string(),
  phone: Joi.string(),
  website: Joi.string(),
  hikingData: Joi.object(),
  featuredImage: Joi.object(),
  images: Joi.array(),
  publish: Joi.boolean()
})

const organisationSchema = Joi.object({
  name: Joi.string().required(),
  author: Joi.object().required(),
  province: Joi.string().required(),
  city: Joi.string().required(),
  address: Joi.string().required(),
  featuredImage: Joi.object(),
});

module.exports = {
  authSchema, emailSchema, packageSchema, productSchema, 
  productUpdateSchema, adminPaymentGatewaySchema, marketSchema,
  marketUpdateSchema, organisationSchema
}

