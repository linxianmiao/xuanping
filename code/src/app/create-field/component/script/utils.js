import { notification, message } from "@uyun/components";
import { International, request as axios } from "@uyun/utils";
import locale from "./locale.json";
// 国际化
const { i18n } = new International({ locale });

// 防止提醒错误，出来许多
let notificationTimer = null;

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function catchError(error) {
  let message;
  switch (error.response.status) {
    case 400:
    case 436:
      message =
        error.response.data.message || i18n("message-ajax-local-exception");
      break;
    case 401:
      message = i18n("message-ajax-authority");
      break;
    case 404:
      message = i18n("message-ajax-server-unfound");
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      message = i18n("message-ajax-server-error");
      break;
    default:
      message = error.message;
      break;
  }
  clearTimeout(notificationTimer);
  notificationTimer = setTimeout(() => {
    notification.error({
      message: i18n("request-err"),
      description: message
    });
  }, 300);
  const err = error.response.data ? error.response.data : error.response;
  return Promise.reject(err);
}
function getResponse(response) {
  if ("errCode" in response) {
    if (response.errCode === 200) {
      return response.data;
    }
    message.error(`err${response.errCode}`);
    return null;
  }
  return response;
}
// 请求添加时间戳
function requestTime(config) {
  config.params = {
    _: new Date().getTime(),
    ...config.params
  };
  return config;
}

// 请求错误捕获
function requestCatchError(err) {
  return Promise.reject(err);
}

function getRequestInstance(baseURL) {
  let request = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
  request.interceptors.request.use(requestTime, requestCatchError);
  request.interceptors.response.use(checkStatus, catchError);
  request.interceptors.response.use(getResponse, null);
  return request;
}

const request = getRequestInstance("/itsm/api/v2");

export { i18n, getRequestInstance, request };
