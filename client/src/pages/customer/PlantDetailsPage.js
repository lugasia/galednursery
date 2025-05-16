import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Button, 
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  IconButton,
  TextField
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Opacity as WaterIcon,
  WbSunny as SunIcon,
  Height as HeightIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import Layout from '../../components/layout/Layout';
import { useCart } from '../../context/CartContext';
import api from '../../utils/api';

const PlantDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedPlants, setRelatedPlants] = useState([]);
  
  useEffect(() => {
    const fetchPlant = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/plants?id=${id}`);
        setPlant(res.data);
        
        // Fetch related plants from the same category
        if (res.data.category) {
          const relatedRes = await api.get(`/api/plants?category=${res.data.category._id}`);
          // Filter out the current plant, only include plants with stock, and limit to 4 plants
          const filtered = relatedRes.data
            .filter(p => p._id !== id && p.stock > 0)
            .slice(0, 4);
          setRelatedPlants(filtered);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching plant:', err);
        setError('אירעה שגיאה בטעינת פרטי הצמח. אנא נסה שוב מאוחר יותר.');
        setLoading(false);
      }
    };
    
    fetchPlant();
  }, [id]);
  
  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(plant.stock, quantity + value));
    setQuantity(newQuantity);
  };
  
  const handleAddToCart = () => {
    addToCart(plant, quantity);
  };
  
  const handleRelatedPlantClick = (plantId) => {
    navigate(`/plant/${plantId}`);
  };
  
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
  
  if (error || !plant) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ my: 4 }}>{error || 'הצמח לא נמצא'}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            חזרה
          </Button>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          חזרה
        </Button>
        
        <Grid container spacing={4}>
          {/* Plant Image */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <img 
                src={plant.imageBase64 || 'https://via.placeholder.com/600x400?text=צמח'} 
                alt={plant.name}
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  maxHeight: '500px',
                  objectFit: 'contain',
                  borderRadius: '4px'
                }}
                className="plant-detail-image"
              />
            </Paper>
          </Grid>
          
          {/* Plant Details */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {plant.name}
              </Typography>
              
              {plant.category && (
                <Chip 
                  label={plant.category.name} 
                  color="primary" 
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              )}
              
              <Divider sx={{ my: 2 }} />
              
              {plant.height && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <HeightIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    <strong>גובה:</strong> {plant.height}
                  </Typography>
                </Box>
              )}
              
              {plant.watering && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WaterIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    <strong>השקיה:</strong> {plant.watering}
                  </Typography>
                </Box>
              )}
              
              {plant.light && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SunIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body1">
                    <strong>אור:</strong> {plant.light}
                  </Typography>
                </Box>
              )}
              
              {plant.uses && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    <strong>שימושים:</strong> {plant.uses}
                  </Typography>
                </Box>
              )}
              
              {plant.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    <strong>תיאור:</strong> {plant.description}
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ mr: 2 }}>
                  מלאי: <span style={{ color: plant.stock > 0 ? '#2e7d32' : '#d32f2f' }}>
                    {plant.stock > 0 ? plant.stock : 'אזל מהמלאי'}
                  </span>
                </Typography>
              </Box>
              
              {plant.stock > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    כמות:
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    value={quantity}
                    inputProps={{ 
                      readOnly: true,
                      style: { textAlign: 'center' } 
                    }}
                    size="small"
                    sx={{ width: '60px', mx: 1 }}
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= plant.stock}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              )}
              
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={<CartIcon />}
                disabled={plant.stock <= 0}
                onClick={handleAddToCart}
                sx={{ py: 1.5 }}
              >
                {plant.stock > 0 ? 'הוסף לעגלה' : 'אזל מהמלאי'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Related Plants */}
        {relatedPlants.length > 0 && (
          <Box sx={{ mt: 6, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              צמחים דומים
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              {relatedPlants.map(relatedPlant => (
                <Grid item key={relatedPlant._id} xs={6} sm={6} md={3}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.03)' }
                    }}
                    onClick={() => handleRelatedPlantClick(relatedPlant._id)}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={relatedPlant.imageBase64 || 'https://via.placeholder.com/300x200?text=צמח'}
                      alt={relatedPlant.name}
                    />
                    <Box sx={{ p: 1.5 }}>
                      <Typography variant="body1" component="div" noWrap>
                        {relatedPlant.name}
                      </Typography>
                      {relatedPlant.stock > 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          מלאי: {relatedPlant.stock}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="error">
                          אזל מהמלאי
                        </Typography>
                      )}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Layout>
  );
};

export default PlantDetailsPage;
