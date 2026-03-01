import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
    GET_GAMES,
    SEARCH_GAMES,
    ADD_FAVORITE_GAME,
    REMOVE_FAVORITE_GAME,
    GET_FAVORITE_GAMES
} from '../graphql/queries';

export const useGames = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: gamesData, loading: gamesLoading, refetch: refetchGames } = useQuery(GET_GAMES);

    const { data: searchData, loading: searchLoading } = useQuery(SEARCH_GAMES, {
        variables: { term: searchTerm },
        skip: !searchTerm
    });

    const { data: favData, refetch: refetchFavorites } = useQuery(GET_FAVORITE_GAMES);

    const [addFavorite] = useMutation(ADD_FAVORITE_GAME, {
        onCompleted: () => {
            refetchFavorites();
        }
    });

    const [removeFavorite] = useMutation(REMOVE_FAVORITE_GAME, {
        onCompleted: () => {
            refetchFavorites();
        }
    });

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const handleAddFavorite = async (gameId) => {
        try {
            await addFavorite({ variables: { gameId } });
        } catch (error) {
            console.error('Error adding favorite:', error);
        }
    };

    const handleRemoveFavorite = async (gameId) => {
        try {
            await removeFavorite({ variables: { gameId } });
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    const isFavorite = (gameId) => {
        return favData?.getFavoriteGames?.some(game => game.id === gameId) || false;
    };

    return {
        games: gamesData?.games || [],
        searchResults: searchData?.searchGames || [],
        favoriteGames: favData?.getFavoriteGames || [],
        loading: gamesLoading || searchLoading,
        searchTerm,
        handleSearch,
        handleAddFavorite,
        handleRemoveFavorite,
        isFavorite,
        refetchGames,
        refetchFavorites
    };
};