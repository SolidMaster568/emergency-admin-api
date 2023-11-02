import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Row,
  Col,
  Button,
} from "reactstrap";
import { connect } from "react-redux";
import NotificationAlert from "react-notification-alert";
import ReactTable from "components/ReactTable/ReactTable2.js";
import Moment from "moment";
import { Pie } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import wait from "./wait";
import html2canvas from "html2canvas";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

const ProfitDetail = ({ credential }) => {
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
  const [users, setUsers] = useState([]);
  const [profitInfo, setProfitInfo] = useState([]);
  const [profit, setProfit] = useState({});
  const [isExport, setIsExport] = useState(true);

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
          const resp = await ApiCall(
            apiConfig.profit_info.url,
            apiConfig.profit_info.method,
            credential.loginToken,
            { profit_id: id }
          );
          if (resp.data.result) {
            const users = response.data.data;
            setProfitInfo({
              additional_payouts: resp.data.data.additional_payouts.map(
                (i) => ({
                  ...i,
                  user: users.filter((u) => u._id === i.app_user_id)[0] || {},
                  percentage: i.percentage + "%",
                  base_amount: i.base_amount + "$",
                  amount: i.amount + "$",
                })
              ),
              investor_payouts: resp.data.data.investor_payouts.map((i) => ({
                ...i,
                user: users.filter((u) => u._id === i.app_user_id)[0] || {},
                percentage: i.percentage + "%",
                base_amount: i.base_amount + "$",
                amount: i.amount + "$",
              })),
              referral_payouts: resp.data.data.referral_payouts.map((i) => ({
                ...i,
                user: users.filter((u) => u._id === i.app_user_id)[0] || {},
                percentage: i.percentage + "%",
                base_amount: i.base_amount + "$",
                amount: i.amount + "$",
              })),
            });
          } else {
            notify(resp.data.message, "danger");
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
          setProfit(response.data.data.filter((i) => i._id === id)[0] || {});
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
      labels: ["Investor Payouts", "Referral Payouts"],
      datasets: [
        {
          label: "Emails",
          pointRadius: 0,
          pointHoverRadius: 0,
          backgroundColor: ["#ff8779", "#2a84e9"],
          borderWidth: 0,
          data: [profit.investor_payouts, profit.referral_payouts],
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
    pdf.save("profit_detail.pdf");
  };

  const exportExcel = (profitInfo) => {
    const tmp = [];
    profitInfo.investor_payouts.map((p) => tmp.push(p));
    profitInfo.referral_payouts.map((p) => tmp.push(p));
    const profits = tmp.map((p) => ({
      "Profit Name": p.year + "-" + p.month,
      Type: p.type === 1 ? "Investor" : "Referrer",
      Investor: getUserName(p.app_user_id),
      "Base Amount": p.base_amount,
      Percentage: p.percentage,
      Amount: p.Amount,
      CreatedAt: Moment(p.createdAt).format("DD/MM/YYYY hh:mm:ss"),
    }));
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const wsProfit = XLSX.utils.json_to_sheet(profits);
    const wb = {
      Sheets: { profit: wsProfit },
      SheetNames: ["profit"],
    };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "profit_detail.xlsx");
  };

  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <div className="content">
        <Button
          color="btn1 btn-sm mb-3"
          onClick={() => {
            window.location.href = "/admin/profit";
          }}
        >
          Go back
        </Button>

        <Row>
          <Col xs={12} md={12}>
            <Card id="pdf">
              <CardHeader>
                <CardTitle>
                  <span style={{ fontSize: "28px" }}>
                    <div className="flex-row" style={{ marginLeft: 20 }}>
                      {profit.name}
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
                              onClick={() => exportExcel(profitInfo)}
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
                <Row style={{ marginLeft: 5 }}>
                  <Col md="8" lg="9" sm="7">
                    <Row style={{ marginTop: 40 }}>
                      <h4>Investor Payouts: </h4>
                      <h4 style={{ marginLeft: 5 }}>
                        {profit.investor_payouts}$
                      </h4>
                    </Row>
                    <Row>
                      <h4>Referral Payouts:</h4>
                      <h4 style={{ marginLeft: 5 }}>
                        {profit.referral_payouts}$
                      </h4>
                    </Row>
                    <Row>
                      <h4>Preferred User Payouts:</h4>
                      <h4 style={{ marginLeft: 5 }}>
                        {profit.additional_payouts}$
                      </h4>
                    </Row>
                  </Col>
                  <Col md="4" lg="3" sm="5">
                    <div className="chart-area">
                      <Pie data={chartData.data} options={chartData.options} />
                    </div>
                  </Col>
                </Row>
                {profitInfo.investor_payouts && (
                  <div style={{ marginTop: "20px" }}>
                    <ReactTable
                      data={profitInfo.investor_payouts.map((p) => ({
                        ...p,
                        profit_name: p.year + "-" + p.month,
                      }))}
                      title="Investor Payouts"
                      isProfit={true}
                      isExport={isExport}
                      filterable
                      resizable={false}
                      columns={[
                        {
                          Header: "Profit Name",
                          accessor: "profit_name",
                        },
                        {
                          Header: "Investor",
                          accessor: "user.fullname",
                        },
                        {
                          Header: "Base Amount",
                          accessor: "base_amount",
                        },
                        {
                          Header: "Percentage",
                          accessor: "percentage",
                        },
                        {
                          Header: "Amount",
                          accessor: "amount",
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
                )}
                {profitInfo.referral_payouts && (
                  <div style={{ marginTop: "20px" }}>
                    <ReactTable
                      data={profitInfo.referral_payouts.map((p) => ({
                        ...p,
                        profit_name: p.year + "-" + p.month,
                      }))}
                      isProfit={true}
                      profitType={2}
                      title="Referral Payouts"
                      isExport={isExport}
                      filterable
                      resizable={false}
                      columns={[
                        {
                          Header: "Profit Name",
                          accessor: "profit_name",
                        },
                        {
                          Header: "Referrer",
                          accessor: "user.fullname",
                        },
                        {
                          Header: "Base Amount",
                          accessor: "base_amount",
                        },
                        {
                          Header: "Percentage",
                          accessor: "percentage",
                        },
                        {
                          Header: "Amount",
                          accessor: "amount",
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
                )}
                {profitInfo.additional_payouts && (
                  <div style={{ marginTop: "20px" }}>
                    <ReactTable
                      data={profitInfo.additional_payouts.map((p) => ({
                        ...p,
                        profit_name: p.year + "-" + p.month,
                      }))}
                      title="Preferred User Payouts"
                      isProfit={true}
                      isExport={isExport}
                      filterable
                      resizable={false}
                      columns={[
                        {
                          Header: "Profit Name",
                          accessor: "profit_name",
                        },
                        {
                          Header: "Investor",
                          accessor: "user.fullname",
                        },
                        {
                          Header: "Base Amount",
                          accessor: "base_amount",
                        },
                        {
                          Header: "Percentage",
                          accessor: "percentage",
                        },
                        {
                          Header: "Amount",
                          accessor: "amount",
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
                )}
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

export default connect(mapStateToProps)(ProfitDetail);
