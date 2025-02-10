import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, BookOutlined, QuestionCircleOutlined } from '@ant-design/icons';

const Dashboard: React.FC = () => {
  const stats = [
    { 
      title: 'Users', 
      value: 1234, 
      icon: <UserOutlined className="text-2xl text-blue-500" />, 
      prefix: '', 
      suffix: 'users'
    },
    { 
      title: 'Books', 
      value: 856, 
      icon: <BookOutlined className="text-2xl text-green-500" />, 
      prefix: '', 
      suffix: 'books'
    },
    { 
      title: 'Questions', 
      value: 2456, 
      icon: <QuestionCircleOutlined className="text-2xl text-orange-500" />, 
      prefix: '', 
      suffix: 'questions'
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card hoverable>
              <div className="flex items-center justify-between">
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
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