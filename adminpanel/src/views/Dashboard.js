import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Line, Bar, Pie } from "react-chartjs-2";
import NotificationAlert from "react-notification-alert";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
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
import { jsPDF } from "jspdf";
import wait from "./wait";
import html2canvas from "html2canvas";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

const Dashboard = ({ credential }) => {
  const { apiConfig, ApiCall } = global;
  const notificationAlertRef = React.useRef(null);
  const [data, setData] = useState({});
  const [profits, setProfits] = useState([]);
  const [show, setShow] = useState(false);
  const [project, setProject] = useState({});
  const [isExport, setIsExport] = useState(true);

  let total_investor_payouts = 0;
  let total_referral_payouts = 0;
  profits.map((p) => {
    if (p.investor_payouts) total_investor_payouts += p.investor_payouts;
    if (p.referral_payouts) total_referral_payouts += p.referral_payouts;
  });

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

  useEffect(() => {
    (async () => {
      try {
        const response = await ApiCall(
          apiConfig.dashboard.url,
          apiConfig.dashboard.method,
          credential.loginToken
        );
        if (response.data.result) {
          setData(response.data.data);
        } else {
          notify(response.data.data, "danger");
        }
      } catch (error) {
        notify("Failed", "danger");
      }
    })();
  }, []);

  const barChartData = {
    data: (canvas) => {
      let ctx = canvas.getContext("2d");

      let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);

      gradientStroke.addColorStop(1, "rgba(72,72,176,0.1)");
      gradientStroke.addColorStop(0.4, "rgba(72,72,176,0.0)");
      gradientStroke.addColorStop(0, "rgba(119,52,169,0)"); //purple colors

      return {
        labels: profits.map((p) => p.year + "-" + p.month),
        datasets: [
          {
            label: `Profits $${total_investor_payouts}`,
            fill: true,
            backgroundColor: "#f36648",
            hoverBackgroundColor: "#f36648",
            borderColor: "#f36648",
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            data: profits.map((p) => p.investor_payouts || 0),
          },
          {
            label: `Commissions $${total_referral_payouts}`,
            fill: true,
            backgroundColor: "#7a48f3",
            hoverBackgroundColor: "#7a48f3",
            borderColor: "#7a48f3",
            borderWidth: 2,
            borderDash: [],
            borderDashOffset: 0.0,
            data: profits.map((p) => p.referral_payouts || 0),
          },
        ],
      };
    },
    options: {
      maintainAspectRatio: false,
      legend: {
        display: true,
      },
      tooltips: {
        backgroundColor: "#f5f5f5",
        titleFontColor: "#333",
        bodyFontColor: "#666",
        bodySpacing: 4,
        xPadding: 1,
        mode: "nearest",
        intersect: 0,
        position: "nearest",
      },
      responsive: true,
      scales: {
        yAxes: [
          {
            gridLines: {
              drawBorder: false,
              color: "rgba(225,78,202,0.1)",
              zeroLineColor: "transparent",
            },
            ticks: {
              suggestedMin: 60,
              // suggestedMax: 120,
              padding: 20,
              fontColor: "#9e9e9e",
            },
          },
        ],
        xAxes: [
          {
            gridLines: {
              drawBorder: false,
              color: "rgba(225,78,202,0.1)",
              zeroLineColor: "transparent",
            },
            ticks: {
              padding: 20,
              fontColor: "#9e9e9e",
            },
          },
        ],
      },
    },
  };

  const chartData = {
    data: {
      labels: ["Pledged amount", ""],
      datasets: [
        {
          label: "Emails",
          pointRadius: 0,
          pointHoverRadius: 0,
          backgroundColor: ["#2a84e9", "#c7bfbf"],
          borderWidth: 0,
          data: [],
        },
      ],
    },
    options: {
      cutoutPercentage: 70,
      legend: {
        display: false,
      },
      tooltips: {
        backgroundColor: "#f5f5f5",
        titleFontColor: "#333",
        bodyFontColor: "#666",
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest",
      },
      scales: {
        yAxes: [
          {
            display: 0,
            ticks: {
              display: false,
            },
            gridLines: {
              drawBorder: false,
              zeroLineColor: "transparent",
              color: "rgba(255,255,255,0.05)",
            },
          },
        ],
        xAxes: [
          {
            display: 0,
            barPercentage: 1.6,
            gridLines: {
              drawBorder: false,
              color: "rgba(255,255,255,0.1)",
              zeroLineColor: "transparent",
            },
            ticks: {
              display: false,
            },
          },
        ],
      },
    },
  };

  const chartData1 = {
    data: {
      labels: ["Confirmed amount", ""],
      datasets: [
        {
          label: "Emails",
          pointRadius: 0,
          pointHoverRadius: 0,
          backgroundColor: ["#2a84e9", "#c7bfbf"],
          borderWidth: 0,
          data: [],
        },
      ],
    },
    options: {
      cutoutPercentage: 70,
      legend: {
        display: false,
      },
      tooltips: {
        backgroundColor: "#f5f5f5",
        titleFontColor: "#333",
        bodyFontColor: "#666",
        bodySpacing: 4,
        xPadding: 12,
        mode: "nearest",
        intersect: 0,
        position: "nearest",
      },
      scales: {
        yAxes: [
          {
            display: 0,
            ticks: {
              display: false,
            },
            gridLines: {
              drawBorder: false,
              zeroLineColor: "transparent",
              color: "rgba(255,255,255,0.05)",
            },
          },
        ],
        xAxes: [
          {
            display: 0,
            barPercentage: 1.6,
            gridLines: {
              drawBorder: false,
              color: "rgba(255,255,255,0.1)",
              zeroLineColor: "transparent",
            },
            ticks: {
              display: false,
            },
          },
        ],
      },
    },
  };

  const closeModal = () => {
    setShow(false);
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
        window.location.reload();
      } else {
        notify(response.data.data, "danger");
      }
    } catch (error) {
      notify("Failed", "danger");
    }
    setProject({});
    setShow(false);
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
    pdf.save("dashboard.pdf");
  };

  const exportExcel = (d) => {
    const excelData = [
      {
        "Registerd App Users": d.app_users,
        "Pledges (no.)": d.pledges_num,
        "Rescue Members": d.active_users,
        "TXID Submitted (no.)": d.received_num,
        "Pledges ($)": "$" + d.pledges_total,
        "Active Users": "$" + d.received_total,
        "Target Amount": "$" + d.fund_target,
        "Pledged amount": "$" + d.fund_raised,
        "Pledged Percentage":
          Math.round((d.fund_raised / d.fund_target) * 100) + "%",
      },
    ];
    const profitData = profits.map((p) => ({
      "Profit Name": p.year + "-" + p.month,
      Percentage: p.percentage + "%",
      "Investor Payouts": "$" + p.investor_payouts,
      "Referral Payouts": "$" + p.referral_payouts,
      "Additional Payouts": "$" + p.additional_payouts,
      CreatedAt: Moment(p.createdAt).format("DD/MM/YYYY hh:mm:ss"),
    }));
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const wsDash = XLSX.utils.json_to_sheet(excelData);
    const wsProfit = XLSX.utils.json_to_sheet(profitData);
    const wb = {
      Sheets: { dashboard: wsDash, profit: wsProfit },
      SheetNames: ["dashboard", "profit"],
    };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "dashboard.xlsx");
  };

  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <div className="content" id="pdf">       
        <Row>
          <Col lg="12">
            <Row>
              <Col lg="4" md="6">
                <Card className="card-stats">
                  <CardBody>
                    <Row>
                      <Col xs="5">
                        <div className="info-icon text-center icon-success">
                          <i className="tim-icons icon-single-02" />
                        </div>
                      </Col>
                      <Col xs="7">
                        <div className="numbers">
                          <p className="card-category">Registerd App Users</p>
                          <CardTitle tag="h3">{data?.num_users}</CardTitle>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter>
                    <hr />
                    <div className="stats">
                      <i className="tim-icons icon-single-02" />
                      Registerd App Users
                    </div>
                  </CardFooter>
                </Card>
              </Col>
              <Col lg="4" md="6">
                <Card className="card-stats">
                  <CardBody>
                    <Row>
                      <Col xs="5">
                        <div className="info-icon text-center icon-primary">
                          <i className="tim-icons icon-coins" />
                        </div>
                      </Col>
                      <Col xs="7">
                        <div className="numbers">
                          <p className="card-category">Rescue Teams</p>
                          <CardTitle tag="h3">{data?.num_categories}</CardTitle>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter>
                    <hr />
                    <div className="stats">
                      <i className="tim-icons icon-coins" />Rescue Teams
                    </div>
                  </CardFooter>
                </Card>
              </Col>
              <Col lg="4" md="6">
                <Card className="card-stats">
                  <CardBody>
                    <Row>
                      <Col xs="5">
                        <div className="info-icon text-center icon-warning">
                          <i className="tim-icons icon-app" />
                        </div>
                      </Col>
                      <Col xs="7">
                        <div className="numbers">
                          <p className="card-category">Rescue Members</p>
                          <CardTitle tag="h3">{data?.num_emrs}</CardTitle>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter>
                    <hr />
                    <div className="stats">
                      <i className="tim-icons icon-app" /> Rescue Members
                    </div>
                  </CardFooter>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col lg="4" md="6">
                <Card className="card-stats">
                  <CardBody>
                    <Row>
                      <Col xs="5">
                        <div className="info-icon text-center icon-danger">
                          <i className="tim-icons icon-money-coins" />
                        </div>
                      </Col>
                      <Col xs="7">
                        <div className="numbers">
                          <p className="card-category">Total Calls </p>
                          <CardTitle tag="h3">{data?.num_calls}</CardTitle>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter>
                    <hr />
                    <div className="stats">
                      <i className="tim-icons icon-money-coins" /> Total Calls
                      Submitted (no.)
                    </div>
                  </CardFooter>
                </Card>
              </Col>
              <Col lg="4" md="6">
                <Card className="card-stats">
                  <CardBody>
                    <Row>
                      <Col xs="5">
                        <div className="info-icon text-center icon-danger">
                          <i className="tim-icons icon-money-coins" />
                        </div>
                      </Col>
                      <Col xs="7">
                        <div className="numbers">
                          <p className="card-category">Calls in progress</p>
                          <CardTitle tag="h3">{data?.num_calls_inprogress}</CardTitle>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter>
                    <hr />
                    <div className="stats">
                      <i className="tim-icons icon-money-coins" /> Calls in progress
                    </div>
                  </CardFooter>
                </Card>
              </Col>
              <Col lg="4" md="6">
                <Card className="card-stats">
                  <CardBody>
                    <Row>
                      <Col xs="5">
                        <div className="info-icon text-center icon-danger">
                          <i className="tim-icons icon-money-coins" />
                        </div>
                      </Col>
                      <Col xs="7">
                        <div className="numbers">
                          <p className="card-category">Calls Ended</p>
                          <CardTitle tag="h3">{data?.num_calls_ended}</CardTitle>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                  <CardFooter>
                    <hr />
                    <div className="stats">
                      <i className="tim-icons icon-money-coins" />
                      Calls Ended
                    </div>
                  </CardFooter>
                </Card>
              </Col>
            </Row>        
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
            {/* <Row>
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
            </Row> */}
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
            {/* <Row>
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
            </Row> */}
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
    </>
  );
};

const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return { credential: LoginReducer };
};

export default connect(mapStateToProps)(Dashboard);
