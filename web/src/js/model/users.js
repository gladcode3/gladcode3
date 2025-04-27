import Api from "../helpers/api.js";
import LocalData from "../helpers/local-data.js";

// Symbol é usado como uma "chave de acesso" a propriedades e métodos privados.
const kStorageKey = Symbol('kStorageKey');
const kApi = Symbol('kApi');
const kSetApiInstance = Symbol('kSetApiInstance');

class Users {
    static [kStorageKey] = 'user-infos';
    static [kApi] = null;

    static [kSetApiInstance]() {
        try {
            if (!this[kApi]) this[kApi] = new Api();
        } catch(err) {
            console.log(err);
            throw err;
        }
    }

    static async getUserData() {
        this[kSetApiInstance]();
        return await this[kApi].get('users/user');
    }

    static async getGladiators() {
        this[kSetApiInstance]();
        return await this[kApi].get('gladiators/master');
    }

    static async getUserByName(name) {
        this[kSetApiInstance]();
        return await this[kApi].get(`users/${name}`);
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
        this[kSetApiInstance]();

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
        const updatedUser = await this[kApi].put('users/user', {
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
        const data = new LocalData({ id: this[kStorageKey] }).get();
        return data;
    }

    static async saveLocalUserData() {
        const userData = await this.getUserData();

        new LocalData({ id: this[kStorageKey] })
            .set({ data: userData });
    }

    static async removeLocalUserData() {
        new LocalData({ id: this[kStorageKey] }).remove();
    }

    // Calculate xp for next lvl
    static calcXpToNextLvl({ lvl }) {
        const firstWeight = 1.9;
        const secondWeight = 130;

        return (parseInt(lvl) * firstWeight + 1) * secondWeight;
    }
}

export default Users;
