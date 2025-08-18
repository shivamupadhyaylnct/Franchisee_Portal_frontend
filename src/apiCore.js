
// import jwtDecode from 'jwt-decode';
import axios from 'axios';
import { toast } from 'react-toastify';
//axios.defaults.headers.post['Content-Type'] = 'application/json';

// axios interceptor

//@param {*} token
let logoutTriggered = false;

axios.interceptors.response.use(
    (response) => {

        return response;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data || {};
            const detail = (data.detail || '').toLowerCase();
            const code = data.code || '';

            // ✅ If token expired/invalid or unauthorized
            if (
                (status === 401 ||
                    code === 'token_not_valid' ||
                    code === 'user_not_found' ||
                    detail.includes('token is invalid or expired') ||
                    detail.includes('given token not valid')) && !logoutTriggered
            ) {
                logoutTriggered = true;
                toast.error("Your session has expired. Please log in again.");

                setTimeout(() => {
                    sessionStorage.removeItem(AUTH_SESSION_KEY);
                    delete axios.defaults.headers["Authorization"];
                    window.location.href = '/';
                }, 3000);
                return;
            }
        }

        return Promise.reject({ errorAPI: true, errorMessage: error.message });
    }
);

const setAuthorization = (token) => {
    if (token) axios.defaults.headers["Authorization"] = `Bearer ${token}`;
    else delete axios.defaults.headers["Authorization"];
};

const getAuthorization = () => {
    let user = getUserFromCookie();
    if (user?.token?.token) {
        return user.token.token;
    }
    return null;

}

const getUserType = () => {
    let user = getUserFromCookie();
    if (user?.user?.UserType) {
        return user.user.UserType;
    }
    return null;

}

const getUserFromCookie = () => {
    const user = sessionStorage.getItem(AUTH_SESSION_KEY);
    return user ? (typeof user == 'object' ? user : JSON.parse(user)) : null;
};

const AUTH_SESSION_KEY = 'franchise_user';

class APICore {

    setLoggedInUser = (user, authorisation) => {
        if (user) {
            let usertoken = {
                user: user,
                token: authorisation
            }
            sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(usertoken));
        }
        else {
            sessionStorage.removeItem(AUTH_SESSION_KEY);
        }
    };

    create = async (url, data) => {
        const options = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            data: data,
            url: url
        };
        return axios(options);
    };

    createget = async (url, params = {}) => {
        const options = {
            method: 'GET',
            headers: { 'content-type': 'application/json' },
            params: params,
            url: url
        };
        return axios(options);
    };

    createForm = async (url, data) => {
        const options = {
            method: 'POST',
            headers: { 'content-type': 'multipart/form-data' },
            data: data,
            url: url
        };
        return axios(options);
    };
}

let user = getUserFromCookie();
if (user) {
    const token = user.token;
    if (token) {
        setAuthorization(token.token);
    }
}


export { APICore, setAuthorization, getAuthorization, getUserType };