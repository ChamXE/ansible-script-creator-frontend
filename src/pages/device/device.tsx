import useToken from '@/components/app/useToken';
import { getURL } from '@/components/global';
import { Box, Container, IconButton, Typography } from '@mui/material';
import axios from 'axios';
import * as React from 'react';
import { DataGrid, GridColDef, GridValueFormatterParams, useGridApiRef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Server, Router, Switch, Host } from '~/device';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CreateDevice from './createDevice';
import DeleteIcon from '@mui/icons-material/Delete';

interface DeviceProps {
    deviceType: string;
}

function Device({ deviceType }: DeviceProps) {
    const apiRef = useGridApiRef();
    const { userToken } = useToken();
    const [device, setDevice] = useState<Server[] | Router[] | Switch[] | Host[] | null>(null);
    const [server, setServer] = useState<Server[] | null>(null);
    const [newData, setNewData] = useState(0);
    const curDevice = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);

    const serverColumn: GridColDef[] = [
        { field: `${deviceType}id`, headerName: 'ID', flex: 1, type: 'string' },
        { field: `${deviceType}name`, headerName: 'Name', flex: 1, type: 'string', editable: true },
        {
            field: 'null', headerName: 'Action', flex: 1, renderCell: () => (
                <Box component="span" display="flex">
                    <IconButton>
                        <SaveIcon />
                    </IconButton>
                    <IconButton sx={{ ml: "1rem" }}>
                        <EditIcon />
                    </IconButton>
                    <IconButton sx={{ ml: "1rem" }} onClick={handleDelete}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )
        }
    ];

    const otherColumn: GridColDef[] = [
        ...serverColumn.slice(0, 2),
        {
            field: `serverid`, headerName: 'Server', flex: 1, type: 'string', valueFormatter: (params: GridValueFormatterParams<number>) => {
                if (server) {
                    for (let i = 1; i < server.length; i++) {
                        if (server[i].serverid === params.value) return server[i].servername;
                    }
                    return server[0].servername;
                }
            }
        },
        ...serverColumn.slice(2)
    ]

    const routerColumn: GridColDef[] = [
        ...otherColumn.slice(0, 2),
        {
            field: 'nic', headerName: 'Interfaces', flex: 1, type: 'string', editable: true, valueFormatter: (params: GridValueFormatterParams<string[]>) => {
                if (!params.value) return '';
                let nics = "";
                for (let i = 0; i < params.value.length; i++) {
                    nics += params.value[i]
                    if (i !== params.value.length - 1) nics += ", "
                }
                return nics;
            }
        },
        ...otherColumn.slice(2)
    ];

    const noRowsOverlay = () => (
        <Typography align='center' p='2rem'> No data! </Typography>
    );

    const generateTable = (device: Server[] | Router[] | Switch[] | Host[]) => (
        <DataGrid
            rows={device}
            columns={deviceType === "router" ? routerColumn : (deviceType === "server" ? serverColumn : otherColumn)}
            initialState={{
                pagination: {
                    paginationModel: { page: 0, pageSize: 5 },
                },
            }}
            pageSizeOptions={[5, 10]}
            getRowId={(row) => deviceType === "router" ? row.routerid : row[`${deviceType}id`]}
            slots={{
                noRowsOverlay: noRowsOverlay
            }}
            autoHeight
            apiRef={apiRef}
            sx={{ minWidth: '250px' }}
        />
    )

    const newDataIncoming = () => {
        setNewData((prev) => prev += 1);
    }

    const handleDelete = async () => {
        if (apiRef.current.getSelectedRows().size) {
            const row = apiRef.current.getSelectedRows().values().next().value;
            console.log(row);
            const sureDelete = window.confirm(`Are you sure you want to delete the ${deviceType} ${row[deviceType + 'name']}?`);
            if (sureDelete) {
                const result = await deleteDevice(row[`${deviceType}id`]);
                if (result) setNewData((prev) => prev -= 1);
            }
        }
        else alert("Please select row!");
    }

    async function deleteDevice(id: number): Promise<number> {
        try {
            const response = await axios.delete(`${getURL()}/device/${deviceType}/${id}`);
            if (!response.data.result) return 0;
            return 1;
        } catch (e) {
            console.error(e.message);
            alert('Device deletion failed!');
            return 0;
        }
    }

    async function getDevice(username: string): Promise<Server[] | Router[] | Switch[] | Host[] | null> {
        try {
            const response = await axios.get(`${getURL()}/device/${deviceType}/${username}`);

            if (!response.data.result) {
                console.error(response.data.message);
                return null;
            }

            if (Object.keys(response.data.data).length) {
                switch (deviceType) {
                    case "server":
                        const server: Server[] = JSON.parse(JSON.stringify(response.data.data.server));
                        return server;
                    case "router":
                        const router: Router[] = JSON.parse(JSON.stringify(response.data.data.router));
                        return router;
                    case "switch":
                        const switches: Switch[] = JSON.parse(JSON.stringify(response.data.data.switch));
                        return switches;
                    case "host":
                        const host: Host[] = JSON.parse(JSON.stringify(response.data.data.host));
                        return host;
                    default:
                        return null;
                }
            }
            return null;
        } catch (e) {
            alert('Error fetching device data!');
            console.error(e.message);
            return null;
        }
    }

    async function getServer(username: string): Promise<Server[] | null> {
        try {
            const response = await axios.get(`${getURL()}/device/server/${username}`)

            if (!response.data.result) {
                console.error(response.data.message);
                return null;
            }

            if (Object.keys(response.data.data).length) {
                const server: Server[] = JSON.parse(JSON.stringify(response.data.data.server));
                return server;
            }
            return null;
        } catch (e) {
            alert('Error fetching server!');
            console.error(e.message);
            return null;
        }
    }

    useEffect(() => {
        const server = async () => {
            const server = await getServer(userToken.username);
            setServer(server);
        }

        server();

        const device = async () => {
            const devices = await getDevice(userToken.username);
            setDevice(devices);
        };

        device();
    }, [deviceType, newData]);

    return (
        <Container
            component="main"
            sx={{ mt: '1.5rem', ml: '3rem' }}
        >
            <Box component="span" mb="1rem" display="flex" alignItems="center">
                <Typography fontSize='1.5rem'>{curDevice}</Typography>
                <CreateDevice newDataIncoming={newDataIncoming} deviceType={deviceType} />
            </Box>
            {
                device ?
                    generateTable(device) :
                    generateTable([])
            }

        </Container>
    )
}

export default Device;