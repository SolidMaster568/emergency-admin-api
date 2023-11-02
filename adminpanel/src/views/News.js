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
  CustomInput,
} from "reactstrap";
import Moment from "moment";
import NotificationAlert from "react-notification-alert";
import ReactTable from "components/ReactTable/ReactTable.js";

const News = ({ credential }) => {
  const [news, setNews] = useState([]);
  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);
  const [newsOne, setNewsOne] = useState({});
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
    setNewsOne(data);
    setShow(true);
  };

  const closeModal = () => {
    setNewsOne({});
    setShow(false);
  };

  const openModal1 = (data) => {
    setNewsOne(data);
    setShow1(true);
  };

  const closeModal1 = () => {
    setNewsOne({});
    setShow1(false);
  };

  const save = async (pro) => {
    try {
      const response = await ApiCall(
        apiConfig.news_upsert.url,
        apiConfig.news_upsert.method,
        credential.loginToken,
        pro
      );
      if (response.data.result) {
        const response = await ApiCall(
          apiConfig.news_get.url,
          apiConfig.news_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setNews(response.data.data);
        } else {
          notify(response.data.data, "danger");
        }
      } else {
        notify(response.data.data, "danger");
      }
    } catch (error) {
      notify("Failed", "danger");
    }
    setNewsOne({});
    setShow(false);
  };

  const remove = async (data) => {
    try {
      const response = await ApiCall(
        apiConfig.news_del.url,
        apiConfig.news_del.method,
        credential.loginToken,
        data
      );
      if (response.data.result) {
        const response = await ApiCall(
          apiConfig.news_get.url,
          apiConfig.news_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setNews(response.data.data);
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
    setNewsOne({});
    setShow1(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await ApiCall(
          apiConfig.news_get.url,
          apiConfig.news_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          setNews(response.data.data);
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
    var data = news.map((prop, key) => {
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
  }, [news]);

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
                <CardTitle tag="h3">Coming Soon</CardTitle>
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
          <h4>{newsOne._id ? "Edit " : "Add "}Coming Soon</h4>
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
                    value={newsOne.title}
                    onChange={(e) => {
                      setNewsOne({ ...newsOne, title: e.target.value });
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
                    value={newsOne.content}
                    onChange={(e) => {
                      setNewsOne({ ...newsOne, content: e.target.value });
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row style={{ float: "right", marginRight: "2px" }}>
              <Button color="btn1 btn-sm" onClick={() => save(newsOne)}>
                {newsOne._id ? "Update" : "Save"}
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
            <Button color="btn1 btn-sm" onClick={() => remove(newsOne)}>
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

export default connect(mapStateToProps)(News);
