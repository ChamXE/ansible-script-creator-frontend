import { useState } from 'react';
import dayjs from 'dayjs';

function useToken() {

    const getUserToken = () => {
        const tokenString = localStorage.getItem('userToken');
        const ut: Token = tokenString ? JSON.parse(tokenString) : null;
        if(ut) {
            if(dayjs(ut.expire) < dayjs()) {
                localStorage.removeItem('userToken');
                window.location.replace('/login');
                return null;
            }
        }
        return ut;
    }

    const [userToken, setUserToken] = useState<Token | null>(getUserToken());

    const saveToken = (ut: Token | null) => {
        if(!ut) {
            if(userToken) localStorage.removeItem('userToken');
        }
        if(ut) localStorage.setItem('userToken', JSON.stringify(ut));
        setUserToken(ut);
    }

    return {
        setUserToken: saveToken,
        userToken
    }
}

export default useToken;