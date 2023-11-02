import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import classNames from "classnames";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Row,
  Col,
  Button,
  Modal,
  Input,
  Label,
  Form,
  FormGroup,
  CustomInput,
} from "reactstrap";
import Moment from "moment";
import NotificationAlert from "react-notification-alert";
import ReactDatetime from "react-datetime";
import ReactTable from "components/ReactTable/ReactTable.js";

const Project = ({ credential }) => {
  const [projects, setProjects] = useState([]);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [project, setProject] = useState({ fund_raised: 0, status: false });
  const { apiConfig, ApiCall } = global;
  const notificationAlertRef = React.useRef(null);

  const notify = (message, type) => {
    let options = {};
    options = {
      place: "tr",
      message: message,
      type: type,
      icon: "tim-icons icon-bell-55",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };

  const openModal = (data) => {
    setProject(data);
    setShow(true);
  };

  const closeModal = () => {
    setProject({ fund_raised: 0, status: false });
    setShow(false);
  };

  const openModal1 = (data) => {
    setProject(data);
    setShow1(true);
  };

  const closeModal1 = () => {
    setProject({ fund_raised: 0, status: false });
    setShow1(false);
  };

  const save = async (pro) => {
    try {
      const response = await ApiCall(
        apiConfig.pro_upsert.url,
        apiConfig.pro_upsert.method,
        credential.loginToken,
        pro
      );
      if (response.data.result) {
        const response = await ApiCall(
          apiConfig.pro_get.url,
          apiConfig.pro_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setProjects([response.data.data]);
        } else {
          notify(response.data.data, "danger");
        }
      } else {
        notify(response.data.data, "danger");
      }
    } catch (error) {
      notify("Failed", "danger");
    }
    setProject({});
    setShow(false);
  };

  const remove = async (data) => {
    try {
      const response = await ApiCall(
        apiConfig.pro_del.url,
        apiConfig.pro_del.method,
        credential.loginToken,
        data
      );
      if (response.data.result) {
        const response = await ApiCall(
          apiConfig.pro_get.url,
          apiConfig.pro_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setProjects([response.data.data]);
        } else {
          notify(response.data.data, "danger");
        }
      } else {
        notify(response.data.data, "danger");
      }
    } catch (error) {
      if (error.response) notify(error.response.data.data, "danger");
      else if (error.request) notify("Request failed", "danger");
      else notify("Something went wrong", "danger");
    }
    setProject({ fund_raised: 0, status: false });
    setShow1(false);
  };

  const openChange = async (pro) => {
    try {
      const response = await ApiCall(
        apiConfig.pro_upsert.url,
        apiConfig.pro_upsert.method,
        credential.loginToken,
        pro
      );
      if (response.data.result) {
        const response = await ApiCall(
          apiConfig.pro_get.url,
          apiConfig.pro_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setProjects([response.data.data]);
        } else {
          notify(response.data.data, "danger");
        }
      } else {
        notify(response.data.data, "danger");
      }
    } catch (error) {
      notify("Failed", "danger");
    }
    setProject({});
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await ApiCall(
          apiConfig.pro_get.url,
          apiConfig.pro_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setProjects([response.data.data]);
        } else {
          notify(response.data.data, "danger");
        }
      } catch (error) {
        notify("Failed", "danger");
      }
    })();
  }, []);

  const [data, setData] = useState([]);

  useEffect(() => {
    var data = projects.map((prop, key) => {
      return {
        ...prop,
        createdAt: Moment(prop.createdAt).format("DD/MM/YYYY hh:mm:ss"),
        endDate: Moment(prop.endDate).format("DD/MM/YYYY"),
        status: prop.status ? "Opened" : "",
        fund_target: prop.fund_target + "$",
        fund_raised: prop.fund_raised + "$",
        switches: (
          <div>
            <CustomInput
              type="switch"
              id="switch-2"
              checked={prop.isActive}
              onChange={() => openChange({ ...prop, isActive: !prop.isActive })}
            />
          </div>
        ),
        actions: (
          <div className="actions-right">
            <Link to={`/admin/projectDetail/${prop._id}`}>
              <Button
                color="warning"
                size="sm"
                className={classNames("btn-icon btn-link like btn-neutral")}
                style={{ opacity: 0.7 }}
              >
                <i class="fa fa-eye" aria-hidden="false"></i>
              </Button>
            </Link>
            {/* use this button to add a edit kind of action */}
            <Button
              onClick={() => openModal(prop)}
              color="warning"
              size="sm"
              className={classNames("btn-icon btn-link like btn-neutral")}
              style={{ opacity: 0.7 }}
            >
              <i className="tim-icons icon-pencil" />
            </Button>
            {/* use this button to remove the data row */}
            <Button
              onClick={() => openModal1(prop)}
              color="danger"
              size="sm"
              className={classNames(
                "btn-icon btn-link like btn-neutral"
                // , {
                //   "btn-neutral": key < 5,
                // }
              )}
              style={{ opacity: 0.7 }}
            >
              <i className="tim-icons icon-trash-simple" />
            </Button>
          </div>
        ),
      };
    });
    setData(data);
  }, [projects]);

  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <div className="content">
        <Row>
          <Col xs={12} md={12}>
            <Card>
              <CardHeader>
                <CardTitle tag="h3">Projects</CardTitle>
              </CardHeader>
              <CardBody>
                <ReactTable
                  data={data}
                  filterable
                  resizable={false}
                  columns={[
                    {
                      Header: "Name",
                      accessor: "name",
                    },
                    {
                      Header: "Target",
                      accessor: "fund_target",
                    },
                    {
                      Header: "Pledged",
                      accessor: "fund_raised",
                    },
                    {
                      Header: "EndDate",
                      accessor: "endDate",
                    },
                    // {
                    //   Header: "CreatedAt",
                    //   accessor: "createdAt",
                    // },
                    // {
                    //   Header: "Pinned",
                    //   accessor: "pinned",
                    // },
                    // {
                    //   Header: "Status",
                    //   accessor: "status",
                    // },
                    {
                      Header: "IsActive",
                      accessor: "switches",
                      sortable: false,
                      filterable: false,
                    },
                    {
                      Header: "Actions",
                      accessor: "actions",
                      sortable: false,
                      filterable: false,
                    },
                  ]}
                  defaultPageSize={10}
                  showPaginationTop
                  showPaginationBottom={false}
                  openModal={openModal}
                  className="-striped -highlight"
                />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
      <Modal isOpen={show}>
        <div className="modal-header">
          <h4>{project._id ? "Edit " : "Add "}Projects</h4>
          <button
            aria-label="Close"
            className="close"
            data-dismiss="modal"
            type="button"
            onClick={() => closeModal()}
          >
            <i className="tim-icons icon-simple-remove" />
          </button>
        </div>
        <div className="modal-body">
          <Form className="form-horizontal">
            <Row>
              <Label md="3">Project Name</Label>
              <Col md="9">
                <FormGroup>
                  <Input
                    type="text"
                    value={project.name}
                    onChange={(e) => {
                      setProject({ ...project, name: e.target.value });
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">Target</Label>
              <Col md="9">
                <FormGroup>
                  <Input
                    type="number"
                    value={project.fund_target}
                    onChange={(e) => {
                      setProject({ ...project, fund_target: e.target.value });
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">Pledged</Label>
              <Col md="9">
                <FormGroup>
                  <Input
                    type="number"
                    value={project.fund_raised}
                    onChange={(e) => {
                      setProject({ ...project, fund_raised: e.target.value });
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">End Date</Label>
              <Col md="9">
                <FormGroup>
                  <ReactDatetime
                    inputProps={{
                      className: "form-control",
                      placeholder: "Datetime Picker Here",
                    }}
                    value={{ _d: project.endDate }}
                    onChange={(date) => {
                      setProject({ ...project, endDate: date._d });
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row className="mt-1 mb-4">
              <Label md="3"></Label>
              <Col md="9">
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      defaultChecked={project.isActive}
                      onChange={() =>
                        setProject({ ...project, isActive: !project.isActive })
                      }
                    />
                    <span className="form-check-sign" />
                    IsActive
                  </Label>
                </FormGroup>
              </Col>
            </Row>
            <Row style={{ float: "right", marginRight: "2px" }}>
              <Button color="btn1 btn-sm" onClick={() => save(project)}>
                {project._id ? "Update" : "Save"}
              </Button>
              <Button color="btn1 btn-sm" onClick={() => closeModal()}>
                Cancel
              </Button>
            </Row>
          </Form>
        </div>
      </Modal>
      <Modal isOpen={show1}>
        <div className="modal-header">
          <h4>Are you sure you want to delete?</h4>
        </div>
        <div className="modal-body">
          <Row style={{ float: "right", marginRight: "2px" }}>
            <Button color="btn1 btn-sm" onClick={() => remove(project)}>
              Confirm
            </Button>
            <Button color="btn1 btn-sm" onClick={() => closeModal1()}>
              Cancel
            </Button>
          </Row>
        </div>
      </Modal>
    </>
  );
};

const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return { credential: LoginReducer };
};

export default connect(mapStateToProps)(Project);
