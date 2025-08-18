import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import Table from 'smart-webcomponents-react/table';
import { MultiSelect } from 'primereact/multiselect';
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import axios from 'axios';
import Swal from 'sweetalert2';
import { apiPost, apiGet, apiFormDataPost } from '../apiCommon';
import { baseURL } from '../base';
import { config } from '../config';
import { Dialog, DialogActions, DialogContent, DialogTitle, } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Grid2 as Grid } from '@mui/material';
import { Button } from '@mui/material';

const CustomFlatpickr = ({ onChange }) => {
    const inputRef = useRef();

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const defaultDate = new Date(currentYear, 0);
        flatpickr(inputRef.current, {
            dateFormat: "Y-m",
            defaultDate: defaultDate,
            plugins: [
                new monthSelectPlugin({
                    shorthand: true,
                    dateFormat: "Y-m",
                    altFormat: "F Y",
                }),
            ],
            onChange: (selectedDates) => {
                console.log(selectedDates)
                if (onChange && selectedDates.length > 0 && selectedDates[0] instanceof Date) {
                    onChange(selectedDates);
                } else {
                    onChange(null); // Optional: notify parent it's cleared
                }
            }
        });
    }, []);

    return <input ref={inputRef} className="form-control flatpickr flatpickr-input active" type="text" placeholder="Select Month & Year" />;
};

