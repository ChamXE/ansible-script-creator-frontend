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
import { Credentials } from '@/models/user';
import { getURL } from '@/components/global';

interface LoginProps {
    setUserToken: (userToken: Token) => void;
}

async function loginUser(credentials: Credentials): Promise<Token> {
    try {
        const response = await axios.post(`${getURL()}/user/login`, credentials);
        if (!response.data.result) {
            console.error(response.data.message);
            return {
                username: "-1"
            };
        }
        if (Object.keys(response.data.data).length) {
            return JSON.parse(JSON.stringify(response.data.data));
        }
        return {
            username: "1",
        };

    } catch (e) {
        alert('Login failed! Please try again!');
        console.error(e.message);
        return {
            username: "-1",
        };
    }
}

function Login({ setUserToken }: LoginProps) {
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const username = data.get('username')?.toString();
        const password = data.get('password')?.toString();
        if (username && password) {
            const token = await loginUser({
                username,
                password
            });
            if (+token.username === 1) {
                alert("Incorrect username/password!");
                return;
            }
            if(+token.username === -1) {
                return;
            }
            setUserToken(token);
        }
    };

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
                    Login
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
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Login
                    </Button>
                    <Grid container>
                        <Grid item>
                            <Link href="/register" variant="body2">
                                {"Don't have an account? Register"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}

export default Login;