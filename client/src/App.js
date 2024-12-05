import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Link,
  createTheme,
  ThemeProvider,
  CssBaseline,
  IconButton,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// Создаем темы
const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'dark' ? {
      // Темная тема
      primary: {
        main: '#9c27b0',
        light: '#ba68c8',
        dark: '#7b1fa2',
      },
      secondary: {
        main: '#ce93d8',
      },
      background: {
        default: '#1a1a1a',
        paper: '#2d2d2d',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b0b0b0',
      },
    } : {
      // Светлая тема
      primary: {
        main: '#9c27b0',
        light: '#ba68c8',
        dark: '#7b1fa2',
      },
      secondary: {
        main: '#7b1fa2',
      },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff',
      },
      text: {
        primary: '#2d2d2d',
        secondary: '#666666',
      },
    }),
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: mode === 'dark' 
            ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            : '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
          background: mode === 'dark'
            ? 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
          backdropFilter: 'blur(4px)',
          border: mode === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.18)'
            : '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiAnswer, setAiAnswer] = useState(null);
  const [generateAiAnswer, setGenerateAiAnswer] = useState(true);
  const [mode, setMode] = useState('dark');

  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log('Search form submitted');
    
    if (!searchQuery.trim()) {
      setError('Пожалуйста, введите поисковый запрос');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults([]);
    setAiAnswer(null);

    try {
      const searchOptions = {
        generateAnswer: generateAiAnswer
      };
      
      console.log('Sending search request to server:', { query: searchQuery, options: searchOptions });
      
      const response = await fetch('https://search-ai-l3g1.vercel.app/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          options: searchOptions
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Search results received:', data);
      
      if (data.results) {
        setSearchResults(data.results);
      }
      
      if (data.aiAnswer) {
        setAiAnswer(data.aiAnswer);
      }
      
    } catch (error) {
      console.log('Search error details:', error);
      setError('Не удалось выполнить поиск. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
      console.log('Search completed');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ py: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Tooltip title={`Переключить на ${mode === 'dark' ? 'светлую' : 'темную'} тему`}>
              <IconButton onClick={toggleTheme} color="primary" sx={{ ml: 1 }}>
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
          </Box>

          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              mb: 4,
              background: 'linear-gradient(45deg, #ce93d8 30%, #9c27b0 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}
          >
            Поиск на базе искусственного интеллекта
          </Typography>
          
          <Paper 
            component="form" 
            onSubmit={handleSearch} 
            sx={{ 
              p: 3, 
              mb: 4,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(145deg, #2d2d2d 0%, #1a1a1a 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
              borderRadius: '20px',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                : '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
              backdropFilter: 'blur(4px)',
              border: theme.palette.mode === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.18)'
                : '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={9}>
                <TextField
                  fullWidth
                  label="Поисковый запрос"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ 
                    height: '56px',
                    background: 'linear-gradient(45deg, #9c27b0 30%, #ce93d8 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #7b1fa2 30%, #ba68c8 90%)',
                    }
                  }}
                  startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SearchIcon />}
                >
                  {loading ? 'Поиск...' : 'Найти'}
                </Button>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={generateAiAnswer}
                      onChange={(e) => setGenerateAiAnswer(e.target.checked)}
                      color="secondary"
                    />
                  }
                  label="Сгенерировать ответ ИИ"
                />
              </Grid>
            </Grid>
          </Paper>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: '12px',
                '& .MuiAlert-icon': {
                  color: '#f44336'
                }
              }}
            >
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={aiAnswer ? 6 : 12}>
              {searchResults.length > 0 && (
                <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 3 }}>
                  Результаты поиска
                </Typography>
              )}
              {searchResults.map((result, index) => (
                <Card key={index} sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" component="div" sx={{ color: theme.palette.primary.main, mb: 1 }}>
                      {result.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <Link 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        sx={{ 
                          color: theme.palette.primary.main,
                          '&:hover': {
                            color: theme.palette.primary.light
                          }
                        }}
                      >
                        {result.url}
                      </Link>
                    </Typography>
                    <Typography variant="body1" color="text.primary">
                      {result.content}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Grid>

            {aiAnswer && (
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 3 }}>
                  Ответ искусственного интеллекта
                </Typography>
                <Card>
                  <CardContent>
                    <Typography variant="body1" paragraph>
                      {aiAnswer.answer}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      Сгенерировано с помощью {aiAnswer.model}
                    </Typography>
                    {aiAnswer.sources && aiAnswer.sources.length > 0 && (
                      <>
                        <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, color: theme.palette.primary.main }}>
                          Источники:
                        </Typography>
                        <List dense>
                          {aiAnswer.sources.map((source, index) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={source.title}
                                secondary={
                                  <Link 
                                    href={source.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    sx={{ 
                                      color: theme.palette.primary.main,
                                      '&:hover': {
                                        color: theme.palette.primary.light
                                      }
                                    }}
                                  >
                                    {source.url}
                                  </Link>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
