import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import useToken from "@/components/app/useToken";
import { Router } from "~/device";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { Box, Button, Container, Typography } from "@mui/material";
import ViewBGP from "@/components/service/viewBGP";
import { getDevice, isRouter } from '@/components/device/functions';

function BGP() {
    const apiRef = useGridApiRef();
    const { userToken } = useToken();
    const [router, setRouter] = useState<Router[] | null>(null);
    const [viewBGPConfig, setViewBGPConfig] = useState<React.ReactElement| null>(null);

    const handleSelectRouter = () => {
        const row = apiRef.current.getSelectedRows();
        if(!row.size) return alert("Please select a router to view!");
        const rowData = row.values().next().value;
        setViewBGPConfig(<ViewBGP
            routerid={rowData.routerid}
            handleResetViewBGP={handleResetViewBGP} />
        )
    }

    const handleResetViewBGP = () => {
        setViewBGPConfig(null);
    }

    const column: GridColDef[] = [
        { field: 'routerid', headerName: 'Router ID', flex: 1, type: 'string', },
        { field: 'routername', headerName: 'Router Name', flex: 1, type: 'string', },
        {
            field: 'null', headerName: 'Action', flex: 1, renderCell: () => (
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSelectRouter}
                    sx={{ mt: 3, mb: 2 }}
                >
                    View BGP Configuration
                </Button>
            )
        }
    ];

    const noRowsOverlay = () => (
        <Typography align='center' p='2rem'> No data! </Typography>
    );

    const generateTable = (router: Router[]) => (
        <DataGrid
            rows={router}
            columns={column}
            initialState={{
                pagination: {
                    paginationModel: {page: 0, pageSize: 5},
                },
                sorting: {
                    sortModel: [{field: 'routerid', sort: 'asc'}],
                },
            }}
            pageSizeOptions={[5, 10]}
            getRowId={(row) => row.routerid}
            slots={{
                noRowsOverlay: noRowsOverlay,
            }}
            apiRef={apiRef}
            autoHeight
        />
    )

    useEffect(() => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        const retrieveRouter = async () => {
            const result = await getDevice(userToken!.username, 'router', source);
            if(result && isRouter(result)) setRouter(result);
        }

        retrieveRouter();

        return () => {
            source.cancel();
        }
    }, [])

    return (
        <Container
            component="main"
            sx={{mt: '1.5rem', ml: '3rem', maxWidth: '95vw !important'}}
        >
            <Box component="span" mb="1rem" display="flex" alignItems="center">
                <Typography fontSize='1.5rem'>Routers</Typography>
            </Box>
            { router && generateTable(router) }
            { viewBGPConfig }
        </Container>
    );
}

export default BGP;