import "./newproduct.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/Config";
import Select from "react-select";

const NewProduct = ({ inputs, title }) => {
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    productSubtitles: "",
    feature: false,
    categoryId: ""
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/category/`);
        const categoriesData = response.data.categories.map(category => ({
          value: category._id,
          label: category.categoryName
        }));
        setCategories(categoriesData);
      } catch (error) {
        console.error("There was an error fetching the categories!", error);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prevState) => ({
      ...prevState,
      [id]: newValue,
    }));

    console.log(`Updated ${id} to:`, newValue); // Log each updated value
  };

  const handleCategoryChange = (selectedOption) => {
    setFormData((prevState) => ({
      ...prevState,
      categoryId: selectedOption.value,
    }));

    console.log(`Updated categoryId to:`, selectedOption.value); // Log selected category ID
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Process fields before adding to FormData
    const processedData = {
      productName: formData.productName,
      price: parseFloat(formData.price), // Convert price to number
      productSubtitles: formData.productSubtitles, // Ensure productSubtitles is an array
      feature: formData.feature, // Ensure feature is boolean
      categoryId: formData.categoryId,
    };

    for (const key in processedData) {
      data.append(key, processedData[key]);
    }

    if (file) {
      data.append("image", file);
    }

    // Log all form data before sending
    for (let pair of data.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await axios.post(`${BASE_URL}/product/create-product`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(response.data);
      window.location.href = '/products';
    } catch (error) {
      console.error("There was an error creating the product!", error);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt="Product"
            />
          </div>
          <div className="right">
            <form onSubmit={handleSubmit}>
              <div className="formInput">
                <label htmlFor="file">
                  Image: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>

              {inputs.map((input) => (
                input.id !== "categoryId" ? (
                  <div className="formInput" key={input.id}>
                    <label>{input.label}</label>
                    <input
                      type={input.type}
                      id={input.id}
                      name={input.id}
                      placeholder={input.placeholder}
                      checked={input.type === "checkbox" ? formData[input.id] : undefined}
                      value={input.type !== "checkbox" ? formData[input.id] : undefined}
                      onChange={handleInputChange}
                    />
                  </div>
                ) : (
                  <div className="formInput" key={input.id}>
                    <label>{input.label}</label>
                    <Select
                      options={categories}
                      onChange={handleCategoryChange}
                      placeholder="Select a category"
                    />
                  </div>
                )
              ))}
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProduct;

export const productInputs = [
  {
    id: "productName",
    label: "Product Name",
    type: "text",
    placeholder: "Enter product name",
  },
  {
    id: "price",
    label: "Price",
    type: "number",
    placeholder: "Enter price",
  },
  {
    id: "productSubtitles",
    label: "Product Subtitles",
    type: "text",
    placeholder: "Enter product subtitles, separated by commas",
  },
  {
    id: "feature",
    label: "Feature",
    type: "checkbox",
  },
  {
    id: "categoryId",
    label: "Category",
    type: "text",
    placeholder: "Enter category ID",
  },
];
