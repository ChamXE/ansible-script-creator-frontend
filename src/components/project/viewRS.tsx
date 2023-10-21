import { Backdrop, Box, Container, Fade, IconButton, Modal, Typography } from '@mui/material';
import { useEffect, useState } from "react";
import { Project, RouterSwitch, SwitchHost, SwitchSwitch } from "@/models/project";
import { ProjectDevice } from "@/models/device";
import axios, { CancelTokenSource } from "axios";
import { getURL } from "../global";
import { DataGrid, GridColDef, GridValueFormatterParams, useGridApiRef } from '@mui/x-data-grid';
import { deleteConnection, getConnection } from './functions';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateEditRS from './createEditRS';

interface ViewRSProps {
    project: Project;
    resetRS?: () => void;
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

function ViewRS ({ project, resetRS }: ViewRSProps) {
    const apiRef = useGridApiRef();
    const [open, setOpen] = useState(true);
    const [connection, setConnection] = useState<RouterSwitch[] | null>(null);
    const [projectDevices, setProjectDevices] = useState<ProjectDevice | null>(null);
    const [newData, setNewData] = useState(0);
    const [edit, setEdit] = useState<React.ReactElement | null>(null);
    const connectionType = 'routerSwitch';

    const handleClose = () =>  {
        setOpen(false);
        if(resetRS) resetRS();
    }

    const resetEdit = () => {
        setEdit(null);
    }

    const handleNewDataIncoming = () => {
        setNewData((prev) => prev + 1);
    }

    const column: GridColDef[] = [
        {
            field: 'routerid', headerName: 'Router Name', flex: 1, type: 'string', valueFormatter: (params: GridValueFormatterParams<number>) => {
                return projectDevices?.router.filter(({ routerid }) => routerid === params.value)[0].routername;
            }
        },
        {
            field: 'switchid', headerName: 'Switch Name', flex: 1, type: 'string', valueFormatter: (params: GridValueFormatterParams<number>) => {
                return projectDevices?.switch.filter(({ switchid }) => switchid === params.value)[0].switchname;
            }
        },
        { field: 'ip', headerName: 'IP Address', flex: 1, type: 'string', },
        { field: 'subnet', headerName: 'Subnet Mask', flex: 1, type: 'string', },
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
            const connection: RouterSwitch = row.values().next().value
            setEdit(
                <CreateEditRS 
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
            const connection: RouterSwitch = row.values().next().value
            const sureDelete = window.confirm('Are you sure you want to delete this connection?');
            if (sureDelete) {
                const result = await deleteConnection(connection.projectid, connection.routerid, connection.switchid, connectionType);
                if (result) setNewData((prev) => prev - 1);
            }
        }
        else alert("Please select row!");
    }

    const noRowsOverlay = () => (
        <Typography align='center' p='2rem'> No data! </Typography>
    );

    const generateTable = (connection: RouterSwitch[]) => {
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
                getRowId={(row) => `${row.projectid}${row.routerid}${row.switchid}`}
                slots={{
                    noRowsOverlay: noRowsOverlay
                }}
                apiRef={apiRef}
                autoHeight
            />
        );
    }

    async function getProjectDevices(projectId: number, source: CancelTokenSource): Promise<ProjectDevice | null> {
        try {
            const response = await axios.get(`${getURL()}/device/${projectId}`, {
                cancelToken: source.token
            });
    
            if (!response.data.result) {
                console.error(response.data.message);
                return null;
            }
    
            if (Object.keys(response.data.data).length) {
                return JSON.parse(JSON.stringify(response.data.data));
            }
            return null;
        } catch (e) {
            if (e.code !== "ERR_CANCELED") {
                alert('Error fetching devices in this project!');
                console.error(e.message);
            }
            return null;
        }
    }

    function isRouterSwitch(item: RouterSwitch[] | SwitchSwitch[] | SwitchHost[]): item is RouterSwitch[] {
        if (!item.length) return true;
        return 'routerid' in item[0];
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
            if(c && isRouterSwitch(c)) setConnection(c);
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
                        <CreateEditRS
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

export default ViewRS;