import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, Calendar, Clock } from 'lucide-react';
import { CardHeader } from './ui/card';

const UsageStats = ({ groupedLinks, downloadStartTime }) => {
  if (!groupedLinks || Object.keys(groupedLinks).length === 0) return null;

  // Calculate total files and date range
  let totalFiles = 0;
  let earliestDate = new Date();
  let latestDate = new Date(0);
  const monthlyData = [];

  Object.entries(groupedLinks).forEach(([year, months]) => {
    Object.entries(months).forEach(([month, links]) => {
      totalFiles += links.length;
      
      // Track monthly totals for the chart
      monthlyData.push({
        date: `${year}-${month}`,
        count: links.length
      });

      // Find date range
      links.forEach(link => {
        const date = new Date(link.date);
        if (date < earliestDate) earliestDate = date;
        if (date > latestDate) latestDate = date;
      });
    });
  });

  // Calculate statistics
  const daysSinceStart = Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24));
  const filesPerDay = (totalFiles / daysSinceStart).toFixed(2);
  
  // Format duration since download started
  const getDurationText = () => {
    if (!downloadStartTime) return '';
    const seconds = Math.floor((Date.now() - downloadStartTime) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  };

  // Sort monthly data chronologically
  monthlyData.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Card className="bg-white shadow-lg">
        <CardHeader>
            
        </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stats */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <div className="text-sm text-gray-600">Total Files</div>
                <div className="text-2xl font-semibold">{totalFiles}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <div className="text-sm text-gray-600">Daily Average</div>
                <div className="text-2xl font-semibold">{filesPerDay}</div>
              </div>
            </div>

            {downloadStartTime && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-purple-500 mt-1" />
                <div>
                  <div className="text-sm text-gray-600">Download Started</div>
                  <div className="text-lg font-medium">{getDurationText()}</div>
                </div>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="col-span-2 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            {`You've captured ${totalFiles} memories over ${daysSinceStart} days - that's about ${filesPerDay} memories every day! `}
            {totalFiles > 365 && `You could look at a different memory every day for ${Math.floor(totalFiles/365)} years! `}
            {filesPerDay > 1 && `On average, you saved a new memory every ${(24/filesPerDay).toFixed(1)} hours.`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageStats;