import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer 
} from 'recharts';
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import Sidebar from '@/components/admin/Sidebar';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';

// Interfaces for visitor statistics data
interface VisitorCount {
  count: number;
}

interface DateStat {
  date: string;
  count: number;
}

interface PageStat {
  url: string;
  count: number;
}

interface CountryStat {
  country: string;
  count: number;
}

interface DeviceStat {
  device: string;
  count: number;
}

// Custom color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF6666', '#4CAF50', '#FFA726'];

// Time period options
const TIME_PERIODS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 3 months' },
  { value: '180', label: 'Last 6 months' },
  { value: '365', label: 'Last year' },
];

const VisitorStatsPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { isAuthenticated, isAdmin, user } = useAdminAuth();
  const { toast } = useToast();
  
  // State for time period selector
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('30');
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Query visitor count
  const { 
    data: visitorCount, 
    isLoading: isLoadingCount,
    error: countError
  } = useQuery<VisitorCount>({
    queryKey: ['/api/admin/visitor-stats/count'],
    retry: 1,
  });
  
  // Query visitor stats by date range
  const { 
    data: visitorsByDate, 
    isLoading: isLoadingDateStats, 
    refetch: refetchDateStats,
    error: dateError
  } = useQuery<DateStat[]>({
    queryKey: ['/api/admin/visitor-stats/date-range', selectedTimePeriod],
    queryFn: async () => {
      const response = await fetch(`/api/admin/visitor-stats/date-range?days=${selectedTimePeriod}`);
      if (!response.ok) {
        throw new Error('Failed to fetch visitor date statistics');
      }
      return response.json();
    },
    retry: 1,
  });
  
  // Query visitor stats by page
  const { 
    data: visitorsByPage, 
    isLoading: isLoadingPageStats,
    error: pageError
  } = useQuery<PageStat[]>({
    queryKey: ['/api/admin/visitor-stats/pages'],
    retry: 1,
  });
  
  // Query visitor stats by country
  const { 
    data: visitorsByCountry, 
    isLoading: isLoadingCountryStats,
    error: countryError
  } = useQuery<CountryStat[]>({
    queryKey: ['/api/admin/visitor-stats/countries'],
    retry: 1,
  });
  
  // Query visitor stats by device
  const { 
    data: visitorsByDevice, 
    isLoading: isLoadingDeviceStats,
    error: deviceError
  } = useQuery<DeviceStat[]>({
    queryKey: ['/api/admin/visitor-stats/devices'],
    retry: 1,
  });
  
  // Handle time period change
  const handleTimePeriodChange = (value: string) => {
    setSelectedTimePeriod(value);
  };
  
  // Loading state
  const isLoading = isLoadingCount || isLoadingDateStats || isLoadingPageStats || 
                   isLoadingCountryStats || isLoadingDeviceStats;
  
  // Show error notifications for API errors
  useEffect(() => {
    if (countError) {
      toast({
        title: 'Error loading visitor count',
        description: 'Failed to load total visitor count data.',
        variant: 'destructive',
      });
    }
    
    if (dateError) {
      toast({
        title: 'Error loading date statistics',
        description: 'Failed to load visitor trend data.',
        variant: 'destructive',
      });
    }
    
    if (pageError) {
      toast({
        title: 'Error loading page statistics',
        description: 'Failed to load page view data.',
        variant: 'destructive',
      });
    }
    
    if (countryError) {
      toast({
        title: 'Error loading country statistics',
        description: 'Failed to load visitor geographic data.',
        variant: 'destructive',
      });
    }
    
    if (deviceError) {
      toast({
        title: 'Error loading device statistics',
        description: 'Failed to load device type data.',
        variant: 'destructive',
      });
    }
  }, [countError, dateError, pageError, countryError, deviceError, toast]);
  
  // Format visitor data for charts
  const formatPageData = () => {
    if (!visitorsByPage) return [];
    
    return visitorsByPage.slice(0, 10).map((item, index) => ({
      name: item.url.length > 25 ? item.url.substring(0, 22) + '...' : item.url,
      value: item.count,
      fullUrl: item.url, // Store full URL for tooltip
      fill: COLORS[index % COLORS.length],
    }));
  };
  
  const formatCountryData = () => {
    if (!visitorsByCountry) return [];
    
    return visitorsByCountry.map((item, index) => ({
      name: item.country || 'Unknown',
      value: item.count,
      fill: COLORS[index % COLORS.length],
    }));
  };
  
  const formatDeviceData = () => {
    if (!visitorsByDevice) return [];
    
    return visitorsByDevice.map((item, index) => ({
      name: item.device.charAt(0).toUpperCase() + item.device.slice(1), // Capitalize device type
      value: item.count,
      fill: COLORS[index % COLORS.length],
    }));
  };
  
  // Custom tooltip renderers
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p>Views: <span className="font-semibold">{payload[0].value}</span></p>
          {payload[0].payload.fullUrl && (
            <p className="text-xs text-gray-500 mt-1">{payload[0].payload.fullUrl}</p>
          )}
        </div>
      );
    }
    return null;
  };
  
  const DateTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          <p>Visitors: <span className="font-semibold">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar isMobileOpen={isMobileMenuOpen} toggleMobile={toggleMobileMenu} />
        <div className="flex-1 p-4 md:p-8 md:ml-64">
          <div className="flex justify-center items-center h-full">
            <div className="w-16 h-16 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if user is authenticated and admin
  if (!isAuthenticated || !isAdmin) {
    navigate("/admin/login");
    return null;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isMobileOpen={isMobileMenuOpen} toggleMobile={toggleMobileMenu} />
      <div className="flex-1 p-4 md:p-8 md:ml-64">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Visitor Statistics</h1>
          <p className="text-gray-600">
            Analysis of website traffic and visitor behavior
          </p>
        </div>
        
        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="overflow-hidden border-t-4 border-t-blue-500">
            <CardHeader className="pb-2 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold">
                    Total Visitors
                  </CardTitle>
                  <CardDescription>All-time website visitors</CardDescription>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <i className="fas fa-users h-5 w-5 text-blue-700"></i>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold">{visitorCount?.count || 0}</div>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <span>Unique visits tracked</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-t-4 border-t-emerald-500">
            <CardHeader className="pb-2 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold">
                    Most Popular Page
                  </CardTitle>
                  <CardDescription>Highest traffic page</CardDescription>
                </div>
                <div className="bg-emerald-100 p-2 rounded-full">
                  <i className="fas fa-file h-5 w-5 text-emerald-700"></i>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-xl font-bold truncate">
                {visitorsByPage && visitorsByPage.length > 0 
                  ? (visitorsByPage[0].url === '/' ? 'Homepage' : visitorsByPage[0].url) 
                  : 'No data'}
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <span>{visitorsByPage && visitorsByPage.length > 0 
                  ? `${visitorsByPage[0].count} views` 
                  : 'No views recorded'}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-t-4 border-t-amber-500">
            <CardHeader className="pb-2 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold">
                    Top Device Type
                  </CardTitle>
                  <CardDescription>Most common visitor device</CardDescription>
                </div>
                <div className="bg-amber-100 p-2 rounded-full">
                  <i className="fas fa-laptop h-5 w-5 text-amber-700"></i>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-xl font-bold capitalize">
                {visitorsByDevice && visitorsByDevice.length > 0 
                  ? visitorsByDevice[0].device 
                  : 'No data'}
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <span>{visitorsByDevice && visitorsByDevice.length > 0 && visitorCount && visitorCount.count
                  ? `${Math.round((visitorsByDevice[0].count / visitorCount.count) * 100)}% of visitors` 
                  : 'No data recorded'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Time Period Selector */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-lg font-medium mb-2">Time Period</h2>
            <Select value={selectedTimePeriod} onValueChange={handleTimePeriodChange}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TIME_PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Tabs for different stats views */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-4 mb-8">
            <TabsTrigger value="trends">Visitor Trends</TabsTrigger>
            <TabsTrigger value="pages">Popular Pages</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
          </TabsList>
          
          {/* Visitor Trends Tab */}
          <TabsContent value="trends" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Visitor Trends</CardTitle>
                <CardDescription>
                  Daily visitors over the selected time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {visitorsByDate && visitorsByDate.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={visitorsByDate}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                          }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip content={<DateTooltip />} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          name="Visitors"
                          stroke="#0088FE" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No visitor trend data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Popular Pages Tab */}
          <TabsContent value="pages" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Pages</CardTitle>
                <CardDescription>
                  Most visited pages across the website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {visitorsByPage && visitorsByPage.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={formatPageData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={150}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="value" name="Page Views" fill="#8884d8">
                          {formatPageData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No page view data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Geography Tab */}
          <TabsContent value="geography" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Visitor Geography</CardTitle>
                <CardDescription>
                  Distribution of visitors by country
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {visitorsByCountry && visitorsByCountry.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={formatCountryData()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {formatCountryData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No geography data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Devices Tab */}
          <TabsContent value="devices" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
                <CardDescription>
                  Visitor device breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {visitorsByDevice && visitorsByDevice.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={formatDeviceData()}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {formatDeviceData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No device data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VisitorStatsPage;