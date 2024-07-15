import "./listdelivery.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import DataDelivery from "../../components/datatable/DataDelivery"

const ListDelivery = () => {
  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <DataDelivery/>
      </div>
    </div>
  )
}

export default ListDelivery;