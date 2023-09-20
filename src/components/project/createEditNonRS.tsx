import { useState } from "react";
import { ProjectDevice } from "@/models/device";
import { SwitchHost, SwitchSwitch } from "@/models/project";
import { Backdrop, Box, Button, Fade, MenuItem, Modal, TextField, Typography } from '@mui/material';
import { createConnection, updateConnection } from './functions';

interface CreateEditNonRSProps {
    connectionType: string;
    projectId: number;
    connection?: SwitchSwitch | SwitchHost;
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

function CreateEditNonRS({ connectionType, projectId, connection, projectDevices, resetEdit, handleNewDataIncoming }: CreateEditNonRSProps) {
    const [open, setOpen] = useState(connection ? true : false);
    const [firstFilled, setFirstFilled] = useState(connection? true: false);
    const [select, setSelect] = useState<number | null>(null);
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        if(resetEdit) resetEdit();
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        let final: SwitchSwitch | SwitchHost;
        let reverse: SwitchSwitch | undefined;
        if(connectionType === 'switchSwitch') {
            const switchIdSrc = formData.get('switchid_src')!.toString();
            if(switchIdSrc === 'none') return alert('Please select first switch!');
            const switchIdDst = formData.get('switchid_dst')!.toString();
            if(switchIdDst === 'none') return alert('Please select second switch!');
            if(switchIdSrc === switchIdDst) return alert('Please select different devices!')
            const { switchname: srcSwitchName } = projectDevices!.switch.filter(({ switchid }) => switchid === +switchIdSrc)[0];
            const { switchname: dstSwitchName } = projectDevices!.switch.filter(({ switchid }) => switchid === +switchIdDst)[0];
            final = {
                projectid: projectId,
                switchid_src: +switchIdSrc,
                switchid_dst: +switchIdDst,
                portname: srcSwitchName + dstSwitchName,
            }
            reverse = {
                projectid: projectId,
                switchid_src: +switchIdDst,
                switchid_dst: +switchIdSrc,
                portname: dstSwitchName + srcSwitchName,
            }
        }
        else {
            const switchId = formData.get('switchid')!.toString();
            if(switchId === 'none') return alert('Please select switch!');
            const hostId = formData.get('hostid')!.toString();
            if(hostId === 'none') return alert('Please select host!');
            const { switchname } = projectDevices!.switch.filter(({ switchid }) => switchid === +switchId)[0];
            const { hostname } = projectDevices!.host.filter(({ hostid }) => hostid === +hostId)[0];
            final = {
                projectid: projectId,
                switchid: +switchId,
                hostid: +hostId,
                portname: switchname + hostname,
            }
        }
        let result: number, reverseResult: number | undefined;
        if(connection) {
            result = await updateConnection(connection, final, connectionType)
            if(reverse) {
                if(isSwitchSwitch(connection)) {
                    const reverseConnection = {
                        ...connection,
                        switchid_src: connection.switchid_dst,
                        switchid_dst: connection.switchid_src,
                    }
                    reverseResult = await updateConnection(reverseConnection, reverse, connectionType)
                }
            }
        }
        else {
            result = await createConnection(final, connectionType);
            if(reverse) {
                reverseResult = await createConnection(reverse, connectionType);
            }
        }
        if (result && (reverseResult === undefined || reverseResult)) {
            handleNewDataIncoming();
            handleClose();
        }
        else {
            alert('Data entry failed! Please try again.');
        }
    }

    const handleFirstInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedValue = event.target.value;
        if(selectedValue !== "none") {
            setFirstFilled(true);
            setSelect(+selectedValue);
        }
        else setFirstFilled(false);
    }

    const generateForm = () => (
        <Box component="form" sx={style} onSubmit={handleSubmit}>
            <Typography fontSize='1.5rem'>{ connection ? 'Edit Connection' : 'New Connection' }</Typography>
            <TextField
                margin="normal"
                fullWidth
                required
                name={connectionType === 'switchSwitch' ? 'switchid_src' : 'switchid'}
                label={connectionType === 'switchSwitch' ? 'First Switch' : 'Switch Name'}
                type="text"
                id={connectionType === 'switchSwitch' ? 'switchid_src' : 'switchid'}
                select
                defaultValue={connection ? (isSwitchSwitch(connection) ? connection.switchid_src : connection.switchid) : 'none'}
                onChange={connectionType === 'switchSwitch' ? handleFirstInputChange : () => {}}
            >
                <MenuItem key="none" value="none">Select {connectionType === 'switchSwitch' ? 'First Switch' : 'Switch'}</MenuItem>
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
                name={connectionType === 'switchSwitch' ? 'switchid_dst' : 'hostid'}
                label={connectionType === 'switchSwitch' ? 'Second Switch' : 'Host Name'}
                type="text"
                id={connectionType === 'switchSwitch' ? 'switchid_dst' : 'hostid'}
                select
                defaultValue={connection ? (isSwitchSwitch(connection) ? connection.switchid_dst : connection.hostid) : 'none'}
                disabled={connectionType === 'switchSwitch' ? !firstFilled : false}
            >
                <MenuItem key="none" value="none">Select {connectionType === 'switchSwitch' ? 'Second Switch' : 'Host'}</MenuItem>
                {
                    connectionType === 'switchSwitch' ? 
                        projectDevices?.switch.map(({ switchid, switchname }) => {
                            return <MenuItem key={switchid} value={`${switchid}`}  disabled={switchid === select}>{switchname}</MenuItem>
                        })
                        :
                        projectDevices?.host.map(({ hostid, hostname }) => {
                            return <MenuItem key={hostid} value={`${hostid}`}>{hostname}</MenuItem>
                        })
                }
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

    function isSwitchSwitch(item: SwitchSwitch | SwitchHost): item is SwitchSwitch {
        return 'switchid_src' in item;
    }

    return (
        <Box component="span" mb="1rem" display="flex" alignItems="center">
            {
                connection ? 
                    <></>
                    :
                    (
                        <Box component="span" display="flex" alignItems="center">
                            <Typography fontSize='1.5rem' sx={{ m: 'auto 0 auto 0' }}>{connectionType === 'switchSwitch' ? 'Inter Switch' : 'Switch Host'} Connection</Typography>
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

export default CreateEditNonRS;