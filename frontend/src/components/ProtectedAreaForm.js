import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Map from './Map';

const ProtectedAreaForm = ({ protectedArea, onSubmit }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      coordinates: [0, 0],
      address: {
        province: '',
        district: '',
        sector: '',
        cell: '',
      },
    },
    size: {
      value: '',
      unit: 'hectares',
    },
    establishedDate: '',
    type: '',
    status: 'active',
    biodiversity: {
      species: [],
      ecosystems: [],
    },
    management: {
      organization: user?.organization || '',
      contactPerson: {
        name: '',
        email: '',
        phone: '',
        position: '',
      },
    },
  });
  const [newSpecies, setNewSpecies] = useState({
    name: '',
    scientificName: '',
    category: 'fauna',
    conservationStatus: 'least_concern',
    description: '',
  });
  const [newEcosystem, setNewEcosystem] = useState({
    name: '',
    description: '',
    threats: [],
  });
  const [newThreat, setNewThreat] = useState('');
  const [errors, setErrors] = useState({});
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [mapZoom, setMapZoom] = useState(8);

  useEffect(() => {
    if (protectedArea) {
      setFormData({
        ...protectedArea,
        establishedDate: protectedArea.establishedDate.split('T')[0],
      });
      setMapCenter([
        protectedArea.location.coordinates[1],
        protectedArea.location.coordinates[0],
      ]);
    }
  }, [protectedArea]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        address: {
          ...prev.location.address,
          [name]: value,
        },
      },
    }));
  };

  const handleSizeChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      size: {
        ...prev.size,
        [name]: value,
      },
    }));
  };

  const handleContactPersonChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      management: {
        ...prev.management,
        contactPerson: {
          ...prev.management.contactPerson,
          [name]: value,
        },
      },
    }));
  };

  const handleMapClick = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [lng, lat],
      },
    }));
    setMapCenter([lat, lng]);
  };

  const handleAddSpecies = () => {
    if (newSpecies.name && newSpecies.scientificName) {
      setFormData((prev) => ({
        ...prev,
        biodiversity: {
          ...prev.biodiversity,
          species: [...prev.biodiversity.species, { ...newSpecies }],
        },
      }));
      setNewSpecies({
        name: '',
        scientificName: '',
        category: 'fauna',
        conservationStatus: 'least_concern',
        description: '',
      });
    }
  };

  const handleRemoveSpecies = (index) => {
    setFormData((prev) => ({
      ...prev,
      biodiversity: {
        ...prev.biodiversity,
        species: prev.biodiversity.species.filter((_, i) => i !== index),
      },
    }));
  };

  const handleAddEcosystem = () => {
    if (newEcosystem.name) {
      setFormData((prev) => ({
        ...prev,
        biodiversity: {
          ...prev.biodiversity,
          ecosystems: [...prev.biodiversity.ecosystems, { ...newEcosystem }],
        },
      }));
      setNewEcosystem({
        name: '',
        description: '',
        threats: [],
      });
    }
  };

  const handleRemoveEcosystem = (index) => {
    setFormData((prev) => ({
      ...prev,
      biodiversity: {
        ...prev.biodiversity,
        ecosystems: prev.biodiversity.ecosystems.filter((_, i) => i !== index),
      },
    }));
  };

  const handleAddThreat = () => {
    if (newThreat.trim()) {
      setNewEcosystem((prev) => ({
        ...prev,
        threats: [...prev.threats, newThreat.trim()],
      }));
      setNewThreat('');
    }
  };

  const handleRemoveThreat = (threat) => {
    setNewEcosystem((prev) => ({
      ...prev,
      threats: prev.threats.filter((t) => t !== threat),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.location.address.province) newErrors.province = 'Province is required';
    if (!formData.location.address.district) newErrors.district = 'District is required';
    if (!formData.size.value) newErrors.size = 'Size is required';
    if (!formData.establishedDate) newErrors.establishedDate = 'Established date is required';
    if (!formData.type) newErrors.type = 'Type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (protectedArea) {
        await api.put(`/protected-areas/${protectedArea._id}`, formData);
      } else {
        await api.post('/protected-areas', formData);
      }
      navigate('/protected-areas');
    } catch (error) {
      console.error('Error saving protected area:', error);
      setErrors(error.response?.data?.errors || {});
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Protected Area Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            multiline
            rows={4}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Province"
                  name="province"
                  value={formData.location.address.province}
                  onChange={handleLocationChange}
                  error={!!errors.province}
                  helperText={errors.province}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="District"
                  name="district"
                  value={formData.location.address.district}
                  onChange={handleLocationChange}
                  error={!!errors.district}
                  helperText={errors.district}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sector"
                  name="sector"
                  value={formData.location.address.sector}
                  onChange={handleLocationChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cell"
                  name="cell"
                  value={formData.location.address.cell}
                  onChange={handleLocationChange}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, height: 300 }}>
              <Map
                center={mapCenter}
                zoom={mapZoom}
                onMapClick={handleMapClick}
                markers={[
                  {
                    position: [
                      formData.location.coordinates[1],
                      formData.location.coordinates[0],
                    ],
                    title: formData.name,
                  },
                ]}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Size"
            name="value"
            type="number"
            value={formData.size.value}
            onChange={handleSizeChange}
            error={!!errors.size}
            helperText={errors.size}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Size Unit</InputLabel>
            <Select
              name="unit"
              value={formData.size.unit}
              onChange={handleSizeChange}
              label="Size Unit"
            >
              <MenuItem value="hectares">Hectares</MenuItem>
              <MenuItem value="square_km">Square Kilometers</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Established Date"
            name="establishedDate"
            type="date"
            value={formData.establishedDate}
            onChange={handleChange}
            error={!!errors.establishedDate}
            helperText={errors.establishedDate}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Type"
              error={!!errors.type}
              required
            >
              <MenuItem value="national_park">National Park</MenuItem>
              <MenuItem value="forest_reserve">Forest Reserve</MenuItem>
              <MenuItem value="wildlife_reserve">Wildlife Reserve</MenuItem>
              <MenuItem value="conservation_area">Conservation Area</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Contact Person
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.management.contactPerson.name}
                  onChange={handleContactPersonChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Position"
                  name="position"
                  value={formData.management.contactPerson.position}
                  onChange={handleContactPersonChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.management.contactPerson.email}
                  onChange={handleContactPersonChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.management.contactPerson.phone}
                  onChange={handleContactPersonChange}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Biodiversity
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Species
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Species Name"
                    value={newSpecies.name}
                    onChange={(e) =>
                      setNewSpecies((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Scientific Name"
                    value={newSpecies.scientificName}
                    onChange={(e) =>
                      setNewSpecies((prev) => ({ ...prev, scientificName: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={newSpecies.category}
                      onChange={(e) =>
                        setNewSpecies((prev) => ({ ...prev, category: e.target.value }))
                      }
                      label="Category"
                    >
                      <MenuItem value="flora">Flora</MenuItem>
                      <MenuItem value="fauna">Fauna</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Conservation Status</InputLabel>
                    <Select
                      value={newSpecies.conservationStatus}
                      onChange={(e) =>
                        setNewSpecies((prev) => ({
                          ...prev,
                          conservationStatus: e.target.value,
                        }))
                      }
                      label="Conservation Status"
                    >
                      <MenuItem value="least_concern">Least Concern</MenuItem>
                      <MenuItem value="near_threatened">Near Threatened</MenuItem>
                      <MenuItem value="vulnerable">Vulnerable</MenuItem>
                      <MenuItem value="endangered">Endangered</MenuItem>
                      <MenuItem value="critically_endangered">
                        Critically Endangered
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={newSpecies.description}
                    onChange={(e) =>
                      setNewSpecies((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddSpecies}
                    disabled={!newSpecies.name || !newSpecies.scientificName}
                  >
                    Add Species
                  </Button>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.biodiversity.species.map((species, index) => (
                  <Chip
                    key={index}
                    label={`${species.name} (${species.scientificName})`}
                    onDelete={() => handleRemoveSpecies(index)}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Ecosystems
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ecosystem Name"
                    value={newEcosystem.name}
                    onChange={(e) =>
                      setNewEcosystem((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={newEcosystem.description}
                    onChange={(e) =>
                      setNewEcosystem((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      label="Threat"
                      value={newThreat}
                      onChange={(e) => setNewThreat(e.target.value)}
                    />
                    <Button
                      variant="contained"
                      onClick={handleAddThreat}
                      disabled={!newThreat.trim()}
                    >
                      Add Threat
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {newEcosystem.threats.map((threat, index) => (
                      <Chip
                        key={index}
                        label={threat}
                        onDelete={() => handleRemoveThreat(threat)}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddEcosystem}
                    disabled={!newEcosystem.name}
                  >
                    Add Ecosystem
                  </Button>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.biodiversity.ecosystems.map((ecosystem, index) => (
                  <Chip
                    key={index}
                    label={ecosystem.name}
                    onDelete={() => handleRemoveEcosystem(index)}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/protected-areas')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {protectedArea ? 'Update Protected Area' : 'Create Protected Area'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProtectedAreaForm; 