import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiPost, apiGet } from "../apiCommon";
import { config } from "../config";
import { Dialog, DialogActions, DialogContent, DialogTitle, } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Grid2 as Grid } from "@mui/material";
import { Switch, FormControlLabel } from "@mui/material";
import Swal from 'sweetalert2';

function alert() {
  const navigate = useNavigate();
  const [isAgreementExpirationPopup, setIsAgreementExpirationPopup] = useState(false);
  const [isStockBlockPopup, setIsStockBlockPopup] = useState(false);
  const [isInvoiceSubmissionPopup, setIsInvoiceSubmissionPopup] = useState(false);
  const [isGenericFormPopup, setIsGenericFormPopup] = useState(false);

  const [agreementExpForm, setAgreementExpForm] = useState({
    alertName: "Agreement Expiration Notification",
    alertMessage: "",
    remainingDays: "",
  });
  const [stockBlockForm, setStockBlockForm] = useState({
    alertName: "Stock Block and Payment Hold Alerts",
    alertMessage: "",
  });
  const [invoiceForm, setInvoiceForm] = useState({
    alertName: "Invoice Submission Reminder",
    alertMessage: "",
    expiryDate: "",
  });
  const [genericForm, setGenericForm] = useState({
    alertName: "Generic Message Alert",
    alertMessage: "",
    isVisible: false,
  });


  const resetAgreementForm = () => {
    setAgreementExpForm({ alertMessage: "", remainingDays: "", });
  };
  const resetStockBlockForm = () => {
    setAgreementExpForm({ alertMessage: ""});
  };
  const resetInvoiceForm = () => {
    setAgreementExpForm({ alertMessage: "", expiryDate: "", });
  };


  const handleAgreementChange = (e) => {
    const { name, value } = e.target;
    // remainingDays
        if (name === "remainingDays") {
          if (/^\d{0,3}$/.test(value)) {
            setAgreementExpForm({
              ...agreementExpForm,
              [name]: value,
            });
          }
        } 
    // textarea
      else {
        setAgreementExpForm({
          ...agreementExpForm,
          [name]: value,
        });
      }
  };



  const handleStockBlockChange = (e) => {
    setStockBlockForm({
      ...stockBlockForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleInvoiceChange = (e) => {
    setInvoiceForm({
      ...invoiceForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenericAlertChange = (e) => {
    const { name, type, value, checked } = e.target;

    setGenericForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      isVisible: false, // Toggle button become Auto OFF As we start typing...
    }));
  };

  //======================= (Save and Toggle ) ================================

  const handleToggle = async (e) => {
    const { checked } = e.target;

    // Update state first
    setGenericForm((prev) => ({
      ...prev,
      isVisible: checked,
    }));

    // Wait for state to update, then call API using the latest value
    const updatedForm = {
      ...genericForm,
      isVisible: checked,
    };

    // Run save with updated value
    try {
      const res = await apiPost(config.createAlert,
        updatedForm
      );
      if (res.data.code === 201) {
        toast.success(`Alert ${checked ? "Enabled" : "DISABLED"} on dashboard`);
      }
    } catch (error) {
      toast.error("Failed to update alert status");
    }
  };

  const handleSave = async () => {
    try {

      if (isAgreementExpirationPopup && (!agreementExpForm.alertMessage || !agreementExpForm.remainingDays)) {
        Swal.fire({

          icon: "warning",
          text: "Ensure Alert Message & Remaining Days are filled to proceed further.",
          confirmButtonText: "OK",
        });
        setTimeout(() => document.querySelector('.swal2-container')?.setAttribute('style', 'z-index: 3000 !important'), 0);
        return;
      }
      else if (isStockBlockPopup && !stockBlockForm.alertMessage) {
        Swal.fire({

          icon: "warning",
          text: "Ensure Alert Message to be filled to proceed further.",
          confirmButtonText: "OK",
          customClass: {
            popup: 'my-swal-container'
          }
        });
        setTimeout(() => document.querySelector('.swal2-container')?.setAttribute('style', 'z-index: 3000 !important'), 0);
        return;
      }
      else if (isInvoiceSubmissionPopup && !invoiceForm.alertMessage && !invoiceForm.expiryDate) {
        Swal.fire({

          icon: "warning",
          text: "Ensure Alert Message & Expiry Date are filled to proceed further.",
          confirmButtonText: "OK",
          customClass: {
            popup: 'my-swal-container'
          }
        });
        setTimeout(() => document.querySelector('.swal2-container')?.setAttribute('style', 'z-index: 3000 !important'), 0);
        return;
      }
      else if (isGenericFormPopup && !genericForm.alertMessage) {
        Swal.fire({

          icon: "warning",
          text: "Ensure Alert Message to be filled to proceed further.",
          confirmButtonText: "OK",
          customClass: {
            popup: 'my-swal-container'
          }
        });
        setTimeout(() => document.querySelector('.swal2-container')?.setAttribute('style', 'z-index: 3000 !important'), 0);
        return;
      }
      // console.log("from data is : ", agreementExpForm)
      // console.log("Stock Block : ", stockBlockForm)
      // console.log("invoice form : ", invoiceForm)
      // console.log("Generic Form : ", genericForm)

      // Check and send Agreement Expiration Notification if it has data
      if (agreementExpForm.alertMessage && agreementExpForm.remainingDays) {
        // console.log("Agreement is running")
        const res1 = await apiPost(config.createAlert,
          agreementExpForm
        );

        if (res1.data.code === 201) {
          toast.success("Agreement Expiration Alert Added");
          setIsAgreementExpirationPopup(false)
          setAgreementExpForm({
            alertMessage: "",
            remainingDays: "",
            alertName: "Agreement Expiration Notification",
          });
        }
      }

      // Check and send Stock Block Alert if it has data
      if (stockBlockForm.alertMessage) {
        // console.log("Stock Block is running")
        const res2 = await apiPost(config.createAlert,
          stockBlockForm
        );

        if (res2.data.code === 201) {
          toast.success("Stock Block Alert Added");
          setIsStockBlockPopup(false)
          setStockBlockForm({
            alertMessage: "",
            alertName: "Stock Block and Payment Hold Alerts",
          });
        }
      }

      // Check and send Invoice Reminder if it has data
      if (invoiceForm.alertMessage && invoiceForm.expiryDate) {
        // console.log("Invoice is running")
        const res3 = await apiPost(config.createAlert,
          invoiceForm
        );

        if (res3.data.code === 201) {
          toast.success("Invoice Reminder Alert Added");
          setIsInvoiceSubmissionPopup(false)
          setInvoiceForm({
            alertMessage: "",
            expiryDate: "",
            alertName: "Invoice Submission Reminder",
          });
        }
      }

      // Check and send Generic Message if it has data
      if (genericForm.alertMessage) {
         const res4 = await apiPost(config.createAlert,
          genericForm
        );
        if (res4.data.code === 201) {
          toast.success("Generic Message Added");
          setIsGenericFormPopup(false)
          setGenericForm({ 
            alertMessage: "", 
            alertName: "Generic Message Alert" });
        }
      }

    } catch (error) {
      console.error("Error saving user:", error);
      if (error.response) {
        console.log("Backend error response:", error.response.data);
        toast.error(JSON.stringify(error.response.data.message));
      }
    }
  };

  //==================================================

  const handleNavClick = (e, value) => {
    e.preventDefault();
    navigate(value);
  };

  //========( Fetching the Generic Alert and toggle button Status into the textare) ============================

  useEffect(() => {
    if (isGenericFormPopup) {
      fetchGenericAlert();
    }
  }, [isGenericFormPopup]);

  const fetchGenericAlert = async () => {
    try {
      const response = await apiGet(config.getGenericAlert);
      if (response.data.code === 200) {
        setGenericForm({
          alertName: response.data.data.alertName,
          alertMessage: response.data.data.alertMessage,
          isVisible: response.data.data.isVisible,
        });
      }
    } catch (error) {
      console.error("Failed to load generic alert:", error);
    }
  };

  return (
    <>
      {/* <!--  BEGIN CONTENT AREA  --> */}
      <div id="content" className="main-content">
        <div className="layout-px-spacing">
          <div className="middle-content container-fluid p-0">
            <div className="card mt-3">
              <div className="card-body p-3">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5>Alerts</h5>
                  <div className="d-flex gap-2">
                    <a href="/admin/dashboard" className="btn btn-primary" onClick={(e) => handleNavClick(e, "/admin/dashboard")} >
                      <i className="fa fa-arrow-left me-2"></i> Back
                    </a>
                  </div>
                </div>
                <div className="p-5 d-flex justify-content-evenly gap-5">
                  <button className="btn btn-warning p-4 fs-17" onClick={() => setIsAgreementExpirationPopup(true)} > Agreement Expiration Notification </button>
                  <button className="btn btn-danger p-4 fs-17" onClick={() => setIsStockBlockPopup(true)} > Stock Block and Payment Hold Alerts </button>
                  <button className="btn btn-secondary p-4 fs-17" onClick={() => setIsInvoiceSubmissionPopup(true)} > Invoice Submission Reminder </button>
                  <button className="btn btn-success p-4 fs-17" onClick={() => setIsGenericFormPopup(true)} > Generic Message Alert </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* agreementexpiration Popup */}


        <Dialog
            open={isAgreementExpirationPopup}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            sx={{ ".MuiDialog-paper": { maxWidth: "55rem !important", }, }} >
          <DialogTitle id="alert-dialog-title"> Agreement Expiration Notification </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => {setIsAgreementExpirationPopup(false); resetAgreementForm() }}
            sx={(theme) => ({ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500], })} >
            <CloseIcon />
          </IconButton>
          <DialogContent
            sx={{ width: { xs: "60vw", sm: "60vw", md: "45rem" }, minHeight: "20rem", }}>
            <>
              <Grid container spacing={2} justify="center">
                <Grid size={{ lg: 12, md: 12, xs: 12 }}>
                  <div className="form-group">
                    <label htmlFor="phone">Alert Message</label>
                    <textarea
                      id="textarea"
                      className="form-control textarea"
                      maxLength="400" // total 500
                      rows="4"
                      value={agreementExpForm.alertMessage}
                      name="alertMessage"
                      onChange={handleAgreementChange}
                      placeholder="Agreement Expiration has not been submitted for [specific month]."
                    ></textarea>
                  </div>
                </Grid>
                <Grid size={{ lg: 12, md: 12, xs: 12 }}>
                  <div className="form-group">
                    <label htmlFor="phone">Remaining Days</label>
                    <input
                      type="number"
                      className="form-control mb-3"
                      id="profession"
                      placeholder="days"
                      onChange={handleAgreementChange}
                      name="remainingDays"
                      value={agreementExpForm.remainingDays}
                    />
                  </div>
                </Grid>
              </Grid>
            </>

          </DialogContent>
          <DialogActions>
            <button className="btn btn-light-dark" onClick={() => {setIsAgreementExpirationPopup(false);resetAgreementForm()}} >
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary" >
              Save
            </button>
          </DialogActions>
        </Dialog>

        {/* stockblock */}

        <Dialog
          open={isStockBlockPopup}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          sx={{
            ".MuiDialog-paper": {
              maxWidth: "55rem !important",
            },
          }}
        >
          <DialogTitle id="alert-dialog-title">
            Stock Block and Payment Hold Alerts
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => {setIsStockBlockPopup(false);resetStockBlockForm()}}
            sx={(theme) => ({ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500], })}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent
            sx={{ width: { xs: "60vw", sm: "60vw", md: "45rem" }, minHeight: "15rem", }}
          >
            <>
              <Grid container spacing={2} justify="center">
                <Grid size={{ lg: 12, md: 12, xs: 12 }}>
                  <textarea
                    id="textarea"
                    className="form-control textarea"
                    maxLength="400" // total 500
                    rows="4"
                    value={stockBlockForm.alertMessage}
                    name="alertMessage"
                    onChange={handleStockBlockChange}
                    placeholder="Your GST is non-compliant. Stock and commission will be on hold until resolved for integrity or compliance issues"
                  ></textarea>
                </Grid>
              </Grid>
            </>
          </DialogContent>
          <DialogActions>
            <button
              className="btn btn-light-dark"
              onClick={() => {setIsStockBlockPopup(false);resetStockBlockForm()}}>
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary" >
              Save
            </button>
          </DialogActions>
        </Dialog>

        {/* invoicesubmission */}

        <Dialog
          open={isInvoiceSubmissionPopup}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          sx={{ ".MuiDialog-paper": { maxWidth: "55rem !important", }, }}
        >
          <DialogTitle id="alert-dialog-title">
            Invoice Submission Reminder (Advance release)
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => {setIsInvoiceSubmissionPopup(false);resetInvoiceForm()}}
            sx={(theme) => ({ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500], })}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent
            sx={{ width: { xs: "60vw", sm: "60vw", md: "45rem" }, minHeight: "20rem", }} >
            <>
              <Grid container spacing={2} justify="center">
                <Grid size={{ lg: 12, md: 12, xs: 12 }}>
                  <div className="form-group">
                    <label htmlFor="phone">Alert Message</label>
                    <textarea
                      id="textarea"
                      className="form-control textarea"
                      maxLength="400" // total 500
                      rows="4"
                      value={invoiceForm.alertMessage}
                      name="alertMessage"
                      onChange={handleInvoiceChange}
                      placeholder=" Invoice has not been submitted for [specific month]. Commission is on hold for any franchisee lacking submitted invoices"
                    ></textarea>
                  </div>
                </Grid>
                <Grid size={{ lg: 12, md: 12, xs: 12 }}>
                  <div className="form-group">
                    <label htmlFor="phone">Expiry Date</label>
                    <input
                      type="date"
                      className="form-control mb-3"
                      name="expiryDate"
                      value={invoiceForm.expiryDate}
                      onChange={handleInvoiceChange}
                      id="profession"
                      placeholder="expiryDate"
                    />
                  </div>
                </Grid>
              </Grid>
            </>
          </DialogContent>
          <DialogActions>
            <button className="btn btn-light-dark"
              onClick={() => {setIsInvoiceSubmissionPopup(false);resetInvoiceForm}} >
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary" >
              Save
            </button>
          </DialogActions>
        </Dialog>

        {/* Generic Message Alert */}

          <Dialog
          open={isGenericFormPopup}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          sx={{ ".MuiDialog-paper": { maxWidth: "55rem !important" } }}
          >
          <DialogTitle id="alert-dialog-title"> {" "} Generic Message Alert{" "} </DialogTitle>
          <IconButton
              aria-label="close"
              onClick={() => setIsGenericFormPopup(false)}
              sx={(theme) => ({ position: "absolute", right: 8, top: 8, color: theme.palette.grey[500], })}
              >
              <CloseIcon />
          </IconButton>

          <DialogContent
              sx={{ width: { xs: "60vw", sm: "60vw", md: "45rem" }, minHeight: "10rem", }}
          >
              <>
              <Grid container spacing={2} justify="center">
                  <Grid size={{ lg: 12, md: 12, xs: 12 }}>
                  <div className="form-group">
                      <textarea
                      id="textarea"
                      className="form-control textarea"
                      maxLength="400" // total 500
                      rows="4"
                      value={genericForm.alertMessage}
                      name="alertMessage"
                      onChange={handleGenericAlertChange}
                      placeholder="Alert to display on Dashboard"
                      ></textarea>
                  </div>
                  </Grid>
              </Grid>
              </>
          </DialogContent>
          <DialogActions>
              <FormControlLabel
              control={
                  <Switch
                  checked={genericForm.isVisible}
                  onChange={handleToggle}
                  name="isVisible"
                  color="primary"
                  disabled={!genericForm.alertMessage} // disable toggle if someone type
                  />
              }
              label="Show on Dashboard"
              />
          </DialogActions>
          </Dialog>
      </div>
      {/* <!--  END CONTENT AREA  --> */}
    </>
  );
}

export default alert;
