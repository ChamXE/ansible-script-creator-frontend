import { useState } from "react";
import { ProjectDevice } from "@/models/device";
import { RouterSwitch } from "@/models/project";
import { Backdrop, Box, Button, Fade, MenuItem, Modal, TextField, Typography } from '@mui/material';
import { createConnection, updateConnection } from './functions';
import {Subnet} from "@/components/global";
import * as React from "react";

interface CreateEditRSProps {
    projectId: number;
    connection?: RouterSwitch;
    projectDevices: ProjectDevice | null;
    resetEdit?: () => void;
    handleNewDataIncoming: () => void;
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

function CreateEditRS({ projectId, connection, projectDevices, resetEdit, handleNewDataIncoming }: CreateEditRSProps) {
    const connectionType = 'routerSwitch';
    const [open, setOpen] = useState(!!connection);
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        if(resetEdit) resetEdit();
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const routerId = formData.get('routerid')!.toString();
        if(routerId === 'none') return alert('Please select router!');
        const { routername } = projectDevices!.router.filter(({ routerid }) => routerid === +routerId)[0];
        const switchId = formData.get('switchid')!.toString();
        if(switchId === 'none') return alert('Please select switch!');
        const subnet = formData.get('subnet')!.toString();
        if(subnet === 'none') return alert('Please select subnet!');
        const { switchname } = projectDevices!.switch.filter(({ switchid }) => switchid === +switchId)[0];
        const routerSwitch: RouterSwitch = {
            projectid: projectId,
            routerid: +routerId,
            switchid: +switchId,
            portname: routername + switchname,
            ip: formData.get('ip')!.toString(),
            subnet: subnet,
            interfacename: connection ? connection.interfacename : null,
        }
        let result: number;
        if(connection) {
            result = await updateConnection(connection, routerSwitch, connectionType)
        }
        else {
            result = await createConnection(routerSwitch, connectionType);
        }
        if (result) {
            handleNewDataIncoming();
            handleClose();
        }
        else {
            alert('Data entry failed! Please try again.');
        }
    }

    const generateForm = () => (
        <Box component="form" sx={style} onSubmit={handleSubmit}>
            <Typography fontSize='1.5rem'>{ connection ? 'Edit Connection' : 'New Connection' }</Typography>
            <TextField
                margin="normal"
                fullWidth
                required
                name="routerid"
                label="Router Name"
                type="text"
                id="routerid"
                select
                defaultValue={connection ? connection.routerid : 'none'}
            >
                <MenuItem key="none" value="none">Select Router</MenuItem>
                {
                    projectDevices?.router.map(({ routerid, routername }) => {
                        return <MenuItem key={routerid} value={`${routerid}`}>{routername}</MenuItem>
                    })
                }
            </TextField>
            <TextField
                margin="normal"
                fullWidth
                required
                name="switchid"
                label="Switch Name"
                type="text"
                id="switchid"
                select
                defaultValue={connection ? connection.switchid : 'none'}
            >
                <MenuItem key="none" value="none">Select Switch</MenuItem>
                {
                    projectDevices?.switch.map(({ switchid, switchname }) => {
                        return <MenuItem key={switchid} value={`${switchid}`}>{switchname}</MenuItem>
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
                defaultValue={connection ? connection.ip : ''}
            />
            <TextField
                margin="normal"
                fullWidth
                required
                name="subnet"
                label="Subnet Mask"
                type="text"
                id="subnet"
                defaultValue={connection ? connection.subnet : ''}
                select
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
                name="interfacename"
                label="Interface"
                type="text"
                id="interfacename"
                defaultValue={connection ? connection.interfacename : ''}
                disabled
            >
            </TextField>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                { connection ? 'Save' : 'Create' }
            </Button>
        </Box>
    )

    return (
        <Box component="span" mb="1rem" display="flex" alignItems="center">
            {
                connection ? 
                    <></>
                    :
                    (
                        <Box component="span" display="flex" alignItems="center">
                            <Typography fontSize='1.5rem' sx={{ m: 'auto 0 auto 0' }}>Router Switch Connection</Typography>
                            <Button
                                variant="contained"
                                sx={{ m: 'auto 0 auto 1rem'}}
                                onClick={handleOpen}
                            >
                                Add Connection
                            </Button>
                        </Box>
                    )
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
                    <Box sx={style}>
                        { generateForm() }
                    </Box>
                </Fade>
            </Modal>
        </Box>
    )
}

export default CreateEditRS;