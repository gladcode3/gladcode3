import Toast from "../components/toast.js";
import GoogleLogin from "../helpers/google-login.js";

class UserAuth {
    static async auth() {
        await GoogleLogin.init({ auto: false });
        console.log('GoogleLogin.getCredential()', GoogleLogin.getCredential());

        let credential = GoogleLogin.getCredential();

        if (credential === 'expired') {
            GoogleLogin.removeCredential();

            new Toast(
                'Sua sessão expirou. Por favor, faça login novamente.',
                { type: 'error' }
            );

            credential = null;
        }

        const onFailE = async () => {
            console.warn('onFailE');

            const loginBtn = document.querySelector('#button-login');
            GoogleLogin.renderButton(loginBtn);
        };

        const onSucessE = () => {
            console.warn('onSucessE');
        };

        GoogleLogin.onFail(onFailE);
        GoogleLogin.onSignIn(onSucessE);

        if (credential) {
            onSucessE();
            return;
        }

        GoogleLogin.prompt();
    }
}

export default UserAuth;
