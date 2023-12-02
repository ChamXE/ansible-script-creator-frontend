import { useState } from "react";
import { ProjectDevice } from "@/models/device";
import { InterfaceConfiguration, RouterSwitch } from "@/models/project";
import { Backdrop, Box, Button, Fade, IconButton, MenuItem, Modal, TextField, Typography } from '@mui/material';
import { createConnection, updateConnection } from './functions';
import { Subnet } from "@/components/global";
import * as React from "react";
import DeleteIcon from '@mui/icons-material/Delete';

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
    maxHeight: '60vh',
};

function CreateEditRS({ projectId, connection, projectDevices, resetEdit, handleNewDataIncoming }: CreateEditRSProps) {
    const connectionType = 'routerSwitch';
    const [open, setOpen] = useState(!!connection);
    const [ip, setIP] = useState<string[]>(
        connection? (connection.configuration? Object.keys(connection.configuration) : [""]): [""]
    );
    const [subnet, setSubnet] = useState<string[]>(
        connection? (connection.configuration? Object.values(connection.configuration) : [""]): [""]
    );
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
        const { switchname } = projectDevices!.switch.filter(({ switchid }) => switchid === +switchId)[0];
        for(let i = 0; i < subnet.length; i++) {
            if(subnet[i] === 'none') return alert(`Please select subnet mask for interface ${i + 1}!`);
        }
        const configuration: InterfaceConfiguration = {};
        ip.forEach((elem, idx) => {
            configuration[elem] = subnet[idx]
        });
        const peer = formData.get('peer');
        const routerSwitch: RouterSwitch = {
            projectid: projectId,
            routerid: +routerId,
            switchid: +switchId,
            portname: routername + switchname,
            configuration: configuration,
            interfacename: connection ? connection.interfacename : null,
            peer: peer? peer.toString() : null
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

    const handleUpdateIP = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const index = event.currentTarget.id.split('-')[1];
        setIP((prev) => prev.map((value, idx) => {
            if(idx === +index) return event.currentTarget.value;
            return value;
        }))
    }

    const handleUpdateSubnet = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const index = event.target.name.split('-')[1];
        setSubnet((prev) => prev.map((value, idx) => {
            if(idx === +index) return event.target.value;
            return value;
        }))
    }

    const addNewIP = () => {
        setIP((prev) => [...prev, ""]);
        setSubnet((prev) => [...prev, ""]);
    }

    const deleteIP = (event: React.MouseEvent<HTMLElement>) => {
        const index = event.currentTarget.id.split('-')[1];
        if(+index === 0) return alert('A router cannot has no interface!');
        setIP((prev) => prev.filter((val, idx) => idx !== +index));
        setSubnet((prev) => prev.filter((val, idx) => idx !== +index));
    }

    const generateIndividualConfiguration = (ip: string, subnet: string, idx: number) => {
        return (
            <Box key={idx} component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <TextField
                    margin="normal"
                    required
                    name={`ip-${idx}`}
                    label={`IP Address ${idx + 1}`}
                    type="text"
                    id={`ip-${idx}`}
                    defaultValue={ip}
                    sx={{ width: idx === 0 ? '25%' : '40%' }}
                    onChange={handleUpdateIP}
                />
                <TextField
                    margin="normal"
                    required
                    name={`subnet-${idx}`}
                    label={`Subnet Mask ${idx + 1}`}
                    type="text"
                    id={`subnet-${idx}`}
                    defaultValue={subnet? (subnet.length? subnet : 'none') : 'none'}
                    select
                    sx={{ width: idx === 0 ? '25%' : '40%' }}
                    onChange={handleUpdateSubnet}
                >
                    <MenuItem key="none" value="none">Select Subnet</MenuItem>
                    {
                        Object.keys(Subnet).reverse().map((s) => {
                            return <MenuItem key={s} value={Subnet[+s]}>/{s}</MenuItem>
                        })
                    }
                </TextField>
                {
                    idx === 0 ? (
                        <TextField
                            margin="normal"
                            name="peer"
                            label={`Peer IP`}
                            type="text"
                            id="peer"
                            defaultValue={ connection?.peer ?? ''}
                            sx={{ width: '25%' }}
                        />
                    ) : <></>
                }
                <IconButton id={`delete-${idx}`} sx={{ width: '10%' }} onClick={deleteIP}>
                    <DeleteIcon/>
                </IconButton>
            </Box>
        );
    };

    const generateForm = () => (
        <Box component="form" sx={{ ...style, overflowY: 'scroll'}} onSubmit={handleSubmit}>
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
            <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between'}}>
                <TextField
                    margin="normal"
                    required
                    name="interfacename"
                    label="Interface"
                    type="text"
                    id="interfacename"
                    defaultValue={connection ? connection.interfacename : ''}
                    sx={{ width: '70%' }}
                    disabled
                />
                <Button
                    variant="contained"
                    sx={{ mt: 3, mb: 2, width: '25%' }}
                    onClick={addNewIP}
                >
                    Add IP
                </Button>
            </Box>
            { ip.map((ip, idx) => generateIndividualConfiguration(ip, subnet[idx], idx)) }
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