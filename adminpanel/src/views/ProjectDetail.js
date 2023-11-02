import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardBody, CardHeader, CardTitle, Row, Col } from "reactstrap";
import { connect } from "react-redux";
import Moment from "moment";
import NotificationAlert from "react-notification-alert";
import ReactTable from "components/ReactTable/ReactTable2.js";
import { Pie } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import wait from "./wait";
import html2canvas from "html2canvas";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

const ProjectDetail = ({ credential }) => {
  const { id } = useParams();
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

  const [project, setProject] = useState({});
  const [pledges, setPledges] = useState([]);
  const [profits, setProfits] = useState([]);
  const [users, setUsers] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [isExport, setIsExport] = useState(true);
  const [data, setData] = useState({});

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
    (async () => {
      try {
        const response = await ApiCall(
          apiConfig.pro_get.url,
          apiConfig.pro_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setProject(response.data.data);
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
          apiConfig.appuser_get.url,
          apiConfig.appuser_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setUsers(response.data.data);
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
                  status: p.transaction ? (
                    <span style={{ color: "green" }}>Received</span>
                  ) : (
                    <span style={{ color: "red" }}>Pledged</span>
                  ),
                  approved:
                    p.status === 0 ? (
                      <span style={{ color: "yello" }}>
                        <span>Pending</span>
                        <span style={{ marginLeft: 14 }}>
                          <i className="tim-icons icon-simple-delete" />
                        </span>
                      </span>
                    ) : p.status === 1 ? (
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
                  investor: invs.length > 0 ? invs[0] : {},
                  referrer: refs.length > 0 ? refs[0] : {},
                  amount: p.amount + "$",
                  dateStr: Moment(p.createdAt).format("DD/MM/YYYY hh:mm:ss"),
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
    (async () => {
      try {
        const response = await ApiCall(
          apiConfig.profit_get.url,
          apiConfig.profit_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setProfits(
            response.data.data.map((p) => {
              return {
                ...p,
                percentage: p.percentage + "%",
                createdAt: Moment(p.createdAt).format("DD/MM/YYYY hh:mm:ss"),
              };
            })
          );
        } else {
          notify(response.data.data, "danger");
        }
      } catch (error) {
        notify("Failed", "danger");
      }
    })();
  }, []);

  const chartData = {
    data: {
      labels: ["Target amount", "Pledged amount"],
      datasets: [
        {
          label: "Emails",
          pointRadius: 0,
          pointHoverRadius: 0,
          backgroundColor: ["#ff8779", "#2a84e9"],
          borderWidth: 0,
          data: [project.fund_target, project.fund_raised],
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

  const getUserName = (_id) => {
    if (users.length === 0 || !users) return "";
    const tmp = users.filter((u) => u._id === _id);
    if (!tmp || tmp.length === 0) return "";
    return tmp[0].fullname || "";
  };

  const exportPDF = async () => {
    setIsExport(false);
    await wait(10);
    // const pdf = new jsPDF("portrait", "pt", "a4");
    const pdf = new jsPDF("landscape", "pt", "a4");
    const data = await html2canvas(document.querySelector("#pdf"));
    setIsExport(true);
    const img = data.toDataURL("image/png");
    const imgProperties = pdf.getImageProperties(img);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
    pdf.addImage(img, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("project_detail.pdf");
  };

  const exportExcel = (pledges, profits) => {
    const pledgeData = pledges.map((p) => ({
      Investor: getUserName(p.investor_id),
      Referrer: getUserName(p.referrer_id),
      Amount: p.amount,
      CreatedAt: Moment(p.createdAt).format("DD/MM/YYYY hh:mm:ss"),
    }));
    const profitData = profits.map((p) => ({
      Name: p.name,
      Percentage: p.percentage,
      CreatedAt: Moment(p.createdAt).format("DD/MM/YYYY hh:mm:ss"),
    }));
    console.log(pledgeData, profitData, "+++");
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const wsPledge = XLSX.utils.json_to_sheet(pledgeData);
    const wsProfit = XLSX.utils.json_to_sheet(profitData);
    const wb = {
      Sheets: { pledge: wsPledge, profit: wsProfit },
      SheetNames: ["pledge", "profit"],
    };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "project_detail.xlsx");
  };

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
                  <div className="flex-row">
                    {project.name}
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
                            onClick={() => exportExcel(pledges, profits)}
                          >
                            Excel
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row style={{ marginLeft: 0 }}>
                  <Col md="8" lg="9" sm="7">
                    <Row>
                      <h4>{`Target Amount: ${project.fund_target} $`} </h4>
                    </Row>
                    <Row>
                      <h4>{`Pledged Amount: ${project.fund_raised} $`} </h4>
                    </Row>
                    <Row>
                      <h4>{`Pledges Number: ${data.pledges_num}`}</h4>
                    </Row>
                    <Row>
                      <h4>{`Pledges Total: ${data.pledges_total} $`}</h4>
                    </Row>
                    <Row>
                      <h4>{`Received Number: ${data.received_num}`}</h4>
                    </Row>
                    <Row>
                      <h4>{`Received Total: ${data.received_total} $`}</h4>
                    </Row>
                  </Col>
                  <Col md="4" lg="3" sm="5">
                    <div className="chart-area">
                      <Pie data={chartData.data} options={chartData.options} />
                    </div>
                  </Col>
                </Row>
                <div style={{ marginTop: 20 }}>
                  <ReactTable
                    data={pledges}
                    filterable
                    title="Pledges"
                    isExport={isExport}
                    resizable={false}
                    columns={[
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
                      // {
                      //   Header: "Date",
                      //   accessor: "dateStr",
                      // },
                    ]}
                    defaultPageSize={10}
                    showPaginationTop
                    showPaginationBottom={false}
                    className="-striped -highlight"
                  />
                </div>
                <div style={{ marginTop: 20 }}>
                  <ReactTable
                    data={profits}
                    isProfit={true}
                    isExport={isExport}
                    title="Profits"
                    filterable
                    resizable={false}
                    columns={[
                      {
                        Header: "Name",
                        accessor: "name",
                      },
                      {
                        Header: "Percentage",
                        accessor: "percentage",
                      },
                      {
                        Header: "Investor Payouts",
                        accessor: "investor_payouts",
                      },
                      {
                        Header: "Referral Payouts",
                        accessor: "referral_payouts",
                      },
                      // {
                      //   Header: "CreatedAt",
                      //   accessor: "createdAt",
                      // },
                    ]}
                    defaultPageSize={10}
                    showPaginationTop
                    showPaginationBottom={false}
                    className="-striped -highlight"
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

// export default ProjectDetail;
const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return { credential: LoginReducer };
};

export default connect(mapStateToProps)(ProjectDetail);
