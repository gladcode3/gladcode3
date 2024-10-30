import GoogleLogin from "./helpers/google-login.js";
import Toast from "./components/toast.js";

// WebPack LESS File Reference
import '../less/home.less';

async function main() {
    const loginPath = `dashboard`;

    // Init Google Login and Save JWT in LS
    await GoogleLogin.init({ redirectUri: `https://${window.location.hostname}/${loginPath}` });

    // on login fail
    GoogleLogin.onFail(async () => {
        console.warn('login fail');

        const loginBtn = document.querySelector('#button-login')
        GoogleLogin.renderButton(loginBtn);
    });
    
    let credential = GoogleLogin.getCredential();

    if (credential === 'expired') {
        GoogleLogin.removeCredential();
        new Toast(`Sua sessão expirou. Por favor, faça login novamente.`, { type: 'error' });
        credential = null;
    }
    
    // on login sucefull
    GoogleLogin.onSignIn(() => location.href = `/${loginPath}`);
    
    if (credential) {
        location.href = `/${loginPath}`;
        return;
    }

    GoogleLogin.prompt(loginPath);
}

main().catch(e => console.error(e));
