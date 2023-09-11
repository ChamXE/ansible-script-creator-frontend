import { Backdrop, Box, Button, Container, Divider, Fade, Modal, TextField, Typography } from '@mui/material';
import { Server } from '~/device';
import { createDevice } from '@/components/device/functions';
import * as React from 'react';
import { useEffect, useState } from 'react';

interface CreateEditServerProps {
    server?: Server;
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

function CreateEditServer({ server, resetEdit, newDataIncoming }: CreateEditServerProps) {
    const [open, setOpen] = useState<boolean>(server ? true: false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const generateForm = () => (
        <Box component="form" sx={style} onSubmit={handleSubmit}>
            <Typography fontSize='1.5rem'>{server ? 'Edit Server' : 'New Server'}</Typography>
            <TextField
                margin="normal"
                fullWidth
                name='serverid'
                label="ServerID (Auto)"
                type="number"
                id="serverid"
                disabled
                defaultValue={server?.serverid ?? ''}
            />
            <TextField
                margin="normal"
                fullWidth
                required
                name="servername"
                label="Server Name"
                type="text"
                id="servername"
                defaultValue={server?.servername ?? ''}
            />
            <TextField
                margin="normal"
                fullWidth
                required
                name="ip"
                label="IP Address"
                type="text"
                id="ip"
                defaultValue={server?.ip ?? ''}
            />
            <Divider sx={{ margin: '0.5rem auto 0.5rem auto' }} />
            <Typography fontSize='1.2rem'> Root Credentials </Typography>
            <TextField
                margin="normal"
                fullWidth
                required
                name="username"
                label="Username"
                type="text"
                id="username"
                defaultValue={server?.rootcredential.username ?? ''}
            />
            <TextField
                margin="normal"
                fullWidth
                required
                name="password"
                label="Password"
                type="password"
                id="password"
                defaultValue={server?.rootcredential.password ?? ''}
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                { server ? 'Save' : 'Create' }
            </Button>
        </Box>

    )

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const s: Server = {
            serverid: server ? server.serverid : null,
            servername: formData.get('servername')!.toString(),
            ip: formData.get('ip')!.toString(),
            rootcredential: {
                username: formData.get('username')!.toString(),
                password: formData.get('password')!.toString()
            }
        };

        const result = await createDevice(s, 'server', server ? true : false);
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
                server ? 
                    <></> 
                    :
                    <Button
                        variant="contained"
                        sx={{ marginLeft: '1rem' }}
                        onClick={handleOpen}
                    >
                        Add Server
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

export default CreateEditServer;