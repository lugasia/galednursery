import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import AdminLayout from '../../components/admin/AdminLayout';

// Order status options
const ORDER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Status display components
const StatusChip = ({ status }) => {
  const statusProps = {
    [ORDER_STATUS.PENDING]: { color: 'warning', label: 'בהמתנה' },
    [ORDER_STATUS.APPROVED]: { color: 'info', label: 'אושר' },
    [ORDER_STATUS.SHIPPED]: { color: 'primary', label: 'נשלח' },
    [ORDER_STATUS.COMPLETED]: { color: 'success', label: 'הושלם' },
    [ORDER_STATUS.CANCELLED]: { color: 'error', label: 'בוטל' }
  };
  
  const { color, label } = statusProps[status] || statusProps[ORDER_STATUS.PENDING];
  
  return <Chip color={color} label={label} size="small" />;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Order detail dialog
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  
  // Status change dialog
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [processingStatus, setProcessingStatus] = useState(false);
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch orders from the backend API
      const response = await axios.get('/api/orders');
      const ordersData = response.data;
      
      // Process orders to add totalItems count
      const processedOrders = ordersData.map(order => ({
        ...order,
        totalItems: order.items.reduce((total, item) => total + item.quantity, 0)
      }));
      
      setOrders(processedOrders);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('אירעה שגיאה בטעינת ההזמנות');
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOpenOrderDialog(true);
  };
  
  const handleCloseOrderDialog = () => {
    setOpenOrderDialog(false);
  };
  
  const handleStatusChange = (order, status) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setStatusDialog(true);
  };
  
  const handleConfirmStatusChange = async () => {
    try {
      setProcessingStatus(true);
      
      // Call the API to update the order status
      await axios.patch(`/api/orders/${selectedOrder._id}/status`, { status: newStatus });
      
      // Refresh the orders list to get the updated data
      await fetchOrders();
      
      setStatusDialog(false);
      setProcessingStatus(false);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('אירעה שגיאה בעדכון סטטוס ההזמנה');
      setProcessingStatus(false);
    }
  };
  
  const getFilteredOrders = () => {
    switch (tabValue) {
      case 0: // All orders
        return orders;
      case 1: // Pending
        return orders.filter(order => order.status === ORDER_STATUS.PENDING);
      case 2: // Approved
        return orders.filter(order => order.status === ORDER_STATUS.APPROVED);
      case 3: // Completed
        return orders.filter(order => order.status === ORDER_STATUS.COMPLETED);
      case 4: // Cancelled
        return orders.filter(order => order.status === ORDER_STATUS.CANCELLED);
      default:
        return orders;
    }
  };
  
  const filteredOrders = getFilteredOrders();
  
  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ניהול הזמנות
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="כל ההזמנות" />
            <Tab label="בהמתנה" />
            <Tab label="אושרו" />
            <Tab label="הושלמו" />
            <Tab label="בוטלו" />
          </Tabs>
        </Paper>
        
        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>מספר הזמנה</TableCell>
                  <TableCell>לקוח</TableCell>
                  <TableCell>תאריך</TableCell>
                  <TableCell>פריטים</TableCell>
                  <TableCell>סטטוס</TableCell>
                  <TableCell>פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      לא נמצאו הזמנות
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map(order => (
                    <TableRow key={order._id}>
                      <TableCell>
                        {order.orderNumber || 'ללא מספר'}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                      <TableCell>{order.totalItems}</TableCell>
                      <TableCell>
                        <StatusChip status={order.status} />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="צפה בהזמנה">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewOrder(order)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {order.status === ORDER_STATUS.PENDING && (
                          <Tooltip title="אשר הזמנה">
                            <IconButton
                              color="success"
                              onClick={() => handleStatusChange(order, ORDER_STATUS.APPROVED)}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {order.status === ORDER_STATUS.APPROVED && (
                          <Tooltip title="סמן כנשלח">
                            <IconButton
                              color="info"
                              onClick={() => handleStatusChange(order, ORDER_STATUS.SHIPPED)}
                            >
                              <ShippingIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {order.status === ORDER_STATUS.SHIPPED && (
                          <Tooltip title="סמן כהושלם">
                            <IconButton
                              color="success"
                              onClick={() => handleStatusChange(order, ORDER_STATUS.COMPLETED)}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {(order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.APPROVED) && (
                          <Tooltip title="בטל הזמנה">
                            <IconButton
                              color="error"
                              onClick={() => handleStatusChange(order, ORDER_STATUS.CANCELLED)}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
      
      {/* Order Detail Dialog */}
      <Dialog open={openOrderDialog} onClose={handleCloseOrderDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          פרטי הזמנה {selectedOrder?.orderNumber}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  פרטי לקוח
                </Typography>
                <Typography variant="body1">שם: {selectedOrder.customerName}</Typography>
                <Typography variant="body1">טלפון: {selectedOrder.customerPhone}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  פרטי הזמנה
                </Typography>
                <Typography variant="body1">תאריך: {format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy HH:mm')}</Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  סטטוס: <Box sx={{ ml: 1 }}><StatusChip status={selectedOrder.status} /></Box>
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, mt: 2 }}>
                  פריטים
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  {selectedOrder.items.map((item, index) => (
                    <ListItem key={index} divider={index < selectedOrder.items.length - 1}>
                      <ListItemText
                        primary={item.plant.name}
                        secondary={`כמות: ${item.quantity}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDialog}>סגור</Button>
          
          {selectedOrder && selectedOrder.status === ORDER_STATUS.PENDING && (
            <Button 
              variant="contained" 
              color="success" 
              onClick={() => {
                handleCloseOrderDialog();
                handleStatusChange(selectedOrder, ORDER_STATUS.APPROVED);
              }}
            >
              אשר הזמנה
            </Button>
          )}
          
          {selectedOrder && selectedOrder.status === ORDER_STATUS.APPROVED && (
            <Button 
              variant="contained" 
              color="info" 
              onClick={() => {
                handleCloseOrderDialog();
                handleStatusChange(selectedOrder, ORDER_STATUS.SHIPPED);
              }}
            >
              סמן כנשלח
            </Button>
          )}
          
          {selectedOrder && (selectedOrder.status === ORDER_STATUS.PENDING || selectedOrder.status === ORDER_STATUS.APPROVED) && (
            <Button 
              variant="contained" 
              color="error" 
              onClick={() => {
                handleCloseOrderDialog();
                handleStatusChange(selectedOrder, ORDER_STATUS.CANCELLED);
              }}
            >
              בטל הזמנה
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Status Change Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)}>
        <DialogTitle>שינוי סטטוס הזמנה</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {newStatus === ORDER_STATUS.APPROVED && 'האם אתה בטוח שברצונך לאשר את ההזמנה? המלאי יופחת בהתאם.'}
            {newStatus === ORDER_STATUS.SHIPPED && 'האם אתה בטוח שברצונך לסמן את ההזמנה כנשלחה?'}
            {newStatus === ORDER_STATUS.COMPLETED && 'האם אתה בטוח שברצונך לסמן את ההזמנה כהושלמה?'}
            {newStatus === ORDER_STATUS.CANCELLED && 'האם אתה בטוח שברצונך לבטל את ההזמנה? המלאי יוחזר למלאי הזמין.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>ביטול</Button>
          <Button 
            onClick={handleConfirmStatusChange} 
            variant="contained" 
            color={newStatus === ORDER_STATUS.CANCELLED ? 'error' : 'primary'}
            disabled={processingStatus}
          >
            {processingStatus ? 'מעבד...' : 'אישור'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
