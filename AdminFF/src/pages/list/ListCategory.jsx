import "./listcategory.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import DataCategory from "../../components/datatable/DataCategory"

const ListCategory = () => {
  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <DataCategory/>
      </div>
    </div>
  )
}

export default ListCategory;