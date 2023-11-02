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
import NotificationAlert from "react-notification-alert";
import ReactTable from "components/ReactTable/ReactTable.js";

const Faq = ({ credential }) => {
  const [faqs, setFaqs] = useState([]);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [faq, setFaq] = useState({});
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
    setFaq(data);
    setShow(true);
  };

  const closeModal = () => {
    setFaq({});
    setShow(false);
  };

  const openModal1 = (data) => {
    setFaq(data);
    setShow1(true);
  };

  const closeModal1 = () => {
    setFaq({});
    setShow1(false);
  };

  const save = async (pro) => {
    try {
      const response = await ApiCall(
        apiConfig.faq_upsert.url,
        apiConfig.faq_upsert.method,
        credential.loginToken,
        pro
      );
      if (response.data.result) {
        const response = await ApiCall(
          apiConfig.faq_get.url,
          apiConfig.faq_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setFaqs(response.data.data);
        } else {
          notify(response.data.data, "danger");
        }
      } else {
        notify(response.data.data, "danger");
      }
    } catch (error) {
      notify("Failed", "danger");
    }
    setFaq({});
    setShow(false);
  };

  const remove = async (data) => {
    try {
      const response = await ApiCall(
        apiConfig.faq_del.url,
        apiConfig.faq_del.method,
        credential.loginToken,
        data
      );
      if (response.data.result) {
        const response = await ApiCall(
          apiConfig.faq_get.url,
          apiConfig.faq_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setFaqs(response.data.data);
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
    setFaq({});
    setShow1(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await ApiCall(
          apiConfig.faq_get.url,
          apiConfig.faq_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setFaqs(response.data.data);
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
    var data = faqs.map((prop, key) => {
      return {
        ...prop,
        createdAt: Moment(prop.createdAt).format("DD/MM/YYYY hh:mm:ss"),
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
              color="danger"
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
  }, [faqs]);

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
                <CardTitle tag="h3">Faqs</CardTitle>
              </CardHeader>
              <CardBody>
                <ReactTable
                  data={data}
                  filterable
                  resizable={false}
                  columns={[
                    {
                      Header: "Title",
                      accessor: "title",
                    },
                    {
                      Header: "Content",
                      accessor: "content",
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
          <h4>{faq._id ? "Edit " : "Add "}Faq</h4>
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
                    value={faq.title}
                    onChange={(e) => {
                      setFaq({ ...faq, title: e.target.value });
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">Content</Label>
              <Col md="9">
                <FormGroup>
                  <Input
                    type="text"
                    value={faq.content}
                    onChange={(e) => {
                      setFaq({ ...faq, content: e.target.value });
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row style={{ float: "right", marginRight: "2px" }}>
              <Button color="btn1 btn-sm" onClick={() => save(faq)}>
                {faq._id ? "Update" : "Save"}
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
            <Button color="btn1 btn-sm" onClick={() => remove(faq)}>
              Confirm
            </Button>
            <Button color="btn1 btn-sm" onClick={() => closeModal1()}>
              Cancel
            </Button>
          </Row>
        </div>
      </Modal>
      <Modal isOpen={show1}>
        <div className="modal-header">
          <h4>Are you sure you want to delete?</h4>
        </div>
        <div className="modal-body">
          <Row style={{ float: "right", marginRight: "2px" }}>
            <Button color="btn1 btn-sm" onClick={() => remove(faq)}>
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

export default connect(mapStateToProps)(Faq);
