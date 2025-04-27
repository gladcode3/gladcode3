import Api from "../helpers/api.js";
import LocalData from "../helpers/local-data.js";


class Users {
    static _storageKey = 'user-infos';
    static _api = null;

    static _setApiInstance() {
        try {
            if (!this._api) this._api = new Api();
        } catch(err) {
            console.log(err);
            throw err;
        }
    }

    static async getUserData() {
        this._setApiInstance();
        return await this._api.get('users/user');
    }

    static async getGladiators() {
        this._setApiInstance();
        return await this._api.get('gladiators/master');
    }

    static async getUserByName(name) {
        this._setApiInstance();
        return await this._api.get(`users/${name}`);
    }

    // Prototype:
    static async update({
        nickname,
        emailPref: {
            pref_language,
            pref_message,
            pref_friend,
            pref_update,
            pref_duel,
            pref_tourn
        }
    }) {
        this._setApiInstance();

        const {
            nickname       : oldNickname,
            pref_language  : oldPrefLanguage,
            pref_tourn     : oldPrefTourn,
            pref_duel      : oldPrefDuel,
            pref_update    : oldPrefUpdate,
            pref_friend    : oldPrefFriend,
            pref_message   : oldPrefMessage
        } = Users.getLocalUserData();
        
        // const a = !pref_language && pref_language !== false ? oldPrefLanguage : pref_language;

        // Update:
        const updatedUser = await this._api.put('users/user', {
            nickname: nickname || oldNickname,
            emailPref: {
                pref_language: pref_language || oldPrefLanguage,
                pref_message : pref_message ?? oldPrefMessage,
                pref_friend  : pref_friend ?? oldPrefFriend,
                pref_update  : pref_update ?? oldPrefUpdate,
                pref_duel    : pref_duel ?? oldPrefDuel,
                pref_tourn   : pref_tourn ?? oldPrefTourn
            }
        });

        if (!updatedUser.user) throw new Error('failed to update!');

        await this.saveLocalUserData();
        
        dispatchEvent(new CustomEvent('user-updated'));
    }

    // Local user data methods
    static getLocalUserData() {
        const data = new LocalData({ id: this._storageKey }).get();
        return data;
    }

    static async saveLocalUserData() {
        const userData = await this.getUserData();

        new LocalData({ id: this._storageKey })
            .set({ data: userData });
    }

    static async removeLocalUserData() {
        new LocalData({ id: this._storageKey }).remove();
    }

    // Calculate xp for next lvl
    static calcXpToNextLvl({ lvl }) {
        const firstWeight = 1.9;
        const secondWeight = 130;

        return (parseInt(lvl) * firstWeight + 1) * secondWeight;
    }
}

export default Users;
