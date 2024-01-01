import * as React from 'react';
import { useState } from 'react';
import { BGP, Neighbour, AdvertiseNetwork } from "~/service";
import { Backdrop, Box, Button, Fade, FormControl, FormControlLabel, FormLabel, IconButton, MenuItem, Modal, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import {getURL, Subnet} from "@/components/global";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

interface CreateEditBGPProps {
    bgp?: BGP;
    routerid: number;
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

function CreateEditBGP({ bgp, routerid, resetEdit, handleNewDataIncoming }: CreateEditBGPProps) {
    const [open, setOpen] = useState(!!bgp);
    const [neighbours, setNeighbours] = useState<Neighbour[]>(
        bgp ? (bgp.neighbour ? bgp.neighbour : []) : []
    );
    const [networks, setNetworks] = useState<AdvertiseNetwork[]>(
        bgp ? (bgp.network ? bgp.network : []) : []
    );

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        if(resetEdit) resetEdit();
    };

    const handleUpdate = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const indexItem = event.target.name ? event.target.name.split('-') : event.currentTarget.id.split('-');
        switch(indexItem[0]) {
            case "neighbour":
                setNeighbours((prev) => prev.map((n, idx) => {
                    if(idx !== +indexItem[2]) return n;
                    if(indexItem[1] === 'id') return {
                        ...n,
                        id: event.target.value
                    }
                    if(indexItem[1] === 'remoteas') return {
                        ...n,
                        remoteas: +event.target.value
                    }
                    return {
                        ...n,
                        ebgpmultihop: event.target.value === 'true'
                    }
                }));
                break;
            case "network":
                setNetworks((prev) => prev.map((n, idx) => {
                    if(idx !== +indexItem[2]) return n;
                    if(indexItem[1] === 'ip') return {
                        ...n,
                        ip: event.target.value
                    }
                    return {
                        ...n,
                        mask: event.target.value
                    }
                }));
                break;
            default:
                break;
        }
    }

    const handleAdd = (event: React.MouseEvent<HTMLElement>) => {
        switch(event.currentTarget.id) {
            case "neighbour":
                setNeighbours((prev) => [...prev, { ebgpmultihop: true }])
                break;
            case "network":
                setNetworks((prev) => [...prev, {}])
                break;
            default:
                break;
        }
    }

    const handleDelete = (event: React.MouseEvent<HTMLElement>) => {
        const indexItem = event.currentTarget.id.split('-');
        switch(indexItem[0]) {
            case "neighbour":
                setNeighbours((prev) => prev.filter((n, idx) => idx !== +indexItem[2]));
                break;
            case "network":
                setNetworks((prev) => prev.filter((n, idx) => idx !== +indexItem[2]));
                break;
            default:
                break;
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        for(let i = 0; i < networks.length; i++) {
            if(networks[i].mask) {
                if(networks[i].mask === 'none') {
                    return alert(`Please select subnet mask for IP prefix ${networks[i].ip}!`);
                }
            }
        }
        const bgprouterid = formData.get('bgprouterid')!.toString();
        const b: BGP = {
            configid: bgp? bgp.configid: undefined,
            routerid: routerid,
            asnumber: +formData.get('asnumber')!.toString(),
            bgprouterid: bgprouterid.length? bgprouterid : undefined,
            neighbour: neighbours.length? neighbours : undefined,
            network: networks.length? networks : undefined,
        }
        const result = await createBGPConfiguration(b);
        if(result) {
            handleNewDataIncoming();
            handleClose();
            return;
        }
        return alert('Data entry failed! Please try again.');
    }

    const generateNetwork = (idx: number, network?: AdvertiseNetwork) => {
        return (
            <Box key={'neighbour' + idx} component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <TextField
                    margin="normal"
                    required
                    name={`network-ip-${idx}`}
                    label={`IP Prefix ${idx + 1}`}
                    type="text"
                    id={`network-ip-${idx}`}
                    defaultValue={network?.ip ?? ''}
                    sx={{ width: '40%' }}
                    onChange={handleUpdate}
                />
                <TextField
                    margin="normal"
                    required
                    name={`network-subnet-${idx}`}
                    label={`Subnet Mask ${idx + 1}`}
                    type="text"
                    id={`network-subnet-${idx}`}
                    defaultValue={network? (network.mask? (network.mask.length? network.mask : 'none') : 'none') : 'none'}
                    select
                    sx={{ width: '40%' }}
                    onChange={handleUpdate}
                >
                    <MenuItem key="none" value="none">Select Subnet</MenuItem>
                    {
                        Object.keys(Subnet).reverse().map((s) => {
                            return <MenuItem key={s} value={Subnet[+s]}>/{s}</MenuItem>
                        })
                    }
                </TextField>
                <IconButton id={`network-delete-${idx}`} sx={{ width: '10%' }} onClick={handleDelete}>
                    <DeleteIcon/>
                </IconButton>
            </Box>
        );
    };

    const generateNeighbour = (idx: number, neighbour?: Neighbour) => {
        return (
            <Box key={'neighbour' + idx} component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <TextField
                    margin="normal"
                    required
                    name={`neighbour-id-${idx}`}
                    label={`Neighbour IP ${idx + 1}`}
                    type="text"
                    id={`neighbour-id-${idx}`}
                    defaultValue={neighbour?.id ?? ''}
                    sx={{ width: '30%' }}
                    onChange={handleUpdate}
                />
                <TextField
                    margin="normal"
                    required
                    name={`neighbour-remoteas-${idx}`}
                    label={`Remote AS ${idx + 1}`}
                    type="number"
                    id={`neighbour-remoteas-${idx}`}
                    defaultValue={neighbour?.remoteas ?? ''}
                    sx={{ width: '30%' }}
                    onChange={handleUpdate}
                />
                <FormControl required>
                    <FormLabel id={`ebgpmultihop-${idx}`}>eBGP Multihop {idx + 1}</FormLabel>
                    <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name={`neighbour-ebgpmultihop-${idx}`}
                        defaultValue={neighbour?.ebgpmultihop ?? 'true'}
                        onChange={handleUpdate}
                    >
                        <FormControlLabel value="true" control={<Radio />} label="True" />
                        <FormControlLabel value="false" control={<Radio />} label="False" />
                    </RadioGroup>
                </FormControl>
                <IconButton id={`neighbour-delete-${idx}`} sx={{ width: '10%' }} onClick={handleDelete}>
                    <DeleteIcon/>
                </IconButton>
            </Box>
        );
    };

    const generateForm = () => (
        <Box component="form" sx={{ ...style, overflowY: 'scroll'}} onSubmit={handleSubmit}>
            <Typography fontSize='1.5rem'>{ bgp ? 'Edit BGP Router' : 'New BGP Router' }</Typography>
            <TextField
                margin="normal"
                fullWidth
                name="configid"
                label="Configuration ID (Auto)"
                type="number"
                id="routerid"
                disabled
                defaultValue={bgp ? bgp.configid : ''}
            />
            <TextField
                margin="normal"
                fullWidth
                required
                name="asnumber"
                label="AS Number"
                type="number"
                id="asnumber"
                defaultValue={bgp ? bgp.asnumber : ''}
            />
            <TextField
                margin="normal"
                fullWidth
                name="bgprouterid"
                label="BGP Router ID"
                type="text"
                id="bgprouterid"
                defaultValue={bgp ? bgp.bgprouterid : ''}
            />
            <Box component="span" display="flex" mt="0.5rem">
                <Typography fontSize='1.2rem' m="auto 0 auto 0" width="6rem"> Neighbour </Typography>
                <Button
                    variant="contained"
                    sx={{ ml: '0.8rem' }}
                    id="neighbour"
                    onClick={handleAdd}
                >
                    Add Neighbour
                </Button>
            </Box>
            { neighbours.map((n, idx) => generateNeighbour(idx, n)) }
            <Box component="span" display="flex" mt="0.5rem">
                <Typography fontSize='1.2rem' m="auto 0 auto 0" width="6rem"> Network </Typography>
                <Button
                    variant="contained"
                    sx={{ ml: '0.8rem' }}
                    id="network"
                    onClick={handleAdd}
                >
                    Add Network
                </Button>
            </Box>
            { networks.map((n, idx) => generateNetwork(idx, n)) }
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                { bgp ? 'Save' : 'Create' }
            </Button>
        </Box>
    )

    async function createBGPConfiguration(b: BGP): Promise<number> {
        try {
            const response = await axios.post(`${getURL()}/service/bgp`, b);
            if (!response.data.result) {
                console.error(response.data.message);
                return 0;
            }
            if(bgp) alert('BGP configuration successfully updated!');
            else alert('BGP configuration successfully created!');
            return 1;
        } catch (e) {
            console.error(e.message);
            return 0;
        }
    }

    return (
        <Box component="span" mb="1rem" display="flex" alignItems="center">
            {
                bgp ?
                    <></>
                    :
                    <Box component="span" display="flex" alignItems="center" marginBottom='1rem'>
                        <Typography fontSize='1.5rem' sx={{ m: 'auto 0 auto 0' }}>BGP Configuration</Typography>
                        <Button
                            variant="contained"
                            sx={{ m: 'auto 0 auto 1rem'}}
                            onClick={handleOpen}
                        >
                            Add BGP Router
                        </Button>
                    </Box>
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

export default CreateEditBGP;