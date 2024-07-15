import "./updatediscount.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/Config";
import { useParams } from "react-router-dom";

const UpdateDiscount = ({ inputs, title }) => {
  const { discountId } = useParams();
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "",
    value: "",
    orderTotalMin: "",
    orderTotalMax: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    const fetchDiscountData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/discount/get-discount/${discountId}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          }
        });
        const discount = response.data.discount;
        setFormData({
          code: discount.code,
          type: discount.type,
          value: discount.value,
          orderTotalMin: discount.orderTotalMin,
          orderTotalMax: discount.orderTotalMax,
          startDate: discount.startDate,
          endDate: discount.endDate,
        });
      } catch (error) {
        console.error("There was an error fetching the discount data!", error);
      }
    };
    fetchDiscountData();
  }, [discountId]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));

    console.log(`Updated ${id} to:`, value); // Log each updated value
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Process fields before adding to FormData
    const processedData = {
      code: formData.code,
      type: formData.type,
      value: parseFloat(formData.value), // Ensure value is a number
      orderTotalMin: parseFloat(formData.orderTotalMin), // Ensure orderTotalMin is a number
      orderTotalMax: parseFloat(formData.orderTotalMax), // Ensure orderTotalMax is a number
      startDate: formData.startDate,
      endDate: formData.endDate
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
      const response = await axios.put(`${BASE_URL}/discount/update-discount/${discountId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log(response.data);
      window.location.href = '/discounts';
    } catch (error) {
      console.error("There was an error updating the discount!", error);
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
              src={file ? URL.createObjectURL(file) : formData.imagePath || "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"}
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
                      value={formData[input.id]}
                      onChange={handleInputChange}
                    >
                      {input.options.map(option => (
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
              <button type="submit">Update</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateDiscount;

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
