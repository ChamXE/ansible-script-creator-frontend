import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getURL } from "@/components/global";
import axios from "axios";

const pages = ['Project', 'Device'];
const settings = ['Account', 'Dashboard', 'Logout'];
const devices = ['Router', 'Switch', 'Host'];

interface NavBarProps {
    setUserToken: (userToken: Token) => void;
    isLoggedIn: boolean;
}

function NavBar({ setUserToken, isLoggedIn }: NavBarProps) {
    const navigate = useNavigate();
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const [anchorElDevice, setAnchorElDevice] = useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleOpenDeviceMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElDevice(event.currentTarget);
    }

    const handleCloseNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(null);
        switch (event.currentTarget.textContent) {
            case "Project":
                navigate('/project');
                break;
            case "Device":
                handleOpenDeviceMenu(event);
                break
            default:
                break;
        }
    };

    const handleCloseUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(null);
        switch (event.currentTarget.textContent) {
            case "Account":
                navigate('/profile');
                break;
            case "Dashboard":
                navigate('/dashboard');
                break
            case "Logout":
                setUserToken({
                    username: "",
                });
                sessionStorage.removeItem("userToken");
                axios.post(`${getURL()}/user/logout`);
                break;
            default:
                break;
        }
    };

    const handleCloseDeviceMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElDevice(null);
        switch (event.currentTarget.textContent) {
            case "Server":
                navigate('/device/server');
                break;
            case "Router":
                navigate('/device/router');
                break
            case "Switch":
                navigate('/device/switch');
                break;
            case "Host":
                navigate('/device/host');
                break
            default:
                break;
        }
    }

    return (
        <AppBar position="static" >
            <Container maxWidth={false} sx={{ marginLeft: "0px", marginRight: "0px" }}>
                <Toolbar disableGutters>
                    <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        LOGO
                    </Typography>
                    {
                        isLoggedIn ?
                            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                                <Menu
                                    id="menu-appbar"
                                    anchorEl={anchorElNav}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                    open={Boolean(anchorElNav)}
                                    onClose={handleCloseNavMenu}
                                    sx={{
                                        display: { xs: 'block', md: 'none' },
                                    }}
                                >
                                    { isLoggedIn && pages.map((page) => (
                                        <MenuItem key={page} onClick={handleCloseNavMenu}>
                                            <Typography textAlign="center">{page}</Typography>
                                        </MenuItem>
                                    ))}
                                </Menu>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="device-appbar"
                                    anchorEl={anchorElDevice}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElDevice)}
                                    onClose={handleCloseDeviceMenu}
                                >
                                    { isLoggedIn && devices.map((devices) => (
                                        <MenuItem key={devices} onClick={handleCloseDeviceMenu}>
                                            <Typography textAlign="center">{devices}</Typography>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Box>
                        :
                            <></>
                    }
                    {
                        isLoggedIn ?
                            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                                {pages.map((page) => (
                                    <Button
                                        key={page}
                                        onClick={handleCloseNavMenu}
                                        sx={{ my: 2, color: 'white', display: 'block' }}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </Box>
                        :
                            <></>
                    }
                    {
                        isLoggedIn ?
                            <Box sx={{ flexGrow: 0 }}>
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <AccountCircleIcon fontSize='large' />
                                </IconButton>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    {settings.map((setting) => (
                                        <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                            <Typography textAlign="center">{setting}</Typography>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Box>
                        :
                            <></>
                    }
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default NavBar;