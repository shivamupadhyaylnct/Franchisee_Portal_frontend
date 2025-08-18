import { APICore } from "./ApiCore";
import { baseURL } from "./base";

const api = new APICore();

const apiPost = async (apiName, params) => {
    const base = `${baseURL}${apiName} `;
    return api.create(`${base}`, params);
}



const apiGet = async (apiName, pathParam = null, params = {}) => {
    let url = `${baseURL}${apiName}`;
    if (pathParam) {
        url += `${pathParam}/`;
    }
    return api.createget(url, params);
};
const apiFormDataPost = async (apiName, params) => {
    const base = `${baseURL}${apiName} `;
    return api.createForm(`${base}`, params);
}

export { apiPost, apiGet, apiFormDataPost };