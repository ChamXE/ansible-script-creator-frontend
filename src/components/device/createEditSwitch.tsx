import { createDevice } from '@/components/device/functions';
import { Backdrop, Box, Button, Container, Fade, FormControl, FormControlLabel, FormLabel, MenuItem, Modal, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { Server, Switch } from '~/device';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Project } from '@/models/project';

interface CreateEditSwitchProps {
    switchR?: Switch;
    server: Server[] | null;
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

function CreateEditSwitch({ server, switchR, project, resetEdit, newDataIncoming }: CreateEditSwitchProps) {
    const [open, setOpen] = useState(switchR ? true : false);
    const [controller, setController] = useState<string>('');
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        if(resetEdit) resetEdit();
    };

    const setControllerValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        const pId = event.target.value;
        if(pId !== "none") {
            const p = project?.filter(({ projectid }) => projectid === +pId);
            const s = server?.filter(({ serverid }) => serverid === p![0].serverid);
            setController(s![0].ip);
        }
    }

    const generateForm = () => (
        <Box component="form" sx={style} onSubmit={handleSubmit}>
            <Typography fontSize='1.5rem'>{switchR ? 'Edit Switch' : 'New Switch' }</Typography>
            <TextField
                margin="normal"
                fullWidth
                name="switchid"
                label="Switch ID (Auto)"
                type="number"
                id="switchid"
                disabled
                defaultValue={switchR ? switchR.switchid : ''}
            />
            <TextField
                margin="normal"
                fullWidth
                required
                name="switchname"
                label="Switch Name"
                type="text"
                id="switchname"
                defaultValue={switchR ? switchR.switchname : ''}
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
                defaultValue={switchR ? switchR.projectid : 'none'}
                onChange={setControllerValue}
            >
                <MenuItem key="none" value="none">Select Project</MenuItem>
                {
                    project?.map(({ projectid, projectname }) => {
                        return <MenuItem key={projectid} value={`${projectid}`}>{projectname}</MenuItem>
                    })
                }
            </TextField>
            <FormControl required>
                <FormLabel id="stp">Enable STP</FormLabel>
                <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="stp"
                    defaultValue={switchR ? switchR.stp : 'true'}
                >
                    <FormControlLabel value="true" control={<Radio />} label="True" />
                    <FormControlLabel value="false" control={<Radio />} label="False" />
                </RadioGroup>
            </FormControl>
            <TextField
                margin="normal"
                fullWidth
                required
                name="controller"
                label="Controller IP"
                type="text"
                id="controller"
                disabled
                value={controller}
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                {switchR ? 'Save' : 'Create' }
            </Button>
        </Box>

    )

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const projectId = formData.get('projectid')!.toString();
        if (projectId === 'none') return alert('Please select the project this router belongs to!');
        const s: Switch = {
            switchid: switchR ? switchR.switchid : null,
            projectid: +projectId,
            switchname: formData.get('switchname')!.toString(),
            stp: formData.get('stp')!.toString() === "true" ? true : false,
            controller: controller,
        }

        if (s) {
            const result = await createDevice(s, 'switch', switchR ? true : false);
            if (result) {
                newDataIncoming();
                setOpen(false);
            }
            else {
                alert('Data entry failed! Please try again.');
            }
        }
    }

    return (
        <Container sx={{ ml: "0" }}>
            {
                switchR?
                    <></>:
                    <Button
                        variant="contained"
                        sx={{ marginLeft: '1rem' }}
                        onClick={handleOpen}
                    >
                        Add Switch
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

export default CreateEditSwitch;