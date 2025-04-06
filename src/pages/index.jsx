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

import _document from "./_document";

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

import _app from "./_app";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

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
    
    _document: _document,
    
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

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/BankAccounts" element={<BankAccounts />} />
                
                <Route path="/CreditCards" element={<CreditCards />} />
                
                <Route path="/Transactions" element={<Transactions />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Investments" element={<Investments />} />
                
                <Route path="/Goals" element={<Goals />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/Loans" element={<Loans />} />
                
                <Route path="/NetWorth" element={<NetWorth />} />
                
                <Route path="/RecurringTransactions" element={<RecurringTransactions />} />
                
                <Route path="/Insurance" element={<Insurance />} />
                
                <Route path="/_document" element={<_document />} />
                
                <Route path="/Business" element={<Business />} />
                
                <Route path="/BusinessCreate" element={<BusinessCreate />} />
                
                <Route path="/BusinessDetail" element={<BusinessDetail />} />
                
                <Route path="/BusinessEdit" element={<BusinessEdit />} />
                
                <Route path="/BusinessClients" element={<BusinessClients />} />
                
                <Route path="/BusinessInvoices" element={<BusinessInvoices />} />
                
                <Route path="/BusinessProjects" element={<BusinessProjects />} />
                
                <Route path="/BusinessSettings" element={<BusinessSettings />} />
                
                <Route path="/FinancialAdvisor" element={<FinancialAdvisor />} />
                
                <Route path="/EmergencyFund" element={<EmergencyFund />} />
                
                <Route path="/UserAudit" element={<UserAudit />} />
                
                <Route path="/_app" element={<_app />} />
                
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