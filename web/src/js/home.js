import Session from "./model/session.js";

import '../less/home.less';

const loginBtn = document.querySelector('#login-btn');

loginBtn.addEventListener('click', async () => {
    await Session.googleAuth()
        .catch(e => console.error(e));
    
    const loginData = await Session.login()
        .catch(e => console.error(e));

    if (loginData.token) location.href = '/dashboard';
});
