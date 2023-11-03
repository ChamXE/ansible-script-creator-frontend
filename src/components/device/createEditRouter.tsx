import { createDevice } from '@/components/device/functions';
import { Backdrop, Box, Button, Container, Fade, MenuItem, Modal, TextField, Typography } from '@mui/material';
import { Router, RouterConfiguration } from '~/device';
import * as React from 'react';
import { useState } from 'react';
import { Project } from '~/project';
import CreateRouterConfig from './createRouterConfig';
import { Subnet } from '@/components/global';

interface CreateEditRouterProps {
    router?: Router;
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
    maxHeight: '60vh',
    overflow: 'scroll'
};

function CreateEditRouter({ router, project, resetEdit, newDataIncoming }: CreateEditRouterProps) {
    const [open, setOpen] = useState(!!router);
    const [routerConfig, setRouterConfig] = useState<RouterConfiguration>({
        users: [],
        routes: []
    });
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setRouterConfig({
            users: [],
            routes: []
        });
        if(resetEdit) resetEdit();
    };

    const handleUpdateRouterConfig = (rc: RouterConfiguration) => {
        setRouterConfig({
            ...rc,
            routes: rc.routes.map((route) => {
                return {
                    ...route,
                    mask: Subnet[+route.mask.slice(1)]
                }
            })
        });
    }

    const generateForm = () => (
        <Box component="form" sx={style} onSubmit={handleSubmit}>
            <Typography fontSize='1.5rem'>{ router ? 'Edit Router' : 'New Router' }</Typography>
            <TextField
                margin="normal"
                fullWidth
                name="routerid"
                label="Router ID (Auto)"
                type="number"
                id="routerid"
                disabled
                defaultValue={router ? router.routerid : ''}
            />
            <TextField
                margin="normal"
                fullWidth
                required
                name="routername"
                label="Router Name"
                type="text"
                id="routername"
                defaultValue={router ? router.routername : ''}
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
                defaultValue={router ? router.projectid : 'none'}
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
                name="management"
                label="Management IP Address"
                type="text"
                id="management"
                disabled={!router}
                defaultValue={router ? (router.management ? router.management : '') : ''}
            />
            <CreateRouterConfig rc={router ? router.configuration : routerConfig} handleUpdateRouterConfig={handleUpdateRouterConfig} />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                { router ? 'Save' : 'Create' }
            </Button>
        </Box>
    )

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const management = formData.get('management');
        const projectId = formData.get('projectid')!.toString();
        if (projectId === 'none') return alert('Please select the project this router belongs to!');
        const r: Router = {
            routerid: router ? router.routerid : null,
            projectid: +projectId,
            routername: formData.get('routername')!.toString(),
            management: router ? (management? management.toString() : null) : null,
            configuration: routerConfig,
        }

        const result = await createDevice(r, 'router', !!router);
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
            { router ? 
                <></> 
                : 
                <Button
                    variant="contained"
                    sx={{ marginLeft: '1rem' }}
                    onClick={handleOpen}
                >
                    Add Router
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

export default CreateEditRouter;