function AdminCommission() {
    const navigate = useNavigate();
    const user = sessionStorage.getItem("user_details");
    const userDetails = JSON.parse(user)
    const [vendorCodes, setVendorCodes] = useState([])
    const [selectedVendorCode, setSelectedVendorCode] = useState([])
    console.log("selectedVendorCodes:", selectedVendorCode);
    const [franchiseeName, setfranchiseeName] = useState([])
    const [selectedfranchiseeName, setSelectedfranchiseeName] = useState("")
    const [mapMobileNumber, setMapMobileNumber] = useState("")
    const [isEditCommPopup, setIsEditCommPopup] = useState(false)
    const [isAddUserPopup, setIsAddUserPopup] = useState(false)

    const [franchiseeData, setFranchiseeData] = useState([]);
    const [addFranchiseeForm, setAddFranchiseeForm] = useState({
        franchiseeName: "",
        email: "",
        mobileNumber: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    //commission page

    const commissionTypes = ["Variable", "Fixed and MG", "Boss", "Online"]
    const [selectedCommission, setSelectedCommission] = useState(commissionTypes[0] || "");
    const [storeCodes, setStoreCodes] = useState([])
    const [selectedStoreCode, setSelectedStoreCode] = useState("")
    const [selectedFranchiseName, setSelectedFranchiseName] = useState("");

    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [commissionDetails, setCommissionDetails] = useState([]);
    const [loading, setLoading] = useState(false);

    const [vendorCodeWithName, setVendorCodeWithName] = useState([]);
    const [file, setFile] = useState(null);
    const [editCommisionForm, setEditCommisionForm] = useState({
        Company_Code: "",
        Sap_Store_Code: "",
        Vendor: "",
        Commission_Type: "",
        Legacy: "",
        Franchisee_Name: "",
        Commission_Rate: "",
        Bill_Qty: "",
        MRP: "",
        Discount: "",
        GST: "",
        NSV: "",
        Comm_Amt: "",
        PVCCharged: "",
        PVC_Percent: "",
        PVC_Sales: "",
        CCARD_Sales: "",
        CCARD_Percent: "",
        CARD_Charges: "",
        Tax_Base_Amt: "",
        TDS_Rate: "",
        TDS_Amount: "",
        Net_Commission_Pay: "",
        AUFNR: "",
        ID: "",
        user: userDetails[0].UserName
    });

    //=========================================================================
    const handleNavClick = (e, value) => {
        e.preventDefault();
        navigate(value);
    };

    const handleClose = () => {
        setEditCommisionForm({
            Company_Code: "",
            Sap_Store_Code: "",
            Vendor: "",
            Commission_Type: "",
            Legacy: "",
            Franchisee_Name: "",
            Commission_Rate: "",
            Bill_Qty: "",
            MRP: "",
            Discount: "",
            GST: "",
            NSV: "",
            Comm_Amt: "",
            PVCCharged: "",
            PVC_Percent: "",
            PVC_Sales: "",
            CCARD_Sales: "",
            CCARD_Percent: "",
            CARD_Charges: "",
            Tax_Base_Amt: "",
            TDS_Rate: "",
            TDS_Amount: "",
            Net_Commission_Pay: "",
            AUFNR: "",
            ID: "",
            user: userDetails[0].UserName
        });
    }



    // =============================== ( Model form Data handles and Save Handle) ==================================



    const handleUpdate = async () => {
        const response = await apiPost(config.updatespecificcommission, editCommisionForm);
        if (response.data.code === 200) {
            toast.success("Franchisee updated successfully!");
            let data = {
                commissionType: selectedCommission,
                storeCode: selectedStoreCode,
                vendorCode: selectedFranchiseName,
                month: fromDate ? (formatFromandToDates(fromDate).month) : "",
                year: fromDate ? (formatFromandToDates(fromDate).year) : "",
            }
            await fetchCommissionList(data);
            setIsEditCommPopup(false)
            setEditCommisionForm({
                Company_Code: "",
                Sap_Store_Code: "",
                Vendor: "",
                Commission_Type: "",
                Legacy: "",
                Franchisee_Name: "",
                Commission_Rate: "",
                Bill_Qty: "",
                MRP: "",
                Discount: "",
                GST: "",
                NSV: "",
                Comm_Amt: "",
                PVCCharged: "",
                PVC_Percent: "",
                PVC_Sales: "",
                CCARD_Sales: "",
                CCARD_Percent: "",
                CARD_Charges: "",
                Tax_Base_Amt: "",
                TDS_Rate: "",
                TDS_Amount: "",
                Net_Commission_Pay: "",
                AUFNR: "",
                ID: "",
                user: userDetails[0].UserName
            })
        } else {
            toast.error("Failed to update Franchisee.");
        }
        return;
    }


    //================= ( table Edit and Delete Button , column  )==============================================

    const columns = [
        {
            label: 'Action',
            dataField: 'action',
            excludeFromExport: true,
            width: 150,
            formatFunction: (settings) => {
                const editDiv = document.createElement('span');
                editDiv.className = "downBtn";
                editDiv.style.margin = "10px";
                editDiv.innerHTML = `<span style="cursor:pointer;" title="Edit">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                <path fill="currentColor" d="M3.548 20.938h16.9a.5.5 0 0 0 0-1h-16.9a.5.5 0 0 0 0 1M9.71 17.18a2.6 2.6 0 0 0 1.12-.65l9.54-9.54a1.75 1.75 0 0 0 0-2.47l-.94-.93a1.79 1.79 0 0 0-2.47 0l-9.54 9.53a2.5 2.5 0 0 0-.64 1.12L6.04 17a.74.74 0 0 0 .19.72a.77.77 0 0 0 .53.22Zm.41-1.36a1.47 1.47 0 0 1-.67.39l-.97.26l-1-1l.26-.97a1.5 1.5 0 0 1 .39-.67l.38-.37l1.99 1.99Zm1.09-1.08l-1.99-1.99l6.73-6.73l1.99 1.99Zm8.45-8.45L18.65 7.3l-1.99-1.99l1.01-1.02a.75.75 0 0 1 1.06 0l.93.94a.754.754 0 0 1 0 1.06"/>
              </svg>
            </span>`;
                const deleteDiv = document.createElement('span');
                deleteDiv.className = "downBtn";
                deleteDiv.style.margin = "10px";
                deleteDiv.innerHTML = `<span  style="cursor:pointer;" title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg"  width="28" height="28" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 4c-4.419 0-8 3.582-8 8s3.581 8 8 8s8-3.582 8-8s-3.581-8-8-8m3.707 10.293a.999.999 0 1 1-1.414 1.414L12 13.414l-2.293 2.293a.997.997 0 0 1-1.414 0a1 1 0 0 1 0-1.414L10.586 12L8.293 9.707a.999.999 0 1 1 1.414-1.414L12 10.586l2.293-2.293a.999.999 0 1 1 1.414 1.414L13.414 12z"/>
              </svg>
            </span>`;
                const val = settings.value;

                editDiv.addEventListener('click', () => {
                    const value1 = settings.data.ID;
                    handleEdit(value1);
                });
                deleteDiv.addEventListener('click', () => {
                    const value1 = settings.data.ID;
                    const value2 = settings.data.Sap_Store_Code;
                    const value3 = settings.data.Legacy;
                    handleDelete(value1);
                });
                const template = document.createElement('div');
                template.appendChild(editDiv);
                template.appendChild(deleteDiv);

                settings.template = template;
            }
        },
        {
            label: 'Company Code',
            dataField: 'Company_Code',
            dataType: 'string',
            width: 150
        },
        {
            label: 'SAP Store Code',
            dataField: 'Sap_Store_Code',
            dataType: 'string',
            width: 150
        },
        {
            label: 'Vendor',
            dataField: 'Vendor',
            dataType: 'string',
            width: 150
        },
        {
            label: 'Commission Type',
            dataField: 'Commission_Type',
            dataType: 'string',
            width: 150
        },
        {
            label: 'Legacy',
            dataField: 'Legacy',
            dataType: 'string',
            width: 150
        },
        {
            label: 'Franchisee Name',
            dataField: 'Franchisee_Name',
            dataType: 'string',
            width: 150
        },
        {
            label: 'Commission Rate',
            dataField: 'Commission_Rate',
            dataType: 'string',
            width: 150
        },
        {
            label: 'Bill Qty',
            dataField: 'Bill_Qty',
            dataType: 'string',
            width: 150
        },
        {
            label: 'MRP',
            dataField: 'MRP',
            dataType: 'string',
            width: 150
        },
        {
            label: 'Discount',
            dataField: 'Discount',
            dataType: 'string',
            width: 150
        },
        {
            label: 'GST',
            dataField: 'GST',
            dataType: 'string',
            width: 150
        },
        {
            label: 'NSV',
            dataField: 'NSV',
            dataType: 'string',
            width: 150
        },
        {
            label: 'Comm Amnt',
            dataField: 'Comm_Amt',
            dataType: 'string',
            width: 150
        },
        {
            label: 'PVC Charged',
            dataField: 'PVCCharged',
            dataType: 'string',
            width: 150
        },
        {
            label: 'PVC Percent',
            dataField: 'PVC_Percent',
            dataType: 'string',
            width: 150
        },
        {
            label: 'PVC Sales',
            dataField: 'PVC_Sales',
            dataType: 'string',
            width: 150
        },
        {
            label: 'CCARD Sales',
            dataField: 'CCARD_Sales',
            dataType: 'string',
            width: 150
        },
        {
            label: 'CCARD Percent',
            dataField: 'CCARD_Percent',
            dataType: 'string',
            width: 150
        },
        {
            label: 'CARD Charges',
            dataField: 'CARD_Charges',
            dataType: 'string',
            width: 150
        },
        {
            label: 'Tax Base Amnt',
            dataField: 'Tax_Base_Amt',
            dataType: 'string',
            width: 150
        },
        {
            label: 'TDS Rate',
            dataField: 'TDS_Rate',
            dataType: 'string',
            width: 150
        },
        {
            label: 'TDS Amount',
            dataField: 'TDS_Amount',
            dataType: 'string',
            width: 150
        },
        {
            label: 'Net Commission Pay',
            dataField: 'Net_Commission_Pay',
            dataType: 'string',
            width: 150
        },
        {
            label: 'AUFNR',
            dataField: 'AUFNR',
            dataType: 'string',
            width: 150
        },

    ];

    const handleDelete = async (id) => {

        if (!id) {
            Swal.fire("Error", "Invalid entry.", "error");
            return;
        }

        const result = await Swal.fire({
            title: `Delete!`,
            text: "Are you sure you want to delete this Commission?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });

        if (!result.isConfirmed) return;

        try {
            await apiPost(config.deletecommissiondetail, { 'ID': id });
            await Swal.fire("Deleted!", "Commission has been deleted.", "success");
            const exactMonth = fromDate ? (formatFromandToDates(fromDate).month) : "";
            const exactYear = fromDate ? (formatFromandToDates(fromDate).year) : "";
            let listdata = {
                commissionType: selectedCommission,
                storeCode: selectedStoreCode,
                vendorCode: selectedFranchiseName,
                month: exactMonth,
                year: exactYear,
            }
            await fetchCommissionList(listdata);
        } catch (error) {
            console.error("Failed to delete Commission:", error);
            Swal.fire("Error", "Failed to delete Commission.", "error");
        }
    };

    const handleEdit = async (id) => {
        try {
            const response = await apiGet(config.geteditadmincommissiondetail, id);
            if (response.data.code === 404) {
                toast.error("Detail not found");

            } else if (response.data.code === 201) {
                console.log(response)
                const editCommissionDetail = response.data.data;
                setEditCommisionForm({
                    Company_Code: editCommissionDetail.Company_Code || "",
                    Sap_Store_Code: editCommissionDetail.Sap_Store_Code || "",
                    Vendor: editCommissionDetail.Vendor || "",
                    Commission_Type: editCommissionDetail.Commission_Type || "",
                    Legacy: editCommissionDetail.Legacy || "",
                    Franchisee_Name: editCommissionDetail.Franchisee_Name || "",
                    Commission_Rate: editCommissionDetail.Commission_Rate || "",
                    Bill_Qty: editCommissionDetail.Bill_Qty || "",
                    MRP: editCommissionDetail.MRP || "",
                    Discount: editCommissionDetail.Discount || "",
                    GST: editCommissionDetail.GST || "",
                    NSV: editCommissionDetail.NSV || "",
                    Comm_Amt: editCommissionDetail.Comm_Amt || "",
                    PVCCharged: editCommissionDetail.PVCCharged || "",
                    PVC_Percent: editCommissionDetail.PVC_Percent || "",
                    PVC_Sales: editCommissionDetail.PVC_Sales || "",
                    CCARD_Sales: editCommissionDetail.CCARD_Sales || "",
                    CCARD_Percent: editCommissionDetail.CCARD_Percent || "",
                    CARD_Charges: editCommissionDetail.CARD_Charges || "",
                    Tax_Base_Amt: editCommissionDetail.Tax_Base_Amt || "",
                    TDS_Rate: editCommissionDetail.TDS_Rate || "",
                    TDS_Amount: editCommissionDetail.TDS_Amount || "",
                    Net_Commission_Pay: editCommissionDetail.Net_Commission_Pay || "",
                    AUFNR: editCommissionDetail.AUFNR || "",
                    ID: editCommissionDetail.ID || "",
                });
                setIsEditCommPopup(true)
            } else {
                setEditCommisionForm({
                    Company_Code: "",
                    Sap_Store_Code: "",
                    Vendor: "",
                    Commission_Type: "",
                    Legacy: "",
                    Franchisee_Name: "",
                    Commission_Rate: "",
                    Bill_Qty: "",
                    MRP: "",
                    Discount: "",
                    GST: "",
                    NSV: "",
                    Comm_Amt: "",
                    PVCCharged: "",
                    PVC_Percent: "",
                    PVC_Sales: "",
                    CCARD_Sales: "",
                    CCARD_Percent: "",
                    CARD_Charges: "",
                    Tax_Base_Amt: "",
                    TDS_Rate: "",
                    TDS_Amount: "",
                    Net_Commission_Pay: "",
                    AUFNR: "",
                    ID: "",
                    user: userDetails[0].UserName
                })
            }

        } catch (error) {
            console.error("Failed to fetch Commission Details", error);
            Swal.fire("Error", "Failed to fetch Commission Details", "error");
        }
    };


    //click event listener for edit map delete icons to call handleEdit() or handleDelete()  handleEdit() with correct user ID.
    useEffect(() => {
        const table_Icon = document.querySelector('smart-table');
        if (!table_Icon) return;
        const handleClick = (event) => {
            const editBtn = event.target.closest('.edit-icon');
            const deleteBtn = event.target.closest('.delete-icon');

            if (editBtn) {
                const userId = editBtn.getAttribute('data-id');
                handleEdit(userId);
            }

            if (deleteBtn) {
                const userCodes = deleteBtn.getAttribute('data-id');
                handleDelete(userCodes);
            }
        };

        table_Icon.addEventListener('click', handleClick);
        return () => table_Icon.removeEventListener('click', handleClick); //  Clean up
    }, [commissionDetails]);



    //=========================== ( Data fetching UseEffect ) ================================          

    const fetchCommissionList = async (data) => {
        try {
            const response = await apiPost(config.getadmincommissiondetails, data);
            console.log(data, response)
            if (response.data.code === 400) {
                toast.error("Provide Mandatory fields - Commission Type, Store code,Vendor Code,Month & year ");

            } else if (response.data.code === 201) {
                if (response.data.data.length > 0) {
                    const modifiedData = response.data.data.map(item => ({
                        ...item,
                        action: `
          <div style="display:flex; gap:10px;">
            <span class="edit-icon" data-id="${item.id}" style="cursor:pointer;" title="Edit">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                <path fill="currentColor" d="M3.548 20.938h16.9a.5.5 0 0 0 0-1h-16.9a.5.5 0 0 0 0 1M9.71 17.18a2.6 2.6 0 0 0 1.12-.65l9.54-9.54a1.75 1.75 0 0 0 0-2.47l-.94-.93a1.79 1.79 0 0 0-2.47 0l-9.54 9.53a2.5 2.5 0 0 0-.64 1.12L6.04 17a.74.74 0 0 0 .19.72a.77.77 0 0 0 .53.22Zm.41-1.36a1.47 1.47 0 0 1-.67.39l-.97.26l-1-1l.26-.97a1.5 1.5 0 0 1 .39-.67l.38-.37l1.99 1.99Zm1.09-1.08l-1.99-1.99l6.73-6.73l1.99 1.99Zm8.45-8.45L18.65 7.3l-1.99-1.99l1.01-1.02a.75.75 0 0 1 1.06 0l.93.94a.754.754 0 0 1 0 1.06"/>
              </svg>
            </span>
            <span class="delete-icon"  data-id="${item.id}" style="cursor:pointer;" title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg"  width="28" height="28" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 4c-4.419 0-8 3.582-8 8s3.581 8 8 8s8-3.582 8-8s-3.581-8-8-8m3.707 10.293a.999.999 0 1 1-1.414 1.414L12 13.414l-2.293 2.293a.997.997 0 0 1-1.414 0a1 1 0 0 1 0-1.414L10.586 12L8.293 9.707a.999.999 0 1 1 1.414-1.414L12 10.586l2.293-2.293a.999.999 0 1 1 1.414 1.414L13.414 12z"/>
              </svg>
            </span>
          </div>
        `
                    }));
                    setCommissionDetails(modifiedData);
                } else {
                    setCommissionDetails([])
                }
            }
            else {
                setCommissionDetails([])
            }
        } catch (error) {
            console.error("Failed to fetch Franchisee Details", error);
        }
    };

    // useEffect(() => {
    //     // fetchFranchisee();
    // }, []);


    // ============================= (Downloading CSV ) ===============================================

    const handleCsvBtnClick = () => {
        if (commissionDetails.length > 0) {
            const exportColumns = columns.filter(col => !col.excludeFromExport); // Remove 'action' column from export
            const headers = exportColumns.map(col => col.label).join(',');        // Create CSV header

            const rows = commissionDetails.map(row =>                                     // Create CSV rows
                exportColumns.map(col => row[col.dataField]).join(',')
            );

            const csvContent = [headers, ...rows].join('\n');                     // Combine header and data

            // Download as CSV file
            const file = new Blob([csvContent], { type: 'text/csv' });           //  Use correct variable
            const a = document.createElement('a');
            a.href = URL.createObjectURL(file);
            a.download = 'Commission_Details.csv';
            a.click();
        } else {
            Swal.fire("Error", "No Data to export as CSV", "error");
        }
    };

    // ===============================================================================




    //Commission page

    const handleFormChange = (event) => {
        const { name, value } = event.target; //Destructring
        if (name === 'selectedFranchiseName') {
            setSelectedFranchiseName(value);
        } else if (name === 'selectedCommission') {
            setSelectedCommission(value);
        } else if (name === 'selectedStoreCode') {
            setSelectedStoreCode(value);
        }
    };

    useEffect(() => {
        if (selectedFranchiseName !== "") {
            (async () => {
                try {
                    const response = await apiPost(config.getallstoredetails, {
                        storeUID: selectedFranchiseName
                    });

                    if (response.data.code === 201) {
                        const allStoreDetails = response.data.all_store_details;
                        if (allStoreDetails?.ALL_STORE) {
                            setStoreCodes(allStoreDetails.ALL_STORE);
                            setSelectedStoreCode(allStoreDetails.ALL_STORE[0].LEGACY_CODE);
                        } else {
                            setSelectedStoreCode("");
                        }
                    }
                } catch (error) {
                    console.error("Error fetching store codes:", error);
                    toast.error("Error connecting to the server.");
                }
            })();
        }
    }, [selectedFranchiseName]);


    //========================================= end =====================================================

    useEffect(() => {

        fetchVendors();
        const currentYear = new Date().getFullYear();
        const defaultDate = new Date(currentYear, 0);
        setFromDate([defaultDate])
    }, [])

    const fetchVendors = async () => {
        try {
            const res = await apiGet(config.getAllVendors);
            setVendorCodeWithName(res.data.vendors);
        } catch (error) {
            console.error("Error fetching vendor codes", error);
        }
    };

    const handleSubmit = async () => {
        try {
            let data = {
                commissionType: selectedCommission,
                storeCode: selectedStoreCode,
                vendorCode: selectedFranchiseName,
                month: fromDate ? (formatFromandToDates(fromDate).month) : "",
                year: fromDate ? (formatFromandToDates(fromDate).year) : "",
            }
            setLoading(true);
            await fetchCommissionList(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatFromandToDates = (dateArray) => {
        if (dateArray.length > 0) {
            const selectedDate = dateArray[0];
            const year = selectedDate.getFullYear();
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0"); // 01 to 12

            return { year, month };
        }
        return { year: null, month: null }; // fallback for empty input
    };

    // form data input via name and value
    const handleChange = (e) => {
        setEditCommisionForm({
            ...editCommisionForm,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.xlsx')) {
            setFile(selectedFile);
        } else {
            Swal.fire({
                title: "Error",
                text: "Please upload a valid excel format file.",
                icon: "error",
                didOpen: () => {
                    document.querySelector('.swal2-container').style.zIndex = '2000';
                }
            });
            e.target.value = "";
            setFile(null);
        }
    };

    const handleFileUpload = async () => {
        if (file && file.name.endsWith('.xlsx')) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("user", userDetails[0].UserName);

            try {
                const response = await apiFormDataPost(config.addcommissiondetails, formData);
                if (response.data.code === 201) {
                    setIsAddUserPopup(false);
                    setFile(null);
                    if (response.data.inserted_rows > 0) {
                        await Swal.fire("Data Uploaded!", `${response.data.inserted_rows} commission details have been uploaded`, "success");
                    }
                    else if (response.data.skipped_duplicates > 0) {
                        await Swal.fire("No New Data Added", 'All records in the uploaded file already exist in the system. No new entries were inserted.', "warning");
                    }
                    else {
                        await Swal.fire("Warning!", "Oops! Due to mismatched values, Datas can't be Inserted", "warning");
                        setFile(null);
                    }
                }
                else {
                    setIsAddUserPopup(false);
                    Swal.fire("Error", "Something went wrong, Try again later.", "error");
                }
            } catch (error) {
                setIsAddUserPopup(false);
                Swal.fire("Error", "Something went wrong, Try again later.", "error");
                console.error("Failed to upload Excel file.", error);
            }
        } else {
            Swal.fire("Error", "Please upload a valid Excel (.xlsx) file.", "error");
            setFile(null);
        }
    }

    const handleRecordsDelete = async () => {
        const exactMonth = fromDate ? (formatFromandToDates(fromDate).month) : "";
        const exactYear = fromDate ? (formatFromandToDates(fromDate).year) : "";

        const result = await Swal.fire({
            title: `Delete!`,
            text: `Are you sure you want to delete records of Month & Year - ${exactMonth} & ${exactYear}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });

        if (!result.isConfirmed) return;

        try {
            let data = {
                month: exactMonth,
                year: exactYear,
            }
            await apiPost(config.deletecommissionrecords, data);
            await Swal.fire("Deleted!", `Records of Month & year - (${exactMonth} & ${exactYear}) been deleted.`, "success");

            // Refresh table after deletion
            let listdata = {
                commissionType: selectedCommission,
                storeCode: selectedStoreCode,
                vendorCode: selectedFranchiseName,
                month: exactMonth,
                year: exactYear,
            }
            await fetchCommissionList(listdata);
        } catch (error) {
            console.error("Failed to delete records:", error);
            Swal.fire("Error", "Failed to delete records.", "error");
        }
    }

    return (
        <>
            {/* <!--  BEGIN CONTENT AREA  --> */}
            <div id="content" className="main-content">
                <div className="layout-px-spacing">
                    <div className="middle-content container-xxl p-0">
                        <div className="card mt-3">
                            <div className="card-body">
                                <div className="row">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <h5>Commission Details</h5>
                                        <div className="d-flex gap-2">
                                            <a href="/admin/dashboard"
                                                className="btn btn-primary"
                                                onClick={(e) => handleNavClick(e, "/admin/dashboard")}>
                                                <i className="fa fa-arrow-left me-2"></i> Back
                                            </a>
                                            <button className="btn btn-primary" onClick={() => setIsAddUserPopup(true)}><i className="fa fa-add me-2"></i> Add Records</button>
                                        </div>
                                    </div>
                                    {/* ================= (Form start) ================== */}

                                    <div className="row mb-2">
                                        <div className="form mt-2">
                                            <div className="row">

                                                <div className="col-md-6 mb-3">
                                                    <div className="form-group">
                                                        <label htmlFor="location">Commission Type</label>
                                                        <select name="selectedCommission" id="country" className="form-select" value={selectedCommission}
                                                            onChange={handleFormChange}>
                                                            {commissionTypes.map((option) => (
                                                                <option key={option} value={option}>{option}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="col-md-6 mb-3">
                                                    <div className="form-group">
                                                        <label htmlFor="fullName">Vendor Code </label>
                                                        <select name="selectedFranchiseName"
                                                            id="country"
                                                            className="form-select"
                                                            value={selectedFranchiseName}
                                                            onChange={handleFormChange}
                                                        >
                                                            <option value="" disabled> Select Vendor Code </option>
                                                            {vendorCodeWithName.map((option) => (
                                                                <option key={option.vendorCode} value={option.vendorCode}>
                                                                    {option.vendorCode}  {option.vendorName ? ` - ${option.vendorName}` : ""}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="col-md-6 mb-3">
                                                    <div className="form-group">
                                                        <label htmlFor="address">SAP Store Code </label>
                                                        <select name="selectedStoreCode" id="country" className="form-select" value={selectedStoreCode}
                                                            onChange={handleFormChange}>
                                                            <option value=""> Select Store Code </option>
                                                            {storeCodes.map((option) => (
                                                                <option key={option.LEGACY_CODE} value={option.LEGACY_CODE}>{option.LEGACY_CODE.replace(/^0+/, '')}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>


                                                <div className="col-md-6 mb-3">
                                                    <div className="form-group">
                                                        <label htmlFor="fullName">Month & Year </label>
                                                        <CustomFlatpickr value={fromDate} onChange={(date) => setFromDate(date)} />
                                                    </div>
                                                </div>

                                                {/* <div className="col-md-4 mb-3">
                                                    <div className="form-group">
                                                        <label htmlFor="fullName">To Date </label>
                                                        <CustomFlatpickr value={toDate} onChange={(date) => setToDate(date)} />
                                                    </div>
                                                </div> */}


                                                <div className="col-md-12 mt-3">
                                                    <div className="d-flex justify-content-between">
                                                        {/* Left side button */}
                                                        <div className="form-group">
                                                            <button className="btn btn-danger" onClick={handleRecordsDelete}>Delete Records</button>
                                                        </div>

                                                        {/* Right side button */}
                                                        <div className="form-group">
                                                            <button className="btn btn-secondary" onClick={handleSubmit}>View Records</button>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                    {/* =================== ( Form End ) ============================ */}


                                    {/* ================= (Table) ================== */}

                                    <div className="row">
                                        <div className="col-xl-12 col-lg-12 col-sm-12  layout-spacing" style={{ overflowx: 'auto' }}>
                                            <div className="statbox widget box box-shadow" >
                                                <div className="widget-content widget-content-area" >
                                                    <span style={{ cursor: 'pointer' }} title="Download to CSV formate">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24"
                                                            onClick={handleCsvBtnClick} style={{ cursor: "pointer" }}>
                                                            <g fill="none" stroke="#0257a7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" color="#0257a7">
                                                                <path d="M10.294 14.016C10.248 13.024 9.571 13 8.651 13C7.235 13 7 13.338 7 14.667v1.666C7 17.662 7.235 18 8.651 18c.92 0 1.598-.024 1.643-1.016M21 13l-1.463 3.912c-.272.725-.407 1.088-.622 1.088s-.35-.363-.622-1.088L16.83 13m-2.109 0h-.972c-.389 0-.583 0-.736.063c-.522.216-.515.724-.515 1.187s-.007.97.515 1.187c.153.063.347.063.736.063c.388 0 .583 0 .736.063c.522.216.515.724.515 1.187s.007.97-.515 1.187c-.153.063-.348.063-.736.063h-1.06" />
                                                                <path d="M15 22h-4.273c-3.26 0-4.892 0-6.024-.798a4.1 4.1 0 0 1-.855-.805C3 19.331 3 17.797 3 14.727v-2.545c0-2.963 0-4.445.469-5.628c.754-1.903 2.348-3.403 4.37-4.113C9.095 2 10.668 2 13.818 2c1.798 0 2.698 0 3.416.252c1.155.406 2.066 1.263 2.497 2.35C20 5.278 20 6.125 20 7.818V10" />
                                                                <path d="M3 12a3.333 3.333 0 0 1 3.333-3.333c.666 0 1.451.116 2.098-.057A1.67 1.67 0 0 0 9.61 7.43c.173-.647.057-1.432.057-2.098A3.333 3.333 0 0 1 13 2" />
                                                            </g>
                                                        </svg>
                                                    </span>
                                                    <style> {` .smart-table thead th { background-color:rgb(224, 238, 249) !important; font-size: 13px !important; font-weight: 600; color: #333; } `} </style>
                                                    <Table
                                                        // ref={tableRef}
                                                        id="table"
                                                        key={commissionDetails.length}
                                                        appearance={{ alternationStart: 0, alternationCount: 2 }}
                                                        dataExport={{ view: true, viewStart: 0, viewEnd: 20 }}
                                                        dataSource={commissionDetails}
                                                        paging={true}
                                                        pageIndex={0}
                                                        pageSize={10}
                                                        columns={columns}
                                                        freezeHeader={true}
                                                    ></Table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* =================== ( Table End ) ============================ */}

                                </div>
                            </div>
                        </div>

                    </div>

                </div>



            </div>
            {/* <!--  END CONTENT AREA  --> */}



            {/*======================== <!-- Modal Container for Add User --> =============================*/}

            <Dialog
                open={isAddUserPopup}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                sx={{
                    ".MuiDialog-paper": {
                        maxWidth: "35rem !important",
                        maxHeight: "18rem !important",
                    },
                }}
            >
                <DialogTitle id="alert-dialog-title"
                >
                    Add Records
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={() => { setIsAddUserPopup(false), handleClose() }}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent
                    sx={{
                        width: { xs: '40vw', sm: '40vw', md: '30rem' },
                        minHeight: '10rem',
                    }}
                >
                    <>
                        <Grid container spacing={2} justify="center">
                            <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                <div className="form-group">
                                    <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                                        <Button variant="contained" component="span">
                                            Choose File
                                        </Button>
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".xlsx"
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                    <span> <b>{file ? file.name : ''}</b></span>
                                </div>
                            </Grid>
                        </Grid>
                    </>

                </DialogContent>
                <DialogActions>
                    <button className="btn btn-light-dark" onClick={() => { setIsAddUserPopup(false), handleClose() }} >Cancel</button>
                    <button type="button" onClick={handleFileUpload} className="btn btn-primary">Upload</button>
                </DialogActions>
            </Dialog>

            {/*====================== Edit User Model Container =========================== */}

            <Dialog
                open={isEditCommPopup}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                sx={{
                    ".MuiDialog-paper": {
                        maxWidth: "55rem !important",
                    },
                }}>
                <DialogTitle id="alert-dialog-title" > Edit Commission Details </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={() => setIsEditCommPopup(false)}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })} >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{ width: { xs: '80vw', sm: '80vw', md: '55rem' }, minHeight: '20rem', }} >
                    <>
                        <div className="form" id="stores1">
                            <Grid container spacing={2} justify="center">
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="Company_Code">Company Code</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="Company_Code"
                                            placeholder="Company Code"
                                            name="Company_Code"
                                            onChange={handleChange}
                                            value={editCommisionForm.Company_Code} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="Sap_Store_Code">Sap Store Code</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="Sap_Store_Code"
                                            placeholder="Sap Store Code"
                                            name="Sap_Store_Code"
                                            onChange={handleChange}
                                            value={editCommisionForm.Sap_Store_Code} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="Vendor">Vendor</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="Vendor"
                                            placeholder="Vendor"
                                            name="Vendor"
                                            onChange={handleChange}
                                            value={editCommisionForm.Vendor} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="franchiseeName">Commission Type</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="Commission_Type"
                                            placeholder="Commission Type"
                                            name="Commission_Type"
                                            onChange={handleChange}
                                            value={editCommisionForm.Commission_Type} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="map-mobileNumber">Legacy</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="Legacy"
                                            placeholder="Legacy"
                                            name="Legacy"
                                            onChange={handleChange}
                                            value={editCommisionForm.Legacy} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="Franchisee_Name">Franchisee Name</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="Franchisee_Name"
                                            placeholder="Franchisee Name"
                                            name="Franchisee_Name"
                                            onChange={handleChange}
                                            value={editCommisionForm.Franchisee_Name} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="Commission_Rate">Commission Rate</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="Commission_Rate"
                                            placeholder="Commission Rate"
                                            name="Commission_Rate"
                                            onChange={handleChange}
                                            value={editCommisionForm.Commission_Rate} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="Bill_Qty">Bill Qty</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="Bill_Qty"
                                            placeholder="Bill Qty"
                                            name="Bill_Qty"
                                            onChange={handleChange}
                                            value={editCommisionForm.Bill_Qty} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="MRP">MRP</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="MRP"
                                            placeholder="MRP"
                                            name="MRP"
                                            onChange={handleChange}
                                            value={editCommisionForm.MRP} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="Discount">Discount</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="Discount"
                                            placeholder="Discount"
                                            name="Discount"
                                            onChange={handleChange}
                                            value={editCommisionForm.Discount} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="GST">GST</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="GST"
                                            placeholder="GST"
                                            name="GST"
                                            onChange={handleChange}
                                            value={editCommisionForm.GST} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="NSV">NSV</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="NSV"
                                            placeholder="NSV"
                                            name="NSV"
                                            onChange={handleChange}
                                            value={editCommisionForm.NSV} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="Comm_Amt">Comm Amt</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="Comm_Amt"
                                            placeholder="Comm_Amt"
                                            name="Comm_Amt"
                                            onChange={handleChange}
                                            value={editCommisionForm.Comm_Amt} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="PVCCharged">PVC Charged</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="PVCCharged"
                                            placeholder="PVC Charged"
                                            name="PVCCharged"
                                            onChange={handleChange}
                                            value={editCommisionForm.PVCCharged} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="PVC_Percent">PVC Percent</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="PVC_Percent"
                                            placeholder="PVC Percent"
                                            name="PVC_Percent"
                                            onChange={handleChange}
                                            value={editCommisionForm.PVC_Percent} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="PVC_Sales">PVC Sales</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="PVC_Sales"
                                            placeholder="PVC Sales"
                                            name="PVC_Sales"
                                            onChange={handleChange}
                                            value={editCommisionForm.PVC_Sales} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="CCARD_Sales">CCARD Sales</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="CCARD_Sales"
                                            placeholder="CCARD Sales"
                                            name="CCARD_Sales"
                                            onChange={handleChange}
                                            value={editCommisionForm.CCARD_Sales} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="CCARD_Percent">CCARD Percent</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="CCARD_Percent"
                                            placeholder="CCARD Percent"
                                            name="CCARD_Percent"
                                            onChange={handleChange}
                                            value={editCommisionForm.CCARD_Percent} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="CARD_Charges">CARD Charges</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="CARD_Charges"
                                            placeholder="CARD Charges"
                                            name="CARD_Charges"
                                            onChange={handleChange}
                                            value={editCommisionForm.CARD_Charges} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="Tax_Base_Amt">Tax_Base_Amt</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="Tax_Base_Amt"
                                            placeholder="Tax Base Amt"
                                            name="Tax_Base_Amt"
                                            onChange={handleChange}
                                            value={editCommisionForm.Tax_Base_Amt} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="TDS_Rate">TDS Rate</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="TDS_Rate"
                                            placeholder="TDS Rate"
                                            name="TDS_Rate"
                                            onChange={handleChange}
                                            value={editCommisionForm.TDS_Rate} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="TDS_Amount">TDS Amount</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="TDS_Amount"
                                            placeholder="TDS Amount"
                                            name="TDS_Amount"
                                            onChange={handleChange}
                                            value={editCommisionForm.TDS_Amount} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="Net_Commission_Pay">Net Commission Pay</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="Net_Commission_Pay"
                                            placeholder="Net Commission Pay"
                                            name="Net_Commission_Pay"
                                            onChange={handleChange}
                                            value={editCommisionForm.Net_Commission_Pay} />
                                    </div>
                                </Grid>
                                <Grid size={{ lg: 6, md: 6, xs: 12 }}>
                                    <div className="form-group">
                                        <label htmlFor="AUFNR">AUFNR</label>
                                        <input type="text"
                                            className="form-control mb-3"
                                            id="AUFNR"
                                            placeholder="AUFNR"
                                            name="AUFNR"
                                            onChange={handleChange}
                                            value={editCommisionForm.AUFNR} />
                                    </div>
                                </Grid>
                            </Grid>
                        </div>
                    </>

                </DialogContent>
                <DialogActions>
                    <button className="btn btn-light-dark" onClick={() => { setIsEditCommPopup(false), handleClose() }}>Cancel</button>
                    <button type="button" onClick={handleUpdate} className="btn btn-primary">Update</button>
                </DialogActions>
            </Dialog>

        </>
    )
}

export default AdminCommission;