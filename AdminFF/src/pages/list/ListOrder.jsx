import "./listorder.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import DataOrder from "../../components/datatable/DataOrder"

const ListOrder = () => {
  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <DataOrder/>
      </div>
    </div>
  )
}

export default ListOrder;