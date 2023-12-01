import * as React from 'react';
import { BGP, Neighbour, AdvertiseNetwork } from "~/service";
import { Backdrop, Box, Container, Divider, Fade, IconButton, Modal, Typography } from "@mui/material";
import {DataGrid, GridColDef, GridRenderCellParams, GridValueFormatterParams, useGridApiRef} from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios, {CancelTokenSource} from "axios";
import { getURL } from "@/components/global";
import CreateEditBGP from "@/components/service/createEditBGP"

interface ViewBGPProps {
    routerid: number;
    handleResetViewBGP: () => void;
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '65rem',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '60vh',
};

function ViewBGP({ handleResetViewBGP, routerid }: ViewBGPProps) {
    const apiRef = useGridApiRef();
    const [newData, setNewData] = useState(0);
    const [bgp, setBGP] = useState<BGP[] | null>(null)
    const [open, setOpen] = useState(true);
    const [edit, setEdit] = useState<React.ReactElement | null>(null);

    const handleNewDataIncoming = () => {
        setNewData((prev) => prev + 1);
    }

    const resetEdit = () => {
        setEdit(null);
    }

    const handleClose = () =>  {
        setOpen(false);
        handleResetViewBGP();
    }

    const column: GridColDef[] = [
        { field: 'configid', headerName: 'Config ID', flex: 0.5, type: 'string', },
        { field: 'asnumber', headerName: 'AS Number', flex: 0.6, type: 'number', headerAlign: 'left', align: 'left'},
        {
            field: 'bgprouterid',
            headerName: 'BGP Router ID',
            flex: 0.6,
            type: 'string',
            valueFormatter: (params: GridValueFormatterParams<string>) => {
                return params.value ?? "N/A";
            }
        },
        {
            field: 'null0',
            headerName: 'Neighbour',
            flex: 1,
            type: 'string',
            renderCell: (params: GridRenderCellParams) => {
                const { neighbour } = params.api.getRow(params.id!);
                if(!neighbour.length) return (<p> N/A </p>);
                return (
                    <Box key={params.id!}>
                        {
                            neighbour.map(({ id, remoteas, ebgpmultihop }: Neighbour, idx: number) => (
                                <Box key={params.id! + id! + remoteas! + ebgpmultihop!}>
                                    <Typography>Neighbour: {id}</Typography>
                                    <Typography>AS Number: {remoteas}</Typography>
                                    <Typography>eBGP Multihop: {`${ebgpmultihop}`}</Typography>
                                    { idx === neighbour.length - 1 ? <></> : <Divider /> }
                                </Box>
                            ))
                        }
                    </Box>
                );
            }
        },
        {
            field: 'null1',
            headerName: 'Network',
            flex: 1,
            type: 'string',
            renderCell: (params: GridRenderCellParams) => {
                const { network } = params.api.getRow(params.id!);
                if(!network.length) return (<p> N/A </p>);
                return (
                    <Box key={params.id!}>
                        {
                            network.map(({ ip, mask }: AdvertiseNetwork, idx: number) => (
                                <Box key={params.id! + ip! + mask!}>
                                    <Typography>Prefix: {ip}</Typography>
                                    <Typography>Mask: {mask}</Typography>
                                    { idx === network.length - 1 ? <></> : <Divider /> }
                                </Box>
                            ))
                        }
                    </Box>
                )
            }
        },
        {
            field: 'null2', headerName: 'Action', flex: 0.5, renderCell: () => (
                <Box component="span" display="flex">
                    <IconButton onClick={handleEdit}>
                        <EditIcon />
                    </IconButton>
                    <IconButton sx={{ ml: "1rem" }} onClick={handleDelete}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )
        }
    ];

    const handleEdit = async () => {
        const row = apiRef.current.getSelectedRows();
        if(row.size) {
            const bgp: BGP = row.values().next().value
            setEdit(
                <CreateEditBGP
                    bgp={bgp}
                    routerid={routerid}
                    resetEdit={resetEdit}
                    handleNewDataIncoming={handleNewDataIncoming}
                />
            );
        }
    }

    const handleDelete = async () => {
        const currentRow = apiRef.current.getSelectedRows();
        if(!currentRow.size) return alert("Please select row!");
        const rowData = currentRow.values().next().value;
        const consent = window.confirm(`Are you sure to delete the BGP configuration with id ${rowData.configid}?`);
        if(consent) {
            const deleteResult = await deleteBGPConfig(rowData.configid);
            if(deleteResult) return setNewData((prev) => prev - 1);
        }
    }

    async function deleteBGPConfig(configId: number): Promise<number> {
        try {
            const response = await axios.delete(`${getURL()}/service/bgp/${configId}`);
            if (!response.data.result) return 0;
            return 1;
        } catch (e) {
            console.error(e.message);
            alert('Configuration deletion failed!');
            return 0;
        }
    }

    async function retrieveBGPConfiguration(source: CancelTokenSource): Promise<BGP[] | null> {
        try {
            const response = await axios.get(`${getURL()}/service/bgp/${routerid}`, {
                cancelToken: source.token
            });

            if (!response.data.result) {
                console.error(response.data.message);
                return null;
            }
            if (Object.keys(response.data.data).length) {
                return JSON.parse(JSON.stringify(response.data.data));
            }
            return null;
        } catch (e) {
            if (e.code !== "ERR_CANCELED") {
                alert('Error fetching router BGP configurations!');
                console.error(e.message);
            }
            return null;
        }
    }

    const noRowsOverlay = () => (
        <Typography align='center' p='2rem'> No data! </Typography>
    );

    useEffect(() => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        const getBGPConfiguration = async () => {
            const result = await retrieveBGPConfiguration(source);
            setBGP(result? (result.length? result: []) : []);
        }

        getBGPConfiguration();

        return () => {
            source.cancel();
        }
    }, [newData])

    return (
        <Container sx={{ ml: "0" }}>
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
                        <CreateEditBGP
                            routerid={routerid}
                            handleNewDataIncoming={handleNewDataIncoming}
                        />
                        {
                            bgp &&
                                <DataGrid
                                    rows={bgp}
                                    columns={column}
                                    initialState={{
                                        pagination: {
                                            paginationModel: { page: 0, pageSize: 5 },
                                        },
                                        sorting: {
                                            sortModel: [{ field: 'asnumber', sort: 'asc' }],
                                        },
                                    }}
                                    pageSizeOptions={[5, 10]}
                                    getRowId={(row) => row.configid!}
                                    slots={{
                                        noRowsOverlay: noRowsOverlay
                                    }}
                                    apiRef={apiRef}
                                    getRowHeight={() => 'auto'}
                                />
                        }
                        { edit }
                    </Box>
                </Fade>
            </Modal>
        </Container>
    );
}

export default ViewBGP;