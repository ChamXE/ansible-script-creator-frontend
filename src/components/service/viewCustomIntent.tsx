import * as React from 'react';
import { CustomIntent } from "~/service";
import { Backdrop, Box, Container, Fade, IconButton, Modal, Typography } from "@mui/material";
import {DataGrid, GridColDef, GridValueFormatterParams, useGridApiRef} from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios, { CancelTokenSource } from "axios";
import { getURL } from "@/components/global";
import CreateEditCustomIntent from "@/components/service/createEditCustomIntent"

interface ViewCustomIntentProps {
    projectid: number;
    handleResetViewCustomIntent: () => void;
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

function ViewCustomIntent({ projectid, handleResetViewCustomIntent }: ViewCustomIntentProps) {
    const apiRef = useGridApiRef();
    const [newData, setNewData] = useState(0);
    const [customIntent, setCustomIntent] = useState<CustomIntent[] | null>(null)
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
        handleResetViewCustomIntent();
    }

    const column: GridColDef[] = [
        { field: 'configid', headerName: 'Config ID', flex: 0.5, type: 'string', },
        { field: 'source', headerName: 'Source', flex: 0.6, type: 'string', },
        { field: 'sourcekey', headerName: 'Source Key', flex: 0.6, type: 'string', },
        {
            field: 'intermediate',
            headerName: 'Intermediate',
            flex: 0.6,
            type: 'string',
            valueFormatter: (params: GridValueFormatterParams<string[]>) => {
                let toReturn = "";
                params.value.forEach((elem, idx) => {
                   if(idx === params.value.length - 1) toReturn += elem;
                   else toReturn += elem + " -> ";
                });
                return toReturn;
            },
        },
        { field: 'destination', headerName: 'Destination', flex: 0.6, type: 'string', },
        { field: 'destkey', headerName: 'Destination Key', flex: 0.6, type: 'string', },
        { field: 'ethertype', headerName: 'EtherType', flex: 0.6, type: 'string', },
        {
            field: 'protocol',
            headerName: 'Protocol',
            flex: 0.6,
            type: 'string',
            valueFormatter: (params: GridValueFormatterParams<string>) => {
                return params.value.length ? params.value : "N/A";
            }
        },
        {
            field: 'null', headerName: 'Action', flex: 0.5, renderCell: () => (
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
            const customIntent: CustomIntent = row.values().next().value
            setEdit(
                <CreateEditCustomIntent
                    customIntent={customIntent}
                    projectid={projectid}
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
        const consent = window.confirm(`Are you sure to delete the custom intent with id ${rowData.configid}?`);
        if(consent) {
            const deleteResult = await deleteCustomIntent(rowData.configid);
            if(deleteResult) return setNewData((prev) => prev - 1);
        }
    }

    async function deleteCustomIntent(configId: number): Promise<number> {
        try {
            const response = await axios.delete(`${getURL()}/service/customIntent/${configId}`);
            if (!response.data.result) return 0;
            return 1;
        } catch (e) {
            console.error(e.message);
            alert('Configuration deletion failed!');
            return 0;
        }
    }

    async function retrieveCustomIntent(source: CancelTokenSource): Promise<CustomIntent[] | null> {
        try {
            const response = await axios.get(`${getURL()}/service/customIntent/${projectid}`, {
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
                alert('Error fetching custom intent!');
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

        const getCustomIntent = async () => {
            const result = await retrieveCustomIntent(source);
            setCustomIntent(result? (result.length? result: []) : []);
        }

        getCustomIntent();

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
                        <CreateEditCustomIntent
                            projectid={projectid}
                            handleNewDataIncoming={handleNewDataIncoming}
                        />
                        {
                            customIntent &&
                            <DataGrid
                                rows={customIntent}
                                columns={column}
                                initialState={{
                                    pagination: {
                                        paginationModel: { page: 0, pageSize: 5 },
                                    },
                                    sorting: {
                                        sortModel: [{ field: 'configid', sort: 'asc' }],
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

export default ViewCustomIntent;