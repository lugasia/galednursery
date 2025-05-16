import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Button, 
  IconButton, 
  Divider, 
  TextField,
  Card,
  CardMedia,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  ShoppingCart as CartIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import Layout from '../../components/layout/Layout';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  
  const [activeStep, setActiveStep] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  const steps = ['עגלת קניות', 'פרטי הזמנה', 'סיכום'];
  
  const handleNext = () => {
    if (activeStep === 0) {
      // Check if cart is empty
      if (cartItems.length === 0) {
        return;
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Validate customer information
      const errors = {};
      if (!customerName.trim()) {
        errors.name = 'נא להזין שם';
      }
      if (!customerPhone.trim()) {
        errors.phone = 'נא להזין מספר טלפון';
      } else if (!/^\d{9,10}$/.test(customerPhone.replace(/[\s-]/g, ''))) {
        errors.phone = 'מספר טלפון לא תקין';
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      
      setFormErrors({});
      setActiveStep(2);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleQuantityChange = (plantId, newQuantity) => {
    updateQuantity(plantId, newQuantity);
  };
  
  // No need to calculate total as everything is free
  const calculateTotal = () => {
    return 0;
  };
  
  const formatWhatsAppMessage = () => {
    const items = cartItems.map(item => 
      `${item.plant.name} - כמות: ${item.quantity}`
    ).join('\n');
    
    const message = `*הזמנה חדשה ממשתלת קיבוץ גלעד*\n\n` +
      (orderNumber ? `*מספר הזמנה:* ${orderNumber}\n` : '') +
      `*שם:* ${customerName}\n` +
      `*טלפון:* ${customerPhone}\n\n` +
      `*פריטים:*\n${items}`;
    
    return encodeURIComponent(message);
  };
  
  const handleWhatsAppOrder = async () => {
    try {
      // Create order in the database
      const orderData = {
        customerName,
        customerPhone,
        items: cartItems.map(item => ({
          plant: item.plant._id,
          quantity: item.quantity
        }))
      };
      
      // Send order to the backend
      const response = await axios.post('/api/orders', orderData);
      
      // Save the order number from the response
      if (response.data && response.data.orderNumber) {
        setOrderNumber(response.data.orderNumber);
      }
      
      // Open WhatsApp with order details
      const message = formatWhatsAppMessage();
      const whatsappURL = `https://wa.me/972523489154?text=${message}`;
      window.open(whatsappURL, '_blank');
      
      setOrderSuccess(true);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('אירעה שגיאה בשליחת ההזמנה. אנא נסה שוב מאוחר יותר.');
    }
  };
  
  const handleCloseSuccessDialog = () => {
    setOrderSuccess(false);
    clearCart();
    navigate('/');
  };
  
  // Cart is empty
  if (cartItems.length === 0 && activeStep === 0) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              עגלת קניות
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
              <CartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                העגלה שלך ריקה
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                לא נמצאו פריטים בעגלת הקניות שלך
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/')}
              >
                המשך בקניות
              </Button>
            </Paper>
          </Box>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            עגלת קניות
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {activeStep === 0 && (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    {cartItems.map((item) => (
                      <Box key={item.plant._id} sx={{ mb: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={3} sm={2}>
                            <CardMedia
                              component="img"
                              image={item.plant.imageBase64 || 'https://via.placeholder.com/100x100?text=צמח'}
                              alt={item.plant.name}
                              className="cart-item-image"
                            />
                          </Grid>
                          <Grid item xs={9} sm={4}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {item.plant.name}
                            </Typography>
                            {item.plant.category && (
                              <Typography variant="body2" color="text.secondary">
                                {item.plant.category.name}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleQuantityChange(item.plant._id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <TextField
                                value={item.quantity}
                                inputProps={{ 
                                  readOnly: true,
                                  style: { textAlign: 'center' } 
                                }}
                                size="small"
                                sx={{ width: '50px', mx: 1 }}
                              />
                              <IconButton 
                                size="small" 
                                onClick={() => handleQuantityChange(item.plant._id, item.quantity + 1)}
                                disabled={item.quantity >= item.plant.stock}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Grid>
                          <Grid item xs={4} sm={2} sx={{ textAlign: 'right' }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                              חינם
                            </Typography>
                          </Grid>
                          <Grid item xs={2} sm={1} sx={{ textAlign: 'center' }}>
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => removeFromCart(item.plant._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                        <Divider sx={{ my: 2 }} />
                      </Box>
                    ))}
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      סיכום הזמנה
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">מספר פריטים:</Typography>
                      <Typography variant="body1">{cartItems.reduce((total, item) => total + item.quantity, 0)}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="body1">סה"כ:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>חינם</Typography>
                    </Box>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleNext}
                      sx={{ mb: 2 }}
                    >
                      המשך להזמנה
                    </Button>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate('/')}
                      startIcon={<ArrowBackIcon />}
                    >
                      המשך בקניות
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
          
          {activeStep === 1 && (
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    פרטי לקוח
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <TextField
                    label="שם מלא"
                    fullWidth
                    margin="normal"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    required
                  />
                  
                  <TextField
                    label="מספר טלפון"
                    fullWidth
                    margin="normal"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    error={!!formErrors.phone}
                    helperText={formErrors.phone}
                    required
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                    >
                      חזרה
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                    >
                      המשך לסיכום
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {activeStep === 2 && (
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    סיכום הזמנה
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      פרטי לקוח:
                    </Typography>
                    <Typography variant="body1">שם: {customerName}</Typography>
                    <Typography variant="body1">טלפון: {customerPhone}</Typography>
                  </Box>
                  
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    פריטים:
                  </Typography>
                  
                  {cartItems.map((item) => (
                    <Box key={item.plant._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">
                        {item.plant.name} x{item.quantity}
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'success.main' }}>
                        חינם
                      </Typography>
                    </Box>
                  ))}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6">סה"כ:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>חינם</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                    >
                      חזרה
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<WhatsAppIcon />}
                      onClick={handleWhatsAppOrder}
                    >
                      הזמן באמצעות וואטסאפ
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
        
        {/* Order Success Dialog */}
      <Dialog open={orderSuccess} onClose={handleCloseSuccessDialog}>
        <DialogTitle>
          ההזמנה נשלחה בהצלחה!
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ההזמנה שלך נשלחה בהצלחה. צוות המשתלה יצור איתך קשר בהקדם.
          </DialogContentText>
          {orderNumber && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                מספר הזמנה:
              </Typography>
              <Typography variant="h6" color="primary">
                {orderNumber}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                שמור את מספר ההזמנה לצורך מעקב
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} color="primary" autoFocus>
            סגור
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Layout>
  );
};

export default CartPage;
