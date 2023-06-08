const mongoose = require('mongoose');
const Booking = require('./Bookingschema');


const propertySchema = new mongoose.Schema({
  
  name: {
    type: String,
    unique:true,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true
  },
  distance: {
    type: Number,
    required: true
  },
  reviews: {
    type: String,
  },
  offer: {
    type: String
  },
  highlights: [{type:String}],
  prevPrice: {
    type:String
  },
  currentPrice: {
    type: String,
    required: true
  },
  reviewsLink: {
    type: String
  },
  location: {
    type: String,
    required: true
  },
  topAmenities: [{type:String}],
  allAmenities: [{type:String}],
  status: {
    type: String,
    enum: ['booked', 'available'],
    default: 'available',

  },
  mainimage:{
    type:String
    
  },
  images:[{
    type:String
  }],

  bookings: [Booking.schema],

  
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;
