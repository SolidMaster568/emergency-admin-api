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
  CustomInput,
} from "reactstrap";
import Moment from "moment";
import Select from "react-select";
import NotificationAlert from "react-notification-alert";
import ReactTable from "components/ReactTable/ReactTable.js";
import AppUserDetail from "./AppUserDetail";
import { jsPDF } from "jspdf";
import wait from "./wait";
import html2canvas from "html2canvas";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import "../assets/css/custom.css";

const AppUser = ({ credential }) => {
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false); //add modal
  const [show1, setShow1] = useState(false); //delete modal
  const [show2, setShow2] = useState(false); //edit modal
  const [show3, setShow3] = useState(false); //password modal
  const [show4, setShow4] = useState(false); //avatar modal
  const [user, setUser] = useState({});
  const [balance, setBalance] = useState({});
  const [isExport, setIsExport] = useState(true);
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
    setUser(data);
    setShow(true);
  };

  const closeModal = () => {
    setUser({});
    setShow(false);
  };

  const showEditModal = (data, balance) => {
    setUser(data);
    setBalance(balance);
    setShow2(true);
  };
  const closeEditModal = () => {
    setShow2(false);
  };

  const showChange = (data) => {
    setUser({ ...data });
    setShow3(true);
  };

  const changePassword = () => {
    (async () => {
      if (user.new_password != user.new_password_confirm) {
        alert('password not matching');
        return;
      }
      try {
        const response = await ApiCall(
          apiConfig.appuser_changePassword.url,
          apiConfig.appuser_changePassword.method,
          credential.loginToken,
          {
            user_id: user._id,
            new_password: user.new_password,
          }
        );
        if (response.data.result) {
          notify(response.data.data, "success");

        } else {
          notify(response.data.data, "danger");
        }
        setShow3(false);
      } catch (error) {
        console.log(error);
        notify("Failed", "danger");
        setShow3(false);
      }
    })();

  };

  const closeChange = () => {
    setShow3(false);
  };



  const openModal1 = (data) => {
    setUser(data);
    setShow1(true);
  };

  const closeModal1 = () => {
    setUser({});
    setShow1(false);
  };

  const save = async (pro) => {
    try {
      const response = await ApiCall(
        apiConfig.appuser_upsert.url,
        apiConfig.appuser_upsert.method,
        credential.loginToken,
        pro
      );
      if (response.data.result) {
        const resp = await ApiCall(
          apiConfig.appuser_get.url,
          apiConfig.appuser_get.method,
          credential.loginToken
        );
        if (resp.data.result) {
          notify('Done. Please refresh.', "success");
        } else {
          notify(resp.data.message, "danger");
        }
      } else {
        notify(response.data.data, "danger");
      }
    } catch (error) {
      notify("Failed", "danger");
    }
    setUser({});
    setShow(false);
  };
  const editBalance = async (user_id, balance) => {
    console.log(user_id, balance)
    try {
      const response = await ApiCall(
        apiConfig.appuser_upsert.url,
        apiConfig.appuser_upsert.method,
        credential.loginToken,
        {
          _id: user_id,
          balance
        }
      );
      if (response.data.result) {
        notify('Done!', "success");
        window.location.reload();
      } else {
        notify(response.data.message, "danger");
      }
    } catch (error) {
      console.log(error.message)
      notify("Failed", "danger");
    }
    setShow2(false)

  };

  const selRow = (data) => {
    showEditModal(data.values);
  };

  const remove = async (data) => {
    try {
      const response = await ApiCall(
        apiConfig.appuser_del.url,
        apiConfig.appuser_del.method,
        credential.loginToken,
        data
      );
      if (response.data.result) {
        notify('Done', 'success')
        window.location.reload()
      } else {
        notify(response.data.data, "danger");
      }
    } catch (error) {
      console.log(error.message)
      notify("Something went wrong", "danger");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await ApiCall(
          apiConfig.appuser_get.url,
          apiConfig.appuser_get.method,
          credential.loginToken
        );
        if (response.data.result) {
          let tmp = response.data.data;
          setUsers(
            response.data.data.map((p) => {
              const refs = tmp.filter((r) => p.referrer_id === r._id);
              return {
                ...p,
                referrer:
                  refs.length > 0
                    ? { value: refs[0]._id, label: refs[0].fullname }
                    : {},
                isActiveUser: p.isActiveUser ? (
                  <span style={{ marginLeft: 5, color: "green" }}>
                    <i className="tim-icons icon-check-2" />
                  </span>
                ) : (
                  <span style={{ marginLeft: 5, color: "red" }}>
                    <i className="tim-icons icon-simple-remove" />
                  </span>
                ),
                isis: p.isActiveUser ? 1 : 0,
                referral_volume: "$" + p.referral_volume,
                billing_volume: "$" + p.billing_volume,
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

  const [data, setData] = useState([]);

  useEffect(() => {
    var data = users.map((prop, key) => {
      return {
        ...prop,
        username: prop.firstname + " " + prop.lastname,   
        createdAt: Moment(prop.createdAt).format("DD/MM/YYYY hh:mm:ss"),
        actions: (
          <div className="actions-right" style={{ width: "100px" }}>
            {/* <Button
              color="warning"
              size="sm"
              className={classNames("btn-icon btn-link like btn-neutral")}
              onClick={() => showChange(prop)}
              style={{ opacity: 0.7 }}
            >
              <i class="tim-icons icon-key-25" aria-hidden="false"></i>
            </Button>          */}
          
            <Button //orders
              color="warning"
              size="sm"
              className={classNames("btn-icon btn-link like btn-neutral")}
              onClick={() => window.location.href = '/admin/order/' + prop._id}
              style={{ opacity: 0.7 }}
            >
              <i class="fa fa-book" aria-hidden="false"></i>
            </Button>
            {/* <Button //Edit
              onClick={() => showEditModal(prop, prop.balance)}
              color="warning"
              size="sm"
              className={classNames("btn-icon btn-link like btn-neutral")}
              style={{ opacity: 0.7 }}
            >
              <i className="tim-icons icon-pencil" />
            </Button> */}
            {/* <Button //Delete
              onClick={() => openModal1(prop)}
              color="danger"
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
  }, [users]);

  //avatar modal
  const [file, setFile] = useState(null);
  const handleFileSelect = (e) => {
    setFile(e.target.files[0]);
  }

  const changeAvatar = async () => {
    const formData = new FormData();
    formData.append("user_id", user._id);
    formData.append("avatar", file);

    try {
      const response = await ApiCall(
        apiConfig.appuser_updateAvatar.url,
        apiConfig.appuser_updateAvatar.method,
        credential.loginToken,
        formData
      );
      if (response.data.result) {
        notify('Done', 'success')
        window.location.reload()
      } else {
        notify(response.data.data, "danger");
      }
    } catch (error) {
      console.log(error.message)
      notify("Something went wrong", "danger");
    }
  }

 
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
                      App Users
                    </div>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardBody>               
                <ReactTable
                  data={data}
                  // isExport={isExport}
                  filterable
                  resizable={false}
                  selRow={selRow}
                  columns={[
                    {
                      Header: "Firebase UID",
                      accessor: "uid",
                    },
                    {
                      Header: "User Name",
                      accessor: "username",
                    },
                    {
                      Header: "Email",
                      accessor: "email",
                    },
                    {
                      Header: "Mobile",
                      accessor: "mobile",
                    }, 
                    {
                      Header: "Blood",
                      accessor: "blood_type",
                    }, 
                    {
                      Header: "Height",
                      accessor: "height",
                    }, 
                    {
                      Header: "Weight",
                      accessor: "weight",
                    }, 
                    {
                      Header: "Allergies",
                      accessor: "allergies",
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

      {/* Add/Edit Modal */}
      <Modal isOpen={show} style={{ transform: "translate(0, 10%)" }}>
        <div className="modal-header">
          <h4>Add User</h4>
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
              <Label md="5">Name</Label>
              <Col md="7">
                <FormGroup>
                  <Input
                    type="text"
                    value={user.username}
                    onChange={(e) => {
                      setUser({ ...user, username: e.target.value });
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="5">Email</Label>
              <Col md="7">
                <FormGroup>
                  <Input
                    type="text"
                    value={user.email}
                    onChange={(e) => {
                      setUser({ ...user, email: e.target.value });
                    }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="5">Default password</Label>
              <Col md="7" className="mt-2">
                <FormGroup>
                  <Input type="text" readOnly defaultValue="123456" />
                </FormGroup>
              </Col>
            </Row>
            <Row style={{ float: "right", marginRight: "2px" }}>
              <Button color="btn1 btn-sm" onClick={() => save(user)}>
                Save
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
            <Button color="btn1 btn-sm" onClick={() => remove(user)}>
              Confirm
            </Button>
            <Button color="btn1 btn-sm" onClick={() => closeModal1()}>
              Cancel
            </Button>
          </Row>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={show2} style={{ transform: "translate(0, 10%)" }}>
        <div className="modal-header">
          <h4>Edit balance</h4>
          <button
            aria-label="Close"
            className="close"
            data-dismiss="modal"
            type="button"
            onClick={() => closeEditModal()}
          >
            <i className="tim-icons icon-simple-remove" />
          </button>
        </div>
        <div className="modal-body">
          <Form className="form-horizontal">
            <Row>
              <Label md="5">Name</Label>
              <Col md="7">
                <FormGroup>
                  <Input
                    type="text"
                    value={user.username}
                    readOnly
                  />
                </FormGroup>
              </Col>
            </Row>
            {
              ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SHIB', 'YFI', 'DOGE'].map((coin) =>
                <Row>
                  <Label md="5">{coin}</Label>
                  <Col md="7">
                    <FormGroup>
                      <Input
                        type="number"
                        value={balance[coin]}
                        onChange={(e) => {
                          setBalance({ ...balance, [coin]: Number(e.target.value) });
                        }}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              )
            }

            <Row style={{ float: "right", marginRight: "2px" }}>
              <Button color="btn1 btn-sm" onClick={() => editBalance(user._id, balance)}>
                Edit Balance
              </Button>
              <Button color="btn1 btn-sm" onClick={() => closeEditModal()}>
                Cancel
              </Button>
            </Row>
          </Form>
        </div>
      </Modal>

      {/* Changepassword Modal */}
      <Modal isOpen={show3}>
        <div className="modal-header">
          <h4>Change password</h4>
          <button
            aria-label="Close"
            className="close"
            data-dismiss="modal"
            type="button"
            onClick={() => closeChange()}
          >
            <i className="tim-icons icon-simple-remove" />
          </button>
        </div>
        <div className="modal-body">
          <Form className="form-horizontal">
            <Row>
              <Label md="3">Name</Label>
              <Col md="9">
                <FormGroup>
                  <Input
                    type="text"
                    value={user.username}
                    onChange={() => { }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">Email</Label>
              <Col md="9">
                <FormGroup>
                  <Input
                    type="text"
                    value={user.email || ""}
                    onChange={() => { }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">Password</Label>
              <Col md="9" className="mt-2">
                <FormGroup>
                  <Input
                    type="password"
                    value={user.new_password}
                    onChange={(e) =>
                      setUser({ ...user, new_password: e.target.value })
                    }
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">Confirm</Label>
              <Col md="9" className="mt-2">
                <FormGroup>
                  <Input
                    type="password"
                    value={user.new_password_confirm}
                    onChange={(e) =>
                      setUser({ ...user, new_password_confirm: e.target.value })
                    }
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row style={{ float: "right", marginRight: "2px" }}>
              <Button color="btn1 btn-sm" onClick={() => changePassword()}>
                Confirm
              </Button>
              <Button color="btn1 btn-sm" onClick={() => closeChange()}>
                Close
              </Button>
            </Row>
          </Form>
        </div>
      </Modal>

      {/* Avatar Modal */}
      <Modal isOpen={show4}>
        <div className="modal-header">
          <h4>Change Avatar</h4>
          <button
            aria-label="Close"
            className="close"
            data-dismiss="modal"
            type="button"
            onClick={() => setShow4(false)}
          >
            <i className="tim-icons icon-simple-remove" />
          </button>
        </div>
        <div className="modal-body">
          <Form className="form-horizontal">
            <Row>
              <Label md="3">Name</Label>
              <Col md="9">
                <FormGroup>
                  <Input
                    type="text"
                    value={user.username}
                    onChange={() => { }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">Email</Label>
              <Col md="9">
                <FormGroup>
                  <Input
                    type="text"
                    value={user.email || ""}
                    onChange={() => { }}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Label md="3">Current Avatar</Label>
              <Col md="9" className="mt-2">
                <img src={`${process.env.REACT_APP_BACKEND_URL}/${user.profilePhoto}`} style={{ borderRadius: '50%', width: '200px' }} />
              </Col>
            </Row>
            <Row>
              <Label md="3">New Avatar</Label>
              <Col md="9" className="mt-2">
                <input
                  type="file"
                  onChange={handleFileSelect}
                />
              </Col>
            </Row>
            <Row style={{ float: "right", marginRight: "2px" }}>
              <Button color="btn1 btn-sm" onClick={() => changeAvatar()}>
                Confirm
              </Button>
              <Button color="btn1 btn-sm" onClick={() => setShow4(false)}>
                Close
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

export default connect(mapStateToProps)(AppUser);
