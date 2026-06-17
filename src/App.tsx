import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import TicketListPage from "@/pages/TicketListPage";
import DashboardPage from "@/pages/DashboardPage";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/tickets" element={<TicketListPage />} />
          <Route path="/admin/tickets/:ticketId" element={<TicketListPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
