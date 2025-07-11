import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem,
  Chip,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const ResearchProjectForm = ({ project, onSubmit }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectives: [],
    methodology: '',
    location: {
      lat: '',
      lng: '',
      name: '',
    },
    startDate: '',
    endDate: '',
    status: 'planning',
    tags: [],
  });
  const [newObjective, setNewObjective] = useState('');
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        startDate: project.startDate.split('T')[0],
        endDate: project.endDate.split('T')[0],
      });
    }
  }, [project]);

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
        [name]: value,
      },
    }));
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setFormData((prev) => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()],
      }));
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (formData.objectives.length === 0) newErrors.objectives = 'At least one objective is required';
    if (!formData.methodology) newErrors.methodology = 'Methodology is required';
    if (!formData.location.name) newErrors.location = 'Location name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Prepare payload to match backend requirements
    const payload = {
      title: formData.title,
      description: formData.description,
      objectives: formData.objectives,
      methodology: formData.methodology,
      location: {
        name: formData.location.name,
        lat: formData.location.lat !== '' ? Number(formData.location.lat) : undefined,
        lng: formData.location.lng !== '' ? Number(formData.location.lng) : undefined,
      },
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status || 'planning',
      tags: formData.tags || [],
      leadResearcher: user?._id,
    };

    try {
      if (project) {
        await api.put(`/research-projects/${project._id}`, payload);
      } else {
        await api.post('/research-projects', payload);
      }
      navigate('/research-projects');
    } catch (error) {
      console.error('Error saving project:', error);
      setErrors(error.response?.data?.errors || {});
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Project Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
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
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Objectives
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="New Objective"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                error={!!errors.objectives}
                helperText={errors.objectives}
              />
              <Button
                variant="contained"
                onClick={handleAddObjective}
                disabled={!newObjective.trim()}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.objectives.map((objective, index) => (
                <Chip
                  key={index}
                  label={objective}
                  onDelete={() => handleRemoveObjective(index)}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Methodology"
            name="methodology"
            value={formData.methodology}
            onChange={handleChange}
            error={!!errors.methodology}
            helperText={errors.methodology}
            multiline
            rows={3}
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Location Name"
            name="name"
            value={formData.location.name}
            onChange={handleLocationChange}
            error={!!errors.location}
            helperText={errors.location}
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Latitude"
            name="lat"
            type="number"
            value={formData.location.lat}
            onChange={handleLocationChange}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Longitude"
            name="lng"
            type="number"
            value={formData.location.lng}
            onChange={handleLocationChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Start Date"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            error={!!errors.startDate}
            helperText={errors.startDate}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="End Date"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            error={!!errors.endDate}
            helperText={errors.endDate}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="planning">Planning</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="on-hold">On Hold</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="New Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/research-projects')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {project ? 'Update Project' : 'Create Project'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ResearchProjectForm; 