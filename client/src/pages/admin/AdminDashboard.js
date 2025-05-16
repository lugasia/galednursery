import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  LocalFlorist as PlantIcon, 
  Category as CategoryIcon, 
  ShoppingCart as OrderIcon, 
  Inventory as InventoryIcon 
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, value, icon, color }) => (
  <Card elevation={3}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4">
          {value}
        </Typography>
      </Box>
      <Box sx={{ 
        bgcolor: `${color}.light`, 
        p: 2, 
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPlants: 0,
    totalCategories: 0,
    lowStockPlants: 0,
    outOfStockPlants: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch plants data
        const plantsRes = await axios.get('/api/plants');
        const plants = plantsRes.data;
        
        // Fetch categories data
        const categoriesRes = await axios.get('/api/categories');
        const categories = categoriesRes.data;
        
        // Fetch recent orders (placeholder for now)
        // In a real implementation, you would fetch from /api/orders
        const recentOrdersData = [];
        
        // Calculate statistics
        const lowStock = plants.filter(plant => plant.stock > 0 && plant.stock < 5).length;
        const outOfStock = plants.filter(plant => plant.stock === 0).length;
        
        setStats({
          totalPlants: plants.length,
          totalCategories: categories.length,
          lowStockPlants: lowStock,
          outOfStockPlants: outOfStock
        });
        
        setRecentOrders(recentOrdersData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('אירעה שגיאה בטעינת נתוני הדאשבורד');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          דאשבורד ניהול
        </Typography>
        <Typography variant="body1" gutterBottom>
          שלום {user?.name || 'מנהל'}, ברוכים הבאים למערכת הניהול של משתלת קיבוץ גלעד
        </Typography>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="סה״כ צמחים" 
            value={stats.totalPlants} 
            icon={<PlantIcon sx={{ color: 'primary.main', fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="קטגוריות" 
            value={stats.totalCategories} 
            icon={<CategoryIcon sx={{ color: 'secondary.main', fontSize: 40 }} />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="מלאי נמוך" 
            value={stats.lowStockPlants} 
            icon={<InventoryIcon sx={{ color: 'warning.main', fontSize: 40 }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="אזל מהמלאי" 
            value={stats.outOfStockPlants} 
            icon={<InventoryIcon sx={{ color: 'error.main', fontSize: 40 }} />}
            color="error"
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              צמחים במלאי נמוך
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {stats.lowStockPlants === 0 ? (
              <Typography variant="body1">אין צמחים במלאי נמוך</Typography>
            ) : (
              <Alert severity="warning" sx={{ mb: 2 }}>
                יש {stats.lowStockPlants} צמחים במלאי נמוך. בדוק את עמוד הצמחים לפרטים נוספים.
              </Alert>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              הזמנות אחרונות
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {recentOrders.length === 0 ? (
              <Typography variant="body1">אין הזמנות אחרונות</Typography>
            ) : (
              <List>
                {recentOrders.map(order => (
                  <ListItem key={order.id} divider>
                    <ListItemText
                      primary={`הזמנה #${order.id}`}
                      secondary={`${order.customerName} - ${order.date}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default AdminDashboard;
