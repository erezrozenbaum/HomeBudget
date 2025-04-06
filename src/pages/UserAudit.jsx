
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, subMonths, startOfYear } from 'date-fns';
import { 
  Download, 
  Filter, 
  ActivitySquare,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Timer,
  MapPin,
  Calendar
} from 'lucide-react';
import { UserAudit } from '@/api/entities';

export default function UserAuditPage() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('30d');

  const dateRanges = {
    'all': {
      label: 'All Time',
      getRange: () => ({
        from: null,
        to: null
      })
    },
    '7d': {
      label: 'Last 7 Days',
      getRange: () => ({
        from: subDays(new Date(), 7),
        to: new Date()
      })
    },
    '30d': {
      label: 'Last 30 Days',
      getRange: () => ({
        from: subDays(new Date(), 30),
        to: new Date()
      })
    },
    '3m': {
      label: 'Last 3 Months',
      getRange: () => ({
        from: subMonths(new Date(), 3),
        to: new Date()
      })
    },
    '6m': {
      label: 'Last 6 Months',
      getRange: () => ({
        from: subMonths(new Date(), 6),
        to: new Date()
      })
    },
    '1y': {
      label: 'Last Year',
      getRange: () => ({
        from: subMonths(new Date(), 12),
        to: new Date()
      })
    },
    'ytd': {
      label: 'Year to Date',
      getRange: () => ({
        from: startOfYear(new Date()),
        to: new Date()
      })
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, selectedAction, selectedSection, selectedStatus, selectedDateRange]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      // Create sample logs if none exist
      const existingLogs = await UserAudit.list();
      
      if (existingLogs.length === 0) {
        await UserAudit.create({
          action_type: 'login',
          section: 'authentication',
          timestamp: new Date().toISOString(),
          status: 'success',
          ip_address: '192.168.1.1',
          device_info: 'Chrome on Windows'
        });
        
        await UserAudit.create({
          action_type: 'create',
          section: 'bank_accounts',
          entity_type: 'BankAccount',
          entity_id: '123456789',
          timestamp: subDays(new Date(), 1).toISOString(),
          status: 'success'
        });
      }
      
      const auditLogs = await UserAudit.list('-timestamp');
      setLogs(auditLogs);
      setFilteredLogs(auditLogs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        (log.entity_type?.toLowerCase().includes(term)) ||
        (log.action_type?.toLowerCase().includes(term)) ||
        (log.section?.toLowerCase().includes(term)) ||
        (log.error_message?.toLowerCase().includes(term)) ||
        (log.ip_address?.toLowerCase().includes(term))
      );
    }

    // Apply action type filter
    if (selectedAction !== 'all') {
      filtered = filtered.filter(log => log.action_type === selectedAction);
    }

    // Apply section filter
    if (selectedSection !== 'all') {
      filtered = filtered.filter(log => log.section === selectedSection);
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(log => log.status === selectedStatus);
    }

    // Apply date range filter
    if (selectedDateRange !== 'all') {
      const { from, to } = dateRanges[selectedDateRange].getRange();
      if (from && to) {
        filtered = filtered.filter(log => {
          if (!log.timestamp) return false;
          const logDate = new Date(log.timestamp);
          return logDate >= from && logDate <= to;
        });
      }
    }

    setFilteredLogs(filtered);
  };

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Action', 'Section', 'Entity Type', 'Entity ID', 'Status', 'IP Address', 'Device Info', 'Error Message'],
      ...filteredLogs.map(log => [
        log.timestamp || '',
        log.action_type || '',
        log.section || '',
        log.entity_type || '',
        log.entity_id || '',
        log.status || '',
        log.ip_address || '',
        log.device_info || '',
        log.error_message || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <ShieldAlert className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
    } catch (e) {
      return timestamp;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity Log</h1>
          <p className="text-gray-400">Track and monitor your account activity</p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            
            <div>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {selectedAction === 'all' ? 'All Actions' : selectedAction}
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all" className="text-white">All Actions</SelectItem>
                  <SelectItem value="login" className="text-white">Login</SelectItem>
                  <SelectItem value="logout" className="text-white">Logout</SelectItem>
                  <SelectItem value="create" className="text-white">Create</SelectItem>
                  <SelectItem value="update" className="text-white">Update</SelectItem>
                  <SelectItem value="delete" className="text-white">Delete</SelectItem>
                  <SelectItem value="view" className="text-white">View</SelectItem>
                  <SelectItem value="settings_change" className="text-white">Settings Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {selectedSection === 'all' ? 'All Sections' : selectedSection}
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all" className="text-white">All Sections</SelectItem>
                  <SelectItem value="authentication" className="text-white">Authentication</SelectItem>
                  <SelectItem value="bank_accounts" className="text-white">Bank Accounts</SelectItem>
                  <SelectItem value="credit_cards" className="text-white">Credit Cards</SelectItem>
                  <SelectItem value="transactions" className="text-white">Transactions</SelectItem>
                  <SelectItem value="investments" className="text-white">Investments</SelectItem>
                  <SelectItem value="settings" className="text-white">Settings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {selectedStatus === 'all' ? 'All Status' : selectedStatus}
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all" className="text-white">All Status</SelectItem>
                  <SelectItem value="success" className="text-white">Success</SelectItem>
                  <SelectItem value="error" className="text-white">Error</SelectItem>
                  <SelectItem value="warning" className="text-white">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {dateRanges[selectedDateRange].label}
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {Object.entries(dateRanges).map(([key, { label }]) => (
                    <SelectItem key={key} value={key} className="text-white">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-700 bg-gray-800">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Timestamp</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Action</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Section</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Details</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Location</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-gray-400">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-gray-400">
                      No audit logs found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-gray-400" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <ActivitySquare className="h-4 w-4 text-blue-400" />
                          <span className="text-gray-300 capitalize">{log.action_type || ''}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300 capitalize">
                        {log.section || ''}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className="capitalize text-gray-300">
                            {log.status || ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {log.entity_type && log.entity_id ? (
                          <span>
                            {log.entity_type}: {log.entity_id.substring(0, 8)}...
                          </span>
                        ) : log.error_message ? (
                          <span className="text-red-400">{log.error_message}</span>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.ip_address ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">{log.ip_address}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
