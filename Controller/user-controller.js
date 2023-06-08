const { json } = require("body-parser");
const Property=require("../models/hotelschema.js")
const Booking=require("../models/Bookingschema")
const schedule = require('node-schedule');
const moment = require('moment-timezone');
const IST_TIMEZONE = 'Asia/Kolkata';
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cron = require('node-cron');
const admin = require("firebase-admin");
// var serviceAccount = require("../Serviceaccount.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });




module.exports.checkIfAuthenticated= (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const idToken = req.headers.authorization.split('Bearer ')[1];
    admin.auth().verifyIdToken(idToken)
      .then(decodedToken => {
        req.user = decodedToken;
        next();
      })
      .catch(error => {
        console.error('Error verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
      });
  } else {
    res.status(403).send('Unauthorized');
  }
};


module.exports.checkIsAdmin=(req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const idToken = req.headers.authorization.split('Bearer ')[1];
    admin.auth().verifyIdToken(idToken)
      .then(decodedToken => {
        req.user = decodedToken;
        const userEmail = decodedToken.email;
        const adminEmail = process.env.ADMIN_EMAIL;
        if (userEmail === adminEmail) {
          req.isAdmin = true;
        } else {
          req.isAdmin = false;
        }
        next();
      })
      .catch(error => {
        console.error('Error verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
      });
  } else {
    res.status(403).send('Unauthorized');
  }
};


module.exports.adddata = async (req, res) => {
  try {
    const hotPropertyel =  new Property(req.body);
    await hotPropertyel.save();
    res.status(201).json(hotPropertyel);
  } catch (err) {
    console.log("error: ", err.message);
    res.status(400).json({ message: err.message });
  }
};



  module.exports.getdata= async (req,res)=>{
    const Propertys = await Property.find({
      status: req.query.status || 'available',
    });
    // res.status(200).json({Propertys})
    res.send(Propertys);

  }

 module.exports.getonedata= async (req, res) => {
  console.log(req.params.id)
  const Propertydata = await Property.find({_id:req.params.id});
  if(Propertydata){
    return res.json({hotel:Propertydata });
} else {
  return res.json({hotel:false });
}
  
}
 module.exports.Findonedata= async (req, res) => {
    console.log(req.body.hotelname)
    const hoteldata = await Property.findOne({name:req.body.hotelname});
    if(hoteldata){
    return res.status(200).json({hotel:hoteldata });
} else {
  return res.status(400).json({hotel:"hotel not found" });
}
  
}
 module.exports.deleteone= async (req, res) => {
    const id = req.params.id;
    console.log(id)
const response = await Property.findByIdAndDelete(id);
    if(response){
    return res.json({hotel:"Hotel successfully deleted"});
} else {
  return res.json({hotel:"hotel not Deleted" });
}
  
}




