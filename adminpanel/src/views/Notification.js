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
} from "reactstrap";
import Moment from "moment";
import { jsPDF } from "jspdf";
import wait from "./wait";
import html2canvas from "html2canvas";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import NotificationAlert from "react-notification-alert";

const AppUser = ({ credential }) => {
  const { apiConfig, ApiCall } = global;
  const notificationAlertRef = React.useRef(null);
  const [message, setMessage] = useState("");
  const [data, setData] = useState([]);
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

  const send = async () => {
    try {
      const response = await ApiCall(
        apiConfig.note_send.url,
        apiConfig.note_send.method,
        credential.loginToken,
        { message: message }
      );
      if (response.data.result) {
        setMessage("");
        alert("success");
      } else {
        notify(response.data.data, "danger");
      }
    } catch (error) {
      notify("Failed", "danger");
    }
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
    pdf.save("notification.pdf");
  };

  const exportExcel = (d) => {
    const noteData = d.map((p) => ({
      content: p.content,
      createdAt: Moment(p.createdAt).format("DD/MM/YYYY hh:mm:ss"),
    }));
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const wsNote = XLSX.utils.json_to_sheet(noteData);
    const wb = {
      Sheets: { notification: wsNote },
      SheetNames: ["notification"],
    };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "notification.xlsx");
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await ApiCall(
          apiConfig.note_get.url,
          apiConfig.note_get.method
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
  console.log(data, "----------notification data");
  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>
      <div className="content" style={{ marginTop: 200 }}>
        <Row>
          <Col xs={3} md={3}></Col>
          <Col xs={6} md={6}>
            <Card>
              <CardHeader>
                <CardTitle tag="h3">Notification</CardTitle>
              </CardHeader>
              <CardBody>
                <Form className="form-horizontal">
                  <FormGroup>
                    {/* <Input
                      fullWidth
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    /> */}
                    <Input
                      multiLine
                      type="text"
                      placeholder="max 100 characters"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </FormGroup>
                  <Row style={{ float: "right", marginRight: "2px" }}>
                    <Button color="btn1 btn-sm" onClick={() => send()}>
                      Send
                    </Button>
                  </Row>
                </Form>
              </CardBody>
            </Card>
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
            <div id="pdf">
              <h3>Logs</h3>
              {data.map((item) => {
                return <p>{item.content}</p>;
              })}
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return { credential: LoginReducer };
};

export default connect(mapStateToProps)(AppUser);
