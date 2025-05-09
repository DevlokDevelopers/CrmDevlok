import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GetStart from './pages/GetStart/GetStart'
import Login from './pages/Login/Login'
import Forgotpassword from './pages/ForgotPassword/Forgotpassword'
import ResetPassword from './pages/ResetPassword/Resetpassword'
import UpcomingEvents from './pages/SalesMUpEve/SalesMUpEve'
import SalesMCalendar from './pages/SalesMCalender/SalesMCalender'
import LeadCards from './pages/SalesManagerLeads/SalesMNewLeads'
import FollowedLeads from './pages/SalesManagerLeads/SalesMFollowedLeads'
import DataSavedLeads from './pages/SalesManagerLeads/SalesMDataSaved'
import ClosedLeads from './pages/SalesManagerLeads/SalesMClosed'
import UnSuccessLeads from './pages/SalesManagerLeads/SalesMUnsuccessLeads'
import PendingLeads from './pages/SalesManagerLeads/SalesMPending'
import SalesmanagerLeadAnalytics from './pages/SalesManagerLeads/SalesMAnalytics'
import AddLead from './pages/AddLead/AddLead'
import DataEntryForm from './pages/Data Entry Form/DataEntry'
import SalesMBuyList from './pages/SalesmanagerDatabank/SalesMBuyList'
import SalesMSellList from './pages/SalesmanagerDatabank/SalesMSellList'
import SalesMForrentList from './pages/SalesmanagerDatabank/SalesMForrent'
import SalesMRentseekerList from './pages/SalesmanagerDatabank/SalesMRentseeker'
import DataEditForm from './pages/Data Entry Form/EditDataForm'
import DataList from './pages/SalesmanagerDatabank/DataListing'
import MatchingDatas from './pages/SalesmanagerDatabank/MatchingData'
import FilteredResults from './pages/SalesmanagerDatabank/FilterResult'
import SalesMDataGraph from './pages/SalesmanagerDatabank/DataGraph'
import FollowUpCalendar from './pages/SalesmanagerDatabank/AddFollowUp'
import FollowUpList from './pages/SalesmanagerDatabank/FollowupList'
import SalesManagerProjects from './pages/SalesMProjectsection/ProjectList'
import SalesmanagerProjectDetails from './pages/SalesMProjectsection/SingleProject'
import UnrecordedLeads from './pages/SalesManagerLeads/SalesMUnrecorded'
import SalesManagerProfile from './pages/SalesManagerProfile/SalesManagerProfile'
import SalesMSearchResults from './pages/SalesMSearchResult.jsx/SalesMSearchResult'
import SalesMDashboard from './pages/SalesMDashboard/SalesMDashboard'
import AdminDashboard from './pages/ADMIN/AdminDashBoard/AdminDashBoard'
import AdminCalendar from './pages/ADMIN/AdminCalender/AdminCalender'
import AdminUpcomingEvents from './pages/ADMIN/AdminUpcomingevent/AdminUpcoming'
import AdminDataGraph from './pages/ADMIN/AdminDataBank/DatabankAnalytics'
import AdminFilteredResults from './pages/ADMIN/AdminDataBank/AdminFilterResult'
import AdminBuyList from './pages/ADMIN/AdminDataBank/BuyDatabank'
import AdminDataDisplay from './pages/ADMIN/AdminDataBank/AdminDataDisplay'
import AdminMatchingDatas from './pages/ADMIN/AdminDataBank/MatchingDataList'
import AdminSellList from './pages/ADMIN/AdminDataBank/SellDatabank'
import AdminForrentList from './pages/ADMIN/AdminDataBank/AdminForrentData'
import AdminRentseekerList from './pages/ADMIN/AdminDataBank/AdminRentSeeker'
import AdminNewLeads from './pages/ADMIN/AdminLeads/AdminNewLeads'
import AdminFollowedLeads from './pages/ADMIN/AdminLeads/AdminFollowedLeads'
import AdminUnrecordedLeads from './pages/ADMIN/AdminLeads/AdminUnrecorded'
import AdminDataSavedLeads from './pages/ADMIN/AdminLeads/AdminDatasavedLeads'
import AdminClosedLeads from './pages/ADMIN/AdminLeads/AdminClosedLeads'
import AdminUnsuccessLeads from './pages/ADMIN/AdminLeads/AdminUnsuccess'
import AdminPendingLeads from './pages/ADMIN/AdminLeads/AdminPendingLeads'
import AdminLeadAnalytics from './pages/ADMIN/AdminLeads/AdminLeadAnalytics'
import AdminAddLead from './pages/ADMIN/AdminLeads/AdminAddLead'
import AdminProjects from './pages/ADMIN/AdminProject/AdminProjectList'
import AdminProjectDetails from './pages/ADMIN/AdminProject/SingleAdminProject'
import AdminDataForProject from './pages/ADMIN/AdminProject/Data_Available_project'
import AdminCreateProject from './pages/ADMIN/AdminProject/AdminCreateProject'
import AdminEmployeeListing from './pages/ADMIN/Employees/EmployeeListing'
import AddSalesManager from './pages/ADMIN/Employees/AddSalesmanger'
import AdminSalesManagerProfile from './pages/ADMIN/Employees/SalesManagerProfile'
import AddGroundEmployee from './pages/ADMIN/Employees/AddGroundLevelEmployee'
import AdminSearchResults from './pages/ADMIN/AdminSearchResult/AdminSearchResult'
import AdminProfile from './pages/ADMIN/AdminProfile/AdminProfile'
import AdminLeadCategoryGraph from './pages/ADMIN/AdminLeads/adminleadcategory'
import AdminDatabank from './pages/ADMIN/AdminDataBank/AdminDatabank'

