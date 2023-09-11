import { createDevice } from '@/components/global';
import { Backdrop, Box, Button, Container, Fade, MenuItem, Modal, TextField, Typography } from '@mui/material';
import { Host } from '~/device';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Project } from '@/models/project';

interface CreateEditHostProps {
    host?: Host;
    project: Project[] | null;
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

function CreateEditHost({ host, project, resetEdit, newDataIncoming }: CreateEditHostProps) {
    const [open, setOpen] = useState(host ? true : false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const generateForm = () => (
        <Box component="form" sx={style} onSubmit={handleSubmit}>
            <Typography fontSize='1.5rem'>{ host ? 'Edit Host' : 'New Host' }</Typography>
            <TextField
                margin="normal"
                fullWidth
                name="hostid"
                label="Host ID (Auto)"
                type="number"
                id="hostid"
                disabled
                defaultValue={host ? host.hostid : ''}
            />
            <TextField
                margin="normal"
                fullWidth
                required
                name="hostname"
                label="Hostname"
                type="text"
                id="hostname"
                defaultValue={host ? host.hostname : ''}
            />
            <TextField
                margin="normal"
                fullWidth
                required
                name="projectid"
                label="Project"
                type="text"
                id="projectid"
                select
                defaultValue={host ? host.projectid : "none"}
            >
                <MenuItem key="none" value="none">Select Project</MenuItem>
                {
                    project?.map(({ projectid, projectname }) => {
                        return <MenuItem key={projectid} value={`${projectid}`}>{projectname}</MenuItem>
                    })
                }
            </TextField>
            <TextField
                margin="normal"
                fullWidth
                required
                name="ip"
                label="IP Address"
                type="text"
                id="ip"
                defaultValue={host ? host.ip : ''}
            />
            <TextField
                margin="normal"
                fullWidth
                required
                name="subnet"
                label="Subnet Mask"
                type="text"
                id="subnet"
                defaultValue={host ? host.subnet : ''}
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                { host ? 'Save' : 'New Host' }
            </Button>
        </Box>

    )

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const projectId = formData.get('projectid')!.toString();
        if (projectId === 'none') return alert('Please select the project this router belongs to!');
        const h: Host = {
            hostid: host ? host.hostid : null,
            projectid: +projectId,
            hostname: formData.get('hostname')!.toString(),
            ip: formData.get('ip')!.toString(),
            subnet: formData.get('subnet')!.toString(),
        }

        const result = await createDevice(h, 'host', host ? true : false);
        if (result) {
            newDataIncoming();
            setOpen(false);
        }
        else {
            alert('Data entry failed! Please try again.');
        }
    }

    useEffect(() => {
        if(!open) {
            if(resetEdit) {
                resetEdit();
            }
        }
    }, [open]);

    return (
        <Container sx={{ ml: "0" }}>
            {
                host ? 
                    <></>
                    :
                    <Button
                        variant="contained"
                        sx={{ marginLeft: '1rem' }}
                        onClick={handleOpen}
                    >
                        Add Host
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
                    {generateForm()}
                </Fade>
            </Modal>
        </Container>
    );
}

export default CreateEditHost;