import "./datadelivery.scss"; // Import CSS/SCSS file
import { DataGrid } from "@mui/x-data-grid"; // Import DataGrid component from MUI
import { Link } from "react-router-dom"; // Import Link component from React Router
import { useState, useEffect } from "react"; // Import useState and useEffect hooks from React
import axios from "axios"; // Import axios for HTTP requests
import { BASE_URL } from "../../utils/Config"; // Import BASE_URL from config file

const deliveryColumns = [
  { field: "_id", headerName: "ID", width: 150 },
  { field: "orderId", headerName: "Order ID", width: 200 },
  { field: "deliveryDate", headerName: "Delivery Date", width: 200, type: "date" },
  { field: "status", headerName: "Status", width: 150 },
  { field: "createdAt", headerName: "Created At", width: 200, type: "date" },
  { field: "updatedAt", headerName: "Updated At", width: 200, type: "date" },
];

const DataDelivery = () => {
  const [deliveryRows, setDeliveryRows] = useState([]); // State to hold delivery data
  const [loading, setLoading] = useState(true); // State to manage loading state

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const token = sessionStorage.getItem('accessToken'); // Replace 'your_token_key' with your actual key
        const response = await axios.get(`${BASE_URL}/delivery/get-all-deliveries`, {
          headers: {
            Authorization: `Bearer ${token}`, // Use token from sessionStorage
          },
        });
        setDeliveryRows(response.data); // Update state with fetched deliveries
      } catch (error) {
        console.error('Error fetching delivery data:', error); // Log error if fetch fails
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };

    fetchDeliveries(); // Call fetchDeliveries function on component mount
  }, []); // Empty dependency array ensures useEffect runs only once on mount

  if (loading) {
    return <div>Loading...</div>; // Render loading indicator while fetching data
  }

  const handleDelete = async (id) => {
    try {
      const token = sessionStorage.getItem('accessToken'); // Replace 'your_token_key' with your actual key
      await axios.delete(`${BASE_URL}/delivery/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Use token from sessionStorage
        },
      });
      setDeliveryRows(deliveryRows.filter((row) => row._id !== id)); // Remove deleted delivery from state
      console.log(`Delivery with ID ${id} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting delivery with ID ${id}:`, error);
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
            <Link to={`/deliveries/${params.row._id}`} style={{ textDecoration: "none" }}>
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
        All Deliveries
      </div>
      <DataGrid
        className="datagrid"
        rows={deliveryRows}
        columns={deliveryColumns.concat(actionColumn)}
        pageSize={10} // Increase pageSize if needed
        rowsPerPageOptions={[10, 20, 50]} // Add more options as needed
        checkboxSelection
        getRowId={(row) => row._id}
      />
    </div>
  );
};

export default DataDelivery;
