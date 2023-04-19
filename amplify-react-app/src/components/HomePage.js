import React, { useEffect } from "react";
import { Card, Col, Row } from "antd";

export default function HomePage({ user, signOut }) {
  const requestTypes = [
    { "Hardware Requests": "Order something" },
    { "Hardware Requests": "Order something" },
    { "Hardware Requests": "Order something" },
    { "Hardware Requests": "Order something" },
    { "Hardware Requests": "Order something" },
    { "Hardware Requests": "Order something" },
  ];

  return (
    <Row gutter={16}>
      {requestTypes.map((value, index) => {
        return (
          <Col key={index} span={8}>
            <Card title={Object.keys(value)} bordered={false}>
              {value[Object.keys(value)]}
            </Card>
          </Col>
        );
      })}
      {/* 
      <Col span={8}>
        <Card title="Card title" bordered={false}>
          Card content
        </Card>
      </Col>
      <Col span={8}>
        <Card title="Card title" bordered={false}>
          Card content
        </Card>
      </Col> */}
    </Row>
  );
}
