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
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const ResearchProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
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
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/research-projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
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

      if (dialogType === 'finding') {
        await api.post(`/research-projects/${id}/findings`, formDataToSend);
      } else if (dialogType === 'document') {
        await api.post(`/research-projects/${id}/documents`, formDataToSend);
      }

      handleCloseDialog();
      fetchProject();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async (type, itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/research-projects/${id}/${type}/${itemId}`);
        fetchProject();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  if (loading) {
    return <Typography>Loading project details...</Typography>;
  }

  if (!project) {
    return <Typography>Project not found</Typography>;
  }

  const isLeadResearcher = user && project.leadResearcher._id === user._id;
  const isAdmin = user && user.role === 'admin';
  const canEdit = isLeadResearcher || isAdmin;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          {project.title}
        </Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/research-projects/${id}/edit`)}
          >
            Edit Project
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography paragraph>{project.description}</Typography>

            <Typography variant="h6" gutterBottom>
              Objectives
            </Typography>
            <List>
              {project.objectives.map((objective, index) => (
                <ListItem key={index}>
                  <ListItemText primary={objective} />
                </ListItem>
              ))}
            </List>

            <Typography variant="h6" gutterBottom>
              Methodology
            </Typography>
            <Typography paragraph>{project.methodology}</Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Findings" />
              <Tab label="Documents" />
              <Tab label="Team Members" />
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {activeTab === 0 && (
                <>
                  {canEdit && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog('finding')}
                      sx={{ mb: 2 }}
                    >
                      Add Finding
                    </Button>
                  )}
                  <List>
                    {project.findings.map((finding) => (
                      <ListItem
                        key={finding._id}
                        secondaryAction={
                          canEdit && (
                            <IconButton
                              edge="end"
                              onClick={() => handleDelete('findings', finding._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )
                        }
                      >
                        <ListItemText
                          primary={finding.title}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {finding.description}
                              </Typography>
                              <br />
                              <Typography component="span" variant="caption">
                                Added by {finding.addedBy.name} on{' '}
                                {new Date(finding.date).toLocaleDateString()}
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
                      onClick={() => handleOpenDialog('document')}
                      sx={{ mb: 2 }}
                    >
                      Add Document
                    </Button>
                  )}
                  <List>
                    {project.documents.map((doc) => (
                      <ListItem
                        key={doc._id}
                        secondaryAction={
                          canEdit && (
                            <IconButton
                              edge="end"
                              onClick={() => handleDelete('documents', doc._id)}
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
                          primary={doc.title}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                {doc.description}
                              </Typography>
                              <br />
                              <Typography component="span" variant="caption">
                                Uploaded by {doc.uploadedBy.name} on{' '}
                                {new Date(doc.uploadedAt).toLocaleDateString()}
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
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>{project.leadResearcher.name[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={project.leadResearcher.name}
                      secondary="Lead Researcher"
                    />
                  </ListItem>
                  {project.teamMembers.map((member) => (
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
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Project Details
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={project.status}
                color={
                  project.status === 'completed'
                    ? 'success'
                    : project.status === 'in-progress'
                    ? 'warning'
                    : 'default'
                }
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Location
              </Typography>
              <Typography>{project.location.name}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Timeline
              </Typography>
              <Typography>
                {new Date(project.startDate).toLocaleDateString()} -{' '}
                {new Date(project.endDate).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {project.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'finding' ? 'Add Finding' : 'Add Document'}
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

export default ResearchProjectDetails; 