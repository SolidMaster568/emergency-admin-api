import actions from "store/actions";
import * as types from "../actions/types";

const INITIAL_STATE = {
  items: [],
  item: {},
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case types.PROJECT_LIST:
      console.log(action.payload, "---------projects in reduce");
      return {
        ...state,
        items: [...action.payload.data],
      };
    // case types.SET_PRODUCT:
    //   console.log("+++++++++++++++++", action.payload.data);
    //   return {
    //     ...state,
    //     item: action.payload.data,
    //   };
    case types.PROJECT_ADD:
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case types.PROJECT_UPDATE:
      const data=action.payload
      return {
        ...state,
        items: state.items.map(one=>{
          if(one._id===data._id) return data
          else return one;
        }),
      };
    // case types.DELETE_PRODUCT:
    //   return deleteProduct(state, action.payload.id);
    default:
      return state;
  }
};
  