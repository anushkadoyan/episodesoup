import { useCallback } from "react";
import { tvMazeBaseURL, redditBaseURL } from "./constants";
import axios from "axios";
import { Show } from "../tvmaze/Show";

export const useTvApi = () => {
  const getShows = useCallback(async (query: string) => {
    const response = await axios.get(`${tvMazeBaseURL}search/shows?q=${query}`);
    const mapped = response.data?.map((show: Show) => show.show);
    return mapped;
  }, []);

  const getSeasons = useCallback(async (showId: number) => {
    const response = await axios.get(`${tvMazeBaseURL}shows/${showId}/seasons`);
    return response.data;
  }, []);

  const getEpisodes = useCallback(async (seasonId: number) => {
    const response = await axios.get(
      `${tvMazeBaseURL}seasons/${seasonId}/episodes`
    );
    return response.data;
  }, []);

  const getSubreddits = useCallback(async (showName: number) => {
    // https://www.reddit.com/subreddits/search.json?q=desperate&sort=relevance&t=all

    const response = await axios.get(
      `${redditBaseURL}subreddits/search.json?q=${showName}&sort=relevance&t=all&limit=5`
    );
    return response.data;
  }, []);

  const getRedditPosts = useCallback(
    async (
      subreddit: string,
      before: string,
      after: string,
      query: string,
      useRedditApi: boolean
    ) => {
      if (useRedditApi) {
        const response = await axios.get(
          `${redditBaseURL}r/${subreddit}/search.json?q=${query}&restrict_sr=on&limit=5`
        );
        return response.data;
      }

      const params: Record<string, string> = {
        subreddit,
        ...(before && { before }),
        ...(after && { after }),
        ...(query && { q: query }),
        sort_type: "score",
        size: "5",
      };
      const encodedQuery = new URLSearchParams(params).toString();

      // https://www.reddit.com/search/submission?subreddit=desperatehousewives&sort_type=created_utc&after=1523588521&before=1676794174&size=1000
      //api.pushshift.io/reddit/search/submission?subreddit=thelastofus
      const response = await axios.get(
        // TODO specific query
        //&author_flair_text=discussion
        `https://api.pushshift.io/reddit/search/submission?${encodedQuery}`
        // `https://api.pushshift.io/reddit/search/submission?subreddit=${subreddit}&q=${query}&sort_type=score&after=${after}&before=${before}&size=1000`
      );
      return response.data;
    },
    []
  );

  return { getShows, getSeasons, getEpisodes, getSubreddits, getRedditPosts };
};
