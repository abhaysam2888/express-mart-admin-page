import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Home from "./components/Home";
import Login from "./components/Login";
import AddProducts from "./components/AddProducts";
import Products from "./components/Products";
import AdminGuard from "./components/AdminGuard";
import Layout from "./components/Layout";
import { checkAuth } from "./store/authSlice";
import "./App.css";
import Notification from "./components/Notification";
import Crousal from "./components/Crousal";
import ProdcutCategory from "./components/ProdcutCategory";
import AddProductCategory from "./components/AddProductCategory";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />

      {/* Protected */}
      <Route element={<AdminGuard />}>
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/addProduct" element={<AddProducts />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/prodcutCategory" element={<ProdcutCategory />} />
          <Route path="/AddprodcutCategory" element={<AddProductCategory />} />
          <Route path="/Crousal" element={<Crousal />} />
        </Route>
      </Route>
    </Routes>
  );
}
