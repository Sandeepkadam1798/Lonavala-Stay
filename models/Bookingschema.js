const mongoose = require('mongoose');
const Property = require('./hotelschema.js');

const bookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  guestName: {
    type: String,
    required: true,
  },
  guestEmail: {
    type: String,
    required: true,
  },
  guestPhone: {
    type: String,
    required: true,
  },
  orderid: {
    type: String,
    required: true,
  },
  amountpaid: {
    type: String,
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['booked', 'checkedIn', 'checkedOut', 'cancelled','active'],
    default: 'booked',
  },
  
},{ timestamps: true });

// bookingSchema.pre('save', async function(next) {
//   const booking = this;

//   // Find the property associated with the booking
//   const property = await Property.findById(booking.property);

//   // Update the property status to 'booked'
//   property.status = 'booked';

//   // Save the property changes
//   await property.save();

//   next();
// });

// bookingSchema.post('save', async function(booking) {
//   const property = await Property.findById(booking.property);

//   // If check-out date has passed, update property status and booking field
//   if (booking.checkOut < new Date()) {
//     property.status = 'available';
//     property.bookings.pull(booking._id);
//   }

//   await property.save();
// });






const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
