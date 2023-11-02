import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Row, Col, Button, Modal, Input, Label, Form, FormGroup, } from "reactstrap";

const AddEmr = ({ isOpen, emr_data, onClose, onSave }) => {
    const [user, setUser] = useState(emr_data);

    return (
        < Modal isOpen={isOpen} style={{ transform: "translate(0, 10%)" }
        }>
            <div className="modal-header">
                <h4>{user._id ? "Edit " : "Add "}</h4>
                <button
                    aria-label="Close"
                    className="close"
                    data-dismiss="modal"
                    type="button"
                    onClick={onClose}
                >
                    <i className="tim-icons icon-simple-remove" />
                </button>
            </div>
            <div className="modal-body">
                <Form className="form-horizontal">
                    <Row>
                        <Label md="5">Firebase UID</Label>
                        <Col md="7">
                            <FormGroup>
                                <Input
                                    type="text"
                                    value={user.uid}
                                    onChange={(e) => {
                                        setUser({ ...user, uid: e.target.value });
                                    }}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Label md="5">First Name</Label>
                        <Col md="7">
                            <FormGroup>
                                <Input
                                    type="text"
                                    value={user.firstname}
                                    onChange={(e) => {
                                        setUser({ ...user, firstname: e.target.value });
                                    }}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Label md="5">Last Name</Label>
                        <Col md="7">
                            <FormGroup>
                                <Input
                                    type="text"
                                    value={user.lastname}
                                    onChange={(e) => {
                                        setUser({ ...user, lastname: e.target.value });
                                    }}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Label md="5">Email</Label>
                        <Col md="7">
                            <FormGroup>
                                <Input
                                    type="text"
                                    value={user.email}
                                    onChange={(e) => {
                                        setUser({ ...user, email: e.target.value });
                                    }}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Label md="5">Mobile</Label>
                        <Col md="7">
                            <FormGroup>
                                <Input
                                    type="text"
                                    value={user.mobile}
                                    onChange={(e) => {
                                        setUser({ ...user, mobile: e.target.value });
                                    }}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Label md="5">Password</Label>
                        <Col md="7">
                            <FormGroup>
                                <Input
                                    type="text"
                                    value={user.password}
                                    onChange={(e) => {
                                        setUser({ ...user, password: e.target.value });
                                    }}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row style={{ float: "right", marginRight: "2px" }}>
                        <Button color="btn1 btn-sm" onClick={() => onSave(user)}>
                            Save
                        </Button>
                        <Button color="btn1 btn-sm" onClick={onClose}>
                            Cancel
                        </Button>
                    </Row>
                </Form>
            </div>
        </Modal >
    );
}

const mapStateToProps = (state) => {
    const { LoginReducer } = state;
    return { credential: LoginReducer };
};

export default connect(mapStateToProps)(AddEmr);
