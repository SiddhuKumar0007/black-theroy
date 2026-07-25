const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  size: { type: String, required: true },
  color: {
    name: { type: String, required: true },
    hex: { type: String, required: true }
  },
  image: { type: String, required: true }
});

const AddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  landmark: { type: String, default: '' }
});

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [OrderItemSchema],
    shippingAddress: {
      type: AddressSchema,
      required: true
    },
    billingAddress: {
      type: AddressSchema,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'wallet', 'cod'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentGateway: {
      type: String,
      enum: ['stripe', 'razorpay', 'cod'],
      required: true
    },
    paymentGatewayId: {
      type: String,
      default: ''
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    courierTracking: {
      type: String,
      default: '' // tracking number
    },
    courierName: {
      type: String,
      default: '' // Bluedart, Delhivery etc
    },
    couponCode: {
      type: String,
      default: ''
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    gstNumber: {
      type: String,
      default: ''
    },
    shippingCharges: {
      type: Number,
      default: 0
    },
    estimatedDeliveryDate: {
      type: Date
    },
    totalAmount: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', OrderSchema);
