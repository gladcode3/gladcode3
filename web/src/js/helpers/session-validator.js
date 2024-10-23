import Request from "./request.js";
import GoogleLogin from "./google-login.js";
import TemplateVar from "./template-var.js";

const validateSession = async () => {
    // handle redirect from google login
    function handleRedirect() {
        const credential = TemplateVar.get('googleCredential');
        // console.log(credential);
        if (credential) {
            GoogleLogin.saveCredential(credential);
        }
    }
    handleRedirect();

    const userSession = GoogleLogin.getCredential();

    if (!userSession) {
        location.href = '/';
    };

    const api = new Request({ url: 'https://api.localtest.me' });

    // await api.post('back_login', {
    //     action: 'SET',
    //     token: userSession.token
    // });

    return api;
};

export default validateSession;
