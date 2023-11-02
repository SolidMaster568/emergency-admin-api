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

const Link = ({ credential }) => {
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [links, setLinks] = useState([]);
  const [link, setLink] = useState({});
  const [isExport, setIsExport] = useState(false);

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

  // Open Edit Modal
  const openModal = (data) => {
    setLink(data)
    setShow(true);
  };

  const closeModal = () => {
    setLink(null);
    setShow(false);
  };

  const openModal1 = (data) => {
    setLink(data);
    setShow1(true);
  };

  const closeModal1 = () => {
    setLink(null);
    setShow1(false);
  };

  const save = async (plee) => {
    try {
      const response = await ApiCall(
        apiConfig.link_upsert.url,
        apiConfig.link_upsert.method,
        credential.loginToken,
        plee
      );
      if (response.data.result) {
        notify('success', "success");
        window.location.reload();
      } else {
        notify(response.data.data, "danger");
      }
    } catch (error) {
      notify("Failed", "danger");
    }
    setLink({});
    setShow(false);
  };

  const remove = async (data) => {
    try {
      const response = await ApiCall(
        apiConfig.link_del.url,
        apiConfig.link_del.method,
        credential.loginToken,
        data
      );
      if (response.data.result) {
        const response = await ApiCall(
          apiConfig.link_get.url,
          apiConfig.link_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setLinks(
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
    setLink({});
    setShow1(false);
  };

  const [investors, setInvestors] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await ApiCall(
          apiConfig.link_get.url,
          apiConfig.link_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setLinks(response.data.data);
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
    var data = links.map((prop, key) => {
      return {
        ...prop,
        createdAt: Moment(prop.createdAt).format("DD/MM/YYYY hh:mm:ss"),
        actions: (
          <div className="actions-right">
            {/* edit */}
            <Button
              onClick={() => openModal(prop)}
              color="warning"
              size="sm"
              className={classNames("btn-icon btn-link like btn-neutral")}
              style={{ opacity: 0.7 }}
            >
              <i className="tim-icons icon-pencil" />
            </Button>
            {/* delete */}
            {/* <Button
              onClick={() => openModal1(prop)}
              color="warning"
              size="sm"
              className={classNames("btn-icon btn-link like btn-neutral")}
              style={{ opacity: 0.7 }}
            >
              <i className="tim-icons icon-trash-simple" />
            </Button> */}
          </div>
        ),
      };
    });
    setData(data);
  }, [links]);

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
                      Links
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
                  columns={[
                    {
                      Header: "Title",
                      accessor: "title",
                    },
                    {
                      Header: "Link",
                      accessor: "content",
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
      {/* Edit Modal */}
      <Modal isOpen={show}>
        <div className="modal-header">
          <h4>Edit Link</h4>
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
              <Label md="3">Title</Label>
              <Col md="9">
                <FormGroup>
                  <Input
                    type="text"
                    style={{ color: "rgb(112 114 118)" }}
                    value={link.title}
                    disabled
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">Link</Label>
              <Col md="9">
                <FormGroup>
                  <Input
                    type="text"
                    style={{ color: "rgb(112 114 118)" }}
                    value={link.content}
                    onChange={(e) =>
                      setLink({ ...link, content: e.target.value })
                    }
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row style={{ float: "right", marginRight: "2px" }}>
              <Button color="btn1 btn-sm" onClick={() => save(link)}>
                {link._id ? "Update" : "Save"}
              </Button>
              <Button color="btn1 btn-sm" onClick={() => closeModal()}>
                Cancel
              </Button>
            </Row>
          </Form>
        </div>
      </Modal>
      {/* Delete Modal */}
      <Modal isOpen={show1}>
        <div className="modal-header">
          <h4>Are you sure you want to delete?</h4>
        </div>
        <div className="modal-body">
          <Row style={{ float: "right", marginRight: "2px" }}>
            <Button color="btn1 btn-sm" onClick={() => remove(link)}>
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

// export default Link;
const mapStateToProps = (state) => {
  const { LoginReducer } = state;
  return { credential: LoginReducer };
};

export default connect(mapStateToProps)(Link);
