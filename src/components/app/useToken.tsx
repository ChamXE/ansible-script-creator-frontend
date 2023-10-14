import { useState } from 'react';

function useToken() {
    const getUserToken = () => {
        const tokenString = localStorage.getItem('userToken');
        const userToken: Token = tokenString ? JSON.parse(tokenString) : {
            username: ""
        };
        return userToken;
    }

    const [userToken, setUserToken] = useState<Token>(getUserToken());

    const saveToken = (userToken: Token) => {
        localStorage.setItem('userToken', JSON.stringify(userToken));
        setUserToken(userToken);
    }

    return {
        setUserToken: saveToken,
        userToken
    }
}

export default useToken;