export interface Credentials {
    username: string;
    password?: string;
    newPassword?: string;
    confirmNewPassword?: string;
}

export interface User extends Credentials {
    email: string;
}