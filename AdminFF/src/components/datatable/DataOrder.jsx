import "./dataorder.scss"; // Import CSS/SCSS file
import { DataGrid } from "@mui/x-data-grid"; // Import DataGrid component from MUI
import { Link } from "react-router-dom"; // Import Link component from React Router
import { useState, useEffect } from "react"; // Import useState and useEffect hooks from React
import axios from "axios"; // Import axios for HTTP requests
import { BASE_URL } from "../../utils/Config"; // Import BASE_URL from config file

const orderColumns = [
  { field: "_id", headerName: "ID", width: 150 },
  {
    field: "products",
    headerName: "Products",
    width: 300,
    renderCell: (params) => {
      const products = params.value.map((product) => `${product.quantity} x ${product.productId}`);
      return <div>{products.join(", ")}</div>;
    },
  },
  { field: "fullName", headerName: "Full Name", width: 200 },
  { field: "email", headerName: "Email", width: 200 },
  { field: "phone", headerName: "Phone", width: 150 },
  { field: "address", headerName: "Address", width: 300 },
  {
    field: "totalAmount",
    headerName: "Total Amount",
    width: 150,
    valueFormatter: (params) => `${params.value.toLocaleString()} VND`,
  },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 200,
    type: "date",
  },
 
  {
    field: "shippingFee",
    headerName: "Shipping Fee",
    width: 150,
    valueFormatter: (params) => `${params.value.toLocaleString()} VND`,
  },
  {
    field: "voucherCode",
    headerName: "Voucher Code",
    width: 150,
  },
  {
    field: "voucherDiscount",
    headerName: "Voucher Discount",
    width: 180,
    valueFormatter: (params) => `${params.value.toLocaleString()} VND`,
  },
  {
    field: "paymentMethod",
    headerName: "Payment Method",
    width: 150,
  },
  {
    field: "deliveryStatus",
    headerName: "Delivery Status",
    width: 180,
    renderCell: (params) => {
      return (
        <div className={`deliveryStatus ${params.row.delivery.status}`}>
          {params.row.delivery.status}
        </div>
      );
    },
  },
];

const DataOrder = () => {
  const [orderRows, setOrderRows] = useState([]); // State to hold order data
  const [loading, setLoading] = useState(true); // State to manage loading state

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = sessionStorage.getItem('accessToken'); // Replace 'your_token_key' with your actual key
        const response = await axios.get(`${BASE_URL}/order/get-all-orders`, {
          headers: {
            Authorization: `Bearer ${token}`, // Use token from sessionStorage
          },
        });
        console.log('Fetched order data:', response.data.orders); // Log fetched data
        setOrderRows(response.data.orders); // Update state with fetched orders
      } catch (error) {
        console.error('Error fetching order data:', error); // Log error if fetch fails
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };

    fetchOrders(); // Call fetchOrders function on component mount
  }, []); // Empty dependency array ensures useEffect runs only once on mount

  if (loading) {
    return <div>Loading...</div>; // Render loading indicator while fetching data
  }

  const handleDelete = async (id) => {
    try {
      const token = sessionStorage.getItem('accessToken'); // Replace 'your_token_key' with your actual key
      await axios.delete(`${BASE_URL}/order/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Use token from sessionStorage
        },
      });
      setOrderRows(orderRows.filter((row) => row._id !== id)); // Remove deleted order from state
      console.log(`Order with ID ${id} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting order with ID ${id}:`, error);
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={`/products/${params.row._id}`} style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>
            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row._id)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="datatable">
      <div className="datatableTitle">
        All Orders
        {/* Link to add new order route if needed */}
      </div>
      <DataGrid
        className="datagrid"
        rows={orderRows}
        columns={orderColumns.concat(actionColumn)}
        pageSize={10} // Increase pageSize if needed
        rowsPerPageOptions={[10, 20, 50]} // Add more options as needed
        checkboxSelection
        getRowId={(row) => row._id}
      />
    </div>
  );
};

export default DataOrder;
