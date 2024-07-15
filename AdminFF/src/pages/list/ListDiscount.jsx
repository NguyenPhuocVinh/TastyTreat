import "./listdiscount.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import DataDiscount from "../../components/datatable/DataDiscount"

const ListDiscount = () => {
  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <DataDiscount/>
      </div>
    </div>
  )
}

export default ListDiscount;