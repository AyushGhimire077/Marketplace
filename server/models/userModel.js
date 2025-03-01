import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
        type: String, required: true,
        default: 'user', enum: ['user', 'admin', 'dealer']
    },
})

const dealerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  role: {
    type: String,
    required: true,
    default: "dealer",
  },
  verfiyOtt: { type: String },
  verfiyOttExpiry: { type: Date },
  isVerified: { type: Boolean, required: true, default: false },
});

const userModel = mongoose.model('customer', userSchema)
const dealerModel = mongoose.model('dealer', dealerSchema)

export { userModel, dealerModel }