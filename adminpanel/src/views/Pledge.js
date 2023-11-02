import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
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
} from "reactstrap";
import Moment from "moment";
import Select from "react-select";
import NotificationAlert from "react-notification-alert";
import ReactTable from "components/ReactTable/ReactTable1.js";
import { jsPDF } from "jspdf";
import wait from "./wait";
import html2canvas from "html2canvas";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

const Pledge = ({ credential }) => {
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [pledges, setPledges] = useState([]);
  const [pledge, setPledge] = useState({});
  const [isExport, setIsExport] = useState(true);

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
    if (data.investor)
      setPledge({
        ...data,
        investor: { value: data.investor_id, label: data.investor.fullname },
      });
    else setPledge({});
    setShow(true);
  };

  const closeModal = () => {
    setPledge({});
    setShow(false);
  };

  const openModal1 = (data) => {
    setPledge(data);
    setShow1(true);
  };

  const closeModal1 = () => {
    setPledge({});
    setShow1(false);
  };

  const save = async (plee) => {
    plee = { ...plee, investor_id: plee.investor.value };
    delete plee.investor;
    delete plee.referrer;
    try {
      const response = await ApiCall(
        apiConfig.pledge_upsert.url,
        apiConfig.pledge_upsert.method,
        credential.loginToken,
        plee
      );
      if (response.data.result) {
        const response = await ApiCall(
          apiConfig.pledge_get.url,
          apiConfig.pledge_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setPledges(
            response.data.data.map((p) => {
              const invs = investors.filter((i) => p.investor_id === i._id);
              const refs = investors.filter((r) => p.referrer_id === r._id);
              return {
                ...p,
                investor: invs.length > 0 ? invs[0] : {},
                referrer: refs.length > 0 ? refs[0] : {},
              };
            })
          );
        } else {
          notify(response.data.data, "danger");
        }
      } else {
        notify(response.data.data, "danger");
      }
    } catch (error) {
      notify("Failed", "danger");
    }
    setPledge({});
    setShow(false);
  };

  const remove = async (data) => {
    try {
      const response = await ApiCall(
        apiConfig.pledge_del.url,
        apiConfig.pledge_del.method,
        credential.loginToken,
        data
      );
      if (response.data.result) {
        const response = await ApiCall(
          apiConfig.pledge_get.url,
          apiConfig.pledge_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setPledges(
            response.data.data.map((p) => {
              const invs = investors.filter((i) => p.investor_id === i._id);
              const refs = investors.filter((r) => p.referrer_id === r._id);
              return {
                ...p,
                investor: invs.length > 0 ? invs[0] : {},
                referrer: refs.length > 0 ? refs[0] : {},
              };
            })
          );
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
    setPledge({});
    setShow1(false);
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
    pdf.save("pledge.pdf");
  };

  const exportExcel = (d) => {
    const pledgeData = d.map((p) => ({
      Investor: p.investor.fullname,
      Referrer: p.referrer.fullname,
      Amount: p.amount,
      TXID: p.transaction,
      Status: p.status,
      Approved: p.approved,
    }));
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const wsPledge = XLSX.utils.json_to_sheet(pledgeData);
    const wb = {
      Sheets: { pledge: wsPledge },
      SheetNames: ["pledge"],
    };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "pledge.xlsx");
  };

  const [investors, setInvestors] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await ApiCall(
          apiConfig.appuser_get.url,
          apiConfig.appuser_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          const invests = response.data.data;
          setInvestors(invests);
          const resp = await ApiCall(
            apiConfig.pledge_get.url,
            apiConfig.pledge_get.method,
            credential.loginToken
          );
          if (resp.data.result) {
            setPledges(
              resp.data.data.map((p) => {
                const invs = invests.filter((i) => p.investor_id === i._id);
                const refs = invests.filter((r) => p.referrer_id === r._id);
                return {
                  ...p,
                  investor: invs.length > 0 ? invs[0] : {},
                  referrer: refs.length > 0 ? refs[0] : {},
                };
              })
            );
          } else {
            notify(response.data.data, "danger");
          }
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
    var data = pledges.map((prop, key) => {
      return {
        ...prop,
        createdAt: Moment(prop.createdAt).format("DD/MM/YYYY hh:mm:ss"),
        amount: prop.amount + "$",
        status: prop.transaction ? (
          <span style={{ color: "green" }}>Received</span>
        ) : (
          <span style={{ color: "red" }}>Pledged</span>
        ),
        approved:
          prop.status === 0 ? (
            <span style={{ color: "yello" }}>
              <span>Pending</span>
              <span style={{ marginLeft: 14 }}>
                <i className="tim-icons icon-simple-delete" />
              </span>
            </span>
          ) : prop.status === 1 ? (
            <span style={{ color: "green" }}>
              <span>Approved</span>
              <span style={{ marginLeft: 5 }}>
                <i className="tim-icons icon-check-2" />
              </span>
            </span>
          ) : (
            <span style={{ color: "red" }}>
              <span>Rejected</span>
              <span style={{ marginLeft: 10 }}>
                <i className="tim-icons icon-simple-remove" />
              </span>
            </span>
          ),
        actions: (
          <div className="actions-right">
            <Button
              onClick={() => openModal(prop)}
              color="warning"
              size="sm"
              className={classNames("btn-icon btn-link like btn-neutral")}
              style={{ opacity: 0.7 }}
            >
              <i className="tim-icons icon-pencil" />
            </Button>
            <Button
              onClick={() => openModal1(prop)}
              color="warning"
              size="sm"
              className={classNames("btn-icon btn-link like btn-neutral")}
              style={{ opacity: 0.7 }}
            >
              <i className="tim-icons icon-trash-simple" />
            </Button>
          </div>
        ),
      };
    });
    setData(data);
  }, [pledges]);

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
                      Pledges
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
                <ReactTable
                  data={data}
                  isExport={isExport}
                  filterable
                  resizable={false}
                  columns={
                    !isExport
                      ? [
                          {
                            Header: "Investor",
                            accessor: "investor.fullname",
                          },
                          {
                            Header: "Referrer",
                            accessor: "referrer.fullname",
                          },
                          {
                            Header: "Amount",
                            accessor: "amount",
                          },
                          {
                            Header: "TXID",
                            accessor: "transaction",
                          },
                          {
                            Header: "Status",
                            accessor: "status",
                          },
                          {
                            Header: "Approved",
                            accessor: "approved",
                          },
                        ]
                      : [
                          {
                            Header: "Investor",
                            accessor: "investor.fullname",
                          },
                          {
                            Header: "Referrer",
                            accessor: "referrer.fullname",
                          },
                          {
                            Header: "Amount",
                            accessor: "amount",
                          },
                          {
                            Header: "TXID",
                            accessor: "transaction",
                          },
                          {
                            Header: "Status",
                            accessor: "status",
                          },
                          {
                            Header: "Approved",
                            accessor: "approved",
                          },
                          {
                            Header: "Actions",
                            accessor: "actions",
                            sortable: false,
                            filterable: false,
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
      <Modal isOpen={show}>
        <div className="modal-header">
          <h4>{pledge._id ? "Edit " : "Add "}Pledges</h4>
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
              <Label md="3">Investor</Label>
              <Col md="9">
                <FormGroup>
                  <Select
                    className="react-select info"
                    classNamePrefix="react-select"
                    name="investor"
                    value={pledge.investor}
                    onChange={(value) =>
                      setPledge({ ...pledge, investor: value })
                    }
                    options={investors.map((one) => ({
                      value: one._id,
                      label: one.fullname,
                    }))}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">Amount</Label>
              <Col md="9">
                <FormGroup>
                  <div className="cccc">
                    <Input
                      id="currency"
                      type="number"
                      fullWidth
                      style={{ color: "rgb(112 114 118)" }}
                      value={pledge.amount}
                      onChange={(e) =>
                        setPledge({ ...pledge, amount: e.target.value })
                      }
                    />
                    <span className="currency">$</span>
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">TXID</Label>
              <Col md="9">
                <FormGroup>
                  <Input
                    type="text"
                    style={{ color: "rgb(112 114 118)" }}
                    value={pledge.transaction}
                    onChange={(e) =>
                      setPledge({ ...pledge, transaction: e.target.value })
                    }
                  />
                </FormGroup>
              </Col>
            </Row>
            {/* <Row>
              <Label md="3">Referrer</Label>
              <Col md="9">
                <FormGroup>
                  <Input
                    type="text"
                    style={{ color: "#dcdfe9" }}
                    value={pledge.referrer_id}
                    onChange={(e) =>
                      setPledge({
                        ...pledge,
                        referrer_id: e.target.value,
                      })
                    }
                  />
                </FormGroup>
              </Col>
            </Row> */}
            <Row className="mt-1 mb-4">
              <Label md="3">Status</Label>
              <Col md="9">
                <FormGroup check className="form-check-radio">
                  <Label check>
                    <Input
                      id="pending"
                      name="pending"
                      type="radio"
                      checked={pledge.status === 0}
                      onChange={() => setPledge({ ...pledge, status: 0 })}
                    />
                    <span className="form-check-sign" />
                    Pending
                  </Label>
                  <Label style={{ marginLeft: "15px" }} check>
                    <Input
                      id="approved"
                      name="approved"
                      type="radio"
                      checked={pledge.status === 1}
                      onChange={() => setPledge({ ...pledge, status: 1 })}
                    />
                    <span className="form-check-sign" />
                    Approved
                  </Label>
                  <Label style={{ marginLeft: "15px" }} check>
                    <Input
                      id="finished"
                      name="finished"
                      type="radio"
                      checked={pledge.status === 2}
                      onChange={() => setPledge({ ...pledge, status: 2 })}
                    />
                    <span className="form-check-sign" />
                    Rejected
                  </Label>
                </FormGroup>
              </Col>
            </Row>
            <Row style={{ float: "right", marginRight: "2px" }}>
              <Button color="btn1 btn-sm" onClick={() => save(pledge)}>
                {pledge._id ? "Update" : "Save"}
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
            <Button color="btn1 btn-sm" onClick={() => remove(pledge)}>
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

// export default Pledge;
const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return { credential: LoginReducer };
};

export default connect(mapStateToProps)(Pledge);
