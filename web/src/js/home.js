import GoogleLogin from "./helpers/google-login.js";
import Toast from "./components/toast.js";

import '../less/home.less';


async function main() {

    const loginPath = `profile`;

    await GoogleLogin.init({ redirectUri: `https://${window.location.hostname}/${loginPath}` });
    GoogleLogin.onFail(async () => {
        const loginBtn = document.querySelector('#button-login')
        GoogleLogin.renderButton(loginBtn);
    });
    
    let credential = GoogleLogin.getCredential();
    if (credential === 'expired') {
        GoogleLogin.removeCredential();
        new Toast(`Sua sessão expirou. Por favor, faça login novamente.`, { type: 'error' });
        credential = null;
    }
    
    GoogleLogin.onSignIn(() => location.href = `/${loginPath}`);
    if (credential) {
        location.href = `/${loginPath}`;
        return;
    }
    GoogleLogin.prompt(loginPath);
}

main().catch(e => console.error(e));
