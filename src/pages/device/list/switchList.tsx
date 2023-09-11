import useToken from '@/components/app/useToken';
import { deleteDevice, getDevice, getProject } from '@/components/global';
import { Box, Container, IconButton, Typography } from '@mui/material';
import axios from 'axios';
import * as React from 'react';
import { DataGrid, GridColDef, GridValueFormatterParams, useGridApiRef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Server, Router, Switch, Host } from '~/device';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Project } from '@/models/project';
import CreateEditSwitch from '../createEdit/createEditSwitch';

function SwitchList() {
    const apiRef = useGridApiRef();
    const { userToken } = useToken();
    const [device, setDevice] = useState<Switch[] | null>(null);
    const [project, setProject] = useState<Project[] | null>(null);
    const [newData, setNewData] = useState(0);
    const [edit, setEdit] = useState<JSX.Element | null>(null);

    const column: GridColDef[] = [
        { field: 'switchid', headerName: 'ID', flex: 1, type: 'string' },
        { field: 'switchname', headerName: 'Name', flex: 1, type: 'string' },
        {
            field: 'stp', headerName: 'Enable STP', flex: 1, type: 'boolean', valueFormatter: (params: GridValueFormatterParams<boolean>) => {
                if (params.value) return "✔️";
                return "❌";
            }
        },
        { field: 'controller', headerName: 'Controller', flex: 1, type: 'string' },
        {
            field: 'projectid', headerName: 'Project', flex: 1, type: 'string', valueFormatter: (params: GridValueFormatterParams<number>) => {
                if (project) {
                    for (let i = 1; i < project.length; i++) {
                        if (project[i].serverid === params.value) return project[i].projectname;
                    }
                    return project[0].projectname;
                }
            }
        },
        {
            field: 'null', headerName: 'Action', flex: 1, renderCell: () => (
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

    function isSwitch(item: Server[] | Router[] | Switch[] | Host[]): item is Switch[] {
        if (!item.length) return false;
        return 'switchid' in item[0];
    }

    const noRowsOverlay = () => (
        <Typography align='center' p='2rem'> No data! </Typography>
    );

    const generateTable = (device: Switch[]) => {
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
                getRowId={(row) => row.switchid}
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
            const sureDelete = window.confirm(`Are you sure you want to delete the switch ${row.switchname}?`);
            if (sureDelete) {
                const result = await deleteDevice(row.switchid, 'switch');
                if (result) setNewData((prev) => prev -= 1);
            }
        }
        else alert("Please select row!");
    }

    const handleEdit = async () => {
        const row = apiRef.current.getSelectedRows();
        if(row.size) {
            const switchR: Switch = row.values().next().value
            setEdit(
                <CreateEditSwitch switchR={switchR} project={project} resetEdit={resetEdit} newDataIncoming={newDataIncoming}/>
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
            const devices = await getDevice(userToken.username, 'switch', source);
            if (devices && isSwitch(devices)) setDevice(devices);
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
                <Typography fontSize='1.5rem'>Switch</Typography>
                <CreateEditSwitch newDataIncoming={newDataIncoming} project={project} />
            </Box>
            {
                device && generateTable(device)
            }
            { edit }
        </Container>
    )
}

export default SwitchList;