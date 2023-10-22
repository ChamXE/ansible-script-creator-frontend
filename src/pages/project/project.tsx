import {Project} from "@/models/project";
import {getProject, getServer, getURL} from '@/components/global';
import React, {useState, useEffect} from "react";
import useToken from "@/components/app/useToken";
import axios from "axios";
import {DataGrid, GridColDef, GridRenderCellParams, useGridApiRef} from "@mui/x-data-grid";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {Server} from "@/models/device";
import {Box, Button, Container, IconButton, Typography} from "@mui/material";
import CreateEditProject from "@/components/project/createEditProject";
import ViewRS from "@/components/project/viewRS";
import ViewNonRS from "@/components/project/viewNonRS";

function ProjectList() {
    const {userToken} = useToken();
    const apiRef = useGridApiRef();
    const [project, setProject] = useState<Project[] | null>(null);
    const [server, setServer] = useState<Server[] | null>(null);
    const [newData, setNewData] = useState(0);
    const [edit, setEdit] = useState<React.ReactElement | null>(null);
    const [routerSwitch, setRouterSwitch] = useState<React.ReactElement | null>(null);
    const [switchSwitch, setSwitchSwitch] = useState<React.ReactElement | null>(null);
    const [switchHost, setSwitchHost] = useState<React.ReactElement | null>(null);

    const column: GridColDef[] = [
        {field: 'projectid', headerName: 'Project ID', type: 'string', flex: 1},
        {field: 'projectname', headerName: 'Project Name', type: 'string', flex: 1},
        {
            field: 'routerswitch',
            headerName: 'Router - Switch Connection',
            type: 'string',
            flex: 1,
            renderCell: () => (
                <Button
                    variant="contained"
                    sx={{marginLeft: '1rem'}}
                    onClick={handleOpenRS}
                >
                    View
                </Button>
            )
        },
        {
            field: 'switchswitch',
            headerName: 'Switch - Switch Connection',
            type: 'string',
            flex: 1,
            renderCell: () => (
                <Button
                    variant="contained"
                    sx={{marginLeft: '1rem'}}
                    onClick={handleOpenSS}
                >
                    View
                </Button>
            )
        },
        {
            field: 'switchhost', headerName: 'Switch - Host Connection', type: 'string', flex: 1, renderCell: () => (
                <Button
                    variant="contained"
                    sx={{marginLeft: '1rem'}}
                    onClick={handleOpenSH}
                >
                    View
                </Button>
            )
        },
        {
            field: 'null', headerName: 'Action', flex: 1, renderCell: () => (
                <Box component="span" display="flex">
                    <IconButton onClick={handleEdit}>
                        <EditIcon/>
                    </IconButton>
                    <IconButton sx={{ml: "1rem"}} onClick={handleDelete}>
                        <DeleteIcon/>
                    </IconButton>
                </Box>
            )
        },
        {
            field: 'generated',
            headerName: 'Generate Hostfile',
            flex: 1,
            renderCell: (params: GridRenderCellParams<any, boolean>) => (
                <Button
                    variant="contained"
                    sx={{marginLeft: '1rem'}}
                    onClick={handleGenerateProject}
                    disabled={params.value}
                >
                    Generate
                </Button>
            )
        },
    ];
    const handleNewDataIncoming = () => {
        setNewData((prev) => prev + 1);
    }

    const resetEdit = () => {
        setEdit(null);
    }

    const handleOpenRS = () => {
        if (apiRef.current.getSelectedRows().size) {
            const row = apiRef.current.getSelectedRows().values().next().value;
            setRouterSwitch(<ViewRS resetRS={resetRS} project={row}/>);
        }
    }

    const resetRS = () => {
        setRouterSwitch(null);
    }

    const handleOpenSS = () => {
        if (apiRef.current.getSelectedRows().size) {
            const row = apiRef.current.getSelectedRows().values().next().value;
            setSwitchSwitch(<ViewNonRS connectionType='switchSwitch' resetNonRS={resetSS} project={row}/>);
        }
    }

    const resetSS = () => {
        setSwitchSwitch(null);
    }

    const handleOpenSH = () => {
        if (apiRef.current.getSelectedRows().size) {
            const row = apiRef.current.getSelectedRows().values().next().value;
            setSwitchHost(<ViewNonRS connectionType='switchHost' resetNonRS={resetSH} project={row}/>);
        }
    }

    const resetSH = () => {
        setSwitchHost(null);
    }

    const handleEdit = async () => {
        const row = apiRef.current.getSelectedRows();
        if (row.size) {
            const project: Project = row.values().next().value
            setEdit(
                <CreateEditProject resetEdit={resetEdit} newDataIncoming={handleNewDataIncoming} server={server}
                                   project={project}/>
            );
        }
    }

    const handleDelete = async () => {
        if (apiRef.current.getSelectedRows().size) {
            const row = apiRef.current.getSelectedRows().values().next().value;
            const sureDelete = window.confirm(`Are you sure you want to delete the project ${row.projectname}?`);
            if (sureDelete) {
                const result = await deleteProject(row.projectid);
                if (result) setNewData((prev) => prev - 1);
            }
        } else alert("Please select row!");
    }

    const handleGenerateProject = async () => {
        if (apiRef.current.getSelectedRows().size) {
            const row = apiRef.current.getSelectedRows().values().next().value;
            if (row.generated) return alert('This project has been generated!');
            const sureGenerate = window.confirm(`Are you sure you want to generate the hostfile for the project ${row.projectname}? This action is irreversible and you cannot do it again!`);
            if (sureGenerate) {
                const result = await generateProject(row.projectid);
                if (result) {
                    alert('Project generated!');
                    setNewData((prev) => prev - 1);
                } else return alert('Project creation failed!');
            }
        }
    }

    const generateTable = (project: Project[]) => (
        <DataGrid
            rows={project}
            columns={column}
            initialState={{
                pagination: {
                    paginationModel: {page: 0, pageSize: 5},
                },
                sorting: {
                    sortModel: [{field: 'projectid', sort: 'asc'}],
                },
            }}
            pageSizeOptions={[5, 10]}
            getRowId={(row) => row.projectid}
            slots={{
                noRowsOverlay: noRowsOverlay,
            }}
            apiRef={apiRef}
            autoHeight
        />
    )

    const noRowsOverlay = () => (
        <Typography align='center' p='2rem'> No data! </Typography>
    );

    async function deleteProject(projectId: number): Promise<number> {
        try {
            const response = await axios.delete(`${getURL()}/project/${projectId}`);
            if (!response.data.data.result) return 0;
            return 1;
        } catch (e) {
            console.error(e.message);
            alert('Project deletion failed!');
            return 0;
        }
    }

    async function generateProject(projectId: number): Promise<number> {
        try {
            const response = await axios.post(`${getURL()}/project/generateProject/${projectId}`);
            if (response.data.data.result) return 1;
            return 0;
        } catch (e) {
            console.error(e.message);
            alert('Project generation failed!');
            return 0;
        }
    }

    useEffect(() => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        const loadProject = async () => {
            const project: Project[] | null = await getProject(userToken!.username, source)
            setProject(project);
        }

        const loadServer = async () => {
            const server: Server[] | null = await getServer(source);
            setServer(server);
        }

        loadProject();
        loadServer();

        return () => {
            source.cancel()
        }
    }, [newData]);

    return (
        <Container
            component="main"
            sx={{mt: '1.5rem', ml: '3rem', maxWidth: '95vw !important'}}
        >
            <Box component="span" mb="1rem" display="flex" alignItems="center">
                <Typography fontSize='1.5rem'>Project</Typography>
                <CreateEditProject newDataIncoming={handleNewDataIncoming} server={server}/>
            </Box>
            {project && generateTable(project)}
            {edit}
            {routerSwitch}
            {switchSwitch}
            {switchHost}
        </Container>
    );
}

export default ProjectList;