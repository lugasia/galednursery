import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Paper,
  InputBase,
  IconButton,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Layout from '../../components/layout/Layout';
import PlantCard from '../../components/customer/PlantCard';
import api from '../../utils/api';

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState(null);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchCategoryAndPlants = async () => {
      try {
        setLoading(true);
        
        // Fetch category details
        const categoryRes = await api.get(`/api/categories?id=${id}`);
        setCategory(categoryRes.data);
        
        // Fetch plants in this category
        const plantsRes = await api.get(`/api/plants?category=${id}`);
        
        // Filter out plants with no stock
        const plantsWithStock = plantsRes.data.filter(plant => plant.stock > 0);
        setPlants(plantsWithStock);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('אירעה שגיאה בטעינת הנתונים. אנא נסה שוב מאוחר יותר.');
        setLoading(false);
      }
    };
    
    fetchCategoryAndPlants();
  }, [id]);
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const filteredPlants = plants.filter(plant => 
    (plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (plant.description && plant.description.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    plant.stock > 0
  );
  
  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }
  
  if (error || !category) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ my: 4 }}>{error || 'הקטגוריה לא נמצאה'}</Alert>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            aria-label="breadcrumb"
            sx={{ mb: 3 }}
          >
            <Link 
              underline="hover" 
              color="inherit" 
              onClick={() => navigate('/')}
              sx={{ cursor: 'pointer' }}
            >
              דף הבית
            </Link>
            <Typography color="text.primary">{category.name}</Typography>
          </Breadcrumbs>
          
          <Typography variant="h4" component="h1" gutterBottom>
            {category.name}
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
          
          {filteredPlants.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>לא נמצאו צמחים בקטגוריה זו</Alert>
          ) : (
            <Grid container spacing={2}>
              {filteredPlants.map(plant => (
                <Grid item key={plant._id} xs={12} sm={6} md={4} lg={3}>
                  <PlantCard plant={plant} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Layout>
  );
};

export default CategoryPage;
