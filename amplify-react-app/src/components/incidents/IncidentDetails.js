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
  DatePicker,
  List,
  Tooltip,
} from "antd";
import { Comment } from "@ant-design/compatible";

const { RangePicker } = DatePicker;

export default function IncidentDetails() {
  const params = useParams();
  const [incidentData, setIncidentData] = useState({});
  const { TextArea } = Input;

  useEffect(() => {
    fetchIncident(params.id).then((response) => {
      setIncidentData(response.data);
    });
  }, []);
  const data = [
    {
      actions: [<span key="comment-list-reply-to-0">Reply to</span>],
      author: "Han Solo",
      content: (
        <p>
          We supply a series of design principles, practical patterns and high
          quality design resources (Sketch and Axure), to help people create
          their product prototypes beautifully and efficiently.
        </p>
      ),
      datetime: (
        <Tooltip title="2016-11-22 11:22:33">
          <span>8 hours ago</span>
        </Tooltip>
      ),
    },
    {
      actions: [<span key="comment-list-reply-to-0">Reply to</span>],
      author: "Han Solo",
      content: (
        <p>
          We supply a series of design principles, practical patterns and high
          quality design resources (Sketch and Axure), to help people create
          their product prototypes beautifully and efficiently.
        </p>
      ),
      datetime: (
        <Tooltip title="2016-11-22 10:22:33">
          <span>9 hours ago</span>
        </Tooltip>
      ),
    },
  ];
  return (
    <div style={{ padding: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={<h1>Incident {incidentData.incidentId}</h1>}
            bordered={false}
          >
            <Row>
              <Col sm={24} md={12}>
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
                  <Form.Item label="Status" name="status">
                    <Select>
                      <Select.Option value="status">Status</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Description" name="description">
                    <TextArea rows={5} />
                  </Form.Item>
                </Form>
              </Col>
              <Col sm={24} md={12}>
                <Form
                  labelCol={{ span: 12 }}
                  wrapperCol={{ span: 20 }}
                  layout="vertical"
                  style={{ maxWidth: 600, padding: "16px 0px" }}
                >
                  <Form.Item label="Sub Category" name="subCategory">
                    <Select>
                      <Select.Option value="demo">Demo</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Developer" name="developer">
                    <Input />
                  </Form.Item>
                  <Form.Item label="Reporter" name="reporter">
                    <Input />
                  </Form.Item>
                  <Form.Item label="RangePicker" name="dateRange">
                    <RangePicker />
                  </Form.Item>
                  <Form.Item label="Complexity" name="complexity">
                    <InputNumber />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col>
          <List
            className="comment-list"
            header={`${data.length} Comments`}
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item) => (
              <li>
                <Comment
                  actions={item.actions}
                  author={item.author}
                  avatar={item.avatar ?? ""}
                  content={item.content}
                  datetime={item.datetime}
                  style={{ padding: "0px 16px", margin: "16px 0px" }}
                />
              </li>
            )}
          />
          <Form
            labelCol={{ span: 12 }}
            layout="vertical"
            style={{ padding: "16px 0px" }}
          >
            <Form.Item label="Add Comment" name="Comment">
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" style={{ float: "right" }}>
                Add comment
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
}
