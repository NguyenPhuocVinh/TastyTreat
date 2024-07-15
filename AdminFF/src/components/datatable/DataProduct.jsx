import "./dataproduct.scss";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/Config";

// Define product columns
const productColumns = [
  { field: "_id", headerName: "ID", width: 100 },
  {
    field: "productName",
    headerName: "Product Name",
    width: 200,
  },
  {
    field: "imagePath",
    headerName: "Image",
    width: 100,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img className="cellImg" src={params.row.imagePath} alt="product" />
        </div>
      );
    },
  },
  {
    field: "price",
    headerName: "Price",
    width: 150,
    valueFormatter: (params) =>
      params.value ? `${params.value.toLocaleString()} VND` : "N/A",
  },
  {
    field: "categoryName",
    headerName: "Category Name",
    width: 230,
  },
  {
    field: "feature",
    headerName: "Feature",
    width: 100,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.feature ? "active" : "inactive"}`}>
          {params.row.feature ? "Yes" : "No"}
        </div>
      );
    },
  },
];

const DataProduct = () => {
  const [productRows, setProductRows] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/category/`);
        const categoriesMap = response.data.categories.reduce((acc, category) => {
          acc[category._id] = category.categoryName;
          return acc;
        }, {});
        setCategories(categoriesMap);
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/product/`);
        const productsWithCategoryNames = response.data.products.map((product) => ({
          ...product,
          categoryName: categories[product.categoryId] || "Unknown",
        }));
        setProductRows(productsWithCategoryNames);
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories().then(fetchProducts);
  }, [categories]);

  const handleDelete = async (id) => {
    try {
      const token = sessionStorage.getItem("accessToken");
      await axios.delete(`${BASE_URL}/product/delete-product/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProductRows(productRows.filter((row) => row._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
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
            <Link to={`/products/${params.row._id}`} style={{ textDecoration: "none" }}>
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
        All Product
        <Link to="/products/new" className="link">
          Add New
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={productRows}
        columns={productColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
        getRowId={(row) => row._id}
      />
    </div>
  );
};

export default DataProduct;
