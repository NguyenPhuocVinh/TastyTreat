// Import necessary modules and components
import "./datadiscount.scss";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/Config";

// Define discount columns
const discountColumns = [
  { field: "_id", headerName: "ID", width: 150 },
  {
    field: "imagePath",
    headerName: "Image",
    width: 100,
    renderCell: (params) => (
      <div className="cellWithImg">
        <img className="cellImg" src={params.row.imagePath} alt="discount" />
      </div>
    ),
  },
  { field: "code", headerName: "Code", width: 200 },
  {
    field: "value",
    headerName: "Value",
    width: 150,
    valueFormatter: (params) => {
      if (params.type === "PERCENT") {
        return params.value ? `${params.value}%` : "N/A";
      } else if (params.type === "FIXED") {
        return params.value ? `${params.value.toLocaleString()} VND` : "N/A";
      } 
    },
  },
  { field: "type", headerName: "Type", width: 150 },
  { field: "startDate", headerName: "Start Date", width: 200, type: "date" },
  { field: "endDate", headerName: "End Date", width: 200, type: "date" },
  {
    field: "orderTotalMin",
    headerName: "Order Total Min",
    width: 180,
    valueFormatter: (params) =>
      params.value ? `${params.value.toLocaleString()} VND` : "N/A",
  },
  {
    field: "orderTotalMax",
    headerName: "Order Total Max",
    width: 180,
    valueFormatter: (params) =>
      params.value ? `${params.value.toLocaleString()} VND` : "N/A",
  },
  { field: "createdAt", headerName: "Created At", width: 200, type: "date" },
];

// Define DataDiscount component
const DataDiscount = () => {
  const [discountRow, setDiscountRow] = useState([]); // State to hold discounts data
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null); // State to hold error information

  useEffect(() => {
    // Function to fetch discounts data
    const fetchDiscounts = async () => {
      try {
        const token = sessionStorage.getItem("accessToken"); // Retrieve token from session storage
        const response = await axios.get(`${BASE_URL}/discount/get-all-discounts`, {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token to request headers
          },
        });
        // Map API response data to format suitable for DataGrid
        const formattedDiscounts = response.data.map((discount) => ({
          ...discount,
          startDate: discount.condition.startDate,
          endDate: discount.condition.endDate,
          orderTotalMin: discount.condition.orderTotalMin,
          orderTotalMax: discount.condition.orderTotalMax,
          createdAt: discount.createAt,
          imagePath: discount.imagePath, // Ensure imagePath is correctly assigned
        }));
        setDiscountRow(formattedDiscounts); // Update discounts state
      } catch (error) {
        console.error("Error fetching discounts:", error); // Log error if fetch fails
        setError("Failed to fetch discounts"); // Set error state
      } finally {
        setLoading(false); // Set loading state to false
      }
    };

    fetchDiscounts(); // Invoke fetchDiscounts function on component mount
  }, []); // Empty dependency array ensures useEffect runs only on mount

  // Function to handle deletion of a discount
  const handleDelete = async (id) => {
    try {
      const token = sessionStorage.getItem("accessToken"); // Retrieve token from session storage
      await axios.delete(`${BASE_URL}/discount/delete-discount/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Attach token to request headers
        },
      });
      // Update discounts state by filtering out the deleted discount
      setDiscountRow(discountRow.filter((row) => row._id !== id));
      console.log(`Discount with ID ${id} deleted successfully.`); // Log success message to console
    } catch (error) {
      console.error(`Error deleting discount with ID ${id}:`, error); // Log error if deletion fails
    }
  };

  // Conditional rendering based on loading, error, or empty discounts
  if (loading) {
    return <div>Loading...</div>; // Render loading indicator
  }

  if (error) {
    return <div>Error: {error}</div>; // Render error message if fetch fails
  }

  if (!discountRow || discountRow.length === 0) {
    return <div>No discounts available</div>; // Render message if no discounts available
  }

  // Action column definition for DataGrid
  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => (
        <div className="cellAction">
          <Link to={`/discounts/${params.row._id}`} style={{ textDecoration: "none" }}>
            <div className="viewButton">Update</div>
          </Link>
          <div className="deleteButton" onClick={() => handleDelete(params.row._id)}>
            Delete
          </div>
        </div>
      ),
    },
  ];

  // Render DataDiscount component UI
  return (
    <div className="datatable">
      <div className="datatableTitle">
        All Discounts {/* Title for discounts section */}
        <Link to="/discounts/new" className="link">
          Add New {/* Link to add new discount */}
        </Link>
      </div>
      {/* DataGrid component to display discounts in a tabular format */}
      <DataGrid
        className="datagrid"
        rows={discountRow} // Pass discounts data to DataGrid
        columns={discountColumns.concat(actionColumn)} // Combine discount columns with action column
        pageSize={10} // Number of rows per page
        rowsPerPageOptions={[10, 20, 50]} // Options for rows per page dropdown
        checkboxSelection // Enable checkbox selection for rows
        getRowId={(row) => row._id} // Function to get row ID
        disableSelectionOnClick // Disable row selection on click
      />
    </div>
  );
};

export default DataDiscount; // Export DataDiscount component
