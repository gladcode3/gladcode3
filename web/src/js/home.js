import GoogleLogin from "./helpers/google-login.js";
// import Toast from "./components/toast.js";
import UserAuth from "./model/user-auth.js";

import '../less/home.less';
import Api from "./helpers/api.js";

const loginBtn = document.querySelector('#login-btn');
loginBtn.addEventListener('click', async () => {
    await UserAuth
        .auth()
        .catch(e => console.error(e));
});


const api = new Api({ auth: true });
console.log('api.requestInstance', api.requestInstance);
const loginRes = await api.post('/users/login');
console.log('loginRes:', loginRes);


// Fazer com que o arquivo home seja responsável já por chamar a rota de login e salvar apenas os dados importantes no LS