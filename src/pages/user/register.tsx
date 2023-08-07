import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import axios from 'axios';
import { User } from '@/models/user';
import { getURL } from '@/components/global';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

async function createNewUser(credentials: User): Promise<number> {
    try {
        const response = await axios.post(`${getURL()}/user/registerUser`, credentials);
        if (!response.data.result) {
            console.error(response.data.message);
            return 0;
        }
        alert('User successfully created!');
        return 1;
    } catch (e) {
        alert('User creation failed! Please try again!');
        console.error(e.message);
        return 0;
    }
}

async function checkUsernameAvailability(username: string): Promise<number> {
    try {
        const response = await axios.get(`${getURL()}/user/checkUsernameAvailability/${username}`);
        if (!response.data.result) {
            console.error(response.data.message);
            return -1;
        }
        const result: { availability: boolean } = JSON.parse(JSON.stringify(response.data.data))
        return Number(result.availability);
    } catch (e) {
        console.error(e.message);
        return -1;
    }
}

function Register() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: "",
        password: "",
        confirmPassword: ""
    });
    const [usernameAvailability, setUsernameAvailability] = useState(true);
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(true);
    const [confirmPasswordErrored, setConfirmPasswordErrored] = useState(false);
    const [confirmPasswordDisabled, setConfirmPasswordDisabled] = useState(true);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const username = data.get('username')?.toString();
        const password = data.get('password')?.toString();
        const confirmPassword = data.get('confirmPassword')?.toString();
        const email = data.get('email')?.toString();
        if (username && password && confirmPassword && email) {
            if(password === confirmPassword) {
                const result = await createNewUser({
                    username,
                    password,
                    email
                });
                if (result) navigate('/login');
                return;
            }
            setConfirmPasswordErrored(true);
        }
    };

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser((prevUser) => ({
            ...prevUser,
            [event.target.name]: event.target.value,
        }));
        switch (event.target.name) {
            case "password":
                setConfirmPasswordDisabled(event.target.value? false: true);
                checkConfirmPassword("password", event.target.value);
                break;
            case "confirmPassword":
                checkConfirmPassword("confirmPassword", event.target.value);
                break;
            default:
                break;
        }
    }

    const checkConfirmPassword = async (name: string, value: string) => {
        if(name === "confirmPassword") {
            if (user.password !== value) {
                setConfirmPasswordErrored(true);
            }
            else {
                setConfirmPasswordErrored(false);
            }
        }
        else {
            if(user.confirmPassword) {
                if (user.confirmPassword !== value) {
                    setConfirmPasswordErrored(true);
                }
                else {
                    setConfirmPasswordErrored(false);
                }
            }
        }
    }

    useEffect(() => {
        const checkTimeout = setTimeout(async () => {
            if(user.username) {
                const isAvailable = await checkUsernameAvailability(user.username);
                setUsernameAvailability(isAvailable === 1 ? true : false);
            }
        }, 1000);

        return () => {
            clearTimeout(checkTimeout);
        }
    }, [user.username]);

    useEffect(() => {
        if(usernameAvailability && !confirmPasswordDisabled && !confirmPasswordErrored) {
            setSubmitButtonDisabled(false);
        }
        else {
            setSubmitButtonDisabled(true);
        }
    }, [usernameAvailability, confirmPasswordDisabled, confirmPasswordErrored]);

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
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Register
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        type="text"
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoFocus
                        inputProps={{
                            minLength: 4
                        }}
                        onChange={handleChange}
                        error={!usernameAvailability}
                        helperText={!usernameAvailability ? "Username is already taken!" : ""}
                    />
                    <TextField
                        type="email"
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="E-mail"
                        name="email"
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        inputProps={{
                            minLength: 8
                        }}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        inputProps={{
                            minLength: 8
                        }}
                        disabled={confirmPasswordDisabled}
                        error={confirmPasswordErrored}
                        helperText={confirmPasswordErrored ? "Passwords do not match!" : ""}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={submitButtonDisabled}
                    >
                        Register
                    </Button>
                    <Grid container>
                        <Grid item>
                            <Link href="/login" variant="body2">
                                {"Already have an account? Login"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}

export default Register;