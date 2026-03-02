import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import { SEARCH_GAMES } from '../../graphql/queries';

const GameSearch = () => {
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [imageErrors, setImageErrors] = useState({});

    const [searchGames, { loading, error, data }] = useLazyQuery(SEARCH_GAMES);

    // Unified image function - same as GameList and GameDetails
    const getGameImage = (game) => {
        // 1. Use database cover image if available and not default
        if (game.coverImage && game.coverImage !== 'default-game.jpg') {
            // Use full URL if it's already an external link
            if (game.coverImage.startsWith('http')) {
                return game.coverImage;
            }
            // Get image from local server
            return `http://localhost:4000${game.coverImage}`;
        }

        // 2. Map game titles to local images
        const titleToImage = {
            'The Last of Us Part II': '/images/games/last-of-us.jpg',
            'Cyberpunk 2077': '/images/games/cyberpunk.jpg',
            'FIFA 24': '/images/games/fifa24.jpg',
            'Zelda: Tears of the Kingdom': '/images/games/zelda.jpg',
            'Starfield': '/images/games/starfield.jpg',
            'God of War Ragnarök': '/images/games/god-of-war.jpg',
            'Elden Ring': '/images/games/elden-ring.jpg',
            'Minecraft': '/images/games/minecraft.jpg'
        };

        if (titleToImage[game.title]) {
            return `http://localhost:4000${titleToImage[game.title]}`;
        }

        // 3. Use default image as fallback
        return 'http://localhost:4000/images/games/default-game.jpg';
    };

    // Handle image loading errors
    const handleImageError = (gameId) => {
        setImageErrors(prev => ({ ...prev, [gameId]: true }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setSearchTerm(searchInput);
            searchGames({ variables: { term: searchInput } });
            setImageErrors({}); // Reset image errors on new search
        }
    };

    const handleChange = (e) => {
        setSearchInput(e.target.value);
        if (e.target.value === '') {
            setSearchTerm('');
        }
    };

    return (
        <Container>
            <h2 className="mb-4 text-white">Search Games</h2>

            <Form onSubmit={handleSearch} className="mb-4">
                <Row>
                    <Col md={10}>
                        <Form.Control
                            type="text"
                            placeholder="Search by title, genre, or platform..."
                            value={searchInput}
                            onChange={handleChange}
                            size="lg"
                        />
                    </Col>
                    <Col md={2}>
                        <Button type="submit" variant="primary" className="w-100" size="lg">
                            Search
                        </Button>
                    </Col>
                </Row>
            </Form>

            {loading && (
                <div className="text-center mt-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            )}

            {error && (
                <Alert variant="danger">Error searching games: {error.message}</Alert>
            )}

            {searchTerm && data && (
                <>
                    <h4 className="text-white">Search Results for "{searchTerm}"</h4>
                    <p className="text-white-50">{data.searchGames.length} games found</p>

                    {data.searchGames.length === 0 ? (
                        <Alert variant="info">No games found matching your search.</Alert>
                    ) : (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {data.searchGames.map(game => (
                                <Col key={game.id}>
                                    <Card className="h-100 shadow-sm hover-effect">
                                        {!imageErrors[game.id] ? (
                                            <Card.Img
                                                variant="top"
                                                src={getGameImage(game)}
                                                style={{ height: '200px', objectFit: 'cover' }}
                                                onError={() => handleImageError(game.id)}
                                            />
                                        ) : (
                                            // Show colored placeholder with game title first letter if image fails
                                            <div style={{
                                                height: '200px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '4rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {game.title.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <Card.Body>
                                            <Card.Title>{game.title}</Card.Title>
                                            <Card.Text>
                                                <strong>Genre:</strong> {game.genre}<br />
                                                <strong>Platform:</strong> {game.platform}<br />
                                                <strong>Released:</strong> {game.releaseYear}
                                            </Card.Text>
                                            <Button
                                                as={Link}
                                                to={`/games/${game.id}`}
                                                variant="primary"
                                                className="w-100"
                                            >
                                                View Details
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </>
            )}
        </Container>
    );
};

export default GameSearch;