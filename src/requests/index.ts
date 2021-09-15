import React, { useCallback } from "react";
import { baseURL } from "./constants";
import axios from "axios";
import { Show } from "../tvmaze/Show";

export const useTvApi = () => {
  const getShows = useCallback(async (query: string) => {
    const url = `${baseURL}search/shows?q=${query}`;
    const response = await axios.get(url);
    const mapped = response.data?.map((show: Show) => show.show);
    return mapped;
  }, []);

  const getSeasons = useCallback(async (showId: number) => {
    const url = `${baseURL}shows/${showId}/seasons`;
    const response = await axios.get(url);
    return response.data;
  }, []);

  const getEpisodes = useCallback(async (seasonId: number) => {
    const url = `${baseURL}seasons/${seasonId}/episodes`;
    const response = await axios.get(url);
    return response.data;
  }, []);

  return { getShows, getSeasons, getEpisodes };
};
