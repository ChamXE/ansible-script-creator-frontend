import * as React from 'react';
import { useEffect, useState } from 'react';
import { CustomIntent, ParsedConnection, Source } from "~/service";
import { Backdrop, Box, Button, Fade, IconButton, MenuItem, Modal, TextField, Typography } from "@mui/material";
import { getURL } from "@/components/global";
import axios, { CancelTokenSource } from "axios";
import DeleteIcon from "@mui/icons-material/Delete";

interface CreateEditCustomIntentProps {
    customIntent?: CustomIntent;
    projectid: number;
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

function CreateEditCustomIntent({ customIntent, projectid, resetEdit, handleNewDataIncoming }: CreateEditCustomIntentProps) {
    const [open, setOpen] = useState(!!customIntent);
    const [connection, setConnection] = useState<ParsedConnection>({ source: {}, destination: {} });
    const [sources, setSources] = useState<Source[]>([]);
    const [intermediate, setIntermediate] = useState<string[]>(customIntent?.intermediate ?? []);
    const [source, setSource] = useState<string>(customIntent?.source ?? "none");

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        if(resetEdit) resetEdit();
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const src = formData.get('source')!.toString();
        const sourceItem = sources.find(({ routername }) => routername === source);
        const prot = formData.get('protocol')!.toString();
        const ci: CustomIntent = {
            configid: customIntent? customIntent.configid: undefined,
            projectid: projectid,
            routerid: sourceItem!.routerid,
            source: src,
            destination: formData.get('destination')!.toString(),
            intermediate: intermediate,
            sourcekey: formData.get('sourcekey')!.toString(),
            destkey: formData.get('destkey')!.toString(),
            ethertype: formData.get('ethertype')!.toString(),
            protocol: prot === "none" ? null : prot,
        }
        const result = await createCustomIntent(ci);
        if(result) {
            handleNewDataIncoming();
            handleClose();
            return;
        }
        return alert('Data entry failed! Please try again.');
    }

    const handleAdd = () => {
        const length = intermediate.length;
        if((intermediate.length && intermediate[length-1].length) || (source !== "none" && !intermediate.length)) setIntermediate((prev) => [...prev, ""]);
        else alert('Add source or previous intermediary node first!');
    }

