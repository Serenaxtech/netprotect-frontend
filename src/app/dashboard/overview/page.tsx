'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrganizationApiService, Organization } from '@/services/api/organizationApi';
import { AgentApiService, AgentDetails } from '@/services/api/agentApi';
import { ScanApiService } from '@/services/api/scanApi';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { AuthService } from '@/services/authService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type TimeRange = 'days' | 'months' | 'years';

interface ScanResult {
  scanName: string;
  scanResult: string;
  agentId: string;
  scanDate: string;
}

export default function DashboardOverview() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [agents, setAgents] = useState<AgentDetails[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('months');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const authUser = await AuthService.checkAuth();
        const isRoot = authUser?.role === 'root';
        const organizations = await OrganizationApiService.getAllOrganizations(isRoot);
        setOrganizations(organizations);
      } catch (err) {
        setError('Failed to fetch organizations');
      }
    };
    fetchOrganizations();
  }, []);

  // Fetch agents when organization is selected
  useEffect(() => {
    const fetchAgents = async () => {
      if (!selectedOrg) {
        setAgents([]);
        setSelectedAgent('');
        return;
      }

      try {
        const selectedOrganization = organizations.find(org => org._id === selectedOrg);
        if (!selectedOrganization) return;

        const agentPromises = selectedOrganization.agentIds.map(agentId =>
          AgentApiService.getAgentDetails(agentId)
        );

        const agentDetails = await Promise.all(agentPromises);
        setAgents(agentDetails);
        setSelectedAgent('');
      } catch (err) {
        setError('Failed to fetch agents');
        setAgents([]);
      }
    };

    fetchAgents();
  }, [selectedOrg, organizations]);

  // Fetch scan results when agent is selected
  useEffect(() => {
    const fetchScanResults = async () => {
      if (!selectedAgent) {
        setScanResults([]);
        return;
      }

      try {
        setLoading(true);
        const results = await ScanApiService.getAllScanResults(selectedAgent);
        setScanResults(results);
      } catch (err) {
        console.error('Error fetching scan results:', err);
        setError('Failed to fetch scan results');
        setScanResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchScanResults();
  }, [selectedAgent]);

  const processVulnerabilityData = () => {
    const data = scanResults.map(scan => {
      const parsedResult = JSON.parse(scan.scanResult);
      const totalVulnerabilities = [
        ...Object.values(parsedResult.ftp?.vulnerabilities || {}).flat(),
        ...Object.values(parsedResult.kerberos?.vulnerabilities || {}).flat(),
        ...Object.values(parsedResult.adcs?.vulnerabilities || {}).flat()
      ].length;
  
      // Parse the createdAt date
      const date = new Date(scan.createdAt);
      return {
        date,
        count: totalVulnerabilities
      };
    });
  
    // Sort by date
    data.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Group by selected time range
    const groupedData = data.reduce((acc, curr) => {
      let key = '';
      try {
        if (timeRange === 'days') {
          key = curr.date.toISOString().split('T')[0];
        } else if (timeRange === 'months') {
          key = `${curr.date.getFullYear()}-${String(curr.date.getMonth() + 1).padStart(2, '0')}`;
        } else {
          key = curr.date.getFullYear().toString();
        }
  
        if (!acc[key]) {
          acc[key] = { date: key, count: curr.count };
        } else {
          acc[key].count += curr.count;
        }
      } catch (err) {
        console.error('Error processing date:', curr.date, err);
      }
      return acc;
    }, {} as Record<string, { date: string; count: number }>);

    return Object.values(groupedData);
  };

  const processScanFrequencyData = () => {
    return scanResults.reduce((acc, scan) => {
      try {
        const date = new Date(scan.createdAt);
        let key = '';
        
        if (timeRange === 'months') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else if (timeRange === 'years') {
          key = date.getFullYear().toString();
        } else {
          key = date.toISOString().split('T')[0];
        }
  
        acc[key] = (acc[key] || 0) + 1;
      } catch (err) {
        console.error('Error processing date:', scan.createdAt, err);
      }
      return acc;
    }, {} as Record<string, number>);
  };

  const vulnerabilityChartData = {
    labels: processVulnerabilityData().map(d => d.date),
    datasets: [
      {
        label: 'Total Vulnerabilities',
        data: processVulnerabilityData().map(d => d.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const frequencyData = processScanFrequencyData();
  const scanFrequencyChartData = {
    labels: Object.keys(frequencyData),
    datasets: [
      {
        label: 'Scan Frequency',
        data: Object.values(frequencyData),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgb(153, 102, 255)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Vulnerability Trends'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#111] border-gray-800 shadow-lg">
        <CardHeader className="space-y-4">
          <div className="text-gray-400 text-center text-sm">[ Dashboard Overview ]</div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-center text-white">
            Scan Analysis
          </CardTitle>

          {/* Organization and Agent Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Organization</label>
              <Select value={selectedOrg} onValueChange={setSelectedOrg}>
                <SelectTrigger className="bg-[#1A1A1A] border-gray-800">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org._id} value={org._id}>
                      {org.organizationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">Agent</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="bg-[#1A1A1A] border-gray-800" disabled={!selectedOrg}>
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.agent_id} value={agent.agent_id}>
                      {agent.agent_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {loading ? (
          <CardContent>
            <div className="text-center text-gray-400">Loading...</div>
          </CardContent>
        ) : scanResults.length > 0 ? (
          <CardContent className="space-y-6">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-[#1A1A1A] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-xl text-white text-center">{scanResults.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-center">Total Scans</p>
                </CardContent>
              </Card>
            </div>

            {/* Time Range Selection for Charts */}
            <div className="mb-4">
              <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                <SelectTrigger className="bg-[#1A1A1A] border-gray-800">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">By Days</SelectItem>
                  <SelectItem value="months">By Months</SelectItem>
                  <SelectItem value="years">By Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vulnerability Trends Chart */}
            <Card className="bg-[#1A1A1A] border-gray-800 p-4">
              <CardHeader>
                <CardTitle className="text-xl text-white">Vulnerability Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <Line data={vulnerabilityChartData} options={chartOptions} />
              </CardContent>
            </Card>

            {/* Scan Frequency Chart */}
            <Card className="bg-[#1A1A1A] border-gray-800 p-4">
              <CardHeader>
                <CardTitle className="text-xl text-white">Scan Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar
                  data={scanFrequencyChartData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        ...chartOptions.plugins.title,
                        text: 'Scan Frequency Distribution'
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </CardContent>
        ) : (
          <CardContent>
            <div className="text-center text-gray-400">
              {error || 'Select an organization and agent to view scan analysis'}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}