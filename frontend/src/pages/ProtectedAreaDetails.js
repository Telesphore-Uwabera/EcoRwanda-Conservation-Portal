import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import Map from '../components/Map';

const ProtectedAreaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [protectedArea, setProtectedArea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
  });

  useEffect(() => {
    fetchProtectedArea();
  }, [id]);

  const fetchProtectedArea = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/protected-areas/${id}`);
      setProtectedArea(response.data);
    } catch (error) {
      console.error('Error fetching protected area:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setFormData({
      title: '',
      description: '',
      file: null,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      title: '',
      description: '',
      file: null,
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      file: e.target.files[0],
    }));
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      if (dialogType === 'activity') {
        await api.post(`/protected-areas/${id}/activities`, formDataToSend);
      } else if (dialogType === 'threat') {
        await api.post(`/protected-areas/${id}/threats`, formDataToSend);
      } else if (dialogType === 'monitoring') {
        await api.post(`/protected-areas/${id}/monitoring`, formDataToSend);
      }

      handleCloseDialog();
      fetchProtectedArea();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async (type, itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/protected-areas/${id}/${type}/${itemId}`);
        fetchProtectedArea();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  if (loading) {
    return <Typography>Loading protected area details...</Typography>;
  }

  if (!protectedArea) {
    return <Typography>Protected area not found</Typography>;
  }

  const isManagingOrg = user && protectedArea.management.organization._id === user.organization;
  const isAdmin = user && user.role === 'admin';
  const canEdit = isManagingOrg || isAdmin;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          {protectedArea.name}
        </Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/protected-areas/${id}/edit`)}
          >
            Edit Protected Area
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography paragraph>{protectedArea.description}</Typography>

            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
            <Box sx={{ height: 400, mb: 2 }}>
              <Map
                center={[
                  protectedArea.location.coordinates[1],
                  protectedArea.location.coordinates[0],
                ]}
                zoom={12}
                markers={[
                  {
                    position: [
                      protectedArea.location.coordinates[1],
                      protectedArea.location.coordinates[0],
                    ],
                    title: protectedArea.name,
                  },
                ]}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {protectedArea.location.address.district}, {protectedArea.location.address.province}
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Biodiversity" />
              <Tab label="Activities" />
              <Tab label="Threats" />
              <Tab label="Monitoring" />
              <Tab label="Resources" />
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {activeTab === 0 && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Species
                  </Typography>
                  <List>
                    {protectedArea.biodiversity.species.map((species, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`${species.name} (${species.scientificName})`}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                Category: {species.category}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2">
                                Conservation Status: {species.conservationStatus.replace('_', ' ')}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2">
                                {species.description}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Ecosystems
                  </Typography>
                  <List>
                    {protectedArea.biodiversity.ecosystems.map((ecosystem, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={ecosystem.name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {ecosystem.description}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2">
                                Threats: {ecosystem.threats.join(', ')}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {activeTab === 1 && (
                <>
                  {canEdit && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog('activity')}
                      sx={{ mb: 2 }}
                    >
                      Add Activity
                    </Button>
                  )}
                  <List>
                    {protectedArea.activities.map((activity) => (
                      <ListItem
                        key={activity._id}
                        secondaryAction={
                          canEdit && (
                            <IconButton
                              edge="end"
                              onClick={() => handleDelete('activities', activity._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )
                        }
                      >
                        <ListItemText
                          primary={activity.name}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                Type: {activity.type.replace('_', ' ')}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2">
                                {activity.description}
                              </Typography>
                              <br />
                              <Typography component="span" variant="caption">
                                Status: {activity.status}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {activeTab === 2 && (
                <>
                  {canEdit && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog('threat')}
                      sx={{ mb: 2 }}
                    >
                      Add Threat
                    </Button>
                  )}
                  <List>
                    {protectedArea.threats.map((threat) => (
                      <ListItem
                        key={threat._id}
                        secondaryAction={
                          canEdit && (
                            <IconButton
                              edge="end"
                              onClick={() => handleDelete('threats', threat._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )
                        }
                      >
                        <ListItemText
                          primary={threat.type.replace('_', ' ')}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {threat.description}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2">
                                Severity: {threat.severity}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2">
                                Mitigation Measures: {threat.mitigationMeasures.join(', ')}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {activeTab === 3 && (
                <>
                  {canEdit && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog('monitoring')}
                      sx={{ mb: 2 }}
                    >
                      Add Monitoring Data
                    </Button>
                  )}
                  <List>
                    {protectedArea.monitoring.map((data) => (
                      <ListItem
                        key={data._id}
                        secondaryAction={
                          canEdit && (
                            <IconButton
                              edge="end"
                              onClick={() => handleDelete('monitoring', data._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )
                        }
                      >
                        <ListItemText
                          primary={data.type.replace('_', ' ')}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                Date: {new Date(data.date).toLocaleDateString()}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2">
                                {data.notes}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {activeTab === 4 && (
                <>
                  {canEdit && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog('resource')}
                      sx={{ mb: 2 }}
                    >
                      Add Resource
                    </Button>
                  )}
                  <List>
                    {protectedArea.resources.map((resource) => (
                      <ListItem
                        key={resource._id}
                        secondaryAction={
                          canEdit && (
                            <IconButton
                              edge="end"
                              onClick={() => handleDelete('resources', resource._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )
                        }
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <AttachFileIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={resource.title}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                Type: {resource.type.replace('_', ' ')}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2">
                                {resource.description}
                              </Typography>
                              <br />
                              <Typography component="span" variant="caption">
                                Uploaded by {resource.uploadedBy.name} on{' '}
                                {new Date(resource.uploadedAt).toLocaleDateString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Protected Area Details
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Type
              </Typography>
              <Chip
                label={protectedArea.type.replace('_', ' ')}
                color="primary"
                sx={{ mt: 1 }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={protectedArea.status.replace('_', ' ')}
                color={
                  protectedArea.status === 'active'
                    ? 'success'
                    : protectedArea.status === 'proposed'
                    ? 'info'
                    : 'default'
                }
                sx={{ mt: 1 }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Size
              </Typography>
              <Typography>
                {protectedArea.size.value} {protectedArea.size.unit}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Established Date
              </Typography>
              <Typography>
                {new Date(protectedArea.establishedDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Management
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Organization
              </Typography>
              <Typography>{protectedArea.management.organization.name}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Contact Person
              </Typography>
              <Typography>{protectedArea.management.contactPerson.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {protectedArea.management.contactPerson.position}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {protectedArea.management.contactPerson.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {protectedArea.management.contactPerson.phone}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Staff Members
              </Typography>
              <List>
                {protectedArea.management.staff.map((member) => (
                  <ListItem key={member._id}>
                    <ListItemAvatar>
                      <Avatar>{member.user.name[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.user.name}
                      secondary={member.role}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'activity'
            ? 'Add Activity'
            : dialogType === 'threat'
            ? 'Add Threat'
            : dialogType === 'monitoring'
            ? 'Add Monitoring Data'
            : 'Add Resource'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AttachFileIcon />}
              >
                Upload File
              </Button>
            </label>
            {formData.file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {formData.file.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProtectedAreaDetails; 