import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Credentials, User } from '@/models/user';
import useToken from '@/components/app/useToken';
import { getURL } from '@/components/global';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

async function getUser(username: string): Promise<User | null> {
    try {
        const response = await axios.get(`${getURL()}/user/${username}`);
        if (!response.data.result) {
            console.error(response.data.message);
            return null;
        }
        if (Object.keys(response.data.data).length) {
            const user: User = JSON.parse(JSON.stringify(response.data.data));
            return user;
        }
        return null;

    } catch (e) {
        alert('Error fetching user data!');
        console.error(e.message);
        return null;
    }
}

async function changePassword(passwords: Credentials): Promise<number> {
    const response = await axios.post(`${getURL()}/user/changePassword`, passwords);
    if (!response.data.result) return 1;
    if (!response.data.data.success) return 1;
    return 0;
}

interface ChangePasswordModalProps {
    userToken: Token;
}

function ChangePasswordModal({ userToken }: ChangePasswordModalProps) {
    const [passwords, setPasswords] = useState<Credentials>({
        username: userToken.username,
        password: "",
        newPassword: "",
        confirmNewPassword: ""
    });
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [oldPasswordFilled, setOldPasswordFilled] = useState(false);
    const [oldPasswordErrored, setOldPasswordErrored] = useState(false);
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
    const [confirmPasswordErrored, setConfirmPasswordErrored] = useState(false);
    const [confirmPasswordDisabled, setConfirmPasswordDisabled] = useState(true);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const password = data.get('password')?.toString();
        const newPassword = data.get('newPassword')?.toString();
        const confirmNewPassword = data.get('confirmNewPassword')?.toString();
        if (password && newPassword && confirmNewPassword) {
            if (newPassword === confirmNewPassword) {
                const result = await changePassword({
                    username: passwords.username,
                    password,
                    newPassword,
                    confirmNewPassword
                });
                if (result) {
                    setOldPasswordErrored(true);
                    return;
                }
                alert("Password successfully changed!");
                setOpen(false);
                return;
            }
            setConfirmPasswordErrored(true);
        }
    };

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords((prevPasswords) => ({
            ...prevPasswords,
            [event.target.name]: event.target.value,
        }));
        switch (event.target.name) {
            case "password":
                setOldPasswordFilled(event.target.value ? true : false);
                if (event.target.value && oldPasswordErrored) setOldPasswordErrored(false);
                break;
            case "newPassword":
                setConfirmPasswordDisabled(event.target.value ? false : true);
                checkConfirmPassword("newPassword", event.target.value);
                break;
            case "confirmNewPassword":
                checkConfirmPassword("confirmNewPassword", event.target.value);
                break;
            default:
                break;
        }
    }

    const checkConfirmPassword = async (name: string, value: string) => {
        if (name === "confirmNewPassword") {
            if (passwords.newPassword !== value) {
                setConfirmPasswordErrored(true);
            }
            else {
                setConfirmPasswordErrored(false);
            }
        }
        else {
            if (passwords.confirmNewPassword) {
                if (passwords.confirmNewPassword !== value) {
                    setConfirmPasswordErrored(true);
                }
                else {
                    setConfirmPasswordErrored(false);
                }
            }
        }
    }

    useEffect(() => {
        if (oldPasswordFilled && !confirmPasswordDisabled && !confirmPasswordErrored) {
            setSubmitButtonDisabled(false);
        }
        else {
            setSubmitButtonDisabled(true);
        }
    }, [oldPasswordFilled, confirmPasswordDisabled, confirmPasswordErrored]);

    return (
        <div>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleOpen}
            >
                Change Password
            </Button>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={open}
                onClose={handleClose}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Fade in={open}>
                    <Box component="form" onSubmit={handleSubmit} sx={style}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Old Password"
                            type="password"
                            id="password"
                            inputProps={{
                                minLength: 8
                            }}
                            onChange={handleChange}
                            error={oldPasswordErrored}
                            helperText={oldPasswordErrored ? "Old password is wrong!" : ""}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            required
                            name="newPassword"
                            label="New Password"
                            type="password"
                            id="newPassword"
                            inputProps={{
                                minLength: 8
                            }}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            required
                            name="confirmNewPassword"
                            label="Confirm New Password"
                            type="password"
                            id="confirmNewPassword"
                            inputProps={{
                                minLength: 8
                            }}
                            onChange={handleChange}
                            disabled={confirmPasswordDisabled}
                            error={confirmPasswordErrored}
                            helperText={confirmPasswordErrored ? "Passwords do not match!" : ""}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={submitButtonDisabled}
                        >
                            Submit
                        </Button>
                    </Box>
                </Fade>
            </Modal>
        </div>
    );
}

function Profile() {
    const { userToken } = useToken();
    const [user, setUser] = useState<User>({
        username: "",
        password: "",
        email: ""
    });

    useEffect(() => {
        const user = async () => {
            const userData = await getUser(userToken.username);
            if (userData) setUser(userData);
        };

        user();
    }, [])

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <AccountCircle />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Account
                </Typography>
                <Box component="div" sx={{ mt: 1 }}>
                    <TextField
                        type="text"
                        margin="normal"
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        InputProps={{
                            readOnly: true
                        }}
                        value={user.username}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        name="email"
                        label="E-mail"
                        type="email"
                        id="email"
                        InputProps={{
                            readOnly: true
                        }}
                        value={user.email}
                    />
                    <ChangePasswordModal userToken={userToken} />
                </Box>
            </Box>
        </Container>
    )
}

export default Profile;