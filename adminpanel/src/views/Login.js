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
                <CardTitle tag="h4">Login</CardTitle>
              </CardHeader>
              <CardBody>
                <Form action="#">
                  <label>Email address</label>
                  <FormGroup>
                    <Input type="email" />
                  </FormGroup>
                  <label>Password</label>
                  <FormGroup>
                    <Input type="password" autoComplete="off" />
                  </FormGroup>
                  <label>Confirm</label>
                  <FormGroup>
                    <Input type="password" autoComplete="off" />
                  </FormGroup>
                  <FormGroup check className="mt-3">
                    <Label check>
                      <Input type="checkbox" />
                      <span className="form-check-sign" />
                      Subscribe to newsletter
                    </Label>
                  </FormGroup>
                </Form>
              </CardBody>
              <CardFooter>
                <div style={{ textAlign: "center" }}>
                  <Button className="btn-fill" color="primary" type="submit">
                    Submit
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
