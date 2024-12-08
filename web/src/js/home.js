// import Toast from "./components/toast.js";
import UserAuth from "./model/user-auth.js";
import Users from "./model/users.js";

import '../less/home.less';

const loginBtn = document.querySelector('#login-btn');

loginBtn.addEventListener('click', async () => {
    await UserAuth.auth()
        .catch(e => console.error(e));
    
    await Users.login()
        .catch(e => console.error(e));
});

// Chamar o GoogleAuth através do UserAuth
// Chamar a rota de login
// Salvar o token da rota de login no LS
// Salvar no LS alguns dados (obviamenta dados não-sensíveis), isso poderia ajudar a reduzir algumas requisições, o header por exemplo faria requisições apenas para conseguir a foto de perfil do usuário. Com essa técnica ele apenas pegaria ela do LS.