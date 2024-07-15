import "./listproduct.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import DataProduct from "../../components/datatable/DataProduct"

const ListProduct = () => {
  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <DataProduct/>
      </div>
    </div>
  )
}

export default ListProduct;