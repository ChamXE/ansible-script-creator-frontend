import useToken from '@/components/app/useToken';
import { deleteDevice, getDevice } from '@/components/device/functions';
import { getProject } from '@/components/global';
import { Box, Container, Divider, IconButton, Typography } from '@mui/material';
import axios from 'axios';
import * as React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, GridValueFormatterParams, useGridApiRef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Server, Router, Switch, Host, RouterConfiguration } from '~/device';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Project } from '@/models/project';
import CreateEditRouter from '@/components/device/createEditRouter';

function RouterList() {
    const apiRef = useGridApiRef();
    const { userToken } = useToken();
    const [device, setDevice] = useState<Router[] | null>(null);
    const [project, setProject] = useState<Project[] | null>(null);
    const [newData, setNewData] = useState(0);
    const [edit, setEdit] = useState<JSX.Element | null>(null);

    const column: GridColDef[] = [
        { field: 'routerid', headerName: 'ID', flex: 0.5, type: 'string' },
        { field: 'routername', headerName: 'Name', flex: 0.5, type: 'string' },
        { field: 'management', headerName: 'Management IP Address', flex: 1, type: 'string', valueFormatter: (params: GridValueFormatterParams) => params.value.length ? params.value : "N/A" },
        {
            field: 'projectid', headerName: 'Project', flex: 0.5, type: 'string', valueFormatter: (params: GridValueFormatterParams<number>) => {
                if (project) {
                    for (let i = 1; i < project.length; i++) {
                        if (project[i].serverid === params.value) return project[i].projectname;
                    }
                    return project[0].projectname;
                }
            }
        },
        {
            field: 'configuration.users', headerName: 'Users', flex: 1, type: 'string', renderCell: (params: GridRenderCellParams) => {
                const { users }: RouterConfiguration = params.row.configuration;
                return users.length ? (
                    <Box width='-webkit-fill-available'>
                        {
                            users.map(({ username, password, secret, privilege }, index) => (
                                <Box key={username}>
                                    <Typography>Username: {username}</Typography>
                                    <Typography>Secret: {secret}</Typography>
                                    <Typography>Password: {password}</Typography>
                                    <Typography>Privilege: {privilege}</Typography>
                                    {index !== users.length - 1 ? <Divider /> : <></>}
                                </Box>
                            ))
                        }
                    </Box>
                ) : <Typography>N/A</Typography>;
            }
        },
        {
            field: 'configuration.routes', headerName: 'Routes', flex: 1, type: 'string', renderCell: (params: GridRenderCellParams) => {
                const { routes }: RouterConfiguration = params.row.configuration;
                return routes.length ?
                    (
                        <Box width='-webkit-fill-available'>
                            {
                                routes.map(({ prefix, mask, exitInterface, exitGateway, metric }, index) => (
                                    <Box key={prefix}>
                                        <Typography>Prefix: {prefix}</Typography>
                                        <Typography>Mask: {mask}</Typography>
                                        {exitInterface ? <Typography>Exit Interface: {exitInterface}</Typography> : <></>}
                                        {exitGateway ? <Typography>Exit Gateway: {exitGateway}</Typography> : <></>}
                                        {metric ? <Typography>Metric: {metric}</Typography> : <></>}
                                        {index !== routes.length - 1 ? <Divider /> : <></>}
                                    </Box>
                                ))
                            }
                        </Box>
                    ) : <Typography>N/A</Typography>;
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

    function isRouter(item: Server[] | Router[] | Switch[] | Host[]): item is Router[] {
        if (!item.length) return false;
        return 'routerid' in item[0];
    }

    const noRowsOverlay = () => (
        <Typography align='center' p='2rem'> No data! </Typography>
    );

    const generateTable = (device: Router[]) => {
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
                getRowId={(row) => row.routerid}
                slots={{
                    noRowsOverlay: noRowsOverlay
                }}
                apiRef={apiRef}
                getRowHeight={() => 'auto'}
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
            const sureDelete = window.confirm(`Are you sure you want to delete the router ${row.routername}?`);
            if (sureDelete) {
                const result = await deleteDevice(row.routerid, 'router');
                if (result) setNewData((prev) => prev -= 1);
            }
        }
        else alert("Please select row!");
    }

    const handleEdit = async () => {
        const row = apiRef.current.getSelectedRows();
        if(row.size) {
            const router: Router = row.values().next().value
            setEdit(
                <CreateEditRouter router={router} project={project} resetEdit={resetEdit} newDataIncoming={newDataIncoming}/>
            );
        }
    }

    const resetEdit = () => {
        setEdit(null);
    }

    useEffect(() => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        const project = async () => {
            const devices = await getProject(userToken.username, source);
            if (devices) setProject(devices);
        }

        const device = async () => {
            const devices = await getDevice(userToken.username, 'router', source);
            if (devices && isRouter(devices)) setDevice(devices);
        };

        project();
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
                <Typography fontSize='1.5rem'>Router</Typography>
                <CreateEditRouter newDataIncoming={newDataIncoming} project={project} />
            </Box>
            {
                device && generateTable(device)
            }
            { edit }
        </Container>
    )
}

export default RouterList;