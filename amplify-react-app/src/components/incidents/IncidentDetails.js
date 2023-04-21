import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { fetchIncident } from "../../ApiCalls";
import {
  Col,
  Row,
  Card,
  Form,
  Button,
  Input,
  InputNumber,
  Select,
  Statistic,
} from "antd";

export default function IncidentDetails() {
  const params = useParams();
  const [incidentData, setIncidentData] = useState({});
  const { TextArea } = Input;

  useEffect(() => {
    fetchIncident(params.id).then((response) => {
      setIncidentData(response.data);
    });
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={<h1>Incident {incidentData.incidentId}</h1>}
            bordered={false}
          >
            <Row>
              <Col span={12}>
                <Form
                  labelCol={{ span: 12 }}
                  wrapperCol={{ span: 20 }}
                  layout="vertical"
                  style={{ maxWidth: 600, padding: "16px 0px" }}
                >
                  <Form.Item label="Request Type" name="requestType">
                    <Input value={"requestType"} />
                  </Form.Item>
                  <Form.Item label="Incident Title" name="title">
                    <Input />
                  </Form.Item>
                  <Form.Item label="Sub Category" name="subCategory">
                    <Select>
                      <Select.Option value="demo">Demo</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Complexity" name="complexity">
                    <InputNumber />
                  </Form.Item>
                </Form>
              </Col>
              <Col span={12}>
                <Form
                  labelCol={{ span: 12 }}
                    wrapperCol={{ span: 20 }}
                  layout="vertical"
                  style={{ maxWidth: 600, padding: "16px 0px" }}
                >
                  <Form.Item label="Description" name="description">
                    <TextArea rows={4} />
                  </Form.Item>
                  <Form.Item label="Comments" name="comment">
                    <TextArea rows={4} />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
