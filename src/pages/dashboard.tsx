import { Box, Typography } from '@mui/material';
import useToken from '@/components/app/useToken'
import React from 'react';

function Dashboard() {
    const { userToken } = useToken();
    return (
        <Box component="div" sx={{
            marginLeft: "2rem",
            marginTop: "1rem",
            display: "flex",
            justifyContent: "center"
        }}>
            <Typography paragraph>Welcome back, {userToken!.username}.</Typography>
        </Box>
    )
}

export default Dashboard;