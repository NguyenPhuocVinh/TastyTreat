import "./datauser.scss"; // Import CSS/SCSS file
import { DataGrid } from "@mui/x-data-grid"; // Import DataGrid component from MUI
import { Link } from "react-router-dom"; // Import Link component from React Router
import { useState, useEffect } from "react"; // Import useState and useEffect hooks from React
import axios from "axios"; // Import axios for HTTP requests
import { BASE_URL } from "../../utils/Config"; // Import BASE_URL from config file

const userColumns = [
  { field: "_id", headerName: "ID", width: 150 },
  { field: "fullName", headerName: "Full Name", width: 200 },
  { field: "email", headerName: "Email", width: 200 },
  { field: "phone", headerName: "Phone", width: 150 },
  { field: "userName", headerName: "Username", width: 150 },
  { field: "role", headerName: "Role", width: 150 },
  { field: "isShop", headerName: "Is Shop", width: 150, type: 'boolean' },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 200,
    type: "date",
  },
  {
    field: "verified",
    headerName: "Verified",
    width: 150,
    type: 'boolean',
  },
];

const DataUser = () => {
  const [userRows, setUserRows] = useState([]); // State to hold user data
  const [loading, setLoading] = useState(true); // State to manage loading state

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem('accessToken'); // Replace 'your_token_key' with your actual key
        const response = await axios.get(`${BASE_URL}/user/get-all-users`, {
          headers: {
            Authorization: `Bearer ${token}`, // Use token from sessionStorage
          },
        });
        setUserRows(response.data.users); // Update state with fetched users
      } catch (error) {
        console.error('Error fetching user data:', error); // Log error if fetch fails
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };

    fetchUsers(); // Call fetchUsers function on component mount
  }, []); // Empty dependency array ensures useEffect runs only once on mount

  if (loading) {
    return <div>Loading...</div>; // Render loading indicator while fetching data
  }

  const handleDelete = async (id) => {
    try {
      const token = sessionStorage.getItem('accessToken'); // Replace 'your_token_key' with your actual key
      await axios.delete(`${BASE_URL}/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Use token from sessionStorage
        },
      });
      setUserRows(userRows.filter((row) => row._id !== id)); // Remove deleted user from state
      console.log(`User with ID ${id} deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
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
            <Link to={`/users/${params.row._id}`} style={{ textDecoration: "none" }}>
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
        All Users
      </div>
      <DataGrid
        className="datagrid"
        rows={userRows}
        columns={userColumns.concat(actionColumn)}
        pageSize={10} // Increase pageSize if needed
        rowsPerPageOptions={[10, 20, 50]} // Add more options as needed
        checkboxSelection
        getRowId={(row) => row._id}
      />
    </div>
  );
};

export default DataUser;
