import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Badge,
  Container,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Home as HomeIcon,
  ShoppingCart as CartIcon,
  Menu as MenuIcon,
  Category as CategoryIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import api from '../../utils/api';

const Navbar = () => {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const navbarRef = useRef(null);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories from:', api.defaults.baseURL + '/api/categories');
        const res = await api.get('/api/categories');
        console.log('Categories response:', res);
        // Ensure we have an array of categories
        if (res.data && Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          console.error('Categories data is not an array:', res.data);
          setCategories([]); // Set empty array as fallback
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategories([]); // Set empty array on error
      }
    };
    
    fetchCategories();
    
    // Add scroll event listener for sticky navbar
    const handleScroll = () => {
      if (navbarRef.current) {
        const navbarHeight = navbarRef.current.offsetHeight;
        setIsSticky(window.scrollY > navbarHeight);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  return (
    <>
      <AppBar 
        position={isSticky ? "fixed" : "static"} 
        color="primary"
        ref={navbarRef}
        elevation={isSticky ? 4 : 1}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography 
              variant="h6" 
              component={RouterLink} 
              to="/"
              sx={{ 
                flexGrow: 1, 
                textDecoration: 'none', 
                color: 'inherit',
                fontWeight: 'bold'
              }}
            >
              משתלת קיבוץ גלעד
            </Typography>
            
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/"
                startIcon={<HomeIcon />}
              >
                דף הבית
              </Button>
            </Box>
            
            <IconButton 
              color="inherit" 
              aria-label="cart"
              onClick={() => navigate('/cart')}
            >
              <Badge badgeContent={totalItems} color="secondary">
                <CartIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Add a placeholder when navbar is fixed to prevent content jump */}
      {isSticky && (
        <Box sx={{ height: navbarRef.current ? navbarRef.current.offsetHeight : 64 }} />
      )}
      
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
            <Typography variant="h6">תפריט</Typography>
            <IconButton onClick={toggleDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <List>
            <ListItem button component={RouterLink} to="/">
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="דף הבית" />
            </ListItem>
            
            <Divider />
            <ListItem>
              <ListItemIcon>
                <CategoryIcon />
              </ListItemIcon>
              <ListItemText primary="קטגוריות" />
            </ListItem>
            
            {categories.map(category => (
              <ListItem 
                button 
                key={category._id}
                component={RouterLink} 
                to={`/category/${category._id}`}
                sx={{ pl: 4 }}
              >
                <ListItemText primary={category.name} />
              </ListItem>
            ))}
            
            <Divider />
            <ListItem button component={RouterLink} to="/cart">
              <ListItemIcon>
                <Badge badgeContent={totalItems} color="secondary">
                  <CartIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="עגלת קניות" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
