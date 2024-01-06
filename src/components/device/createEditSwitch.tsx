import { createDevice } from '@/components/device/functions';
import { Backdrop, Box, Button, Container, Fade, FormControl, FormControlLabel, FormLabel, MenuItem, Modal, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { Switch } from '~/device';
import * as React from 'react';
import { useState } from 'react';
import { Project } from '@/models/project';

interface CreateEditSwitchProps {
    switchR?: Switch;
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

function CreateEditSwitch({ switchR, project, resetEdit, newDataIncoming }: CreateEditSwitchProps) {
    const [open, setOpen] = useState(!!switchR);
    const controller = process.env.REACT_APP_CONTROLLER!;

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        if(resetEdit) resetEdit();
    };

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
            >
                <MenuItem key="none" value="none">Select Project</MenuItem>
                {
                    project?.map(({ projectid, projectname }) => {
                        return <MenuItem key={projectid} value={`${projectid}`}>{projectname}</MenuItem>
                    })
                }
            </TextField>
            <FormControl required>
                <FormLabel id="controller">Controller Required</FormLabel>
                <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="controller"
                    defaultValue={switchR ? `${!!switchR.controller}` : 'true'}
                >
                    <FormControlLabel value="true" control={<Radio />} label="True" />
                    <FormControlLabel value="false" control={<Radio />} label="False" />
                </RadioGroup>
            </FormControl>
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
        const needController = formData.get('controller')!.toString();
        const s: Switch = {
            switchid: switchR ? switchR.switchid : null,
            projectid: +projectId,
            switchname: formData.get('switchname')!.toString(),
            controller: needController === "true" ? controller : null,
        }

        if (s) {
            const result = await createDevice(s, 'switch', !!switchR);
            if (result) {
                newDataIncoming();
                handleClose();
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