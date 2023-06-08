const express=require("express")
const router=express.Router();



const {checkIsAdmin,adddata,getdata,getonedata,deleteone,Findonedata,Fillterproperties,
    Addbooking,Getallbookings,Checkout,Paymentverification,Getbookings,checkIfAuthenticated} =require("../Controller/user-controller.js")


// authenticate
router.get("/checkauthenticate",checkIfAuthenticated,checkIsAdmin)




router.post("/add",adddata)
router.get("/Retrive",getdata)
router.get("/Retriveone/:id",getonedata)
router.post("/Findone",Findonedata)
router.delete("/Deleteone/:id",deleteone)
router.get('/Fillterproperties',Fillterproperties)
router.post('/Addbooking',Addbooking)
router.get("/Getallbookings",Getallbookings)
router.get("/bookings/:guestEmail",Getbookings)


// payment route

router.post("/checkout",Checkout)
router.post("/paymentverification",Paymentverification)

module.exports = router;



