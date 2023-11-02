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
import Select from "react-select";
import NotificationAlert from "react-notification-alert";
import ReactTable from "components/ReactTable/ReactTable.js";
import { jsPDF } from "jspdf";
import wait from "./wait";
import html2canvas from "html2canvas";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

const AppUser = ({ credential }) => {
  const { apiConfig, ApiCall } = global;
  const notificationAlertRef = React.useRef(null);
  const [users, setUsers] = useState([]);
  const [preusers, setPreusers] = useState([]);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [user, setUser] = useState({});
  const [isExport, setIsExport] = useState(true);

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
    setUser(data);
    setShow(true);
  };

  const closeModal = () => {
    setUser({});
    setShow(false);
  };

  const openModal1 = (data) => {
    setUser(data);
    setShow1(true);
  };

  const closeModal1 = () => {
    setUser({});
    setShow1(false);
  };

  const save = async (pro) => {
    pro = { ...pro, app_user_id: pro.app_user_id.value };
    try {
      const response = await ApiCall(
        apiConfig.preappuser_upsert.url,
        apiConfig.preappuser_upsert.method,
        credential.loginToken,
        pro
      );
      if (response.data.result) {
        const resp = await ApiCall(
          apiConfig.preappuser_get.url,
          apiConfig.preappuser_get.method,
          credential.loginToken
        );
        if (resp.data.result) {
          setPreusers(resp.data.data);
        } else {
          notify(resp.data.message, "danger");
        }
      } else {
        notify(response.data.data, "danger");
      }
    } catch (error) {
      notify("Failed", "danger");
    }
    setUser({});
    setShow(false);
  };

  const remove = async (data) => {
    try {
      const response = await ApiCall(
        apiConfig.preappuser_del.url,
        apiConfig.preappuser_del.method,
        credential.loginToken,
        data
      );
      if (response.data.result) {
        const resp = await ApiCall(
          apiConfig.preappuser_get.url,
          apiConfig.preappuser_get.method,
          credential.loginToken
        );
        if (resp.data.result) {
          setPreusers(resp.data.data);
        } else {
          notify(resp.data.data, "danger");
        }
      } else {
        notify(response.data.data, "danger");
      }
    } catch (error) {
      if (error.response) notify(error.response.data.data, "danger");
      else if (error.request) notify("Request failed", "danger");
      else notify("Something went wrong", "danger");
    }
    setUser({});
    setShow1(false);
  };

  const getUserName = (_id) => {
    if (users.length === 0 || !users) return "";
    const tmp = users.filter((u) => u._id === _id);
    if (!tmp || tmp.length === 0) return "";
    return tmp[0].fullname || "";
  };

  const getUser = (_id) => {
    if (users.length === 0 || !users) return {};
    const tmp = users.filter((u) => u._id === _id);
    if (!tmp || tmp.length === 0) return {};
    return { value: tmp[0]._id, label: tmp[0].fullname };
  };

  const exportPDF = async () => {
    setIsExport(false);
    await wait(10);
    const pdf = new jsPDF("landscape", "pt", "a4");
    const data = await html2canvas(document.querySelector("#pdf"));
    setIsExport(true);
    const img = data.toDataURL("image/png");
    const imgProperties = pdf.getImageProperties(img);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
    pdf.addImage(img, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("preappuser.pdf");
  };

  const exportExcel = (d) => {
    const preappuserData = d.map((p) => ({
      "App user": p.username,
      Percentage: p.percentage,
    }));
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const wsPreappuser = XLSX.utils.json_to_sheet(preappuserData);
    const wb = {
      Sheets: { preappuser: wsPreappuser },
      SheetNames: ["preappuser"],
    };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "preappuser.xlsx");
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await ApiCall(
          apiConfig.appuser_get.url,
          apiConfig.appuser_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setUsers(response.data.data);
          console.log(response.data.data, "------users");
        } else {
          notify(response.data.data, "danger");
        }
      } catch (error) {
        notify("Failed", "danger");
      }
    })();
    (async () => {
      try {
        const response = await ApiCall(
          apiConfig.preappuser_get.url,
          apiConfig.preappuser_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setPreusers(response.data.data);
          console.log(preusers, "------preusers");
        } else {
          notify(response.data.data, "danger");
        }
      } catch (error) {
        notify("Failed", "danger");
      }
    })();
  }, []);

  let data = preusers.map((prop, key) => ({
    ...prop,
    app_user_id: getUser(prop.app_user_id),
    username: getUserName(prop.app_user_id),
    percentage: prop.percentage + "%",
    date: prop.year && prop.month ? prop.year + "-" + [prop.month] : "",
    createdAt: Moment(prop.createdAt).format("DD/MM/YYYY hh:mm:ss"),
    actions: (
      <div className="actions-right">
        <Button
          onClick={() =>
            openModal({ ...prop, app_user_id: getUser(prop.app_user_id) })
          }
          color="warning"
          size="sm"
          className={classNames("btn-icon btn-link like btn-neutral")}
          style={{ opacity: 0.7 }}
        >
          <i className="tim-icons icon-pencil" />
        </Button>
        <Button
          onClick={() => openModal1(prop)}
          color="danger"
          size="sm"
          className={classNames("btn-icon btn-link like btn-neutral")}
          style={{ opacity: 0.7 }}
        >
          <i className="tim-icons icon-trash-simple" />
        </Button>
      </div>
    ),
  }));

  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <div className="content">
        <Row>
          <Col xs={12} md={12}>
            <Card id="pdf">
              <CardHeader>
                <CardTitle tag="h3">
                  <span style={{ fontSize: "28px" }}>
                    <div className="flex-row" style={{ marginLeft: 20 }}>
                      Preferred App Users
                      <div style={{ float: "right" }}>
                        {isExport && (
                          <>
                            <span
                              style={{
                                cursor: "pointer",
                                fontSize: 16,
                                color: "rgba(34, 42, 66, 0.7)",
                              }}
                              onClick={() => exportPDF()}
                            >
                              PDF
                            </span>
                            <span
                              style={{
                                marginLeft: 20,
                                cursor: "pointer",
                                fontSize: 16,
                                color: "rgba(34, 42, 66, 0.7)",
                              }}
                              onClick={() => exportExcel(data)}
                            >
                              Excel
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <p>
                  This is only additional percentage, preferred user have
                  already been sent their share from 50% profit share.
                </p>
                <ReactTable
                  data={data}
                  isExport={isExport}
                  filterable
                  resizable={false}
                  columns={
                    isExport
                      ? [
                          {
                            Header: "App user",
                            accessor: "username",
                          },
                          {
                            Header: "Date",
                            accessor: "date",
                          },
                          {
                            Header: "Percentage",
                            accessor: "percentage",
                          },
                          // {
                          //   Header: "CreatedAt",
                          //   accessor: "createdAt",
                          // },
                          {
                            Header: "Actions",
                            accessor: "actions",
                            sortable: false,
                            filterable: false,
                          },
                        ]
                      : [
                          {
                            Header: "App user",
                            accessor: "username",
                          },
                          {
                            Header: "Date",
                            accessor: "date",
                          },
                          {
                            Header: "Percentage",
                            accessor: "percentage",
                          },
                        ]
                  }
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
      <Modal isOpen={show} style={{ transform: "translate(0, 10%)" }}>
        <div className="modal-header">
          <h4>{user._id ? "Edit " : "Add "}User</h4>
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
            <Row className="mt-1 mb-4">
              <Label md="3">App User</Label>
              <Col md="9">
                <FormGroup>
                  <FormGroup>
                    <Select
                      className="react-select info"
                      classNamePrefix="react-select"
                      name="app_user_id"
                      value={user.app_user_id}
                      onChange={(value) =>
                        setUser({ ...user, app_user_id: value })
                      }
                      options={users.map((one) => ({
                        value: one._id,
                        label: one.fullname,
                      }))}
                    />
                  </FormGroup>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">Year</Label>
              <Col md="9">
                <FormGroup>
                  <div className="cccc">
                    <Input
                      id="year"
                      type="number"
                      value={user.year}
                      onChange={(e) => {
                        setUser({ ...user, year: e.target.value });
                      }}
                    />
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">Month</Label>
              <Col md="9">
                <FormGroup>
                  <div className="cccc">
                    <Input
                      id="month"
                      type="number"
                      value={user.month}
                      onChange={(e) => {
                        setUser({ ...user, month: e.target.value });
                      }}
                    />
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">Percentage</Label>
              <Col md="9">
                <FormGroup>
                  <div className="cccc">
                    <Input
                      id="currency"
                      type="number"
                      value={user.percentage}
                      onChange={(e) => {
                        setUser({ ...user, percentage: e.target.value });
                      }}
                    />
                    <span className="currency">$</span>
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row style={{ float: "right", marginRight: "2px" }}>
              <Button color="btn1 btn-sm" onClick={() => save(user)}>
                {user._id ? "Update" : "Save"}
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
            <Button color="btn1 btn-sm" onClick={() => remove(user)}>
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

export default connect(mapStateToProps)(AppUser);
