import "./newdiscount.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/Config";

const NewDiscount = ({ inputs, title }) => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENT",
    value: "",
    orderTotalMin: "",
    orderTotalMax: "",
    startDate: "",
    endDate: "",
  });

  // Format number to VND currency
  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Remove formatting to get a numeric value
  const parseCurrency = (value) => {
    if (!value) return "";
    return value.replace(/[^0-9]/g, ''); // Remove all non-numeric characters
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const parsedValue = parseCurrency(value);
    const formattedValue = (id === "orderTotalMin" || id === "orderTotalMax") ? formatCurrency(parsedValue) : value;

    setFormData((prevState) => ({
      ...prevState,
      [id]: formattedValue,
    }));
    console.log(`Updated ${id} to:`, formattedValue); // Log each updated value
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Process fields before adding to FormData
    const processedData = {
      code: formData.code,
      type: formData.type,
      value: formData.value, // Convert value to number
      orderTotalMin: parseFloat(parseCurrency(formData.orderTotalMin)), // Convert orderTotalMin to number
      orderTotalMax: parseFloat(parseCurrency(formData.orderTotalMax)), // Convert orderTotalMax to number
      startDate: formData.startDate,
      endDate: formData.endDate,
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
      const response = await axios.post(`${BASE_URL}/discount/create-discount`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(response.data);
      window.location.href = '/discounts';
    } catch (error) {
      console.error("There was an error creating the discount!", error);
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
              alt="Discount"
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
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  {input.type === "select" ? (
                    <select
                      id={input.id}
                      name={input.id}
                      value={formData[input.id]}
                      onChange={handleInputChange}
                    >
                      {input.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={input.type}
                      id={input.id}
                      name={input.id}
                      placeholder={input.placeholder}
                      value={formData[input.id]}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              ))}
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDiscount;
export const discountInputs = [
  {
    id: "code",
    label: "Discount Code",
    type: "text",
    placeholder: "Enter discount code",
  },
  {
    id: "type",
    label: "Type",
    type: "select",
    options: [
      { label: "Percent", value: "PERCENT" },
      { label: "Fixed", value: "FIXED" },
    ],
    placeholder: "Select discount type",
  },
  {
    id: "value",
    label: "Value",
    type: "number",
    placeholder: "Enter discount value",
  },
  {
    id: "orderTotalMin",
    label: "Order Total Min (VND)",
    type: "text", // Changed to text for currency formatting
    placeholder: "Enter minimum order total in VND",
  },
  {
    id: "orderTotalMax",
    label: "Order Total Max (VND)",
    type: "text", // Changed to text for currency formatting
    placeholder: "Enter maximum order total in VND",
  },
  {
    id: "startDate",
    label: "Start Date",
    type: "date",
    placeholder: "Enter start date",
  },
  {
    id: "endDate",
    label: "End Date",
    type: "date",
    placeholder: "Enter end date",
  },
];
