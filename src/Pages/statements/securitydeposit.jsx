import { useEffect, useState, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Table } from 'smart-webcomponents-react/table';
import 'smart-webcomponents-react/source/styles/smart.default.css';
import axios from 'axios';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import monthSelectPlugin from "flatpickr/dist/plugins/monthSelect";
import { BeatLoader } from 'react-spinners';
import { apiPost } from "../../apiCommon";
import { baseURL } from "../../base";
import { config } from "../../config";
import logo from "../../../src/assets/img/abfrl.png"

// Import Flatpickr styles
import "flatpickr/dist/flatpickr.min.css";
import "flatpickr/dist/plugins/monthSelect/style.css";

// PDF make
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;

const CustomFlatpickr = ({ onChange }) => {
    const inputRef = useRef();

    useEffect(() => {
        flatpickr(inputRef.current, {
            dateFormat: "Y-m", // Year-Month format
            plugins: [
                new monthSelectPlugin({
                    shorthand: true,
                    dateFormat: "Y-m",
                    altFormat: "F Y",
                }),
            ],
            onChange: (selectedDates) => {
                if (onChange) onChange(selectedDates);
            },
        });
    }, []);

    return <input ref={inputRef} className="form-control flatpickr flatpickr-input active" type="text" placeholder="Select Month & Year" />;
};


