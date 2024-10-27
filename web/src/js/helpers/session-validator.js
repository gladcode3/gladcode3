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
};

export default validateSession;
