const apiConfig = {
  /**
   * Emergency
   */
  authenticate: { url: "/api/v1/admin/login", method: "post" },
  appuser_get: { url: "/api/v1/admin/appuser/get", method: "post" },
  emergencies_get: { url: "/api/v1/admin/user/emergencies", method: "post", },
  rescueteam_get: { url: "/api/v1/user/emergency/categories", method: "get", },
  rescueteam_add: { url: "/api/v1/admin/categories_add", method: "post", },
  rescueteam_del: { url: "/api/v1/admin/categories_del", method: "post", },
  emr_get: { url: "/api/v1/admin/emr_get", method: "post", },
  emr_del: { url: "/api/v1/admin/emr_del", method: "post", },
  emr_add: { url: "/api/v1/emr/auth/a-c/register", method: "post", },
  dashboard: { url: "/api/v1/admin/dashboard", method: "post", },

  register: { url: "/api/register", method: "post" },
  changePassword: { url: "/api/change-password", method: "post" },

  //wallets
  getWallet: { url: "/api/wallet/read", method: "post" },
  lockWallet: { url: "/api/wallet/lock", method: "post" },
  adminWallet: { url: "/api/wallet/admin", method: "post" },
  //authorization
  readAuthoriztion: { url: "/api/authorization/read", method: "post" },
  addAuthoriztion: { url: "/api/authorization/add", method: "post" },
  deleteAuthorization: { url: "/api/authorization/delete", method: "post" },
  //setting
  read_setting: { url: "/api/setting/read", method: "post" },
  update_setting: { url: "/api/setting/update", method: "post" },
  delete_setting: { url: "/api/setting/delete", method: "post" },
  //dashboard

  //project
  pro_get: {
    url: "/api/project/get",
    method: "post",
  },
  pro_upsert: {
    url: "/api/project/upsert",
    method: "post",
  },
  pro_del: {
    url: "/api/project/delete",
    method: "post",
  },
  //pledge
  pledge_get: {
    url: "/api/pledge/get",
    method: "post",
  },
  pledge_upsert: {
    url: "/api/pledge/upsert",
    method: "post",
  },
  pledge_del: {
    url: "/api/pledge/delete",
    method: "post",
  },
  //link
  link_get: {
    url: "/api/link/get",
    method: "post",
  },
  link_upsert: {
    url: "/api/link/upsert",
    method: "post",
  },
  link_del: {
    url: "/api/link/delete",
    method: "post",
  },
  //app user

  appuser_upsert: {
    url: "/api/appuser/upsert",
    method: "post",
  },
  appuser_changePassword: {
    url: "/api/appuser/changePassword",
    method: "post",
  },
  appuser_info: {
    url: "/api/appuser/info",
    method: "post",
  },
  appuser_del: {
    url: "/api/appuser/delete",
    method: "post",
  },
  appuser_updateAvatar: {
    url: "/api/appuser/updateAvatar",
    method: "post",
  },
  appuser_export: {
    url: "/api/appuser/export",
    method: "post",
  },
  //news
  news_get: {
    url: "/api/news/get",
    method: "post",
  },
  news_upsert: {
    url: "/api/news/upsert",
    method: "post",
  },
  news_del: {
    url: "/api/news/delete",
    method: "post",
  },
  //news
  faq_get: {
    url: "/api/faq/get",
    method: "post",
  },
  faq_upsert: {
    url: "/api/faq/upsert",
    method: "post",
  },
  faq_del: {
    url: "/api/faq/delete",
    method: "post",
  },
  //order
  order_get: {
    url: "/api/order/get",
    method: "post",
  },
  order_create: {
    url: "/api/order/create",
    method: "post",
  },
  order_upsert: {
    url: "/api/order/upsert",
    method: "post",
  },
  order_del: {
    url: "/api/order/delete",
    method: "post",
  },
  //withdrawal
  withdrawal_get: {
    url: "/api/withdrawal/get",
    method: "post",
  },
  withdrawal_upsert: {
    url: "/api/withdrawal/upsert",
    method: "post",
  },
  withdrawal_del: {
    url: "/api/withdrawal/delete",
    method: "post",
  },
  //deposit
  deposit_get: {
    url: "/api/deposit/get",
    method: "post",
  },
  deposit_create: {
    url: "/api/deposit/create",
    method: "post",
  },
  deposit_del: {
    url: "/api/deposit/delete",
    method: "post",
  },



};

export default apiConfig;
