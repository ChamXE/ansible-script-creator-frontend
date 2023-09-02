import { getURL } from '@/components/global';
import useToken from '@/components/app/useToken';
import { Backdrop, Box, Button, Container, Fade, MenuItem, Modal, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { Server, Router, Switch, Host } from '~/device';
import * as React from 'react';
import { useEffect, useState } from 'react';

interface CreateDeviceProps {
    deviceType: string;
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

function CreateDevice({ deviceType, newDataIncoming }: CreateDeviceProps) {
    const { userToken } = useToken();
    const [open, setOpen] = useState(false);
    const [server, setServer] = useState<Server[] | null>(null);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const curDevice = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);

    const generateForm = () => (
        <Box component="form" sx={style} onSubmit={handleSubmit}>
            <Typography fontSize='1.5rem'> New {curDevice} </Typography>
            <TextField
                margin="normal"
                fullWidth
                name={deviceType + "id"}
                label={curDevice + "ID (Auto)"}
                type="number"
                id={deviceType + "id"}
                disabled
            />
            <TextField
                margin="normal"
                fullWidth
                required
                name={deviceType + "name"}
                label={curDevice + "name"}
                type="text"
                id={deviceType + "name"}
            />
            {
                deviceType === "router" ?
                    <TextField
                        margin="normal"
                        fullWidth
                        required
                        name="nic"
                        label="Interfaces"
                        type="text"
                        id="nic"
                        helperText="Enter the name of interfaces (without spacing), separated by comma"
                    /> :
                    <></>
            }
            {
                deviceType !== "server" ?
                    <TextField
                        margin="normal"
                        fullWidth
                        required
                        name="serverid"
                        label="Server"
                        type="text"
                        id="serverid"
                        select
                        defaultValue="none"
                    >
                        <MenuItem key="none" value="none">Select Server</MenuItem>
                        {
                            server?.map(({ serverid, servername }) => {
                                return <MenuItem key={serverid} value={`${serverid}`}>{servername}</MenuItem>
                            })
                        }
                    </TextField> :
                    <></>
            }
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                Create
            </Button>
        </Box>

    )

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        if (deviceType !== "server") {
            const serverid = formData.get('serverid')!.toString();
            if (serverid === "none") return alert('Please select the server where this device belongs to!');
        }
        let data: Server | Router | Switch | Host | null = null;
        switch (deviceType) {
            case "server":
                const server: Server = {
                    serverid: null,
                    servername: formData.get('servername')!.toString(),
                    username: userToken.username
                }
                data = server;
                break;
            case "router":
                const router: Router = {
                    routerid: null,
                    serverid: +formData.get('serverid')!.toString(),
                    routername: formData.get('routername')!.toString(),
                    nic: formData.get('nic')!.toString().split(',')
                }
                data = router;
                break;
            case "switch":
                const switchR: Switch = {
                    switchid: null,
                    serverid: +formData.get('serverid')!.toString(),
                    switchname: formData.get('switchname')!.toString()
                }
                data = switchR;
                break;
            case "host":
                const host: Host = {
                    hostid: null,
                    serverid: +formData.get('serverid')!.toString(),
                    hostname: formData.get('hostname')!.toString()
                }
                data = host;
                break;
            default:
                data = null;
                break;
        }
        if (data) {
            const result = await createDevice(data);
            if (result) {
                newDataIncoming();
                setOpen(false);
            }
            else {
                alert('Data entry failed! Please try again.');
            }
        }
    }

    async function createDevice(device: Server | Router | Switch | Host): Promise<number> {
        try {
            const response = await axios.post(`${getURL()}/device/${deviceType}`, device);
            if (!response.data.result) {
                console.error(response.data.message);
                return 0;
            }
            alert('Device successfully created!');
            return 1;
        } catch (e) {
            console.error(e.message);
            return 0;
        }
    }

    async function getServer(username: string): Promise<Server[] | null> {
        try {
            const response = await axios.get(`${getURL()}/device/server/${username}`)

            if (!response.data.result) {
                console.error(response.data.message);
                return null;
            }

            if (Object.keys(response.data.data).length) {
                const server: Server[] = JSON.parse(JSON.stringify(response.data.data.server));
                return server;
            }
            return null;
        } catch (e) {
            alert('Error fetching server!');
            console.error(e.message);
            return null;
        }
    }

    useEffect(() => {
        const server = async () => {
            const server = await getServer(userToken.username);
            setServer(server);
        }

        server();
    }, [])

    return (
        <Container>
            <Button
                type="submit"
                variant="contained"
                sx={{ marginLeft: '1rem' }}
                onClick={handleOpen}
            >
                Add {curDevice}
            </Button>
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

export default CreateDevice;