import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalFlorist as PlantIcon
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentCategory, setCurrentCategory] = useState({
    name: '',
    description: ''
  });
  
  // Delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  // Category plants count
  const [categoryCounts, setCategoryCounts] = useState({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesRes = await axios.get('/api/categories');
        setCategories(categoriesRes.data);
        
        // Fetch plants to count by category
        const plantsRes = await axios.get('/api/plants');
        const plants = plantsRes.data;
        
        // Count plants by category
        const counts = {};
        plants.forEach(plant => {
          if (plant.category && plant.category._id) {
            counts[plant.category._id] = (counts[plant.category._id] || 0) + 1;
          }
        });
        
        setCategoryCounts(counts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('אירעה שגיאה בטעינת הנתונים');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleOpenDialog = (mode, category = null) => {
    setDialogMode(mode);
    if (category) {
      setCurrentCategory({
        ...category
      });
    } else {
      setCurrentCategory({
        name: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory({
      ...currentCategory,
      [name]: value
    });
  };
  
  const handleSubmit = async () => {
    try {
      if (dialogMode === 'add') {
        await axios.post('/api/categories', currentCategory);
      } else {
        await axios.put(`/api/categories/${currentCategory._id}`, currentCategory);
      }
      
      // Refresh categories list
      const res = await axios.get('/api/categories');
      setCategories(res.data);
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving category:', err);
      setError('אירעה שגיאה בשמירת הקטגוריה');
    }
  };
  
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialog(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/categories/${categoryToDelete._id}`);
      
      // Refresh categories list
      const res = await axios.get('/api/categories');
      setCategories(res.data);
      
      setDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('אירעה שגיאה במחיקת הקטגוריה');
    }
  };
  
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
          ניהול קטגוריות
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('add')}
          >
            קטגוריה חדשה
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {categories.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  אין קטגוריות להציג
                </Typography>
              </Paper>
            </Grid>
          ) : (
            categories.map(category => (
              <Grid item xs={12} sm={6} md={4} key={category._id}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {category.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PlantIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        צמחים: {categoryCounts[category._id] || 0}
                      </Typography>
                    </Box>
                    
                    {category.description && (
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog('edit', category)}
                    >
                      ערוך
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClick(category)}
                      disabled={categoryCounts[category._id] > 0}
                    >
                      מחק
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
      
      {/* Add/Edit Category Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogMode === 'add' ? 'הוספת קטגוריה חדשה' : 'עריכת קטגוריה'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="שם הקטגוריה"
            fullWidth
            value={currentCategory.name}
            onChange={handleInputChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="תיאור"
            fullWidth
            value={currentCategory.description || ''}
            onChange={handleInputChange}
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ביטול</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {dialogMode === 'add' ? 'הוסף' : 'שמור'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>מחיקת קטגוריה</DialogTitle>
        <DialogContent>
          {categoryCounts[categoryToDelete?._id] > 0 ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              לא ניתן למחוק קטגוריה שיש בה צמחים
            </Alert>
          ) : (
            <Typography>
              האם אתה בטוח שברצונך למחוק את הקטגוריה "{categoryToDelete?.name}"?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>ביטול</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={categoryCounts[categoryToDelete?._id] > 0}
          >
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCategories;
