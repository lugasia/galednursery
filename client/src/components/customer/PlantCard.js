import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  Box,
  Chip,
  CardActionArea
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { 
  Opacity as WaterIcon,
  WbSunny as SunIcon,
  Height as HeightIcon
} from '@mui/icons-material';

const PlantCard = ({ plant }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(plant);
  };
  
  const handleCardClick = () => {
    navigate(`/plant/${plant._id}`);
  };
  
  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s',
        position: 'relative',
        pb: 5, // Add padding at the bottom for the button
        overflow: 'hidden',
        '&:hover': {
          transform: 'scale(1.02)'
        }
      }}
    >
      <CardActionArea onClick={handleCardClick}>
        <CardMedia
          component="img"
          height="180"
          image={plant.imageBase64 || 'https://via.placeholder.com/300x200?text=צמח'}
          alt={plant.name}
          className="plant-card-image"
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Typography gutterBottom variant="subtitle1" component="h2" sx={{ fontWeight: 'bold', textAlign: 'right', fontSize: '1.1rem' }}>
            {plant.name}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
              {plant.category?.name || 'קטגוריה'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {plant.height && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <HeightIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', mt: 0.3, fontSize: '0.9rem' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  גובה: {plant.height}
                </Typography>
              </Box>
            )}
            
            {plant.watering && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <WaterIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', mt: 0.3, fontSize: '0.9rem' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  השקיה: {plant.watering}
                </Typography>
              </Box>
            )}
            
            {plant.light && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <SunIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', mt: 0.3, fontSize: '0.9rem' }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  אור: {plant.light}
                </Typography>
              </Box>
            )}
          </Box>
          
          {plant.uses && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                שימושים: {plant.uses}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
            <Typography variant="body2" color={'success.main'} sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
              מלאי: {plant.stock}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
      
      <Box sx={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        width: '100%' 
      }}>
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth
          onClick={handleAddToCart}
          className="add-to-cart-btn"
          sx={{ 
            borderRadius: 0,
            py: 1,
            fontWeight: 'normal',
            fontSize: '0.9rem',
            textTransform: 'none'
          }}
        >
          הוסף לעגלה
        </Button>
      </Box>
    </Card>
  );
};

export default PlantCard;