    const handleUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const indexItem = event.target.name ? event.target.name.split('-') : event.currentTarget.id.split('-');
        const newVal = event.target.value;
        setIntermediate((prev) => prev.map((n, idx) => {
            if (idx !== +indexItem[1]) return n;
            return newVal;
        }))
    }

    const handleUpdateSource = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSource(event.target.value);
    }

    const handleDelete = (event: React.MouseEvent<HTMLElement>) => {
        const indexItem = event.currentTarget.id.split('-');
        setIntermediate((prev) => prev.filter((n, idx) => idx !== +indexItem[2]));
    }

    const generateIntermediate = (idx: number, node: string) => {
        return (
            <Box key={'intermediate' + idx} component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <TextField
                    margin="normal"
                    required
                    name={`intermediate-${idx}`}
                    label={`Intermediate ${idx + 1}`}
                    type="text"
                    id={`intermediate-${idx}`}
                    defaultValue={node.length? node : 'none'}
                    select
                    sx={{ width: '40%' }}
                    onChange={handleUpdate}
                >
                    <MenuItem key="none" value="none">Select Intermediary Node</MenuItem>
                    {
                        idx === 0 ?
                            connection!.source[source] ?
                                Object.keys(connection!.source[source]).map((s) => {
                                    const found = intermediate.find((elem) => elem === s);
                                    if(!found) {
                                        if(s !== source) return <MenuItem key={s} value={s}>{s}</MenuItem>;
                                    }
                                    else {
                                        if(found === node) return <MenuItem key={s} value={s}>{s}</MenuItem>;
                                    }
                                })
                                :
                                []
                            :
                            Object.keys(connection!.source[intermediate[idx-1]]).map((s) => {
                                const found = intermediate.find((elem) => elem === s);
                                if(!found) {
                                    if(s !== source) return <MenuItem key={s} value={s}>{s}</MenuItem>;
                                }
                                else {
                                    if(found === node) return <MenuItem key={s} value={s}>{s}</MenuItem>;
                                }
                            })
                    }
                </TextField>
                {
                    idx !== 0 ?
                        <IconButton id={`intermediate-delete-${idx}`} sx={{width: '10%'}} onClick={handleDelete}>
                            <DeleteIcon/>
                        </IconButton>
                        :
                        <></>
                }
            </Box>
        );
    };

    const generateForm = () => (
        <Box component="form" sx={{ ...style, overflowY: 'scroll'}} onSubmit={handleSubmit}>
            <Typography fontSize='1.5rem'>{ customIntent ? 'Edit Custom Intent' : 'New Custom Intent' }</Typography>
            <TextField
                margin="normal"
                fullWidth
                name="configid"
                label="Configuration ID (Auto)"
                type="number"
                id="routerid"
                disabled
                defaultValue={customIntent ? customIntent.configid : ''}
            />
            <Box key="sourceinfo" component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <TextField
                    margin="normal"
                    name="source"
                    label="Source"
                    type="text"
                    id="source"
                    select
                    defaultValue={customIntent ? customIntent.source : 'none'}
                    sx={{ width: '45%' }}
                    onChange={handleUpdateSource}
                >
                    <MenuItem key="none" value="none">Select Source</MenuItem>
                    {
                        sources!.map(({ routername }) => {
                            return <MenuItem key={routername} value={routername}>{routername}</MenuItem>;
                        })
                    }
                </TextField>
                <TextField
                    margin="normal"
                    name="sourcekey"
                    label="Source Key"
                    type="text"
                    id="sourcekey"
                    defaultValue={customIntent ? customIntent.sourcekey : ''}
                    sx={{ width: '45%' }}
                />
            </Box>
            <Box component="span" display="flex" mt="0.5rem">
                <Typography fontSize='1.2rem' m="auto 0 auto 0" width="12rem"> Intermediary Nodes </Typography>
                <Button
                    variant="contained"
                    sx={{ ml: '0.8rem' }}
                    id="intermediate"
                    onClick={handleAdd}
                >
                    Add Intermediary Node
                </Button>
            </Box>
            { Object.keys(connection.source).length && intermediate.map((elem, idx) => generateIntermediate(idx, elem)) }
            <Box key="destinationinfo" component="span" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <TextField
                    margin="normal"
                    name="destination"
                    label="Destination"
                    type="text"
                    id="destination"
                    select
                    defaultValue={customIntent ? customIntent.destination : 'none'}
                    sx={{ width: '45%' }}
                >
                    <MenuItem key="none" value="none">Select Destination</MenuItem>
                    {
                        intermediate.length && connection!.destination[intermediate[intermediate.length-1]] ?
                            Object.keys(connection!.destination[intermediate[intermediate.length-1]]).map((dest) => {
                                const found = intermediate.find((elem) => elem === dest);
                                if(!found) {
                                    if(dest !== source) return <MenuItem key={dest} value={dest}>{dest}</MenuItem>;
                                }
                                else {
                                    if(found === customIntent?.destination) return <MenuItem key={dest} value={dest}>{dest}</MenuItem>;
                                }
                            })
                            :
                            []
                    }
                </TextField>
                <TextField
                    margin="normal"
                    name="destkey"
                    label="Destination Key"
                    type="text"
                    id="destkey"
                    defaultValue={customIntent ? customIntent.destkey : ''}
                    sx={{ width: '45%' }}
                />
            </Box>
            <TextField
                margin="normal"
                fullWidth
                name="ethertype"
                label="EtherType"
                type="text"
                id="ethertype"
                defaultValue={customIntent ? customIntent.ethertype : ''}
                select
            >
                <MenuItem key="IPV4" value="IPV4">IPv4</MenuItem>
                <MenuItem key="IPV6" value="IPV6">IPv6</MenuItem>
                <MenuItem key="ARP" value="ARP">ARP</MenuItem>
                <MenuItem key="BDDP" value="BDDP">BDDP</MenuItem>
                <MenuItem key="EAPOL" value="EAPOL">EAPOL</MenuItem>
                <MenuItem key="LLDP" value="LLDP">LLDP</MenuItem>
                <MenuItem key="MPLS_UNICAST" value="MPLS_UNICAST">MPLS Unicast</MenuItem>
                <MenuItem key="MPLS_MULTICAST" value="MPLS_MULTICAST">MPLS Multicast</MenuItem>
                <MenuItem key="QINQ" value="QINQ">QINQ</MenuItem>
                <MenuItem key="RARP" value="RARP">RARP</MenuItem>
                <MenuItem key="VLAN" value="VLAN">VLAN</MenuItem>
            </TextField>
            <TextField
                margin="normal"
                fullWidth
                name="protocol"
                label="Protocol"
                type="text"
                id="protocol"
                defaultValue={customIntent? (customIntent!.protocol ? customIntent.protocol : 'none') : 'none'}
                select
            >
                <MenuItem key="none" value="none">None</MenuItem>
                <MenuItem key="TCP" value="TCP">TCP</MenuItem>
                <MenuItem key="UDP" value="UDP">UDP</MenuItem>
                <MenuItem key="ICMP" value="ICMP">ICMP</MenuItem>
                <MenuItem key="ICMP6" value="ICMP6">ICMP6</MenuItem>
            </TextField>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                { customIntent ? 'Save' : 'Create' }
            </Button>
        </Box>
    )

    async function createCustomIntent(ci: CustomIntent): Promise<number> {
        try {
            const response = await axios.post(`${getURL()}/service/customIntent`, ci);
            if (!response.data.result) {
                console.error(response.data.message);
                return 0;
            }
            if(customIntent) alert('Custom intent successfully updated!');
            else alert('Custom intent successfully created!');
            return 1;
        } catch (e) {
            console.error(e.message);
            return 0;
        }
    }

    async function retrieveConnections(source: CancelTokenSource): Promise<ParsedConnection | null> {
        try {
            const response = await axios.get(`${getURL()}/service/customIntent/connection/${projectid}`, {
                cancelToken: source.token
            });

            if (!response.data.result) {
                console.error(response.data.message);
                return null;
            }
            if (Object.keys(response.data.data.source).length) {
                return JSON.parse(JSON.stringify(response.data.data));
            }
            return null;
        } catch (e) {
            if (e.code !== "ERR_CANCELED") {
                alert('Error fetching connections!');
                console.error(e.message);
            }
            return null;
        }
    }

    async function retrieveSources(source: CancelTokenSource): Promise<Source[] | null> {
        try {
            const response = await axios.get(`${getURL()}/service/customIntent/sources/${projectid}`, {
                cancelToken: source.token
            });

            if (!response.data.result) {
                console.error(response.data.message);
                return null;
            }
            if (response.data.data.length) {
                return JSON.parse(JSON.stringify(response.data.data));
            }
            return null;
        } catch (e) {
            if (e.code !== "ERR_CANCELED") {
                alert('Error fetching sources!');
                console.error(e.message);
            }
            return null;
        }
    }

    useEffect(() => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        const getConnection = async () => {
            const result = await retrieveConnections(source);
            setConnection(result? result: { source: {}, destination: {} });
        }

        const getSources = async () => {
            const result = await retrieveSources(source);
            setSources(result? (result.length? result: []) : []);
        }

        getConnection();
        getSources();

        return () => {
            source.cancel();
        }
    }, [])

    return (
        <Box component="span" mb="1rem" display="flex" alignItems="center">
            {
                customIntent ?
                    <></>
                    :
                    <Box component="span" display="flex" alignItems="center" marginBottom='1rem'>
                        <Typography fontSize='1.5rem' sx={{m: 'auto 0 auto 0'}}>Custom Intents</Typography>
                        <Button
                            variant="contained"
                            sx={{m: 'auto 0 auto 1rem'}}
                            onClick={handleOpen}
                        >
                            Add Custom Intent
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

export default CreateEditCustomIntent;