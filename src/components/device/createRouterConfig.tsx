import { useEffect, useState } from 'react';
import { Box, Button, Container, Divider, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Route, RouterConfiguration, RouterUser } from '~/device';
import { DataGrid, GridColDef, GridValueFormatterParams, useGridApiRef } from '@mui/x-data-grid';
import { Subnet } from "@/components/global";
import { Interfaces } from "~/project";

interface CreateRouterConfigProps {
    rc: RouterConfiguration;
    interfaces: Interfaces | null;
    handleUpdateRouterConfig: (rc: RouterConfiguration) => void;
}

function CreateRouterConfig({ rc, interfaces, handleUpdateRouterConfig }: CreateRouterConfigProps) {
    const [routerConfig, setRouterConfig] = useState(rc);
    const userApiRef = useGridApiRef();
    const routeApiRef = useGridApiRef();

    const userColumn: GridColDef[] = [
        {
            field: 'username',
            headerName: 'Username',
            flex: 1,
            type: 'string',
            editable: true,
            valueFormatter: (params: GridValueFormatterParams) => {
                const num = isNumber(params.value);
                if (num) return "";
                return params.value;
            },
        },
        { field: 'password', headerName: 'Password', flex: 1, type: 'string', editable: true },
        {
            field: 'privilege',
            headerName: 'Privilege',
            flex: 1,
            type: 'singleSelect',
            editable: true,
            valueOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        },
        {
            field: 'null', headerName: 'Action', flex: 1, editable: false, renderCell: () => (
                <IconButton sx={{ ml: "1rem" }} onClick={handleDeleteUser}>
                    <DeleteIcon />
                </IconButton>
            )
        }
    ];

    const routeColumn: GridColDef[] = [
        { field: 'prefix', headerName: 'Prefix', flex: 1, type: 'string', editable: true },
        {
            field: 'mask',
            headerName: 'Subnet',
            flex: 1,
            type: 'singleSelect',
            editable: true,
            valueOptions: Object.keys(Subnet).reverse().map((s) => `/${s}`)
        },
        {
            field: 'exitInterface',
            headerName: 'Exit Interface',
            flex: 1,
            type: 'singleSelect',
            editable: true,
            valueOptions: interfaces? Object.keys(interfaces).map((key) => {
                return `${key} - ${interfaces[key]}`;
            }) : ['none']
        },
        {
            field: 'exitGateway',
            headerName: 'Exit Gateway',
            flex: 1,
            type: 'string',
            editable: true,
        },
        {
            field: 'metric',
            headerName: 'Metric',
            flex: 1,
            type: 'number',
            editable: true,
        },
        {
            field: 'null', headerName: 'Action', flex: 1, editable: false, renderCell: () => (
                <IconButton sx={{ ml: "1rem" }} onClick={handleDeleteRoute}>
                    <DeleteIcon />
                </IconButton>
            )
        }
    ];

    const handleAddUser = () => {
        setRouterConfig((prev) => {
            let users: RouterUser[];
            if (prev.users) {
                users = [
                    {
                        username: '',
                        password: '',
                        privilege: 15,
                    },
                    ...prev.users,
                ];
            }
            else {
                users = [{
                    username: '',
                    password: '',
                    privilege: 15,
                }];
            }
            return {
                ...prev,
                users: users
            }
        });
    }

    const handleDeleteUser = () => {
        const row: string = userApiRef.current.getSelectedRows().keys().next().value;
        if (row) {
            const rowId = row.slice(4);
            setRouterConfig((prev) => {
                return {
                    ...prev,
                    users: prev.users.filter((_, index) => index !== +rowId)
                }
            });
            return;
        }
        alert('Please select user!');
    }

    const handleUpdateUserRow = (updatedRow: RouterUser, originalRow: RouterUser) => {
        setRouterConfig((prev) => {
            return {
                ...prev,
                users: [
                    ...prev.users.filter((user) => user !== originalRow),
                    updatedRow
                ]
            }
        })
        return updatedRow;
    }

    const handleAddRoute = () => {
        setRouterConfig((prev) => {
            let routes: Route[];
            if (prev.routes) {
                routes = [
                    {
                        prefix: '',
                        mask: '',
                        exitGateway: undefined,
                        exitInterface: undefined,
                        metric: undefined,
                    },
                    ...prev.routes,
                ];
            }
            else {
                routes = [{
                    prefix: '',
                    mask: '',
                    exitGateway: undefined,
                    exitInterface: undefined,
                    metric: undefined,
                }];
            }
            return {
                ...prev,
                routes: routes
            }
        });
    }

    const handleDeleteRoute = () => {
        const row: string = routeApiRef.current.getSelectedRows().keys().next().value;
        if (row) {
            const rowId = row.slice(5);
            setRouterConfig((prev) => {
                return {
                    ...prev,
                    routes: prev.routes.filter((_, index) => index !== +rowId)
                }
            });
            return;
        }
        alert('Please select route!');
    }

    const handleUpdateRouteRow = (updatedRow: Route, originalRow: Route) => {
        setRouterConfig((prev) => {
            return {
                ...prev,
                routes: [
                    ...prev.routes.filter((route) => route !== originalRow),
                    {
                        ...updatedRow,
                        exitInterface: updatedRow.exitInterface === "none" ? undefined : updatedRow.exitInterface
                    }
                ]
            }
        })
        return {
            ...updatedRow,
            exitInterface: updatedRow.exitInterface === "none" ? undefined : updatedRow.exitInterface
        };
    }

    const updateParentRouterConfig = () => {
        handleUpdateRouterConfig(routerConfig);
    }

    const noRowsOverlay = () => (
        <Typography align='center' p='2rem'> No data! </Typography>
    );

    function isNumber(text: string) {
        return /^[0-9]*$/.test(text);
    }

    useEffect(() => {
        updateParentRouterConfig();
    },
        [routerConfig])

    return (
        <Container id='test' sx={{ p: '0 !important' }}>
            <Divider />
            <Box component="span" display="flex" mt="0.5rem">
                <Typography fontSize='1.2rem' m="auto 0 auto 0"> User </Typography>
                <Button
                    variant="contained"
                    sx={{ ml: '0.8rem' }}
                    onClick={handleAddUser}
                >
                    Add User
                </Button>
            </Box>
            <DataGrid
                apiRef={userApiRef}
                autoHeight
                columns={userColumn}
                rows={routerConfig.users}
                slots={{ noRowsOverlay: noRowsOverlay }}
                getRowId={(row) => `user${routerConfig.users.indexOf(row)}`}
                hideFooter
                sx={{ '--DataGrid-overlayHeight': '300px', mt: '0.5rem', mb: '0.5rem' }}
                editMode='row'
                processRowUpdate={handleUpdateUserRow}
                key="usertable"
            />
            <Divider />
            <Box component="span" display="flex" mt="0.5rem">
                <Typography fontSize='1.2rem' m="auto 0 auto 0"> Route </Typography>
                <Button
                    variant="contained"
                    sx={{ ml: '0.8rem' }}
                    onClick={handleAddRoute}
                >
                    Add Route
                </Button>
            </Box>
            <DataGrid
                apiRef={routeApiRef}
                autoHeight
                columns={routeColumn}
                rows={routerConfig.routes}
                slots={{ noRowsOverlay: noRowsOverlay }}
                getRowId={(row) => `route${routerConfig.routes.indexOf(row)}`}
                hideFooter
                sx={{ '--DataGrid-overlayHeight': '300px', mt: '0.5rem' }}
                editMode='row'
                processRowUpdate={handleUpdateRouteRow}
                key="routetable"
            />
        </Container>
    )
}

export default CreateRouterConfig;