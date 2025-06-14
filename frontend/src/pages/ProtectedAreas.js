import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  LocationOn as LocationIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Map from '../components/Map';

const ProtectedAreas = () => {
  const [protectedAreas, setProtectedAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showMap, setShowMap] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchProtectedAreas();
  }, [search, typeFilter, statusFilter]);

  const fetchProtectedAreas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await api.get(`/protected-areas?${params.toString()}`);
      setProtectedAreas(response.data);
    } catch (error) {
      console.error('Error fetching protected areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      national_park: 'success',
      forest_reserve: 'info',
      wildlife_reserve: 'warning',
      conservation_area: 'primary',
      other: 'default',
    };
    return colors[type] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      proposed: 'info',
      under_review: 'warning',
      inactive: 'error',
    };
    return colors[status] || 'default';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleMapClick = (area) => {
    setSelectedArea(area);
    setShowMap(true);
  };

  const handleCloseMap = () => {
    setShowMap(false);
    setSelectedArea(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Protected Areas
        </Typography>
        {user && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/protected-areas/new')}
          >
            New Protected Area
          </Button>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search protected areas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              variant="outlined"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              InputProps={{
                startAdornment: <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="national_park">National Park</MenuItem>
              <MenuItem value="forest_reserve">Forest Reserve</MenuItem>
              <MenuItem value="wildlife_reserve">Wildlife Reserve</MenuItem>
              <MenuItem value="conservation_area">Conservation Area</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              variant="outlined"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="proposed">Proposed</MenuItem>
              <MenuItem value="under_review">Under Review</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {loading ? (
        <Typography>Loading protected areas...</Typography>
      ) : (
        <Grid container spacing={3}>
          {protectedAreas.map((area) => (
            <Grid item xs={12} md={6} lg={4} key={area._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="h2" noWrap>
                      {area.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={area.type.replace('_', ' ')}
                        color={getTypeColor(area.type)}
                        size="small"
                      />
                      <Chip
                        label={area.status.replace('_', ' ')}
                        color={getStatusColor(area.status)}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {area.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Established: {formatDate(area.establishedDate)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Size: {area.size.value} {area.size.unit}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Location:
                    </Typography>
                    <Typography variant="body2">
                      {area.location.address.district}, {area.location.address.province}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/protected-areas/${area._id}`)}
                  >
                    View Details
                  </Button>
                  {user && (
                    <Button
                      size="small"
                      startIcon={<MapIcon />}
                      onClick={() => handleMapClick(area)}
                    >
                      View on Map
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={showMap}
        onClose={handleCloseMap}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedArea?.name} - Location
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 500, width: '100%' }}>
            <Map
              center={[
                selectedArea?.location.coordinates[1],
                selectedArea?.location.coordinates[0],
              ]}
              zoom={12}
              markers={[
                {
                  position: [
                    selectedArea?.location.coordinates[1],
                    selectedArea?.location.coordinates[0],
                  ],
                  title: selectedArea?.name,
                },
              ]}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMap}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProtectedAreas; 