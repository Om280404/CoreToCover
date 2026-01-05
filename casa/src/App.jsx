import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

{/* Customer Imports */ }
import Home from "./components/customer/Home";
import ProductListing from "./components/customer/ProductListing";
import ProductInfo from "./components/customer/Product_Info";
import UserProfile from "./components/customer/UserProfile";
import MyOrders from './components/customer/MyOrders';
import MyHiredDesigners from './components/customer/MyHiredDesigners';
import SearchResults from './components/customer/SearchResults';
import Cart from './components/customer/Cart';
import Contact from './components/customer/Contact';
import DesignerCard from './components/customer/DesignerCard';
import DesignerInfo from './components/customer/DesignerInfo';
import Designers from './components/customer/Designers';
import About from './components/customer/About';
import Login from './components/customer/Login';
import Signup from './components/customer/Signup';
import Checkout from './components/customer/Checkout';

{/* Seller Imports */ }
import Orders from './components/seller/Orders';
import SellerAddProduct from './components/seller/SellerAddProduct';
import SellerDashboard from './components/seller/SellerDashboard';
import SellerReturns from './components/seller/SellerReturns';
import Sidebar from './components/seller/Sidebar';
import SellerProfile from './components/seller/SellerProfile';
import SellerLogin from './components/seller/SellerLogin';
import SellerSignup from './components/seller/SellerSignup';
import BusinessDetails from './components/seller/BusinessDetails';
import EditBusinessDetails from './components/seller/EditBusinessDetails';
import SellerKYC from './components/seller/SellerKYC';
import SellerDeliveryDetails from './components/seller/SellerDeliveryDetails';
import SellerDeliveryUpdate from './components/seller/SellerDeliveryUpdate';
import SellerManageBankDetails from './components/seller/SellerManageBankDetails'
import SellerBankDetails from './components/seller/SellerBankDetails';  
import SellerProducts from './components/seller/SellerProducts';

{/*Designer Imports*/ }
import DesignerLogin from "./components/designer/DesignerLogin";
import DesignerSignup from "./components/designer/DesignerSignup";
import DesignerPortfolio from "./components/designer/DesignerPortfolio";
import DesignerDashboard from "./components/designer/DesignerDashboard";
import DesignerExperience from "./components/designer/DesignerExperience";
import DesignerWorkReceived from "./components/designer/DesignerWorkReceived";
import DesignerEditProfile from "./components/designer/DesignerEditProfile";
import DesignerProfileSetup from "./components/designer/DesignerProfileSetup";
import DesignerSubscription from "./components/designer/DesignerSubscription";



const AuthRoute = ({ element, type }) => {
  const isUserLoggedIn = localStorage.getItem("userLoggedIn") === "true";
  const isSellerLoggedIn = localStorage.getItem("sellerLoggedIn") === "true";
  const isDesignerLoggedIn = localStorage.getItem("designerLoggedIn") === "true"

  if (type === "user" && !isUserLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (type === "seller" && !isSellerLoggedIn) {
    return <Navigate to="/sellerlogin" replace />;
  }

  if (type === "designer" && !isDesignerLoggedIn){
    return <Navigate to="/designerlogin" replace />
  }

  return element;
};



function App() {

  return (
    <Router>
      <Routes>
        {/* The Home is now the root page that loads first */}
        <Route path="/" element={<Home />} />
        <Route path="/productlisting" element={<ProductListing/>}/>

        <Route path="/productinfo" element={<ProductInfo />} />
        <Route path="/userprofile" element={<AuthRoute element={<UserProfile/>}/>} />
        <Route path="/myorders" element={<AuthRoute element={<MyOrders/>}/>} />
        <Route path="/myhireddesigners" element={<AuthRoute element={<MyHiredDesigners/>}/>} />
        <Route path="/searchresults" element={<SearchResults />} />
        <Route path="/cart" element={<AuthRoute element={<Cart/>}/>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/designer_card" element={<DesignerCard />} />
        <Route path="/designer_info" element={<AuthRoute element={<DesignerInfo/>}/>} />
        <Route path="/designers" element={<Designers />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/checkout" element={<AuthRoute element={<Checkout/>}/>} />


        {/* Routes for seller side */}
        <Route path="/orders" element={<Orders />} />
        <Route path="/selleraddproduct" element={<AuthRoute element={<SellerAddProduct/>}/>} />
        <Route path="/sellerreturns" element={<AuthRoute element={<SellerReturns/>}/>} />
        <Route path="/sellerdashboard" element={<AuthRoute element={<SellerDashboard/>}/>} />
        <Route path='/sidebar' element={<Sidebar />} />
        <Route path="/sellerprofile" element={<AuthRoute element={<SellerProfile/>}/>} />
        <Route path="/sellerlogin" element={<SellerLogin />} />
        <Route path="/sellersignup" element={<SellerSignup />} />
        <Route path="/businessdetails" element={<BusinessDetails />} />
        <Route path="/editbusinessdetails" element={<EditBusinessDetails/>} />
        <Route path="/sellerKYC" element={<SellerKYC/>} />
        <Route path="/deliverydetails" element={<SellerDeliveryDetails/>} />
        <Route path="/sellerdeliveryupdate" element={<AuthRoute element={<SellerDeliveryUpdate/>}/>} />
        <Route path='/sellermanagebankdetails' element={<SellerManageBankDetails/>} />
        <Route path="/sellerbankdetails" element={<AuthRoute element={<SellerBankDetails/>}/>} />
        <Route path="/sellerproducts" element={<AuthRoute element={<SellerProducts/>}/>} />

        {/* Routes for designer side */}
        <Route path="/designerlogin" element={<DesignerLogin />} />
        <Route path="/designersignup" element={<DesignerSignup />} />
        <Route path="/designerportfolio" element={<DesignerPortfolio />} />
        <Route path="/designerdashboard" element={<AuthRoute element={<DesignerDashboard /> }/>} />
        <Route path="/designerexperience" element={<DesignerExperience />} />
        <Route path="/designerworkreceived" element={<DesignerWorkReceived />} />
        <Route path="/designereditprofile" element={<DesignerEditProfile />} />
        <Route path="/designer_profile_setup" element={<DesignerProfileSetup />} />
        <Route path="/designer_subscription" element={<DesignerSubscription />} />

      </Routes>
    </Router>
  )
}

export default App
