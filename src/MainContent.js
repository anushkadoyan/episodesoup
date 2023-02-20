import React, { useMemo, useState } from "react";
import debounce from "lodash.debounce";

import AsyncSelect from "react-select/async";
import Select from "react-select";
import { useTvApi } from "./requests";
import { Button, Card, Grid } from "semantic-ui-react";
import GenerateTweets from "./GenerateTweets";
import { isObjectPopulated } from "./utilities/general";
import GenerateReddits from "./GenerateReddits";
import { redditBaseURL } from "./requests/constants";

export default function MainContent() {
  const { getShows, getSeasons, getEpisodes } = useTvApi();
  const [isLoading, setIsLoading] = useState(false);

  const [showOptions, setShowOptions] = useState({});
  const [selectedShow, setSelectedShow] = useState({});
  const [selectedSeason, setSelectedSeason] = useState({});
  const [selectedEpisode, setSelectedEpisode] = useState({});
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [reddits, setReddits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const seasonsRef = React.useRef();
  const episodesRef = React.useRef();

  const mapShowsToDropdownElements = (options) => {
    return options.map((option) => ({
      value: option.id,
      label: option.name,
    }));
  };
  const mapSeasonsToDropdownElements = (options) => {
    return options.map((option, i) => ({
      value: option.id,
      label: `Season ${option.number}`,
      index: i + 1,
    }));
  };

  const mapEpisodesToDropdownElements = (options) => {
    return options.map((option, i) => ({
      value: option.id,
      label: `${i + 1}. ${option.name}`,
      rawLabel: option.name,
      airdate: option.airdate,
      index: i + 1,
    }));
  };

  const validInfo = useMemo(
    () =>
      [selectedShow, selectedSeason, selectedEpisode].every(
        (selectedThing) => selectedThing && selectedThing?.value
      ),
    [selectedShow, selectedSeason, selectedEpisode]
  );

  const handleSelectedShow = (selected) => {
    setSelectedShow(selected);
    setSeasons([]);
    setSelectedSeason({});
    setSelectedEpisode({});
    if (!selected) setShowOptions([]);
    if (!selected?.value) return;
    getSeasons(selected.value).then((resp) => {
      if (seasonsRef.current) {
        seasonsRef.current.focus();
      }
      return setSeasons(mapSeasonsToDropdownElements(resp));
    });
  };

  const handleSelectedSeason = (selected) => {
    setSelectedSeason(selected);
    setEpisodes([]);
    setSelectedEpisode({});
    if (!selected?.value) return;
    getEpisodes(selected.value).then((resp) => {
      if (episodesRef.current) {
        episodesRef.current.focus();
      }
      return setEpisodes(mapEpisodesToDropdownElements(resp));
    });
  };

  const handleSelectedEpisode = (selected) => {
    setSelectedEpisode(selected);
  };

  const showSeasons = useMemo(
    () => isObjectPopulated(selectedShow),
    [selectedShow]
  );

  const showEpisodes = useMemo(
    () => isObjectPopulated(selectedShow) && isObjectPopulated(selectedSeason),
    [selectedShow, selectedSeason]
  );

  const showActionButton = useMemo(
    () =>
      isObjectPopulated(selectedShow) &&
      isObjectPopulated(selectedSeason) &&
      isObjectPopulated(selectedEpisode),
    [selectedShow, selectedSeason, selectedEpisode]
  );

  const _loadSuggestions = (query, callback) => {
    getShows(query)
      .then((options) => {
        callback(mapShowsToDropdownElements(options));
      })
      .catch((e) => {
        console.log("Error loading shows", e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const loadSuggestions = debounce(_loadSuggestions, 300);

  const handleActionButtonClicked = () => {
    setCurrentPage(currentPage === 1 ? 2 : 1);
  };

  // TODO disable seasons/episodes in the future
  return (
    <div className="main">
      {currentPage === 1 ? (
        <div className="filters">
          <div className="filter">
            <AsyncSelect
              cacheOptions
              loadOptions={loadSuggestions}
              name="shows"
              placeholder="What are you watching?"
              onChange={handleSelectedShow}
              menuPlacement="auto"
              isClearable
              noOptionsMessage={({ inputValue }) => {
                if (inputValue?.length && !showOptions?.length && !isLoading)
                  return "No shows found";
                return null;
              }}
              isLoading={isLoading}
              value={isObjectPopulated(selectedShow) ? selectedShow : null}
            />
          </div>
          {showSeasons ? (
            <div className="filter">
              <Select
                openMenuOnFocus
                ref={seasonsRef}
                className="basic-single"
                classNamePrefix="select"
                placeholder="Season..."
                isDisabled={!showSeasons}
                menuPlacement="auto"
                isSearchable={false}
                name="seasons"
                options={seasons}
                onChange={handleSelectedSeason}
                isClearable
                value={
                  isObjectPopulated(selectedSeason) ? selectedSeason : null
                }
              />
            </div>
          ) : null}
          {showEpisodes ? (
            <div className="filter">
              <Select
                openMenuOnFocus
                ref={episodesRef}
                className="basic-single"
                classNamePrefix="select"
                placeholder="Episode..."
                isDisabled={!showEpisodes}
                isSearchable={false}
                name="episodes"
                options={episodes}
                onChange={handleSelectedEpisode}
                menuPlacement="auto"
                isClearable
                value={
                  isObjectPopulated(selectedEpisode) ? selectedEpisode : null
                }
                // })}
              />
            </div>
          ) : null}
        </div>
      ) : (
        <GenerateReddits
          validInfo={validInfo}
          selectedShow={selectedShow}
          selectedEpisode={selectedEpisode}
          selectedSeason={selectedSeason}
          setReddits={setReddits}
          goBack={handleActionButtonClicked}
        />
      )}
      {currentPage === 1 ? (
        <Button
          className="actionButton"
          color="blue"
          disabled={!validInfo}
          onClick={handleActionButtonClicked}
        >
          Continue
        </Button>
      ) : // <Grid columns="equal">
      //   <Grid.Row stretched>
      //     <Grid.Column>
      //       <GenerateTweets
      //         validInfo={validInfo}
      //         selectedShow={selectedShow}
      //         selectedEpisode={selectedEpisode}
      //       />
      //     </Grid.Column>
      //     <Grid.Column>
      //       <GenerateReddits
      //         validInfo={validInfo}
      //         selectedShow={selectedShow}
      //         selectedEpisode={selectedEpisode}
      //         selectedSeason={selectedSeason}
      //         setReddits={setReddits}
      //       />
      //     </Grid.Column>
      //   </Grid.Row>
      //   <Grid.Row>
      //     <Grid columns="equal">
      //       {reddits?.map((post) => (
      //         <Grid.Row>
      //           <Grid.Column>
      //             <a
      //               href={`${redditBaseURL}${post.url}`}
      //               target="_blank"
      //               rel="noreferrer"
      //             >
      //               {post.title}
      //             </a>
      //           </Grid.Column>
      //         </Grid.Row>
      //       ))}
      //     </Grid>
      //   </Grid.Row>
      // </Grid>
      null}
    </div>
  );
}
