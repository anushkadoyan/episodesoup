import React, { useCallback, useMemo, useState } from "react";
import debounce from "debounce";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import { useTvApi } from "./requests";
import { Grid } from "semantic-ui-react";
import GenerateTweets from "./GenerateTweets";
import { isObjectPopulated } from "./utilities/general";

export default function MainContent() {
  const { getShows, getSeasons, getEpisodes } = useTvApi();
  const [inputVal, setInputVal] = useState("");
  const [inputSave, setSave] = useState("");
  const [showOptions, setShowOptions] = useState([]);

  const [selectedShow, setSelectedShow] = useState({});
  const [selectedSeason, setSelectedSeason] = useState({});
  const [selectedEpisode, setSelectedEpisode] = useState({});
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const mapShowsToDropdownElements = (options) => {
    return options.map((option) => ({
      value: option.id,
      label: option.name,
    }));
  };

  const mapSeasonsToDropdownElements = (options) => {
    return options.map((option) => ({
      value: option.id,
      label: `Season ${option.number}`,
    }));
  };

  const mapEpisodesToDropdownElements = (options) => {
    return options.map((option) => ({
      value: option.id,
      label: option.name,
      airdate: option.airdate,
    }));
  };

  const debounceLoadOptions = useCallback(
    debounce((inputText) => {
      if (!inputText?.length) return;
      getShows(inputText).then((options) =>
        setShowOptions(mapShowsToDropdownElements(options))
      );
    }, 500),
    []
  );
  const handleSelectedShow = (selected) => {
    setSelectedShow(selected);
    setSeasons([]);
    setSelectedSeason({});
    setSelectedEpisode({});
    if (!selected) setShowOptions([]);
    if (!selected?.value) return;
    getSeasons(selected.value).then((resp) => {
      return setSeasons(mapSeasonsToDropdownElements(resp));
    });
  };

  const handleSelectedSeason = (selected) => {
    setSelectedSeason(selected);
    setEpisodes([]);
    setSelectedEpisode({});
    if (!selected?.value) return;
    getEpisodes(selected.value).then((resp) => {
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

  const showFindButton = useMemo(
    () =>
      isObjectPopulated(selectedShow) &&
      isObjectPopulated(selectedSeason) &&
      isObjectPopulated(selectedEpisode),
    [selectedShow, selectedSeason, selectedEpisode]
  );
  console.log();
  return (
    <div>
      <div className="filters">
        <div className="filter">
          <Select
            cacheOptions
            name="shows"
            placeholder="What are you watching?"
            options={showOptions}
            onInputChange={debounceLoadOptions}
            onChange={handleSelectedShow}
            isClearable
            closeMenuOnSelect={false}
          />
        </div>
        {showSeasons ? (
          <div className="filter">
            <Select
              className="basic-single"
              classNamePrefix="select"
              placeholder="Season..."
              isDisabled={!showSeasons}
              isSearchable
              name="seasons"
              options={seasons}
              onChange={handleSelectedSeason}
              isClearable
            />
          </div>
        ) : null}
        {showEpisodes ? (
          <div className="filter">
            <Select
              className="basic-single"
              classNamePrefix="select"
              placeholder="Episode..."
              isDisabled={!showEpisodes}
              isSearchable
              name="episodes"
              options={episodes}
              onChange={handleSelectedEpisode}
              isClearable
            />
          </div>
        ) : null}
      </div>
      {showFindButton ? (
        <GenerateTweets
          selectedShow={selectedShow}
          selectedSeason={selectedSeason}
          selectedEpisode={selectedEpisode}
        />
      ) : null}
    </div>
  );
}