module.exports.Fillterproperties = async (req, res) => {
  const { category, checkIn, checkOut } = req.query;

  try {
    let properties = await Property.find({ category });

    const bookings = await Booking.find({ checkIn: { $lte: checkOut }, checkOut: { $gte: checkIn } });
    const bookedPropertyIds = bookings.map(booking => booking.property.toString());
    properties = properties.filter(property => !bookedPropertyIds.includes(property._id.toString()));

    res.status(200).json({ properties });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports.Addbooking = async (req, res) => {
  const { propertyId, guestName, guestEmail, guestPhone, checkIn, checkOut } = req.body;

  try {
    const now = new Date();
    const istOffset = 330 * 60 * 1000; // IST is UTC+5:30
    const istNow = new Date(now.getTime() + istOffset);

    const checkInDate = new Date(checkIn);
    const status = checkInDate <= istNow ? "booked" : "active";

    const booking = new Booking({
      property: propertyId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      status
    });

    await booking.save();

    const property = await Property.findById(propertyId);
    const bookings = await Booking.find({ property: propertyId, checkIn: { $lte: checkOut }, checkOut: { $gte: checkIn } });
    if (bookings.length > 0) {
      property.status = "booked";
    } else {
      property.status = "available";
    }
    await property.save();

    res.status(200).json({ message: 'Booking created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





// GET ALL BOOKINGS

module.exports.Getallbookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate("property","name mainimage")
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// GET BOOKING

module.exports.Getbookings = async (req, res) => {
  const Email = req.params.guestEmail;
  console.log(Email)

  try {
    const data = await Booking.findOne({guestEmail:Email} ).populate("property", "name mainimage");
    if (!data) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}







//  FOR PAYMENT

module.exports.Checkout=async (req,res)=>{
  const {amount}=req.body
  const instance = new Razorpay({
    key_id:"rzp_test_TylPzNmfBh90e2",
    key_secret:"dkav399OTk3hgRAwWLJYEgaL",
  });
  

  const options = {
    amount:Number(amount*100),  
    currency: "INR",
    receipt: "order_rcptid_11"
  };
  instance.orders.create(options,  function(err, order) {
    if (err) {
      console.error(err);
    } else {
      res.status(200).json({order:order});
    }
  });

}


// PAYMENT VERIFICATION

module.exports.Paymentverification = async (req, res) => {
  const propertyId = req.query.propertyid;
  const checkIn = req.query.checkIN;
  const checkOut = req.query.checkOUT;
  const guestName = req.query.name;
  const guestEmail = req.query.email;
  const guestPhone = req.query.mob;
  const amountpaid = req.query.tot;
  const orderid=req.body.razorpay_order_id

  // const razorpay = new Razorpay({
  //   key_id: process.env.API_KEY,
  //   key_secret: process.env.SECRET_KEY,
  // });

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  // Concatenate the order ID and payment ID
  const text = `${razorpay_order_id}|${razorpay_payment_id}`;

  // Create a SHA-256 HMAC with the secret key
  const hmac = crypto.createHmac('sha256', "dkav399OTk3hgRAwWLJYEgaL");
  hmac.update(text);
  const generatedSignature = hmac.digest('hex');

  // Compare the generated signature with the signature from the request body
  if (generatedSignature === razorpay_signature) {
    try {
      const now = new Date();
      const istOffset = 330 * 60 * 1000; // IST is UTC+5:30
      const istNow = new Date(now.getTime() + istOffset);

      const checkInDate = new Date(checkIn);
      const status = checkInDate.getTime() <= istNow.getTime() ? "booked" : "active";
      console.log(status)
      const booking = new Booking({
        property: propertyId,
        guestName,
        guestEmail,
        guestPhone,
        checkIn,
        checkOut,
        status,
        amountpaid,
        orderid
      });

      await booking.save();

      const property = await Property.findById(propertyId);
      const bookings = await Booking.find({
        property: propertyId,
        checkIn: { $lte: checkOut },
        checkOut: { $gte: checkIn },
      });

if (status === "booked") {
  property.status = "booked";
} else {
  if (bookings.length > 0) {
    const bookedBookings = bookings.filter(booking => booking.status === "booked");
    property.status = bookedBookings.length > 0 ? "booked" : "available";
  } else {
    property.status = "available";
  }
}

await property.save();

      res.redirect(`http://localhost:3000/paymentsuccessful?&orderid=${razorpay_order_id}&proid=${propertyId}&checkin=${checkIn}&checkout=${checkOut}&amount=${amountpaid}`);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    console.log("Payment is not authentic.");
    res.status(400).json({ message: "Payment verification failed" });
  }
};






// REMOVE HOTEL IF CHECKOUTPERIOD IS OVER


schedule.scheduleJob('0 0 * * *', async function() {
  const currentDate = moment().tz(IST_TIMEZONE).toDate();

  const expiredBookings = await Booking.find({ checkout: { $lt: currentDate }, status: "booked" });
  for (const booking of expiredBookings) {
    if (booking.status === "booked") {
      await booking.remove();
        const property = await Property.findById(booking.property);
      property.status = "available";
      await property.save();
    }
  }
});



// FOR CHAMGING UPCOMING DATES STATUS 




cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    const istOffset = 330 * 60 * 1000; // IST is UTC+5:30
    const istNow = new Date(now.getTime() + istOffset);

    const bookings = await Booking.find({ status: 'active' });

    for (const booking of bookings) {
      const property = await Property.findById(booking.property);

      const checkInDate = booking.checkIn; // Assuming checkInDate is already stored in IST timezone
      if (checkInDate <= istNow) {
        booking.status = 'booked';
        await booking.save();
        property.status = 'booked';
        await property.save();
      }
    }
  } catch (error) {
    console.error(error);
  }
});



