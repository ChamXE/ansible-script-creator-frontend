import { createDevice } from '@/components/device/functions';
import { Backdrop, Box, Button, Container, Fade, MenuItem, Modal, TextField, Typography } from '@mui/material';
import { Host, Router } from '~/device';
import * as React from 'react';
import { useState } from 'react';
import { Project } from '@/models/project';
import { Subnet } from "@/components/global";

interface CreateEditHostProps {
    host?: Host;
    router: Router[] | null;
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

function CreateEditHost({ host, router, project, resetEdit, newDataIncoming }: CreateEditHostProps) {
    const [open, setOpen] = useState(!!host);
    const [pId, setProjectId] = useState<number | null>(host ? host.projectid : null);
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        if(resetEdit) resetEdit();
    };

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
                onChange={handleProjectIdChange}
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
                name="ip"
                label="IP Address"
                type="text"
                id="ip"
                defaultValue={host ? host.ip : ''}
            />
            <TextField
                margin="normal"
                fullWidth
                name="subnet"
                label="Subnet Mask"
                type="text"
                id="subnet"
                select
                defaultValue={host ? host.subnet : ''}
            >
                <MenuItem key="none" value="none">Select Subnet</MenuItem>
                {
                    Object.keys(Subnet).map((s) => {
                        return <MenuItem key={s} value={Subnet[+s]}>/{s}</MenuItem>
                    })
                }
            </TextField>
            <TextField
                margin="normal"
                fullWidth
                required
                name="defaultgateway"
                label="Default Gateway"
                type="text"
                id="defaultgateway"
                select
                defaultValue={host ? host.defaultgateway : "none"}
            >
                <MenuItem key="none" value="none">Select Default Gateway</MenuItem>
                {
                    router?.filter(({ projectid }) => projectid === pId).map(({ routerid, routername }) => {
                        return <MenuItem key={routerid} value={`${routerid}`}>{routername}</MenuItem>
                    })
                }
            </TextField>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                { host ? 'Save' : 'Create' }
            </Button>
        </Box>
    )

    const handleProjectIdChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const pId = event.target.value;
        if(pId === "none") return setProjectId(null);
        return setProjectId(+pId);
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const projectId = formData.get('projectid')!.toString();
        const subnet = formData.get('subnet')!.toString();
        const defaultgateway = formData.get('defaultgateway')!.toString();
        if (projectId === 'none') return alert('Please select the project this router belongs to!');
        if(subnet === 'none') return alert('Please select subnet!');
        if(defaultgateway === 'none') return alert('Please select default gateway');
        const h: Host = {
            hostid: host ? host.hostid : null,
            projectid: +projectId,
            hostname: formData.get('hostname')!.toString(),
            ip: formData.get('ip')!.toString(),
            subnet: subnet,
            defaultgateway: +defaultgateway,
        }

        const result = await createDevice(h, 'host', !!host);
        if (result) {
            newDataIncoming();
            handleClose();
        }
        else {
            alert('Data entry failed! Please try again.');
        }
    }

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