function SecurityDeposit() {

      const tableRef = useRef();
        const user = sessionStorage.getItem("user_details");
        const userDetails = JSON.parse(user)
        // const vendorCodes = userDetails.map(u => u.UserName);
    
        const securityDepositType = ["MG"]
        const [selectedSecurityDeposit, setSelectedSecurityDeposit] = useState(securityDepositType[0] || "");
        const [storeCodes, setStoreCodes] = useState([])
        const [selectedStoreCode, setSelectedStoreCode] = useState("")
        const [selectedFranchiseName, setSelectedFranchiseName] = useState("");
    
        const [fromDate, setFromDate] = useState(null);
        const [toDate, setToDate] = useState(null);
        const [securityDepositDetails, setSecurityDepositDetails] = useState([]);
        const [loading, setLoading] = useState(false);
    
        const [vendorCodeWithName, setVendorCodeWithName] = useState([]);
    
        const appearance = {
            alternationStart: 0,
            alternationCount: 2,
        };
    
        const dataExport = {
            view: true,
            viewStart: 0,
            viewEnd: 50
        };
        const paging = true;
        const pageIndex = 0;
        const pageSize = 10;
    
        const columns = [
            {
                label: 'Vendor Code',
                dataField: 'LIFNR',
                width: 100,
            },
            {
                label: 'SAP Store Code',
                dataField: 'ZUONR',
                dataType: 'string',
                width: 100,
            },
            {
                label: 'Posting Date',
                dataField: 'BUDAT',
                dataType: 'string',
                width: 150,
            },
            {
                label: 'Currency',
                dataField: 'RFCCUR',
                dataType: 'string',
                width: 150,
            },
            {
                label: 'Net Due Date',
                dataField: 'NET_DUE_DATE',
                dataType: 'number',
                width: 150,
            },
            {
                label: 'Amount',
                dataField: 'DMBTR',
                width: 150,
            },
            {
                label: 'Document No',
                dataField: 'BELNR',
                width: 150,
            },
            {
                label: 'Security Deposit Type',
                dataField: 'UMSKZ',
                width: 150,
            },
            // {
            //     label: 'Net Sales Value (Rs.)',
            //     dataField: 'NSV',
            //     width: 150,
            // },
            // {
            //     label: 'Franchise Commission Rate (%)',
            //     dataField: 'Commission_Rate',
            //     width: 150,
            // },
            // {
            //     label: 'Franchise Commission Amount (Rs.)',
            //     dataField: 'Comm_Amt',
            //     width: 150,
            // },
            // {
            //     label: 'Taxable Base Amount (Rs.)',
            //     dataField: 'Tax_Base_Amt',
            //     width: 150,
            // },
            // {
            //     label: 'TDS Rate (%)',
            //     dataField: 'TDS_Rate',
            //     width: 150,
            // },
            // {
            //     label: 'TDS Amount (Rs.)',
            //     dataField: 'TDS_Amount',
            //     width: 150,
            // },
            // {
            //     label: 'Net Commission Payable (Rs.)',
            //     dataField: 'Net_Commission_Pay',
            //     width: 150,
            // },
            // {
            //     label: 'CGST-9% on Taxable Base Amount (Rs.)',
            //     dataField: 'CGST_Amount',
            //     width: 150,
            // },
            // {
            //     label: 'SGST-9% on Taxable Base Amount (Rs.)',
            //     dataField: 'SGST_Amount',
            //     width: 150,
            // },
            // {
            //     label: 'Invoice to be raised (Taxable Base Amount + CGST + SGST)',
            //     dataField: 'Invoice_Amount',
            //     width: 150,
            // },
        ];
    
        //========================================== start ================================================
    
        const handleChange = (event) => {
            const { name, value } = event.target; //Destructring
            if (name === 'selectedFranchiseName') {
                setSelectedFranchiseName(value);
            } else if (name === 'selectedSecurityDeposit') {
                setSelectedSecurityDeposit(value);
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
            const fetchVendorFranchisee = async () => {
                try {
                    const vendorCodes = userDetails.map(u => u.UserName);
                    // console.log("vendorCodes =:",vendorCodes)
                    // console.log("selected vendor",selectedFranchiseName)
    
                    const res = await apiPost(config.getVendorWithFranchisee, { vendorCodes });
                    if (res.data.code === 200) {
                        setVendorCodeWithName(res.data.data);
                        // console.log("vendor with name ",res.data.data)
                    }
                } catch (err) {
                    console.error("Error fetching vendor:", err);
                }
            };
            fetchVendorFranchisee();
        }, [selectedFranchiseName])
    
    
    
        const handleSubmit = async () => {
            const vendorCodeArr = userDetails.map(u => u.UserName);
            let vendorCode = vendorCodeArr[0].padStart(vendorCodeArr[0].length + 3, '0');
            
            console.groupCollapsed("payload Details are below")
            console.log("Security deposite type", selectedSecurityDeposit)
            console.log("vendor Code", vendorCode);
            console.log("selectedStoreCode", selectedStoreCode)
            console.log(`from date is  ${fromDate}`)
            console.log(`To date is ${toDate}`)
            console.groupEnd()
            try {
                if (selectedSecurityDeposit == "") {
                    toast.error("Provide Security Deposit Type");
                    return;
                } else if (selectedStoreCode == "") {
                    toast.error("Provide Store Code");
                    return;
                }else if (vendorCode == "") {
                    toast.error("vendor code doseent fetched");
                    return;
                } else if (fromDate == "" || fromDate == null) {
                    toast.error("Provide From Date");
                    return;
                } else if (toDate == "" || toDate == null) {
                    toast.error("Provide To Date");
                    return;
                }
                else {
                    
                    let storeCodeValues = []
                    if (selectedStoreCode == "All") {
                        storeCodes.forEach((item) => { storeCodeValues.push(item.LEGACY_CODE) })
                    } else {
                        storeCodeValues.push(selectedStoreCode)
                    }
                    let data = {
                        securityDepositType: selectedSecurityDeposit,
                        vendorCode:vendorCode,
                        storeCode: storeCodeValues,
                        fromDate: fromDate ? formatFromandToDates(fromDate) : "",
                        toDate: toDate ? formatFromandToDates(toDate) : "",
                    }
                    setLoading(true);

                    const response = await apiPost(config.getSecurityDeposit, data);
                    if (response.data.code === 400) {
                        toast.error("Provide Mandatory fields - security deposit Type, vendor code, Store code, fromDate,toDate ");
                    } else if (response.data.code === 201) {
                                if (response?.data?.BSIK_RETURN.length > 0) {
                                    toast.success("this is working")
                                    const formattedData = response.data.BSIK_RETURN.map((item) => ({
                                        ...item,
                                        LIFNR: formatAmount(item.LIFNR),
                                        ZUONR: formatAmount(item.ZUONR),
                                        BUDAT: formatAmount(item.BUDAT),
                                        RFCCUR: formatAmount(item.RFCCUR),
                                        NET_DUE_DATE: formatAmount(item.NET_DUE_DATE),
                                        DMBTR: formatAmount(item.DMBTR),
                                        BELNR: formatAmount(item.BELNR),
                                        UMSKZ: formatAmount(item.UMSKZ),
                                        // Net_Commission_Pay: formatAmount(item.Net_Commission_Pay),
                                        // CGST_Amount: formatAmount(item.Tax_Base_Amt * 0.09),
                                        // SGST_Amount: formatAmount(item.Tax_Base_Amt * 0.09),
                                        // Invoice_Amount: formatAmount((item.Tax_Base_Amt * 0.09) + (item.Tax_Base_Amt * 0.09) + item.Tax_Base_Amt),
                                        // displayMonth: getMonthYear(item.Month, item.Year),
                                        // Sap_Store_Code: item.Sap_Store_Code.slice(-4),
                                        // Vendor: item.Vendor.replace(/^0+/, ''),
                                    }));
                                    console.table("table is ", formattedData);
                                    setSecurityDepositDetails(formattedData)
                                } else { 
                                    setSecurityDepositDetails([])
                                }
                    } else {
                        setSecurityDepositDetails([])
                    }
                }
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
                const month = selectedDate.getMonth() + 1; // Month is 0-based
                const formatted = `${year}${month.toString().padStart(2, "0")}`;
                return formatted // Now '2024-11'
            }
        };
    
        const formatAmount = (amount) => {
            return new Intl.NumberFormat('en-IN', {
                maximumFractionDigits: 0,
            }).format(amount);
        };
    
        const getMonthYear = (month, year) => {
            const date = new Date(`${year}-${month.padStart(2, '0')}-01`);
            return date.toLocaleString('en-US', { month: 'short' }) + '-' + year;
        };
    
        //====================== (Table Formation start ) =====================
        const handleCsvBtnClick = () => {
            setTimeout(() => {
                if (tableRef.current) {
                    // Ensure securityDepositDetails has data
                    if (securityDepositDetails.length === 0) {
                        console.log("No data to export");
                        toast.error("No data to export");
                        return;
                    }
    
                    // Extract unique months and sort in chronological order
                    const months = [...new Set(securityDepositDetails.map(item => item.displayMonth))].sort((a, b) => {
                        const [monthA, yearA] = a.split('-');
                        const [monthB, yearB] = b.split('-');
                        const dateA = new Date(`${yearA}-${monthA}-01`);
                        const dateB = new Date(`${yearB}-${monthB}-01`);
                        return dateA - dateB; // Chronological order (oldest to latest)
                    });
                    const dynamicColumns = columns.filter(col =>
                        securityDepositDetails.some(row => row[col.dataField] !== undefined && row[col.dataField] !== '')
                    );
    
                    // Create a map of field values by month in the order of months
                    const fieldData = {};
                    dynamicColumns.forEach(col => {
                        fieldData[col.label] = months.map(month => {
                            const row = securityDepositDetails.find(r => r.displayMonth === month);
                            let value = row ? row[col.dataField] || '' : '';
                            // Clean value: remove newlines, multiple spaces, and ensure consistent formatting
                            value = value.toString().replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
                            // Quote only if value contains commas, spaces, or is non-numeric; otherwise, leave as is for numeric right alignment
                            if (isNaN(value) || value.includes(',') || value.includes(' ')) {
                                value = `"${value}"`;
                            }
                            return value;
                        });
                    });
    
                    // Verify data alignment (debugging)
                    const monthCount = months.length;
                    Object.values(fieldData).forEach((values, index) => {
                        if (values.length !== monthCount) {
                            console.warn(`Mismatch in ${dynamicColumns[index].label}: Expected ${monthCount} values, got ${values.length}`, values);
                        }
                    });
    
                    // Build CSV content
                    let csvContent = "";
    
                    // Add data rows with conditionally quoted values
                    dynamicColumns.forEach(col => {
                        csvContent += `"${col.label}",${fieldData[col.label].join(',')}\n`;
                    });
    
                    // Create and download CSV
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    if (link.download !== undefined) {
                        const url = URL.createObjectURL(blob);
                        link.setAttribute('href', url);
                        link.setAttribute('download', 'Vcommission.csv');
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                } else {
                    console.log("Table ref not ready");
                }
            }, 100);
        };
        //========= (PDF) ============================
        
        function toBase64(url) {
            return fetch(url)
                .then(res => res.blob())
                .then(blob => new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                }));
        }

        const handlePdfBtnClick = () => {
            setTimeout(async () => {
                if (tableRef.current) {
                    // Ensure securityDepositDetails has data
                    if (securityDepositDetails.length === 0) {
                        console.log("No data to export");
                        toast.error("No data to export");
                        return;
                    }
    
                    // Extract unique months and sort in chronological order
                    const months = [...new Set(securityDepositDetails.map(item => item.displayMonth))].sort((a, b) => {
                        const [monthA, yearA] = a.split('-');
                        const [monthB, yearB] = b.split('-');
                        const dateA = new Date(`${yearA}-${monthA}-01`);
                        const dateB = new Date(`${yearB}-${monthB}-01`);
                        return dateA - dateB; // Chronological order (oldest to latest)
                    });
                    const dynamicColumns = columns.filter(col =>
                        securityDepositDetails.some(row => row[col.dataField] !== undefined && row[col.dataField] !== '')
                    );
    
                    // Create a map of field values by month
                    const fieldData = {};
                    dynamicColumns.forEach(col => {
                        fieldData[col.label] = months.map(month => {
                            const row = securityDepositDetails.find(r => r.displayMonth === month);
                            return row ? row[col.dataField] || '' : '';
                        });
                    });
    
                    // Prepare document definition with multiple pages
    
                    const logoBase64 = await toBase64("../../../src/assets/img/abfrl.png");
    
                    const docDefinition = {
                        content: [],
                        styles: {
                            header: {
                                fontSize: 18,
                                bold: true,
                                margin: [40, 100, 0, 20] // Adjusted margin to start below logo (x: 40, y: 130+)
                            },
                            tableHeader: {
                                bold: true,
                                fontSize: 15
                            }
                        },
                        pageSize: 'A4',
                        pageOrientation: 'landscape',
                        background: function (currentPage) {
                            return [
                                {
                                    image: logoBase64,
                                    width: 100, // Adjust width as needed
                                    absolutePosition: { x: 40, y: 20 } // Top left corner with padding
                                }
                            ];
                        }
                    };
    
                    // Split months into chunks of 6 in chronological order
                    for (let i = 0; i < months.length; i += 6) {
                        const chunkMonths = months.slice(i, i + 6);
                        docDefinition.content.push({ text: 'Commission Statement', style: 'header' });
                        docDefinition.content.push({
                            table: {
                                headerRows: 1,
                                widths: ['auto', ...chunkMonths.map(() => '*')],
                                body: dynamicColumns.map(col => [
                                    { text: col.label, rotation: 0 },
                                    ...fieldData[col.label].slice(i, i + 6)
                                ])
                            },
                            layout: 'lightHorizontalLines',
                            fontSize: 12
                        });
                        if (i + 6 < months.length) {
                            docDefinition.content.push({ text: '', pageBreak: 'after' });
                        }
                    }
    
                    pdfMake.createPdf(docDefinition).download('Vcommission.pdf');
                } else {
                    console.log("Table ref not ready");
                    toast.error("Table ref not ready");
                }
            }, 100);
        };
        //====================== (PDF Formation end ) =====================

    return (
        <>
            <div id="content" className="main-content">
                <div className="layout-px-spacing">
                    <div className="middle-content container-xxl p-0">
                        <div className="card mt-3">
                            <div className="card-body">
                                <div className="row">
                                    <h3 style={{ color: "black" }}>Security Deposit Details</h3>
                                    <div className="form mt-2">
                                        <div className="row">

                                            <div className="col-md-4 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="location">Security Deposit Type</label>
                                                    <select name="selectedSecurityDeposit" id="country" className="form-select" value={selectedSecurityDeposit}
                                                        onChange={handleChange}>
                                                        {securityDepositType.map((option) => (
                                                            <option key={option} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="col-md-4 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="fullName">Vendor Code </label>
                                                    <select name="selectedFranchiseName"
                                                        id="country"
                                                        className="form-select"
                                                        value={selectedFranchiseName}
                                                        onChange={handleChange}
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

                                            <div className="col-md-4 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="address"> Store Code </label>
                                                    <select name="selectedStoreCode" id="country" className="form-select" value={selectedStoreCode}
                                                        onChange={handleChange}>
                                                        <option value="All"> Select Store Code </option>
                                                        {storeCodes.map((option) => (
                                                            <option key={option.LEGACY_CODE} value={option.LEGACY_CODE}>{option.LEGACY_CODE.replace(/^0+/, '')}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>


                                            <div className="col-md-4 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="fullName">From Date </label>
                                                    <CustomFlatpickr value={fromDate} onChange={(date) => setFromDate(date)} />
                                                </div>
                                            </div>

                                            <div className="col-md-4 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="fullName">To Date </label>
                                                    <CustomFlatpickr value={toDate} onChange={(date) => setToDate(date)} />
                                                </div>
                                            </div>


                                            <div className="col-md-12 mt-3">
                                                <div className="form-group text-end">
                                                    <button className="btn btn-secondary" onClick={handleSubmit}>View Statement</button>
                                                </div>
                                            </div>

                                        </div>

                                    </div>

                                </div>
                            </div>
                        </div>

                        {
                            securityDepositDetails.length > 0 ? (
                                <>
                                    {loading ? (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
                                                <BeatLoader color="#0257A7" height={4} width={100} loading={loading} />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="card mt-3">
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-xl-12 col-lg-12 col-sm-12  layout-spacing">
                                                        <div className="statbox widget box box-shadow">
                                                            <div className="widget-content widget-content-area">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 24 24" onClick={handleCsvBtnClick} style={{ cursor: "pointer" }}>
                                                                    <title>Download CSV</title>
                                                                    <g fill="none" stroke="#0257a7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" color="#0257a7">
                                                                        <path d="M10.294 14.016C10.248 13.024 9.571 13 8.651 13C7.235 13 7 13.338 7 14.667v1.666C7 17.662 7.235 18 8.651 18c.92 0 1.598-.024 1.643-1.016M21 13l-1.463 3.912c-.272.725-.407 1.088-.622 1.088s-.35-.363-.622-1.088L16.83 13m-2.109 0h-.972c-.389 0-.583 0-.736.063c-.522.216-.515.724-.515 1.187s-.007.97.515 1.187c.153.063.347.063.736.063c.388 0 .583 0 .736.063c.522.216.515.724.515 1.187s.007.97-.515 1.187c-.153.063-.348.063-.736.063h-1.06" />
                                                                        <path d="M15 22h-4.273c-3.26 0-4.892 0-6.024-.798a4.1 4.1 0 0 1-.855-.805C3 19.331 3 17.797 3 14.727v-2.545c0-2.963 0-4.445.469-5.628c.754-1.903 2.348-3.403 4.37-4.113C9.095 2 10.668 2 13.818 2c1.798 0 2.698 0 3.416.252c1.155.406 2.066 1.263 2.497 2.35C20 5.278 20 6.125 20 7.818V10" />
                                                                        <path d="M3 12a3.333 3.333 0 0 1 3.333-3.333c.666 0 1.451.116 2.098-.057A1.67 1.67 0 0 0 9.61 7.43c.173-.647.057-1.432.057-2.098A3.333 3.333 0 0 1 13 2" />
                                                                    </g>
                                                                </svg> &nbsp;
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 32 32" onClick={handlePdfBtnClick} style={{ cursor: "pointer" }}>
                                                                    <title>Download PDF</title>
                                                                    <path fill="#909090" d="m24.1 2.072l5.564 5.8v22.056H8.879V30h20.856V7.945z" />
                                                                    <path fill="#f4f4f4" d="M24.031 2H8.808v27.928h20.856V7.873z" />
                                                                    <path fill="#7a7b7c" d="M8.655 3.5h-6.39v6.827h20.1V3.5z" />
                                                                    <path fill="#dd2025" d="M22.472 10.211H2.395V3.379h20.077z" />
                                                                    <path fill="#464648" d="M9.052 4.534H7.745v4.8h1.028V7.715L9 7.728a2 2 0 0 0 .647-.117a1.4 1.4 0 0 0 .493-.291a1.2 1.2 0 0 0 .335-.454a2.1 2.1 0 0 0 .105-.908a2.2 2.2 0 0 0-.114-.644a1.17 1.17 0 0 0-.687-.65a2 2 0 0 0-.409-.104a2 2 0 0 0-.319-.026m-.189 2.294h-.089v-1.48h.193a.57.57 0 0 1 .459.181a.92.92 0 0 1 .183.558c0 .246 0 .469-.222.626a.94.94 0 0 1-.524.114m3.671-2.306c-.111 0-.219.008-.295.011L12 4.538h-.78v4.8h.918a2.7 2.7 0 0 0 1.028-.175a1.7 1.7 0 0 0 .68-.491a1.9 1.9 0 0 0 .373-.749a3.7 3.7 0 0 0 .114-.949a4.4 4.4 0 0 0-.087-1.127a1.8 1.8 0 0 0-.4-.733a1.6 1.6 0 0 0-.535-.4a2.4 2.4 0 0 0-.549-.178a1.3 1.3 0 0 0-.228-.017m-.182 3.937h-.1V5.392h.013a1.06 1.06 0 0 1 .6.107a1.2 1.2 0 0 1 .324.4a1.3 1.3 0 0 1 .142.526c.009.22 0 .4 0 .549a3 3 0 0 1-.033.513a1.8 1.8 0 0 1-.169.5a1.1 1.1 0 0 1-.363.36a.67.67 0 0 1-.416.106m5.08-3.915H15v4.8h1.028V7.434h1.3v-.892h-1.3V5.43h1.4v-.892" />
                                                                    <path fill="#dd2025" d="M21.781 20.255s3.188-.578 3.188.511s-1.975.646-3.188-.511m-2.357.083a7.5 7.5 0 0 0-1.473.489l.4-.9c.4-.9.815-2.127.815-2.127a14 14 0 0 0 1.658 2.252a13 13 0 0 0-1.4.288Zm-1.262-6.5c0-.949.307-1.208.546-1.208s.508.115.517.939a10.8 10.8 0 0 1-.517 2.434a4.4 4.4 0 0 1-.547-2.162Zm-4.649 10.516c-.978-.585 2.051-2.386 2.6-2.444c-.003.001-1.576 3.056-2.6 2.444M25.9 20.895c-.01-.1-.1-1.207-2.07-1.16a14 14 0 0 0-2.453.173a12.5 12.5 0 0 1-2.012-2.655a11.8 11.8 0 0 0 .623-3.1c-.029-1.2-.316-1.888-1.236-1.878s-1.054.815-.933 2.013a9.3 9.3 0 0 0 .665 2.338s-.425 1.323-.987 2.639s-.946 2.006-.946 2.006a9.6 9.6 0 0 0-2.725 1.4c-.824.767-1.159 1.356-.725 1.945c.374.508 1.683.623 2.853-.91a23 23 0 0 0 1.7-2.492s1.784-.489 2.339-.623s1.226-.24 1.226-.24s1.629 1.639 3.2 1.581s1.495-.939 1.485-1.035" />
                                                                    <path fill="#909090" d="M23.954 2.077V7.95h5.633z" />
                                                                    <path fill="#f4f4f4" d="M24.031 2v5.873h5.633z" />
                                                                    <path fill="#fff" d="M8.975 4.457H7.668v4.8H8.7V7.639l.228.013a2 2 0 0 0 .647-.117a1.4 1.4 0 0 0 .493-.291a1.2 1.2 0 0 0 .332-.454a2.1 2.1 0 0 0 .105-.908a2.2 2.2 0 0 0-.114-.644a1.17 1.17 0 0 0-.687-.65a2 2 0 0 0-.411-.105a2 2 0 0 0-.319-.026m-.189 2.294h-.089v-1.48h.194a.57.57 0 0 1 .459.181a.92.92 0 0 1 .183.558c0 .246 0 .469-.222.626a.94.94 0 0 1-.524.114m3.67-2.306c-.111 0-.219.008-.295.011l-.235.006h-.78v4.8h.918a2.7 2.7 0 0 0 1.028-.175a1.7 1.7 0 0 0 .68-.491a1.9 1.9 0 0 0 .373-.749a3.7 3.7 0 0 0 .114-.949a4.4 4.4 0 0 0-.087-1.127a1.8 1.8 0 0 0-.4-.733a1.6 1.6 0 0 0-.535-.4a2.4 2.4 0 0 0-.549-.178a1.3 1.3 0 0 0-.228-.017m-.182 3.937h-.1V5.315h.013a1.06 1.06 0 0 1 .6.107a1.2 1.2 0 0 1 .324.4a1.3 1.3 0 0 1 .142.526c.009.22 0 .4 0 .549a3 3 0 0 1-.033.513a1.8 1.8 0 0 1-.169.5a1.1 1.1 0 0 1-.363.36a.67.67 0 0 1-.416.106m5.077-3.915h-2.43v4.8h1.028V7.357h1.3v-.892h-1.3V5.353h1.4v-.892" />
                                                                </svg>
                                                                <Table
                                                                    ref={tableRef}
                                                                    id="table"
                                                                    appearance={appearance}
                                                                    dataExport={dataExport}
                                                                    dataSource={securityDepositDetails}
                                                                    paging={paging}
                                                                    pageIndex={pageIndex}
                                                                    pageSize={pageSize}
                                                                    columns={columns}
                                                                    freezeHeader={true}
                                                                    className="my-smart-table"
                                                                ></Table>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    )

                                    }
                                </>
                            ) : (<div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>No Records Found</div>)
                        }
                    </div>

                </div>
            </div>
        </>
    )
}

export default SecurityDeposit;