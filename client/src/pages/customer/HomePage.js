import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  CircularProgress,
  Paper,
  InputBase,
  IconButton,
  Divider,
  Alert,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Layout from '../../components/layout/Layout';
import PlantCard from '../../components/customer/PlantCard';
import api from '../../utils/api';

const HomePage = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesWithCount, setCategoriesWithCount] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all plants and categories from API
        const plantsRes = await api.get('/api/plants');
        const categoriesRes = await api.get('/api/categories');
        const plantsData = plantsRes.data;
        const categoriesData = categoriesRes.data;
        if (!Array.isArray(plantsData) || !Array.isArray(categoriesData)) {
          setError('פורמט הנתונים שגוי');
          setLoading(false);
          return;
        }
        // Filter out plants with no stock
        const plantsWithStock = plantsData.filter(plant => plant && plant.stock > 0);
        setPlants(plantsWithStock);
        // Calculate plant count per category
        const categoryCounts = {};
        plantsWithStock.forEach(plant => {
          if (plant.category) {
            categoryCounts[plant.category] = (categoryCounts[plant.category] || 0) + 1;
          }
        });
        // Filter categories with at least one plant
        const categoriesWithPlants = categoriesData
          .filter(category => categoryCounts[category.id])
          .map(category => ({
            ...category,
            count: categoryCounts[category.id] || 0
          }));
        setCategoriesWithCount(categoriesWithPlants);
        setLoading(false);
      } catch (err) {
        setError('אירעה שגיאה בטעינת הנתונים. אנא נסה שוב מאוחר יותר.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const filteredPlants = plants.filter(plant => {
    // Filter by category
    const categoryMatch = selectedCategory === 'all' || 
      (plant.category && plant.category._id === selectedCategory);
    
    // Filter by search term
    const searchMatch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plant.description && plant.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Only include plants with stock
    return categoryMatch && searchMatch && plant.stock > 0;
  });
  
  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            משתלת קיבוץ גלעד
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
          מגוון רחב של צמחים לבית ולגינה, הכל באהבה מהקהילה.
          </Typography>
          
          {/* Search Bar */}
          <Paper
            component="form"
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: { xs: '100%', sm: '70%', md: '50%' }, mx: 'auto', mb: 4 }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="חיפוש צמחים..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
          
          {/* Category Buttons */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 4 }}>
            <Button
              variant={selectedCategory === 'all' ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => handleCategoryChange(null, 'all')}
              sx={{ m: 0.5, borderRadius: '20px', px: 2 }}
            >
              הכל ({plants.length})
            </Button>
            
            {categoriesWithCount.map(category => (
              <Button
                key={category._id}
                variant={selectedCategory === category._id ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => handleCategoryChange(null, category._id)}
                sx={{ m: 0.5, borderRadius: '20px', px: 2 }}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : filteredPlants.length === 0 ? (
          <Alert severity="info" sx={{ my: 2 }}>לא נמצאו צמחים התואמים את החיפוש</Alert>
        ) : (
          <Grid container spacing={2}>
          {filteredPlants.map(plant => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={plant._id}>
              <PlantCard plant={plant} />
            </Grid>
          ))}
          </Grid>
        )}
      </Container>
    </Layout>
  );
};

export default HomePage;
