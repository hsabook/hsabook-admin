import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { UserOutlined, BookOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { getStatistics } from '../api/dashboard';

/**
 * Fetches and displays dashboard statistics
 */
const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState([
    { 
      title: 'Users', 
      value: 0, 
      icon: <UserOutlined className="text-2xl text-blue-500" />, 
      prefix: '', 
      suffix: 'users'
    },
    { 
      title: 'Books', 
      value: 0, 
      icon: <BookOutlined className="text-2xl text-green-500" />, 
      prefix: '', 
      suffix: 'books'
    },
    { 
      title: 'Questions', 
      value: 0, 
      icon: <QuestionCircleOutlined className="text-2xl text-orange-500" />, 
      prefix: '', 
      suffix: 'questions'
    },
  ]);

  /**
   * Fetches dashboard statistics from API
   */
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await getStatistics();
      
      if (response.status_code === 200) {
        setStats([
          { 
            title: 'Users', 
            value: response.data.users, 
            icon: <UserOutlined className="text-2xl text-blue-500" />, 
            prefix: '', 
            suffix: 'users'
          },
          { 
            title: 'Books', 
            value: response.data.books, 
            icon: <BookOutlined className="text-2xl text-green-500" />, 
            prefix: '', 
            suffix: 'books'
          },
          { 
            title: 'Questions', 
            value: response.data.questions, 
            icon: <QuestionCircleOutlined className="text-2xl text-orange-500" />, 
            prefix: '', 
            suffix: 'questions'
          },
        ]);
      }
    } catch (error) {
      console.error('🔴 Dashboard fetchDashboardStats error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard statistics on component mount
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card hoverable>
              <div className="flex items-center justify-between">
                {loading ? (
                  <Spin />
                ) : (
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                )}
                {stat.icon}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Dashboard;