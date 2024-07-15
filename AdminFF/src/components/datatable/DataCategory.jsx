import "./datacategory.scss";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/Config";

// Define category columns
const categoryColumns = [
  { field: "_id", headerName: "ID", width: 100 },
  {
    field: "categoryName",
    headerName: "Category Name",
    width: 200,
  },
  {
    field: "imagePath",
    headerName: "Image",
    width: 100,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img className="cellImg" src={params.row.imagePath} alt="category" />
        </div>
      );
    },
  },
];

const DataCategory = () => {
  const [categoryRows, setCategoryRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/category/`);
        setCategoryRows(response.data.categories);
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = sessionStorage.getItem("accessToken");
      await axios.delete(`${BASE_URL}/category/delete-category/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategoryRows(categoryRows.filter((row) => row._id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link to={`/categories/${params.row._id}`} style={{ textDecoration: "none" }}>
              <div className="viewButton">Update</div>
            </Link>
            <div className="deleteButton" onClick={() => handleDelete(params.row._id)}>
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
        All Categories
        <Link to="/categories/new" className="link">
          Add New
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={categoryRows}
        columns={categoryColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
        getRowId={(row) => row._id}
      />
    </div>
  );
};

export default DataCategory;
