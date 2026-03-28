'use client';

import { useState } from 'react';
import { useAdminAuth, PERMISSIONS } from '@/contexts/AdminAuthContext';
import {
  Target,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Copy,
} from 'lucide-react';
import { bangladeshLocations, getAllDivisions, getDistrictsByDivision, getThanasByDistrict } from '@/data/bangladesh-locations';

export default function CampaignTargetingPage() {
  const { hasPermission } = useAdminAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedThanas, setSelectedThanas] = useState<string[]>([]);
  const [campaignName, setCampaignName] = useState('');
  const [budget, setBudget] = useState('');

  // Mock campaign data - Replace with real API data
  type CampaignStatus = 'active' | 'paused' | 'draft' | 'ended';
  const campaigns: Array<{
    id: string;
    name: string;
    targetLocations: { divisions: string[]; districts: string[]; thanas: string[] };
    estimatedReach: number;
    budget: number;
    spent: number;
    startDate: Date;
    endDate: Date;
    status: CampaignStatus;
    performance: { impressions: number; clicks: number; conversions: number; revenue: number };
  }> = [
    {
      id: '1',
      name: 'Dhaka Metro Beauty Campaign',
      targetLocations: {
        divisions: ['Dhaka'],
        districts: ['Dhaka', 'Gazipur'],
        thanas: ['Dhanmondi', 'Gulshan', 'Mirpur', 'Uttara'],
      },
      estimatedReach: 45678,
      budget: 50000,
      spent: 23456,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      status: 'active',
      performance: {
        impressions: 123456,
        clicks: 5678,
        conversions: 234,
        revenue: 345678,
      },
    },
    {
      id: '2',
      name: 'Chittagong Coastal Campaign',
      targetLocations: {
        divisions: ['Chittagong'],
        districts: ['Chittagong', "Cox's Bazar"],
        thanas: ['Agrabad', 'Panchlaish', "Cox's Bazar Sadar"],
      },
      estimatedReach: 23456,
      budget: 30000,
      spent: 15678,
      startDate: new Date('2024-01-05'),
      endDate: new Date('2024-02-05'),
      status: 'active',
      performance: {
        impressions: 67890,
        clicks: 3456,
        conversions: 156,
        revenue: 234567,
      },
    },
    {
      id: '3',
      name: 'All Bangladesh New Year Sale',
      targetLocations: {
        divisions: getAllDivisions(),
        districts: [],
        thanas: [],
      },
      estimatedReach: 150000,
      budget: 100000,
      spent: 0,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-15'),
      status: 'draft',
      performance: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
      },
    },
  ];

  if (!hasPermission(PERMISSIONS.CONTENT_MANAGE)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">You don't have permission to manage campaign targeting.</p>
      </div>
    );
  }

  const handleDivisionToggle = (division: string) => {
    setSelectedDivisions(prev =>
      prev.includes(division)
        ? prev.filter(d => d !== division)
        : [...prev, division]
    );
  };

  const calculateEstimatedReach = () => {
    // Simple calculation based on selections
    let reach = 0;
    if (selectedDivisions.length > 0) reach += selectedDivisions.length * 10000;
    if (selectedDistricts.length > 0) reach += selectedDistricts.length * 3000;
    if (selectedThanas.length > 0) reach += selectedThanas.length * 500;
    return reach;
  };

  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalReach = campaigns.reduce((sum, c) => sum + c.estimatedReach, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Location-Based Campaign Targeting</h1>
          <p className="text-gray-600">Create targeted campaigns for specific regions in Bangladesh</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Campaign
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{activeCampaigns}</p>
              <p className="text-xs text-gray-600 mt-1">of {campaigns.length} total</p>
            </div>
            <Target className="w-10 h-10 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reach</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalReach.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">estimated customers</p>
            </div>
            <Users className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">৳{totalBudget.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">allocated</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Spent</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">৳{totalSpent.toLocaleString()}</p>
              <p className="text-xs text-orange-600 mt-1">
                {((totalSpent / totalBudget) * 100).toFixed(1)}% of budget
              </p>
            </div>
            <Calendar className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Active Campaigns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Locations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reach
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {campaign.startDate.toLocaleDateString()} - {campaign.endDate.toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-1">
                      {campaign.targetLocations.divisions.length > 0 && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-3 h-3 mr-1" />
                          {campaign.targetLocations.divisions.length === getAllDivisions().length
                            ? 'All Bangladesh'
                            : `${campaign.targetLocations.divisions.length} division(s)`}
                        </div>
                      )}
                      {campaign.targetLocations.districts.length > 0 && (
                        <p className="text-gray-600">{campaign.targetLocations.districts.length} district(s)</p>
                      )}
                      {campaign.targetLocations.thanas.length > 0 && (
                        <p className="text-gray-600">{campaign.targetLocations.thanas.length} thana(s)</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{campaign.estimatedReach.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">৳{campaign.budget.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Spent: ৳{campaign.spent.toLocaleString()}</p>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-purple-600 h-1 rounded-full"
                          style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-1">
                      <p className="text-gray-600">{campaign.performance.impressions.toLocaleString()} impressions</p>
                      <p className="text-gray-600">{campaign.performance.clicks.toLocaleString()} clicks</p>
                      <p className="text-green-600 font-medium">{campaign.performance.conversions} conversions</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-purple-600 hover:text-purple-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      {campaign.status === 'active' ? (
                        <button className="text-yellow-600 hover:text-yellow-900">
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button className="text-green-600 hover:text-green-900">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-900">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Campaign Modal Preview */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create Location-Based Campaign</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Enter campaign name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Division Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Divisions</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {getAllDivisions().map(division => (
                    <label key={division} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedDivisions.includes(division)}
                        onChange={() => handleDivisionToggle(division)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{division}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (BDT)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Enter budget amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Estimated Reach */}
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Estimated Reach</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                      {calculateEstimatedReach().toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">potential customers</p>
                  </div>
                  <Target className="w-12 h-12 text-purple-400" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle campaign creation
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
