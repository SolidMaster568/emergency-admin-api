import axios from 'axios';

function ApiCall(constant, method, token, reqBody, headers) {
  return axios({
    method,
    url: `${process.env.REACT_APP_BACKEND_URL}${constant}`,
    headers: {
      Authorization: `Bearer ${token}`,
      ...headers,
    },
    data: reqBody,
  });
}

export default ApiCall;