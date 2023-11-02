import React from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Label,
  FormGroup,
  Form,
  Input,
  Row,
  Col,
} from "reactstrap";

const Login = () => {
  return (
    <>
      <div className="content">
        <Row>
          <Col md="4" sm="2"></Col>
          <Col md="4" sm="8">
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Notification</CardTitle>
              </CardHeader>
              <CardBody>
                <Form>
                  <FormGroup>
                    <Input type="text" autoComplete="off" />
                  </FormGroup>
                </Form>
              </CardBody>
              <CardFooter>
                <div style={{ textAlign: "center" }}>
                  <Button className="btn-fill" color="primary" type="button">
                    Send
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </Col>
          <Col md="4" sm="2"></Col>
        </Row>
      </div>
    </>
  );
};

export default Login;
