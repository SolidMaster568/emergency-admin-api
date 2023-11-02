import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Button, Modal, Input, Label, Form, FormGroup, } from "reactstrap";
import Select from "react-select";
import NotificationAlert from "react-notification-alert";
import ReactTable from "components/ReactTable/ReactTable.js";



const Page = ({ credential }) => {
  const { user_id } = useParams();
  const [showModal, setShowModal] = useState(false); //show add/edit modal
  const [showModal2, setShowModal2] = useState(false); //show delete modal
  const [data, setData] = useState([]); // records of db
  const [modalData, setModalData] = useState({}); // one record, for modal

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

  // when start, load data
  useEffect(() => {
    (async () => {
      try {
        let payload = { user_id: '6409f6c95150061690082f40' }
        const response = await ApiCall(
          apiConfig.order_get.url,
          apiConfig.order_get.method,
          credential.loginToken,
          payload
        );
        if (response.data.result) {
          let data = response.data.data
          let newdata = data.map((prop, key) => {
            return {
              ...prop,
              actions: (
                <div className="actions-right">
                  <Button
                    onClick={() => openModal(prop)}
                    color="warning"
                    size="sm"
                    className={classNames("btn-icon btn-link like btn-neutral")}
                  >
                    <i className="tim-icons icon-pencil" />
                  </Button>
                  <Button
                    onClick={() => openModal2(prop)}
                    color="danger"
                    size="sm"
                    className={classNames("btn-icon btn-link like btn-neutral")}
                  >
                    <i className="tim-icons icon-trash-simple" />
                  </Button>
                </div>
              ),
            };
          });
          setData(newdata);
        } else {
          notify(response.data.message ? response.data.message : 'Error', "danger");
        }
      } catch (error) {
        notify("Failed", "danger");
      }
    })();
  }, []);

  //Add/Edit Modal
  const openModal = (data) => {
    setModalData(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setModalData({});
    setShowModal(false);
  };

  const save = async (data) => {
    try {
      const response = await ApiCall(
        apiConfig.pledge_upsert.url,
        apiConfig.pledge_upsert.method,
        credential.loginToken,
        data
      );
      if (response.data.result) {
        const response = await ApiCall(
          apiConfig.pledge_get.url,
          apiConfig.pledge_get.method,
          credential.loginToken
        );

      } else {
        notify(response.data.data, "danger");
      }
    } catch (error) {
      notify("Failed", "danger");
    }
    setModalData({});
    setShowModal(false);
  };


  //Delete Modal
  const openModal2 = (data) => {
    setModalData(data);
    setShowModal2(true);
  };

  const closeModal2 = () => {
    setModalData({});
    setShowModal2(false);
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

      } else {
        notify(response.data.data, "danger");
      }
    } catch (error) {
      if (error.response) notify(error.response.data.data, "danger");
      else if (error.request) notify("Request failed", "danger");
      else notify("Something went wrong", "danger");
    }
    setModalData({});
    setShowModal2(false);
  };



  return (
    <>
      <div className="rna-container">
        <NotificationAlert ref={notificationAlertRef} />
      </div>

      {/* Main Content */}
      <div className="content">
        <Card>
          <CardHeader>
            <CardTitle tag="h3">
            </CardTitle>
          </CardHeader>
          <CardBody>
            <ReactTable
              data={data}
              filterable
              resizable={false}
              columns={[
                {
                  Header: "Pair",
                  accessor: "pair",
                },
                {
                  Header: "Coin Amount",
                  accessor: "coin_amount",
                },
                {
                  Header: "Buy/Sell",
                  accessor: "buysell",
                },
                {
                  Header: "Type",
                  accessor: "type",
                },
                {
                  Header: "Time",
                  accessor: "time",
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
      </div>


      {/* Add/Edit Modal */}
      <Modal isOpen={showModal}>
        <div className="modal-header">
          <h4>{modalData._id ? "Edit " : "Add "}</h4>
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
                    value={modalData.investor}
                    onChange={(value) =>
                      setModalData({ ...modalData, investor: value })
                    }
                    options={[1, 2, 3].map((one) => ({
                      value: one,
                      label: one,
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
                      value={modalData.amount}
                      onChange={(e) =>
                        setModalData({ ...modalData, amount: e.target.value })
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
                    value={modalData.transaction}
                    onChange={(e) =>
                      setModalData({ ...modalData, transaction: e.target.value })
                    }
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row className="mt-1 mb-4">
              <Label md="3">Status</Label>
              <Col md="9">
                <FormGroup check className="form-check-radio">
                  <Label check>
                    <Input
                      id="pending"
                      name="pending"
                      type="radio"
                      checked={modalData.status === 0}
                      onChange={() => setModalData({ ...modalData, status: 0 })}
                    />
                    <span className="form-check-sign" />
                    Pending
                  </Label>
                  <Label style={{ marginLeft: "15px" }} check>
                    <Input
                      id="approved"
                      name="approved"
                      type="radio"
                      checked={modalData.status === 1}
                      onChange={() => setModalData({ ...modalData, status: 1 })}
                    />
                    <span className="form-check-sign" />
                    Approved
                  </Label>
                  <Label style={{ marginLeft: "15px" }} check>
                    <Input
                      id="finished"
                      name="finished"
                      type="radio"
                      checked={modalData.status === 2}
                      onChange={() => setModalData({ ...modalData, status: 2 })}
                    />
                    <span className="form-check-sign" />
                    Rejected
                  </Label>
                </FormGroup>
              </Col>
            </Row>
            <Row style={{ float: "right", marginRight: "2px" }}>
              <Button color="btn1 btn-sm" onClick={() => save(modalData)}>
                {modalData._id ? "Update" : "Save"}
              </Button>
              <Button color="btn1 btn-sm" onClick={() => closeModal()}>
                Cancel
              </Button>
            </Row>
          </Form>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showModal2}>
        <div className="modal-header">
          <h4>Are you surely going to delete it?</h4>
        </div>
        <div className="modal-body">
          <Row style={{ float: "right", marginRight: "2px" }}>
            <Button color="btn1 btn-sm" onClick={() => remove(modalData)}>
              Confirm
            </Button>
            <Button color="btn1 btn-sm" onClick={() => closeModal2()}>
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

export default connect(mapStateToProps)(Page);
