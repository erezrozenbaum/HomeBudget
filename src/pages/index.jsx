import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import BankAccounts from "./BankAccounts";

import CreditCards from "./CreditCards";

import Transactions from "./Transactions";

import Settings from "./Settings";

import Investments from "./Investments";

import Goals from "./Goals";

import Reports from "./Reports";

import Loans from "./Loans";

import NetWorth from "./NetWorth";

import RecurringTransactions from "./RecurringTransactions";

import Insurance from "./Insurance";

import Business from "./Business";

import BusinessCreate from "./BusinessCreate";

import BusinessDetail from "./BusinessDetail";

import BusinessEdit from "./BusinessEdit";

import BusinessClients from "./BusinessClients";

import BusinessInvoices from "./BusinessInvoices";

import BusinessProjects from "./BusinessProjects";

import BusinessSettings from "./BusinessSettings";

import FinancialAdvisor from "./FinancialAdvisor";

import EmergencyFund from "./EmergencyFund";

import UserAudit from "./UserAudit";

import Login from "./Login";

import Register from "./Register";

import _app from "./_app";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    BankAccounts: BankAccounts,
    
    CreditCards: CreditCards,
    
    Transactions: Transactions,
    
    Settings: Settings,
    
    Investments: Investments,
    
    Goals: Goals,
    
    Reports: Reports,
    
    Loans: Loans,
    
    NetWorth: NetWorth,
    
    RecurringTransactions: RecurringTransactions,
    
    Insurance: Insurance,
    
    Business: Business,
    
    BusinessCreate: BusinessCreate,
    
    BusinessDetail: BusinessDetail,
    
    BusinessEdit: BusinessEdit,
    
    BusinessClients: BusinessClients,
    
    BusinessInvoices: BusinessInvoices,
    
    BusinessProjects: BusinessProjects,
    
    BusinessSettings: BusinessSettings,
    
    FinancialAdvisor: FinancialAdvisor,
    
    EmergencyFund: EmergencyFund,
    
    UserAudit: UserAudit,
    
    Login: Login,
    
    Register: Register,
    
    _app: _app,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Protected Route component
function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    const token = localStorage.getItem('token');

    // If user is logged in and tries to access login/register pages, redirect to dashboard
    if (token && (location.pathname === '/login' || location.pathname === '/register')) {
        return <Navigate to="/" replace />;
    }
    
    // For login and register pages, don't use the Layout component
    if (location.pathname === '/login' || location.pathname === '/register') {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        );
    }

    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/BankAccounts" element={<ProtectedRoute><BankAccounts /></ProtectedRoute>} />
                <Route path="/CreditCards" element={<ProtectedRoute><CreditCards /></ProtectedRoute>} />
                <Route path="/Transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                <Route path="/Settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/Investments" element={<ProtectedRoute><Investments /></ProtectedRoute>} />
                <Route path="/Goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
                <Route path="/Reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/Loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
                <Route path="/NetWorth" element={<ProtectedRoute><NetWorth /></ProtectedRoute>} />
                <Route path="/RecurringTransactions" element={<ProtectedRoute><RecurringTransactions /></ProtectedRoute>} />
                <Route path="/Insurance" element={<ProtectedRoute><Insurance /></ProtectedRoute>} />
                <Route path="/Business" element={<ProtectedRoute><Business /></ProtectedRoute>} />
                <Route path="/BusinessCreate" element={<ProtectedRoute><BusinessCreate /></ProtectedRoute>} />
                <Route path="/BusinessDetail" element={<ProtectedRoute><BusinessDetail /></ProtectedRoute>} />
                <Route path="/BusinessEdit" element={<ProtectedRoute><BusinessEdit /></ProtectedRoute>} />
                <Route path="/BusinessClients" element={<ProtectedRoute><BusinessClients /></ProtectedRoute>} />
                <Route path="/BusinessInvoices" element={<ProtectedRoute><BusinessInvoices /></ProtectedRoute>} />
                <Route path="/BusinessProjects" element={<ProtectedRoute><BusinessProjects /></ProtectedRoute>} />
                <Route path="/BusinessSettings" element={<ProtectedRoute><BusinessSettings /></ProtectedRoute>} />
                <Route path="/FinancialAdvisor" element={<ProtectedRoute><FinancialAdvisor /></ProtectedRoute>} />
                <Route path="/EmergencyFund" element={<ProtectedRoute><EmergencyFund /></ProtectedRoute>} />
                <Route path="/UserAudit" element={<ProtectedRoute><UserAudit /></ProtectedRoute>} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}