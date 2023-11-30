import { Backdrop, Box, Container, Fade, IconButton, Modal, Typography } from '@mui/material';
import { useEffect, useState } from "react";
import { Project, RouterSwitch, SwitchHost, SwitchSwitch } from "@/models/project";
import { ProjectDevice } from "@/models/device";
import axios from "axios";
import { DataGrid, GridColDef, GridValueFormatterParams, useGridApiRef } from '@mui/x-data-grid';
import { deleteConnection, getConnection, getProjectDevices } from './functions';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateEditNonRS from './createEditNonRS';

interface ViewNonRSProps {
    connectionType: string;
    project: Project;
    resetNonRS?: () => void;
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '45rem',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

function ViewNonRS ({ connectionType, project, resetNonRS }: ViewNonRSProps) {
    const apiRef = useGridApiRef();
    const [open, setOpen] = useState(true);
    const [connection, setConnection] = useState<SwitchSwitch[] | SwitchHost[] | null>(null);
    const [projectDevices, setProjectDevices] = useState<ProjectDevice | null>(null);
    const [newData, setNewData] = useState(0);
    const [edit, setEdit] = useState<React.ReactElement | null>(null);
    const handleClose = () =>  {
        setOpen(false);
        if(resetNonRS) resetNonRS();
    }

    const handleNewDataIncoming = () => {
        setNewData((prev) => prev + 1);
    }

    const resetEdit = () => {
        setEdit(null);
    }

    const column: GridColDef[] = [
        {
            field: connectionType === 'switchSwitch' ? 'switchid_src': 'switchid', 
            headerName: connectionType === 'switchSwitch' ? 'First Switch': 'Switch Name', 
            flex: 1, 
            type: 'string', 
            valueFormatter: (params: GridValueFormatterParams<number>) => {
                return projectDevices?.switch.filter(({ switchid }) => switchid === params.value)[0].switchname;
            }
        },
        {
            field: connectionType === 'switchSwitch' ? 'switchid_dst': 'hostid', 
            headerName: connectionType === 'switchSwitch' ? 'Second Switch': 'Host Name', 
            flex: 1, 
            type: 'string', 
            valueFormatter: (params: GridValueFormatterParams<number>) => {
                if(connectionType === 'switchSwitch')
                    return projectDevices?.switch.filter(({ switchid }) => switchid === params.value)[0].switchname;
                return projectDevices?.host.filter(({ hostid }) => hostid === params.value)[0].hostname;
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

    const handleEdit = async () => {
        const row = apiRef.current.getSelectedRows();
        if(row.size) {
            const connection: SwitchSwitch | SwitchHost = row.values().next().value
            setEdit(
                <CreateEditNonRS 
                    connectionType={connectionType}
                    projectId={project.projectid!}
                    connection={connection} 
                    projectDevices={projectDevices}
                    resetEdit={resetEdit}
                    handleNewDataIncoming={handleNewDataIncoming}
                />
            );
        }
    }

    const handleDelete = async () => {
        const row = apiRef.current.getSelectedRows();
        if(row.size) {
            const sureDelete = window.confirm('Are you sure you want to delete this connection?');
            if (sureDelete) {
                let result: number;
                if(connectionType === 'switchSwitch') {
                    const connection: SwitchSwitch = row.values().next().value
                    result = await deleteConnection(connection.projectid, connection.switchid_src, connection.switchid_dst, connectionType);
                    result = await deleteConnection(connection.projectid, connection.switchid_dst, connection.switchid_src, connectionType);
                }
                else {
                    const connection: SwitchHost = row.values().next().value
                    result = await deleteConnection(connection.projectid, connection.switchid, connection.hostid, connectionType);
                    
                }
                if (result) setNewData((prev) => prev - 1);
            }
        }
        else alert("Please select row!");
    }

    const noRowsOverlay = () => (
        <Typography align='center' p='2rem'> No data! </Typography>
    );

    const generateTable = (connection: SwitchSwitch[] | SwitchHost[]) => {
        return (
            <DataGrid
                rows={connection}
                columns={column}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                    }
                }}
                pageSizeOptions={[5, 10]}
                getRowId={(row) => {
                    if(connectionType === 'switchSwitch')
                        return `${row.projectid}${row.switchid_src}${row.switchid_dst}`
                    return `${row.projectid}${row.switchid}${row.hostid}`
                }}
                slots={{
                    noRowsOverlay: noRowsOverlay
                }}
                apiRef={apiRef}
                autoHeight
            />
        );
    }

    function isSwitchSwitch(item: RouterSwitch[] | SwitchSwitch[] | SwitchHost[]): item is SwitchSwitch[] {
        if (!item.length) return true;
        return 'switchid_src' in item[0];
    }

    function isSwitchHost(item: RouterSwitch[] | SwitchSwitch[] | SwitchHost[]): item is SwitchHost[] {
        if (!item.length) return true;
        return 'hostid' in item[0];
    }

    useEffect(() => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        const loadProjectDevices = async () => {
            const pd = await getProjectDevices(project.projectid!, source);
            if(pd) setProjectDevices(pd);
        }

        const loadConnection = async () => {
            const c = await getConnection(project.projectid!, connectionType, source);
            if(c && (isSwitchSwitch(c) || isSwitchHost(c))) setConnection(c);
        }

        loadConnection();
        loadProjectDevices();
    }, [newData]);

    return (
        <Container sx={{ ml: "0" }}>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={open}
                onClose={handleClose}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Fade in={open}>
                    <Box sx={style}>
                        <CreateEditNonRS
                            connectionType={connectionType}
                            projectId={project.projectid!}
                            projectDevices={projectDevices} 
                            handleNewDataIncoming={handleNewDataIncoming}
                        />
                        { connection && generateTable(connection) }
                        { edit }
                    </Box>
                </Fade>
            </Modal>
        </Container>
    );
}

export default ViewNonRS;