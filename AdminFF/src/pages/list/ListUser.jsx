import "./listuser.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import DataUser from "../../components/datatable/DataUser"

const ListUser = () => {
  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <DataUser/>
      </div>
    </div>
  )
}

export default ListUser;