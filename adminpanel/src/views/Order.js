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
  const [wallet, setWallet] = useState({}); // user wallet
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
          apiConfig.emergencies_get.url,
          apiConfig.emergencies_get.method,
          credential.loginToken,
          payload
        );

        if (response.data.status == 'success') {
          setData(response.data.data)
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
      data.user_id = user_id;
      const response = await ApiCall(
        apiConfig.order_create.url,
        apiConfig.order_create.method,
        credential.loginToken,
        data
      );
      if (response.data.success) {
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
                  Header: "User Address",
                  accessor: "user_address",
                }, 
                {
                  Header: "Emr Address",
                  accessor: "emr_address",
                },
                 {
                  Header: "category",
                  accessor: "category",
                },
                {
                  Header: "type",
                  accessor: "type",
                },
                {
                  Header: "date",
                  accessor: "date",
                },
                // {
                //   Header: "Actions",
                //   accessor: "actions",
                //   sortable: false,
                //   filterable: false,
                // },
              ]
              }
              defaultPageSize={10}
              showPaginationTop
              showPaginationBottom={false}
              openModal={() => openModal({ buysell: 'buy', type: 'limit' })}
              className="-striped -highlight"
            // isExport={true}
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
              <Label md="3">Coin</Label>
              <Col md="9">
                <FormGroup>
                  <Select
                    className="react-select info"
                    classNamePrefix="react-select"
                    name="coin"
                    onChange={(value) =>
                      setModalData({ ...modalData, coin: value.value })
                    }
                    options={['BTC', 'ETH', 'USDC', 'BNB', 'SHIB', 'YFI', 'DOGE'].map((one) => ({
                      value: one,
                      label: one,
                    }))}
                  />
                </FormGroup>
              </Col>
            </Row>
            {/* Buy/Sell */}
            <Row className="mb-2">
              <Label md="3">Buy/Sell</Label>
              <Col md="9">
                <FormGroup check className="form-check-radio">
                  <Label check>
                    <Input
                      id="pending"
                      name="pending"
                      type="radio"
                      checked={modalData.buysell === 'buy'}
                      onChange={() => setModalData({ ...modalData, buysell: 'buy' })}
                    />
                    <span className="form-check-sign" />
                    <span style={{ color: 'green' }}>Buy</span>
                  </Label>
                  <Label style={{ marginLeft: "15px" }} check>
                    <Input
                      id="approved"
                      name="approved"
                      type="radio"
                      checked={modalData.buysell === 'sell'}
                      onChange={() => setModalData({ ...modalData, buysell: 'sell' })}
                    />
                    <span className="form-check-sign" />
                    <span style={{ color: 'red' }}>Sell</span>
                  </Label>
                </FormGroup>
              </Col>
            </Row>
            {/* Amount */}
            <Row>
              <Col md="3"></Col>
              <Col md="9">
                {modalData.buysell == 'buy' &&
                  <>
                    <span>USDT balance: {wallet.USDT?.balance}</span>
                    <span style={{ color: 'blue', cursor: 'pointer', float: 'right' }}
                      onClick={() => setModalData({ ...modalData, amount: wallet.USDT?.balance })}>
                      MAX</span>
                  </>
                }
                {modalData.buysell == 'sell' &&
                  <>
                    <span>{modalData.coin} balance: {wallet[modalData.coin]?.balance}</span>
                    <span style={{ color: 'blue', cursor: 'pointer', float: 'right' }}
                      onClick={() => setModalData({ ...modalData, amount: wallet[modalData.coin]?.balance })}>
                      MAX</span></>
                }
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
                    <span className="currency">{modalData.buysell == 'buy' ? 'USDT' : modalData.coin}</span>
                  </div>
                </FormGroup>
              </Col>
            </Row>

            <Row className="mb-2">
              <Label md="3">Type</Label>
              <Col md="9">
                <FormGroup check className="form-check-radio">
                  <Label check>
                    <Input
                      type="radio"
                      checked={modalData.type === 'limit'}
                      onChange={() => setModalData({ ...modalData, type: 'limit' })}
                    />
                    <span className="form-check-sign" />
                    Limit
                  </Label>
                  <Label style={{ marginLeft: "15px" }} check>
                    <Input
                      type="radio"
                      checked={modalData.type === 'market'}
                      onChange={() => setModalData({ ...modalData, type: 'market' })}
                    />
                    <span className="form-check-sign" />
                    Market
                  </Label>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">Price</Label>
              <Col md="9">
                <FormGroup>
                  <div className="cccc">
                    <Input id="currency" type="number" onChange={(e) =>
                      setModalData({ ...modalData, price: e.target.value })
                    } />
                    <span className="currency">USDT</span>
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">Time</Label>
              <Col md="9">
                <FormGroup>
                  <div className="cccc">
                    <input type={'datetime-local'}
                      onChange={(e) =>
                        setModalData({ ...modalData, time: e.target.value })
                      } />
                  </div>
                </FormGroup>
              </Col>
            </Row>
            <hr />
            <Row>
              <Col md="2"></Col>
              <Col md="10">
                {modalData.buysell == 'buy' &&
                  <span>Buy {modalData.coin} for {modalData.amount} USDT amount, at price {modalData.price} USDT/{modalData.coin}</span>}
                {modalData.buysell == 'sell' &&
                  <span>Sell {modalData.amount} {modalData.coin}, at price {modalData.price} USDT/{modalData.coin}</span>}
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
