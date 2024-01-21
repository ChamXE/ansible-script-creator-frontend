import * as React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import useToken from "@/components/app/useToken";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { Box, Button, Container, Typography } from "@mui/material";
import ViewCustomIntent from "@/components/service/viewCustomIntent";
import { Project } from "~/project";
import { getProject } from "@/components/global";

function CustomIntent() {
    const apiRef = useGridApiRef();
    const { userToken } = useToken();
    const [project, setProject] = useState<Project[] | null>(null);
    const [viewCustomIntent, setViewCustomIntent] = useState<React.ReactElement| null>(null);

    const handleSelectProject = () => {
        const row = apiRef.current.getSelectedRows();
        if(!row.size) return alert("Please select a project to view!");
        const rowData = row.values().next().value;
        setViewCustomIntent(<ViewCustomIntent
            projectid={rowData.projectid}
            handleResetViewCustomIntent={handleResetViewCustomIntent} />
        )
    }

    const handleResetViewCustomIntent = () => {
        setViewCustomIntent(null);
    }

    const column: GridColDef[] = [
        { field: 'projectid', headerName: 'Project ID', flex: 1, type: 'string', },
        { field: 'projectname', headerName: 'Project Name', flex: 1, type: 'string', },
        {
            field: 'null', headerName: 'Action', flex: 1, renderCell: () => (
                <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSelectProject}
                    sx={{ mt: 3, mb: 2 }}
                >
                    View Custom Intent
                </Button>
            )
        }
    ];

    const noRowsOverlay = () => (
        <Typography align='center' p='2rem'> No data! </Typography>
    );

    const generateTable = (router: Project[]) => (
        <DataGrid
            rows={router}
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

    useEffect(() => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        const loadProject = async () => {
            const project: Project[] | null = await getProject(userToken!.username, source)
            setProject(project);
        }

        loadProject();

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
                <Typography fontSize='1.5rem'>Projects</Typography>
            </Box>
            { project && generateTable(project) }
            { viewCustomIntent }
        </Container>
    );
}

export default CustomIntent;