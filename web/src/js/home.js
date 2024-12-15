// import Toast from "./components/toast.js";
import Session from "./model/session.js";
import Users from "./model/users.js";
import Api from "./helpers/api.js";

import '../less/home.less';

const loginBtn = document.querySelector('#login-btn');

loginBtn.addEventListener('click', async () => {
    await Session.googleAuth()
        .catch(e => console.error(e));
    
    const loginRes = await Session.login()
        .catch(e => console.error(e));

    // const { token } = loginRes; // Por hora o token usado é apenas o do OAuth

    const api = new Api();
    const data = await api.get('users');
    console.log(data);
});


// Salvar no LS alguns dados (obviamenta dados não-sensíveis), isso poderia ajudar a reduzir algumas requisições, o header por exemplo faria requisições apenas para conseguir a foto de perfil do usuário. Com essa técnica ele apenas pegaria ela do LS.