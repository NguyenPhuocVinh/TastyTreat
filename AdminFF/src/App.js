// import Home from "./pages/home/Home";
// import Login from "./pages/login/Login";
// import List from "./pages/list/List";
// import ListProgram from "./pages/list/ListProgram";
// import Single from "./pages/single/Single";
// import New from "./pages/new/New";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { productInputs, userInputs } from "./formSource";
// import "./style/dark.scss";
// import { useContext } from "react";
// import { DarkModeContext } from "./context/darkModeContext";

// function App() {
//   const { darkMode } = useContext(DarkModeContext);

//   return (
//     <div className={darkMode ? "app dark" : "app"}>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/">
//             <Route index element={<Home />} />
//             <Route path="login" element={<Login />} />
//             <Route path="users">
//               <Route index element={<List />} />
//               <Route path=":userId" element={<Single />} />
//               <Route
//                 path="new"
//                 element={<New inputs={userInputs} title="Add New User" />}
//               />
//             </Route>
//             <Route path="programs">
//               <Route index element={<ListProgram />} />
//               <Route path=":productId" element={<Single />} />
//               <Route
//                 path="new"
//                 element={<New inputs={productInputs} title="Add New Product" />}
//               />
//             </Route>
//           </Route>
//         </Routes>
//       </BrowserRouter>
//     </div>
//   );
// }

// export default App;
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import ListUser from "./pages/list/ListUser";
import ListProduct from "./pages/list/ListProduct";
import ListCategory from "./pages/list/ListCategory";
import ListOrder from "./pages/list/ListOrder";
import ListDelivery from "./pages/list/ListDelivery";
import NewProduct from "./pages/new/NewProduct"
import NewCategory from "./pages/new/NewCategory";
import NewDiscount from "./pages/new/NewDiscount";
import ListDiscount from "./pages/list/ListDiscount";
import Single from "./pages/single/Single"
import UpdateProduct from "./pages/single/UpdateProduct";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { productInputs } from "./pages/new/NewProduct";
import { categoryInputs } from "./pages/new/NewCategory";
import { discountInputs } from "./pages/new/NewDiscount";
import "./style/dark.scss";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import UpdateCategory from "./pages/single/UpdateCategory";
import UpdateDiscount from "./pages/single/UpdateDiscount";

function App() {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/users">
            <Route index element={<ListUser/>} />
            <Route path=":userId" element={<UpdateProduct  />} />
            {/* <Route
              path="new"
              element={<New inputs={userInputs} title="Add New User" />}
            /> */}
          </Route>
          <Route path="/products">
            <Route index element={<ListProduct />} />
            <Route path=":productId" element={<UpdateProduct inputs={productInputs} title="Update Product" />} />
            <Route path="new" element={<NewProduct inputs={productInputs} title="Add New Product" />} />
          </Route>
          <Route path="/categories">
            <Route index element={<ListCategory />} />
            <Route path=":categoryId" element={<UpdateCategory inputs={categoryInputs} title="Update Category" />} />
            <Route path="new" element={<NewCategory inputs={categoryInputs} title="Add New Category" />}
            />
          </Route>
          <Route path="/orders">
            <Route index element={<ListOrder />} />
            <Route path=":orderId" element={<UpdateProduct />} />
            {/* <Route
              path="new"
              element={<New inputs={productInputs} title="Add New Product" />}
            /> */}
          </Route>
          <Route path="/deliveries">
            <Route index element={<ListDelivery />} />
            <Route path=":orderId" element={<UpdateProduct />} />
            {/* <Route
              path="new"
              element={<New inputs={productInputs} title="Add New Product" />}
            /> */}
          </Route>
          <Route path="/discounts">
            <Route index element={<ListDiscount />} />
            <Route path=":discountId" element={<UpdateDiscount inputs={discountInputs} title="Update Discount" />} />
            <Route path="new" element={<NewDiscount inputs={discountInputs} title="Add New Discount" />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
