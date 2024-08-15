import GladcodeV2API from "../model/request.js";
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

    const api = new GladcodeV2API({ url: 'https://gladcode.werlang.site', sessionId: userSession.sessionId });

    await api.post('back_login', {
        action: 'SET',
        token: userSession.token
    });

    return api;
};

export default validateSession;
