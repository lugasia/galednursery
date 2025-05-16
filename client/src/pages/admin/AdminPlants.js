import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminPlants = () => {
  const [plants, setPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentPlant, setCurrentPlant] = useState({
    name: '',
    category: '',
    height: '',
    watering: '',
    light: '',
    uses: '',
    description: '',
    imageBase64: '',
    stock: 0
  });
  
  // Delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch plants
        const plantsRes = await axios.get('/api/plants');
        setPlants(plantsRes.data);
        
        // Fetch categories
        const categoriesRes = await axios.get('/api/categories');
        setCategories(categoriesRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('אירעה שגיאה בטעינת הנתונים');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleOpenDialog = (mode, plant = null) => {
    setDialogMode(mode);
    if (plant) {
      setCurrentPlant({
        ...plant,
        category: plant.category?._id || ''
      });
    } else {
      setCurrentPlant({
        name: '',
        category: '',
        height: '',
        watering: '',
        light: '',
        uses: '',
        description: '',
        imageBase64: '',
        stock: 0
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPlant({
      ...currentPlant,
      [name]: name === 'stock' ? parseInt(value) || 0 : value
    });
  };
  
  const handleSubmit = async () => {
    try {
      if (dialogMode === 'add') {
        await axios.post('/api/plants', currentPlant);
      } else {
        await axios.put(`/api/plants/${currentPlant._id}`, currentPlant);
      }
      
      // Refresh plants list
      const res = await axios.get('/api/plants');
      setPlants(res.data);
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving plant:', err);
      setError('אירעה שגיאה בשמירת הצמח');
    }
  };
  
  const handleDeleteClick = (plant) => {
    setPlantToDelete(plant);
    setDeleteDialog(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/plants/${plantToDelete._id}`);
      
      // Refresh plants list
      const res = await axios.get('/api/plants');
      setPlants(res.data);
      
      setDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting plant:', err);
      setError('אירעה שגיאה במחיקת הצמח');
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };
  
  const handleStockFilterChange = (e) => {
    setStockFilter(e.target.value);
  };
  
  const filteredPlants = plants.filter(plant => {
    // Search filter
    const matchesSearch = 
      plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plant.description && plant.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Category filter
    const matchesCategory = 
      selectedCategory === 'all' || 
      (plant.category && plant.category._id === selectedCategory);
    
    // Stock filter
    let matchesStock = true;
    if (stockFilter === 'inStock') {
      matchesStock = plant.stock > 0;
    } else if (stockFilter === 'outOfStock') {
      matchesStock = plant.stock === 0;
    } else if (stockFilter === 'lowStock') {
      matchesStock = plant.stock > 0 && plant.stock < 5;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });
  
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
          ניהול צמחים
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3, mt: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="חיפוש צמחים..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>קטגוריה</InputLabel>
              <Select
                value={selectedCategory}
                label="קטגוריה"
                onChange={handleCategoryChange}
              >
                <MenuItem value="all">כל הקטגוריות</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>מלאי</InputLabel>
              <Select
                value={stockFilter}
                label="מלאי"
                onChange={handleStockFilterChange}
              >
                <MenuItem value="all">כל הצמחים</MenuItem>
                <MenuItem value="inStock">במלאי</MenuItem>
                <MenuItem value="outOfStock">אזל מהמלאי</MenuItem>
                <MenuItem value="lowStock">מלאי נמוך</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('add')}
              fullWidth
            >
              צמח חדש
            </Button>
          </Grid>
        </Grid>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>תמונה</TableCell>
                  <TableCell>שם</TableCell>
                  <TableCell>קטגוריה</TableCell>
                  <TableCell>מלאי</TableCell>
                  <TableCell>פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      לא נמצאו צמחים התואמים את החיפוש
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlants.map(plant => (
                    <TableRow key={plant._id}>
                      <TableCell>
                        <Box
                          component="img"
                          src={plant.imageBase64 || 'https://via.placeholder.com/50x50?text=צמח'}
                          alt={plant.name}
                          sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>{plant.name}</TableCell>
                      <TableCell>
                        {plant.category ? (
                          <Chip label={plant.category.name} size="small" />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {plant.stock === 0 ? (
                          <Chip label="אזל מהמלאי" color="error" size="small" />
                        ) : plant.stock < 5 ? (
                          <Chip label={`${plant.stock} (נמוך)`} color="warning" size="small" />
                        ) : (
                          plant.stock
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="ערוך">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog('edit', plant)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="מחק">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(plant)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
      
      {/* Add/Edit Plant Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'הוספת צמח חדש' : 'עריכת צמח'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="שם הצמח"
                name="name"
                value={currentPlant.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>קטגוריה</InputLabel>
                <Select
                  name="category"
                  value={currentPlant.category}
                  label="קטגוריה"
                  onChange={handleInputChange}
                >
                  {categories.map(category => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="גובה"
                name="height"
                value={currentPlant.height}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="השקיה"
                name="watering"
                value={currentPlant.watering}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="אור"
                name="light"
                value={currentPlant.light}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="שימושים"
                name="uses"
                value={currentPlant.uses}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="תמונה (URL)"
                name="imageBase64"
                value={currentPlant.imageBase64}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="מלאי"
                name="stock"
                type="number"
                value={currentPlant.stock}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="תיאור"
                name="description"
                value={currentPlant.description}
                onChange={handleInputChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
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
        <DialogTitle>מחיקת צמח</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הצמח "{plantToDelete?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>ביטול</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPlants;
