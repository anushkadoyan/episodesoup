import React, { useCallback, useMemo, useState } from "react";
import debounce from "debounce";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import { useTvApi } from "./requests";
import { Grid } from "semantic-ui-react";
import GenerateTweets from "./GenerateTweets";

export default function MainContent() {
  const { getShows, getSeasons, getEpisodes } = useTvApi();
  const [inputVal, setInputVal] = useState("");
  const [inputSave, setSave] = useState("");

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
      rest: option,
    }));
  };

  const debounceLoadOptions = useCallback(
    debounce((inputText, callback) => {
      const val = inputText?.length ? inputText : inputVal;
      getShows(val).then((options) =>
        callback(mapShowsToDropdownElements(options))
      );
    }, 500),
    []
  );
  const handleSelectedShow = (selected) => {
    setSelectedShow(selected);
    setSeasons([]);
    getSeasons(selected.value).then((resp) => {
      return setSeasons(mapSeasonsToDropdownElements(resp));
    });
  };

  const handleSelectedSeason = (selected) => {
    setSelectedSeason(selected);
    setEpisodes([]);
    getEpisodes(selected.value).then((resp) => {
      return setEpisodes(mapEpisodesToDropdownElements(resp));
    });
  };

  const handleSelectedEpisode = (selected) => {
    console.log(selected);
    setSelectedEpisode(selected);
  };

  return (
    <div>
      <div className="filters">
        <div className="filter">
          <AsyncSelect
            loadOptions={debounceLoadOptions}
            cacheOptions
            defaultOptions
            name="shows"
            placeholder="Show..."
            onInputChange={setInputVal}
            onChange={handleSelectedShow}
            onMenuClose={() => setSave(inputVal)} // before the input is cleared, save its value here
            onFocus={() => {
              setInputVal(inputSave); // keeps the input
              setSave(""); // prevents undesired placeholder value
            }}
          />
        </div>
        <div className="filter">
          <Select
            className="basic-single"
            classNamePrefix="select"
            placeholder="Season..."
            isDisabled={!selectedShow}
            isSearchable
            name="seasons"
            options={seasons}
            onChange={handleSelectedSeason}
          />
        </div>
        <div className="filter">
          <Select
            className="basic-single"
            classNamePrefix="select"
            placeholder="Episode..."
            isDisabled={!selectedShow || !selectedSeason}
            isSearchable
            name="episodes"
            options={episodes}
            onChange={handleSelectedEpisode}
          />
        </div>
      </div>
      <GenerateTweets
        selectedShow={selectedShow}
        selectedSeason={selectedSeason}
        selectedEpisode={selectedEpisode}
      />
    </div>
  );
}
