import { Backdrop, Box, Button, Container, Fade, Modal, TextField, Typography } from '@mui/material';
import { Server } from '~/device';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Project } from '@/models/project';
import useToken from '../app/useToken';
import axios from 'axios';
import { getURL } from '../global';

interface CreateEditProjectProps {
    project?: Project;
    server: Server[] | null;
    resetEdit?: () => void;
    newDataIncoming: () => void;
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '35rem',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

function CreateEditProject({ project, server, resetEdit, newDataIncoming }: CreateEditProjectProps) {
    const { userToken } = useToken();
    const [open, setOpen] = useState(project ? true : false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        if(resetEdit) resetEdit();
    };

    const generateForm = () => (
        <Box component="form" sx={style} onSubmit={handleSubmit}>
            <Typography fontSize='1.5rem'>{ project ? 'Edit Project' : 'New Project' }</Typography>
            <TextField
                margin="normal"
                fullWidth
                name="projectid"
                label="Project ID (Auto)"
                type="number"
                id="projectid"
                disabled
                defaultValue={project ? project.projectid : ''}
            />
            <TextField
                margin="normal"
                fullWidth
                required
                name="projectname"
                label="Project Name"
                type="text"
                id="projectname"
                defaultValue={project ? project.projectname : ''}
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                { project ? 'Save' : 'Create' }
            </Button>
        </Box>
    )

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const p: Project = {
            projectid: project ? project.projectid : null,
            projectname: formData.get('projectname')!.toString(),
            username: userToken.username,
            serverid: server![0].serverid!,
        }

        const result = await createProject(p, project ? true : false);
        if (result) {
            newDataIncoming();
            handleClose();
        }
        else {
            alert('Data entry failed! Please try again.');
        }
    }

    async function createProject(project: Project, isEdit: boolean): Promise<number> {
        try {
            const response = await axios.post(`${getURL()}/project/`, project);
            
            if (!response.data.result) {
                console.error(response.data.message);
                return 0;
            }

            alert(`Project successfully ${isEdit ? 'updated' : 'created'}!`);
            return 1;
        } catch (e) {
            console.error(e.message);
            return 0;
        }
    }

    return (
        <Container sx={{ ml: "0" }}>
            {
                project ? 
                    <></>
                    :
                    <Button
                        variant="contained"
                        sx={{ marginLeft: '1rem' }}
                        onClick={handleOpen}
                    >
                        Add Project
                    </Button>
            }
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
                    { generateForm() }
                </Fade>
            </Modal>
        </Container>
    );
}

export default CreateEditProject;