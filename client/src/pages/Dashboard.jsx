import React, { useEffect, useState } from 'react';
import { fetchClientTimeline } from '../services/api';
import TimelineChart from '../components/Dashboard/TimelineChart';

const Dashboard = ({ clientId }) => {
   const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchClientTimeline(clientId);
        setTimelineData(data.data); 
        setLoading(false);
      } catch (err) {
        console.error('Error fetching timeline:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  if (loading) {
    return <div className="p-8 text-center">Cargando datos...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        {  timelineData && 
          <TimelineChart data={timelineData} />
        }
      </div>
    </div>
  );
};

export default Dashboard;