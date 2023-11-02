import axios from "axios";
import * as types from "./types";

export const getProjects = (token) => async (dispatch) => {
  try {
    const response = await axios({
      method: "POST",
      url: "http://localhost:8000/api/project/get",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    // dispatch({ type: types.PROJECT_LIST, data: response.data });
    // return response.data;
    return { type: types.PROJECT_LIST, data: response.data };
  } catch (error) {
    console.log(error);
  }
};

// export const addAndUpdateProject = (project, token) => async (dispatch) => {
export const addAndUpdateProject = (project, token) => async () => {
  try {
    const response = await axios({
      method: "POST",
      url: "http://localhost:8000/api/project/upsert",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: project,
    });
    if (project._id)
      // dispatch({ type: types.PROJECT_UPDATE, data: response.data });
      return { type: types.PROJECT_UPDATE, data: response.data };
    return { type: types.PROJECT_ADD, data: response.data };
  } catch (error) {
    console.log(error);
  }
};
