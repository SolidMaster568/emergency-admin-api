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
  const [modalData, setModalData] = useState({
    buysell: 'buy'
  }); // one record, for modal

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
        let payload = { user_id }

        var response = await ApiCall(
          apiConfig.deposit_get.url,
          apiConfig.deposit_get.method,
          credential.loginToken,
          payload
        );
        if (response.data.success) {
          let data = response.data.data
          let newdata = data.map((prop, key) => {
            return {
              ...prop,
              actions: (
                <div className="actions-right">
                  {/* <Button
                    onClick={() => openModal(prop)}
                    color="warning"
                    size="sm"
                    className={classNames("btn-icon btn-link like btn-neutral")}
                  >
                    <i className="tim-icons icon-pencil" />
                  </Button> */}
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
      console.log(data)
      const response = await ApiCall(
        apiConfig.deposit_create.url,
        apiConfig.deposit_create.method,
        credential.loginToken,
        { ...data, user_id }
      );
      if (response.data.success) {
        notify("Done", "success");
        window.location.reload()
      } else {
        notify(response.data.message, "danger");
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
        apiConfig.deposit_del.url,
        apiConfig.deposit_del.method,
        credential.loginToken,
        data
      );
      if (response.data.success) {
        notify("Done", "success");
        window.location.reload()
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
            <span>Total Deposits: {data.length}</span>

            <ReactTable
              data={data}
              filterable
              resizable={false}
              columns={[
                {
                  Header: "Time",
                  accessor: "createdAt",
                },
                {
                  Header: "Coin",
                  accessor: "code",
                },
                {
                  Header: "Amount",
                  accessor: "amount",
                },
                {
                  Header: "Status",
                  accessor: "status",
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
              openModal={() => openModal()}
              className="-striped -highlight"
              isExport={true}
            />
          </CardBody>
        </Card>
      </div>


      {/* Add/Edit Modal */}
      <Modal isOpen={showModal}>
        <div className="modal-header">
          <h4>{modalData?._id ? "Edit " : "Add "}</h4>
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
              <Label md="3">Coin</Label>
              <Col md="9">
                <FormGroup>
                  <Select
                    className="react-select info"
                    classNamePrefix="react-select"
                    name="coin"
                    onChange={(value) =>
                      setModalData({ ...modalData, code: value.value })
                    }
                    options={['BTC', 'ETH', 'USDC', 'BNB', 'SHIB', 'YFI', 'DOGE'].map((one) => ({
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
                      type="number"
                      fullWidth
                      onChange={(e) => setModalData({ ...modalData, amount: e.target.value })}

                    />
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">Status</Label>
              <Col md="9">
                <FormGroup>
                  <div className="cccc">
                    <Input
                      type="text"
                      fullWidth
                      onChange={(e) => setModalData({ ...modalData, status: e.target.value })}
                    />
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <hr />

            <Row style={{ float: "right", marginRight: "2px" }}>
              <Button color="btn1 btn-sm" onClick={() => save(modalData)}>
                {modalData?._id ? "Update" : "Save"}
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
