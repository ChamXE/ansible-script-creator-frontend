import useToken from '@/components/app/useToken';
import { deleteDevice, getDevice } from '@/components/global';
import { Box, Container, IconButton, Typography } from '@mui/material';
import axios from 'axios';
import * as React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, useGridApiRef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Server, Router, Switch, Host } from '~/device';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateEditServer from '@/components/device/createEditServer';

function ServerList() {
    const apiRef = useGridApiRef();
    const { userToken } = useToken();
    const [device, setDevice] = useState<Server[] | null>(null);
    const [newData, setNewData] = useState(0);
    const [edit, setEdit] = useState<JSX.Element | null>(null);

    const column: GridColDef[] = [
        { field: 'serverid', headerName: 'ID', flex: 0.5, type: 'string' },
        { field: 'servername', headerName: 'Name', flex: 1, type: 'string' },
        { field: 'ip', headerName: 'IP Address', flex: 1, type: 'string' },
        {
            field: 'rootcredential',
            headerName: 'Credentials',
            flex: 1, type: 'string',
            renderCell: (params: GridRenderCellParams<Server>) => {
                const { username, password } = params.row.rootcredential;
                return (
                    <Box m='0.5rem 0 0.5rem 0'>
                        <Typography>Username: {username}</Typography>
                        <Typography>Password: {password}</Typography>
                    </Box>
                );
            }
        },
        {
            field: 'null', headerName: 'Action', flex: 0.5, renderCell: () => (
                <Box component="span" display="flex">
                    <IconButton onClick={handleEdit}>
                        <EditIcon />
                    </IconButton>
                    <IconButton sx={{ ml: "1rem" }} onClick={handleDelete}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )
        }
    ];

    function isServer(item: Server[] | Router[] | Switch[] | Host[]): item is Server[] {
        if (!item.length) return false;
        return 'serverid' in item[0];
    }

    const noRowsOverlay = () => (
        <Typography align='center' p='2rem'> No data! </Typography>
    );

    const generateTable = (device: Server[]) => {
        return (
            <DataGrid
                rows={device}
                columns={column}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                    },
                }}
                pageSizeOptions={[5, 10]}
                getRowId={(row) => row.serverid}
                slots={{
                    noRowsOverlay: noRowsOverlay
                }}
                apiRef={apiRef}
                autoHeight
            />
        );
    }

    const newDataIncoming = () => {
        setNewData((prev) => prev += 1);
    }

    const handleDelete = async () => {
        if (apiRef.current.getSelectedRows().size) {
            const row = apiRef.current.getSelectedRows().values().next().value;
            console.log(row);
            const sureDelete = window.confirm(`Are you sure you want to delete the server ${row.servername}?`);
            if (sureDelete) {
                const result = await deleteDevice(row.serverid, 'server');
                if (result) setNewData((prev) => prev -= 1);
            }
        }
        else alert("Please select row!");
    }

    const handleEdit = async () => {
        const row = apiRef.current.getSelectedRows();
        if(row.size) {
            const server: Server = row.values().next().value
            setEdit(
                <CreateEditServer server={server} resetEdit={resetEdit} newDataIncoming={newDataIncoming}/>
            );
        }
    }

    const resetEdit = () => {
        setEdit(null);
    }

    useEffect(() => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        const device = async () => {
            const devices = await getDevice(userToken.username, 'server', source);
            if (devices && isServer(devices)) setDevice(devices);
        };

        device();

        return () => {
            source.cancel();
        }
    }, [newData]);

    return (
        <Container
            component="main"
            sx={{ mt: '1.5rem', ml: '3rem', maxWidth: '95vw !important' }}
        >
            <Box component="span" mb="1rem" display="flex" alignItems="center">
                <Typography fontSize='1.5rem'>Server</Typography>
                <CreateEditServer newDataIncoming={newDataIncoming} />
            </Box>
            {
                device && generateTable(device)
            }
            { edit }
        </Container>
    )
}

export default ServerList;