function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={<GetStart />} />
        <Route path='/login' element={<Login />}/>
        <Route path='/forgotpassword' element={<Forgotpassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword/>} />
        <Route path='/upcoming_events' element={<UpcomingEvents/>} />
        <Route path='/salesmanger_calender' element={<SalesMCalendar/>} />
        <Route path='/salesmanager_newleads' element={<LeadCards/>} />
        <Route path='/salesmanager_followed_leads' element={<FollowedLeads/>}/>
        <Route path='/Salesmanager_Datasaved' element={<DataSavedLeads/>}/>
        <Route path='/Salesmanager_closed_leads' element={<ClosedLeads/>}/>
        <Route path='/Salesmanager_unsuccess_leads' element={<UnSuccessLeads/>}/>
        <Route path='/salesmanger_pending_leads' element={<PendingLeads/>}/>
        <Route path='/salesmanager_lead_analytics' element={<SalesmanagerLeadAnalytics/>}/>
        <Route path='/addlead_salesman' element={<AddLead/>}/>
        <Route path='/data_entry_form' element={<DataEntryForm/>}/>
        <Route path='/sales_buy_list' element={<SalesMBuyList/>}/>
        <Route path='/salesmanager_sell_list' element={<SalesMSellList/>}/>
        <Route path='/salesmanger_forrent' element={<SalesMForrentList/>}/>
        <Route path='/salesmanager_rentseeker' element={<SalesMRentseekerList/>}/>
        <Route path='/data_edit_form' element={<DataEditForm />} />
        <Route path='/data_list' element={<DataList/>}/>
        <Route path='/matching_data' element={<MatchingDatas/>}/>
        <Route path='/filter_result' element={<FilteredResults/>}/>
        <Route path='/data_graph_salesmanager' element={<SalesMDataGraph/>}/>
        <Route path='/salesmanager_followup_calender' element={<FollowUpCalendar/>} />
        <Route path='/follwup_list' element={<FollowUpList/>} />
        <Route path='/salesmanager_projects' element={<SalesManagerProjects/>} />
        <Route path="/salesmanager_project_details/:id" element={<SalesmanagerProjectDetails />} />
        <Route path='/salesmanager_unrecordedLeads' element={<UnrecordedLeads/>} />
        <Route path='/salesmanagerProfile' element={<SalesManagerProfile/>} />
        <Route path='/salesmsearch_result' element={<SalesMSearchResults/>} />
        <Route path='/salesmanagerDashboard' element={<SalesMDashboard/>} />
        <Route path='/adminDash' element={<AdminDashboard/>} />
        <Route path='/admin_calender' element={<AdminCalendar/>} />
        <Route path='/adminUpcoming' element={<AdminUpcomingEvents/>} />
        <Route path='/admin_data_graph' element={<AdminDataGraph/>} />
        <Route path='/admin_filter_result' element={<AdminFilteredResults/>} />
        <Route path='/admin_buy_data' element={<AdminBuyList/>} />
        <Route path='/admin_data_display' element={<AdminDataDisplay/>} />
        <Route path='/admin_matching_data' element={<AdminMatchingDatas/>} />
        <Route path='/admin_sell_databank' element={<AdminSellList/>} />
        <Route path='/admin_forrent_databank' element={<AdminForrentList/>} />
        <Route path='/admin_rentseeker_databank' element={<AdminRentseekerList/>} />
        <Route path='/admin_new_leads' element={<AdminNewLeads/>} />
        <Route path='/admin_followed_leads' element={<AdminFollowedLeads/>} />
        <Route path='/admin_unrecorded_leads' element={<AdminUnrecordedLeads/>} />
        <Route path='/admin_datasaved_leads' element={<AdminDataSavedLeads/>} />
        <Route path='/admin_closed_leads' element={<AdminClosedLeads/>} />
        <Route path='/admin_unsuccess_lead' element={<AdminUnsuccessLeads/>} />
        <Route path='/admin_pending_leads' element={<AdminPendingLeads/>} />
        <Route path='/admin_lead_analytics' element={<AdminLeadAnalytics/>} />
        <Route path='/admin_manually_enter_lead' element={<AdminAddLead/>} />
        <Route path='/admin_projects' element={<AdminProjects/>} />
        <Route path='/single_admin_project/:id' element={<AdminProjectDetails/>} />
        <Route path='/data_for_project/:projectId' element={<AdminDataForProject/>} />
        <Route path='/create_project' element={<AdminCreateProject/>} />
        <Route path='/employee_listing' element={<AdminEmployeeListing/>} />
        <Route path='/add_salesmanager' element={<AddSalesManager/>} />
        <Route path='/salesmanager_profile_admin/:id' element={<AdminSalesManagerProfile/>} />
        <Route path='/add_ground_staff' element={<AddGroundEmployee/>} />
        <Route path='/admin_search_result' element={<AdminSearchResults/>} />
        <Route path='/admin_profile' element={<AdminProfile/>} />
        <Route path='/adminleadcategorygraph' element={<AdminLeadCategoryGraph/>} />
        <Route path='/admin_databank' element={<AdminDatabank/>}/>




      </Routes>

      </BrowserRouter>
    </>
  )
}

export default App
